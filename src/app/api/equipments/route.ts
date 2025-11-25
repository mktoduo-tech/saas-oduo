import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Listar equipamentos
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar parâmetros de filtro
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const where: Record<string, unknown> = { tenantId: session.user.tenantId }
    if (status) {
      where.status = status
    }

    const equipments = await prisma.equipment.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    // Retornar array diretamente para compatibilidade
    return NextResponse.json(equipments, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar equipamentos:", error)
    return NextResponse.json(
      { error: "Erro ao buscar equipamentos" },
      { status: 500 }
    )
  }
}

// POST - Criar equipamento
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, category, pricePerDay, pricePerHour, quantity, images, purchasePrice, purchaseDate } = body

    if (!name || !category || !pricePerDay) {
      return NextResponse.json(
        { error: "Campos obrigatórios: name, category, pricePerDay" },
        { status: 400 }
      )
    }

    const equipment = await prisma.equipment.create({
      data: {
        name,
        description,
        category,
        pricePerDay: parseFloat(pricePerDay),
        pricePerHour: pricePerHour ? parseFloat(pricePerHour) : null,
        quantity: quantity || 1,
        images: images || [],
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        tenantId: session.user.tenantId,
        status: "AVAILABLE",
      },
    })

    return NextResponse.json(equipment, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar equipamento:", error)
    return NextResponse.json(
      { error: "Erro ao criar equipamento" },
      { status: 500 }
    )
  }
}
