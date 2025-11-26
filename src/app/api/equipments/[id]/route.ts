import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Buscar equipamento por ID
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

    const equipment = await prisma.equipment.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        rentalPeriods: {
          orderBy: { days: "asc" },
        },
      },
    })

    if (!equipment) {
      return NextResponse.json(
        { error: "Equipamento não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(equipment, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar equipamento:", error)
    return NextResponse.json(
      { error: "Erro ao buscar equipamento" },
      { status: 500 }
    )
  }
}

// PUT - Atualizar equipamento
export async function PUT(
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
    const { name, description, category, pricePerDay, pricePerHour, quantity, status, images, rentalPeriods } = body

    // Verificar se equipamento existe e pertence ao tenant
    const existingEquipment = await prisma.equipment.findFirst({
      where: { id, tenantId: session.user.tenantId },
    })

    if (!existingEquipment) {
      return NextResponse.json(
        { error: "Equipamento não encontrado" },
        { status: 404 }
      )
    }

    // Calcular pricePerDay a partir dos períodos se fornecidos
    let calculatedPricePerDay = pricePerDay ? parseFloat(pricePerDay) : undefined
    if (rentalPeriods?.length) {
      const sortedPeriods = [...rentalPeriods].sort((a: { days: number }, b: { days: number }) => a.days - b.days)
      calculatedPricePerDay = sortedPeriods[0].price / sortedPeriods[0].days
    }

    // Atualizar equipamento e períodos em uma transação
    const equipment = await prisma.$transaction(async (tx) => {
      // Se rentalPeriods foi fornecido, deletar os antigos e criar novos
      if (rentalPeriods !== undefined) {
        await tx.rentalPeriod.deleteMany({
          where: { equipmentId: id },
        })

        if (rentalPeriods.length > 0) {
          await tx.rentalPeriod.createMany({
            data: rentalPeriods.map((period: { days: number; price: number; label?: string }) => ({
              equipmentId: id,
              days: period.days,
              price: period.price,
              label: period.label || null,
            })),
          })
        }
      }

      // Atualizar equipamento
      return tx.equipment.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(category && { category }),
          ...(calculatedPricePerDay !== undefined && { pricePerDay: calculatedPricePerDay }),
          ...(pricePerHour !== undefined && { pricePerHour: pricePerHour ? parseFloat(pricePerHour) : null }),
          ...(quantity !== undefined && { quantity }),
          ...(status && { status }),
          ...(images && { images }),
        },
        include: {
          rentalPeriods: {
            orderBy: { days: "asc" },
          },
        },
      })
    })

    return NextResponse.json(equipment, { status: 200 })
  } catch (error) {
    console.error("Erro ao atualizar equipamento:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar equipamento" },
      { status: 500 }
    )
  }
}

// DELETE - Deletar equipamento
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

    const equipment = await prisma.equipment.deleteMany({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (equipment.count === 0) {
      return NextResponse.json(
        { error: "Equipamento não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Erro ao deletar equipamento:", error)
    return NextResponse.json(
      { error: "Erro ao deletar equipamento" },
      { status: 500 }
    )
  }
}
