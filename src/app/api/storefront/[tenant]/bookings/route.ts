import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const bookingSchema = z.object({
  equipmentId: z.string(),
  customerName: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  customerEmail: z.string().email("Email inválido"),
  customerPhone: z.string().min(10, "Telefone inválido"),
  customerCpfCnpj: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  notes: z.string().optional(),
})

// POST - Criar nova reserva pública
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const { tenant } = await params
    const body = await request.json()

    // Validar dados
    const validationResult = bookingSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Buscar o tenant pelo slug
    const tenantData = await prisma.tenant.findUnique({
      where: { slug: tenant },
    })

    if (!tenantData || !tenantData.active) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Buscar ou criar cliente
    let customer = await prisma.customer.findFirst({
      where: {
        email: data.customerEmail,
        tenantId: tenantData.id,
      },
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone,
          cpfCnpj: data.customerCpfCnpj,
          tenantId: tenantData.id,
        },
      })
    }

    // Buscar equipamento
    const equipment = await prisma.equipment.findFirst({
      where: {
        id: data.equipmentId,
        tenantId: tenantData.id,
        status: "AVAILABLE",
      },
    })

    if (!equipment) {
      return NextResponse.json(
        { error: "Equipamento não disponível" },
        { status: 400 }
      )
    }

    // Verificar conflitos de data
    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)

    const conflictingBookings = await prisma.booking.findMany({
      where: {
        equipmentId: data.equipmentId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        OR: [
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: startDate } },
            ],
          },
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: endDate } },
            ],
          },
          {
            AND: [
              { startDate: { gte: startDate } },
              { endDate: { lte: endDate } },
            ],
          },
        ],
      },
    })

    if (conflictingBookings.length > 0) {
      return NextResponse.json(
        { error: "Equipamento já reservado para este período" },
        { status: 400 }
      )
    }

    // Calcular preço total
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalPrice = days * equipment.pricePerDay

    // Criar reserva
    const booking = await prisma.booking.create({
      data: {
        equipmentId: equipment.id,
        customerId: customer.id,
        tenantId: tenantData.id,
        startDate,
        endDate,
        startTime: data.startTime,
        endTime: data.endTime,
        totalPrice,
        status: "PENDING",
        notes: data.notes,
      },
      include: {
        equipment: true,
        customer: true,
      },
    })

    // Registrar log (sem userId pois é público)
    try {
      await prisma.activityLog.create({
        data: {
          action: "CREATE",
          entity: "BOOKING",
          entityId: booking.id,
          description: `Nova reserva criada pelo cliente ${customer.name} via storefront`,
          tenantId: tenantData.id,
          userId: customer.id, // Usar customerId como userId temporário
        },
      })
    } catch (error) {
      // Log não é crítico, continuar sem erro
      console.error("Erro ao criar log:", error)
    }

    return NextResponse.json(
      {
        success: true,
        booking: {
          id: booking.id,
          equipment: booking.equipment.name,
          startDate: booking.startDate,
          endDate: booking.endDate,
          totalPrice: booking.totalPrice,
          status: booking.status,
        },
        message: "Reserva criada com sucesso! Entraremos em contato para confirmação.",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erro ao criar reserva:", error)
    return NextResponse.json(
      { error: "Erro ao criar reserva. Tente novamente." },
      { status: 500 }
    )
  }
}
