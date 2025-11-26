import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST - Marcar reserva como paga
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { paymentMethod } = body

    // Verificar se a reserva existe e pertence ao tenant
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        customer: { select: { name: true } },
        equipment: { select: { name: true } },
        items: {
          include: {
            equipment: { select: { name: true } },
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

    // Determinar equipamento principal
    const equipmentName = booking.equipment?.name || booking.items[0]?.equipment?.name || "Equipamento"

    // Verificar se já está paga
    if (booking.paidAt) {
      return NextResponse.json(
        { error: "Esta reserva já foi paga" },
        { status: 400 }
      )
    }

    // Atualizar reserva como paga
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        paidAt: new Date(),
        status: booking.status === "PENDING" ? "CONFIRMED" : booking.status,
      },
    })

    // Registrar atividade
    await prisma.activityLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: "PAYMENT_RECEIVED",
        entity: "BOOKING",
        entityId: id,
        description: `Pagamento de R$ ${booking.totalPrice.toFixed(2)} recebido de ${booking.customer.name} - ${equipmentName}${paymentMethod ? ` (${paymentMethod})` : ""}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Pagamento de R$ ${booking.totalPrice.toFixed(2)} registrado com sucesso`,
      booking: updatedBooking,
    })
  } catch (error) {
    console.error("Erro ao registrar pagamento:", error)
    return NextResponse.json(
      { error: "Erro ao registrar pagamento" },
      { status: 500 }
    )
  }
}

// DELETE - Estornar pagamento (desfazer)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    // Verificar se a reserva existe e pertence ao tenant
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        customer: { select: { name: true } },
        equipment: { select: { name: true } },
        items: {
          include: {
            equipment: { select: { name: true } },
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

    // Determinar equipamento principal
    const equipmentName = booking.equipment?.name || booking.items[0]?.equipment?.name || "Equipamento"

    // Verificar se está paga
    if (!booking.paidAt) {
      return NextResponse.json(
        { error: "Esta reserva não possui pagamento registrado" },
        { status: 400 }
      )
    }

    // Remover pagamento
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        paidAt: null,
      },
    })

    // Registrar atividade
    await prisma.activityLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: "PAYMENT_REVERSED",
        entity: "BOOKING",
        entityId: id,
        description: `Pagamento de R$ ${booking.totalPrice.toFixed(2)} estornado - ${booking.customer.name} - ${equipmentName}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Pagamento estornado com sucesso",
      booking: updatedBooking,
    })
  } catch (error) {
    console.error("Erro ao estornar pagamento:", error)
    return NextResponse.json(
      { error: "Erro ao estornar pagamento" },
      { status: 500 }
    )
  }
}
