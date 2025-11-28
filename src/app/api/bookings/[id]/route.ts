import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidateBookings } from "@/lib/cache/revalidate"

// GET - Buscar reserva por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        equipment: true,
        customer: true,
        items: {
          include: {
            equipment: {
              select: {
                id: true,
                name: true,
                category: true,
                images: true,
                pricePerDay: true,
                totalStock: true,
                availableStock: true,
              },
            },
          },
        },
        stockMovements: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Reserva não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(booking, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar reserva:", error)
    return NextResponse.json(
      { error: "Erro ao buscar reserva" },
      { status: 500 }
    )
  }
}

// PUT - Atualizar reserva
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.tenantId || !session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, startDate, endDate, startTime, endTime, totalPrice, notes } = body

    // Buscar reserva atual com itens
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        items: {
          include: {
            equipment: true,
          },
        },
        equipment: true,
      },
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Reserva não encontrada" },
        { status: 404 }
      )
    }

    // Se está mudando o status, precisamos atualizar o estoque
    const isStatusChange = status && status !== existingBooking.status
    const previousStatus = existingBooking.status

    // Executar atualização em transação
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // Atualizar a reserva
      const booking = await tx.booking.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(startDate && { startDate: new Date(startDate) }),
          ...(endDate && { endDate: new Date(endDate) }),
          ...(startTime !== undefined && { startTime }),
          ...(endTime !== undefined && { endTime }),
          ...(totalPrice && { totalPrice: parseFloat(totalPrice) }),
          ...(notes !== undefined && { notes }),
        },
        include: {
          equipment: true,
          customer: true,
          items: {
            include: {
              equipment: true,
            },
          },
        },
      })

      // Se mudou o status, atualizar estoque
      if (isStatusChange) {
        // Determinar itens a processar (novos ou legado)
        const itemsToProcess = existingBooking.items.length > 0
          ? existingBooking.items
          : existingBooking.equipment
            ? [{ equipmentId: existingBooking.equipment.id, quantity: 1, equipment: existingBooking.equipment }]
            : []

        for (const item of itemsToProcess) {
          const equipment = await tx.equipment.findUnique({
            where: { id: item.equipmentId },
          })

          if (!equipment) continue

          // Lógica de atualização de estoque baseada na transição de status
          // PENDING/CONFIRMED -> COMPLETED: mover de reservedStock para availableStock
          // PENDING/CONFIRMED -> CANCELLED: mover de reservedStock para availableStock
          // Qualquer -> PENDING/CONFIRMED (reativação): verificar disponibilidade

          if (
            (previousStatus === "PENDING" || previousStatus === "CONFIRMED") &&
            (status === "COMPLETED" || status === "CANCELLED")
          ) {
            // Liberar estoque reservado
            await tx.equipment.update({
              where: { id: item.equipmentId },
              data: {
                reservedStock: { decrement: item.quantity },
                availableStock: { increment: item.quantity },
              },
            })

            // Registrar movimentação
            await tx.stockMovement.create({
              data: {
                type: status === "COMPLETED" ? "RENTAL_RETURN" : "ADJUSTMENT",
                quantity: item.quantity,
                previousStock: equipment.availableStock,
                newStock: equipment.availableStock + item.quantity,
                reason: status === "COMPLETED"
                  ? `Devolução - Reserva #${existingBooking.bookingNumber}`
                  : `Cancelamento - Reserva #${existingBooking.bookingNumber}`,
                equipmentId: item.equipmentId,
                bookingId: id,
                userId: session.user.id,
                tenantId: session.user.tenantId,
              },
            })
          }
        }

        // Registrar atividade
        await tx.activityLog.create({
          data: {
            action: "UPDATE",
            entity: "BOOKING",
            entityId: id,
            description: `Reserva #${existingBooking.bookingNumber} - Status alterado de ${previousStatus} para ${status}`,
            metadata: {
              previousStatus,
              newStatus: status,
              itemsCount: itemsToProcess.length,
            },
            userId: session.user.id,
            tenantId: session.user.tenantId,
          },
        })
      }

      return booking
    })

    // Invalidar cache
    revalidateBookings(session.user.tenantId)

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    }, { status: 200 })
  } catch (error) {
    console.error("Erro ao atualizar reserva:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar reserva" },
      { status: 500 }
    )
  }
}

// DELETE - Deletar/Cancelar reserva
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.tenantId || !session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    // Buscar reserva com itens
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        items: true,
        equipment: true,
      },
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Reserva não encontrada" },
        { status: 404 }
      )
    }

    // Se já está cancelada, apenas retornar sucesso
    if (existingBooking.status === "CANCELLED") {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Executar cancelamento em transação
    await prisma.$transaction(async (tx) => {
      // Atualizar status para cancelado
      await tx.booking.update({
        where: { id },
        data: { status: "CANCELLED" },
      })

      // Liberar estoque se estava pendente ou confirmada
      if (existingBooking.status === "PENDING" || existingBooking.status === "CONFIRMED") {
        // Determinar itens a processar
        const itemsToProcess = existingBooking.items.length > 0
          ? existingBooking.items
          : existingBooking.equipment
            ? [{ equipmentId: existingBooking.equipment.id, quantity: 1 }]
            : []

        for (const item of itemsToProcess) {
          const equipment = await tx.equipment.findUnique({
            where: { id: item.equipmentId },
          })

          if (!equipment) continue

          // Liberar estoque reservado
          await tx.equipment.update({
            where: { id: item.equipmentId },
            data: {
              reservedStock: { decrement: item.quantity },
              availableStock: { increment: item.quantity },
            },
          })

          // Registrar movimentação
          await tx.stockMovement.create({
            data: {
              type: "ADJUSTMENT",
              quantity: item.quantity,
              previousStock: equipment.availableStock,
              newStock: equipment.availableStock + item.quantity,
              reason: `Cancelamento - Reserva #${existingBooking.bookingNumber}`,
              equipmentId: item.equipmentId,
              bookingId: id,
              userId: session.user.id,
              tenantId: session.user.tenantId,
            },
          })
        }
      }

      // Registrar atividade
      await tx.activityLog.create({
        data: {
          action: "DELETE",
          entity: "BOOKING",
          entityId: id,
          description: `Reserva #${existingBooking.bookingNumber} cancelada`,
          metadata: {
            previousStatus: existingBooking.status,
          },
          userId: session.user.id,
          tenantId: session.user.tenantId,
        },
      })
    })

    // Invalidar cache
    revalidateBookings(session.user.tenantId)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Erro ao cancelar reserva:", error)
    return NextResponse.json(
      { error: "Erro ao cancelar reserva" },
      { status: 500 }
    )
  }
}
