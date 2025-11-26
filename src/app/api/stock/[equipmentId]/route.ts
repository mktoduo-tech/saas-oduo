import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Detalhes do estoque de um equipamento
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ equipmentId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { equipmentId } = await params

    const equipment = await prisma.equipment.findFirst({
      where: {
        id: equipmentId,
        tenantId: session.user.tenantId,
      },
      include: {
        // Últimas 10 movimentações
        stockMovements: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            user: {
              select: { id: true, name: true },
            },
            booking: {
              select: { id: true, bookingNumber: true },
            },
          },
        },
        // Reservas ativas com este equipamento
        bookingItems: {
          where: {
            booking: {
              status: { in: ["PENDING", "CONFIRMED"] },
            },
          },
          include: {
            booking: {
              select: {
                id: true,
                bookingNumber: true,
                startDate: true,
                endDate: true,
                status: true,
                customer: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
        // Custos associados
        costs: {
          orderBy: { date: "desc" },
          take: 5,
        },
      },
    })

    if (!equipment) {
      return NextResponse.json(
        { error: "Equipamento não encontrado" },
        { status: 404 }
      )
    }

    // Calcular métricas adicionais
    const metrics = {
      utilizationRate: equipment.totalStock > 0
        ? ((equipment.reservedStock / equipment.totalStock) * 100).toFixed(1)
        : 0,
      isLowStock: equipment.availableStock <= equipment.minStockLevel,
      totalValue: equipment.unitCost
        ? equipment.totalStock * equipment.unitCost
        : null,
    }

    return NextResponse.json({
      equipment,
      metrics,
    })
  } catch (error) {
    console.error("Erro ao buscar detalhes do estoque:", error)
    return NextResponse.json(
      { error: "Erro ao buscar detalhes do estoque" },
      { status: 500 }
    )
  }
}
