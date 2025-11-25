import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/lib/auth"

const prisma = new PrismaClient()

// GET - Listar clientes
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const customers = await prisma.customer.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    })

    return NextResponse.json(customers, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar clientes:", error)
    return NextResponse.json(
      { error: "Erro ao buscar clientes" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Criar cliente
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, cpfCnpj, address, city, state, zipCode, notes } = body

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Campos obrigatórios: name, phone" },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        cpfCnpj,
        address,
        city,
        state,
        zipCode,
        notes,
        tenantId: session.user.tenantId,
      },
    })

    return NextResponse.json({ customer }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar cliente:", error)
    return NextResponse.json(
      { error: "Erro ao criar cliente" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
