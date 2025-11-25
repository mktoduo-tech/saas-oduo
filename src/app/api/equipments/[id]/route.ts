import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/lib/auth"

const prisma = new PrismaClient()

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
  } finally {
    await prisma.$disconnect()
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
    const { name, description, category, pricePerDay, pricePerHour, quantity, status, images } = body

    const equipment = await prisma.equipment.updateMany({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(pricePerDay && { pricePerDay: parseFloat(pricePerDay) }),
        ...(pricePerHour !== undefined && { pricePerHour: pricePerHour ? parseFloat(pricePerHour) : null }),
        ...(quantity !== undefined && { quantity }),
        ...(status && { status }),
        ...(images && { images }),
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
    console.error("Erro ao atualizar equipamento:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar equipamento" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
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
  } finally {
    await prisma.$disconnect()
  }
}
