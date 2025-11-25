import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/super-admin"

// GET - Detalhes de um tenant específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSuperAdmin()
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { id } = await params

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            equipments: true,
            bookings: true,
            customers: true,
            apiKeys: true,
            webhooks: true,
          },
        },
      },
    })

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant não encontrado" },
        { status: 404 }
      )
    }

    // Buscar estatísticas adicionais
    const [revenue, recentBookings, equipmentStats] = await Promise.all([
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        _count: { id: true },
        where: {
          tenantId: id,
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
      }),
      prisma.booking.findMany({
        where: { tenantId: id },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { name: true } },
          equipment: { select: { name: true } },
        },
      }),
      prisma.equipment.groupBy({
        by: ["status"],
        where: { tenantId: id },
        _count: { id: true },
      }),
    ])

    return NextResponse.json({
      ...tenant,
      stats: {
        totalRevenue: revenue._sum.totalPrice || 0,
        totalBookings: revenue._count.id,
        equipmentByStatus: equipmentStats.reduce((acc, item) => {
          acc[item.status] = item._count.id
          return acc
        }, {} as Record<string, number>),
      },
      recentBookings,
    })
  } catch (error) {
    console.error("Erro ao buscar tenant:", error)
    return NextResponse.json(
      { error: "Erro ao buscar tenant" },
      { status: 500 }
    )
  }
}

// PUT - Atualizar tenant
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSuperAdmin()
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { name, email, phone, address, active } = body

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(address !== undefined && { address }),
        ...(active !== undefined && { active }),
      },
    })

    return NextResponse.json(tenant)
  } catch (error) {
    console.error("Erro ao atualizar tenant:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar tenant" },
      { status: 500 }
    )
  }
}

// DELETE - Deletar tenant (cuidado!)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSuperAdmin()
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { id } = await params
    const url = new URL(request.url)
    const confirm = url.searchParams.get("confirm")

    // Requer confirmação para deletar
    if (confirm !== "DELETE_TENANT") {
      return NextResponse.json(
        { error: "Confirmação necessária. Adicione ?confirm=DELETE_TENANT" },
        { status: 400 }
      )
    }

    // Verificar se tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookings: true, equipments: true, customers: true },
        },
      },
    })

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant não encontrado" },
        { status: 404 }
      )
    }

    // Deletar tenant (cascade vai deletar tudo relacionado)
    await prisma.tenant.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: `Tenant "${tenant.name}" deletado com sucesso`,
      deleted: {
        bookings: tenant._count.bookings,
        equipments: tenant._count.equipments,
        customers: tenant._count.customers,
      },
    })
  } catch (error) {
    console.error("Erro ao deletar tenant:", error)
    return NextResponse.json(
      { error: "Erro ao deletar tenant" },
      { status: 500 }
    )
  }
}
