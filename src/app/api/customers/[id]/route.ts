import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/lib/auth"

const prisma = new PrismaClient()

// GET - Buscar cliente por ID
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

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        bookings: {
          include: {
            equipment: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!customer) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ customer }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar cliente:", error)
    return NextResponse.json(
      { error: "Erro ao buscar cliente" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - Atualizar cliente
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
    const { name, email, phone, cpfCnpj, address, city, state, zipCode, notes } = body

    const customer = await prisma.customer.updateMany({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      data: {
        ...(name && { name }),
        ...(email !== undefined && { email }),
        ...(phone && { phone }),
        ...(cpfCnpj !== undefined && { cpfCnpj }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(zipCode !== undefined && { zipCode }),
        ...(notes !== undefined && { notes }),
      },
    })

    if (customer.count === 0) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar cliente" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - Deletar cliente
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

    // Verificar se o cliente tem reservas
    const customerWithBookings = await prisma.customer.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    })

    if (customerWithBookings && customerWithBookings._count.bookings > 0) {
      return NextResponse.json(
        { error: "Não é possível deletar cliente com reservas" },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.deleteMany({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (customer.count === 0) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Erro ao deletar cliente:", error)
    return NextResponse.json(
      { error: "Erro ao deletar cliente" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
