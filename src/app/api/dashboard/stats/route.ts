import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const tenantId = session.user.tenantId

    // Buscar estatísticas em paralelo
    const [
      totalEquipments,
      totalCustomers,
      totalBookings,
      recentBookings,
      equipmentsByCategory,
      bookingsByStatus,
    ] = await Promise.all([
      // Total de equipamentos
      prisma.equipment.count({
        where: { tenantId },
      }),

      // Total de clientes
      prisma.customer.count({
        where: { tenantId },
      }),

      // Total de reservas
      prisma.booking.count({
        where: { tenantId },
      }),

      // Reservas recentes (últimas 5)
      prisma.booking.findMany({
        where: { tenantId },
        include: {
          customer: true,
          equipment: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Equipamentos por categoria
      prisma.equipment.groupBy({
        by: ["category"],
        where: { tenantId },
        _count: {
          category: true,
        },
      }),

      // Reservas por status
      prisma.booking.groupBy({
        by: ["status"],
        where: { tenantId },
        _count: {
          status: true,
        },
      }),
    ])

    // Calcular receita total de reservas concluídas
    const completedBookings = await prisma.booking.aggregate({
      where: {
        tenantId,
        status: "COMPLETED",
      },
      _sum: {
        totalPrice: true,
      },
    })

    const totalRevenue = completedBookings._sum.totalPrice || 0

    // Equipamentos disponíveis
    const availableEquipments = await prisma.equipment.count({
      where: {
        tenantId,
        status: "AVAILABLE",
      },
    })

    // Calcular reservas ativas e pendentes
    const activeBookings = bookingsByStatus.find((item) => item.status === "CONFIRMED")?._count.status || 0
    const pendingBookings = bookingsByStatus.find((item) => item.status === "PENDING")?._count.status || 0

    // Calcular receita do mês atual
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthRevenue = await prisma.booking.aggregate({
      where: {
        tenantId,
        status: "COMPLETED",
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
      _sum: {
        totalPrice: true,
      },
    })

    // Calcular receita pendente
    const pendingRevenue = await prisma.booking.aggregate({
      where: {
        tenantId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      _sum: {
        totalPrice: true,
      },
    })

    return NextResponse.json(
      {
        customers: {
          total: totalCustomers,
        },
        equipment: {
          total: totalEquipments,
          available: availableEquipments,
        },
        bookings: {
          total: totalBookings,
          active: activeBookings,
          pending: pendingBookings,
        },
        revenue: {
          total: totalRevenue,
          thisMonth: thisMonthRevenue._sum.totalPrice || 0,
          pending: pendingRevenue._sum.totalPrice || 0,
        },
        recentBookings: recentBookings.map((booking) => ({
          id: booking.id,
          startDate: booking.startDate.toISOString(),
          endDate: booking.endDate.toISOString(),
          totalPrice: booking.totalPrice,
          status: booking.status,
          customer: {
            name: booking.customer.name,
          },
          equipment: {
            name: booking.equipment.name,
          },
        })),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 }
    )
  }
}
