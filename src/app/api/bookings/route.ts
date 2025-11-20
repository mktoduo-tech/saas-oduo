import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/lib/auth"

const prisma = new PrismaClient()

// GET - Listar reservas
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get("status")

    const bookings = await prisma.booking.findMany({
      where: {
        tenantId: session.user.tenantId,
        ...(status && { status: status as any }),
      },
      include: {
        equipment: true,
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ bookings }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar reservas:", error)
    return NextResponse.json(
      { error: "Erro ao buscar reservas" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Criar reserva
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const {
      equipmentId,
      customerId,
      startDate,
      endDate,
      startTime,
      endTime,
      totalPrice,
      notes,
    } = body

    if (!equipmentId || !customerId || !startDate || !endDate || !totalPrice) {
      return NextResponse.json(
        { error: "Campos obrigatórios: equipmentId, customerId, startDate, endDate, totalPrice" },
        { status: 400 }
      )
    }

    // Verificar se o equipamento existe e pertence ao tenant
    const equipment = await prisma.equipment.findFirst({
      where: {
        id: equipmentId,
        tenantId: session.user.tenantId,
      },
    })

    if (!equipment) {
      return NextResponse.json(
        { error: "Equipamento não encontrado" },
        { status: 404 }
      )
    }

    // Verificar se o cliente existe e pertence ao tenant
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        tenantId: session.user.tenantId,
      },
    })

    if (!customer) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      )
    }

    // Verificar disponibilidade
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        equipmentId,
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          {
            AND: [
              { startDate: { lte: new Date(startDate) } },
              { endDate: { gte: new Date(startDate) } },
            ],
          },
          {
            AND: [
              { startDate: { lte: new Date(endDate) } },
              { endDate: { gte: new Date(endDate) } },
            ],
          },
        ],
      },
    })

    if (conflictingBookings.length > 0) {
      return NextResponse.json(
        { error: "Equipamento não disponível para este período" },
        { status: 409 }
      )
    }

    const booking = await prisma.booking.create({
      data: {
        equipmentId,
        customerId,
        tenantId: session.user.tenantId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime,
        endTime,
        totalPrice: parseFloat(totalPrice),
        notes,
        status: "PENDING",
      },
      include: {
        equipment: true,
        customer: true,
      },
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar reserva:", error)
    return NextResponse.json(
      { error: "Erro ao criar reserva" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
