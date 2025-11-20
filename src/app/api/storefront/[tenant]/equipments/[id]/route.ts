import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Buscar equipamento específico com disponibilidade
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string; id: string }> }
) {
  try {
    const { tenant, id } = await params

    // Buscar o tenant pelo slug
    const tenantData = await prisma.tenant.findUnique({
      where: { slug: tenant },
    })

    if (!tenantData || !tenantData.active) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Buscar equipamento
    const equipment = await prisma.equipment.findFirst({
      where: {
        id,
        tenantId: tenantData.id,
        status: "AVAILABLE",
      },
    })

    if (!equipment) {
      return NextResponse.json(
        { error: "Equipamento não encontrado" },
        { status: 404 }
      )
    }

    // Buscar reservas ativas para calcular disponibilidade
    const activeBookings = await prisma.booking.findMany({
      where: {
        equipmentId: id,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      select: {
        startDate: true,
        endDate: true,
      },
    })

    return NextResponse.json(
      {
        equipment,
        activeBookings,
        tenant: tenantData,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao buscar equipamento:", error)
    return NextResponse.json(
      { error: "Erro ao buscar equipamento" },
      { status: 500 }
    )
  }
}
