import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/super-admin"

// GET - Estatísticas globais do sistema
export async function GET() {
  const authResult = await requireSuperAdmin()
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    // Executar todas as queries em paralelo
    const [
      totalTenants,
      activeTenants,
      totalUsers,
      totalEquipments,
      totalCustomers,
      totalBookings,
      revenueData,
      recentTenants,
      bookingsByStatus,
      monthlyStats,
    ] = await Promise.all([
      // Total de tenants
      prisma.tenant.count(),

      // Tenants ativos
      prisma.tenant.count({ where: { active: true } }),

      // Total de usuários
      prisma.user.count(),

      // Total de equipamentos
      prisma.equipment.count(),

      // Total de clientes
      prisma.customer.count(),

      // Total de reservas
      prisma.booking.count(),

      // Receita total (soma de todas as reservas confirmadas/completadas)
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
      }),

      // Últimos 10 tenants criados
      prisma.tenant.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          email: true,
          active: true,
          createdAt: true,
          _count: {
            select: {
              users: true,
              equipments: true,
              bookings: true,
              customers: true,
            },
          },
        },
      }),

      // Reservas por status
      prisma.booking.groupBy({
        by: ["status"],
        _count: { id: true },
      }),

      // Estatísticas dos últimos 12 meses
      getMonthlyStats(),
    ])

    // Formatar reservas por status
    const bookingsStatusMap = bookingsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.id
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      overview: {
        totalTenants,
        activeTenants,
        inactiveTenants: totalTenants - activeTenants,
        totalUsers,
        totalEquipments,
        totalCustomers,
        totalBookings,
        totalRevenue: revenueData._sum.totalPrice || 0,
      },
      bookingsByStatus: {
        pending: bookingsStatusMap["PENDING"] || 0,
        confirmed: bookingsStatusMap["CONFIRMED"] || 0,
        completed: bookingsStatusMap["COMPLETED"] || 0,
        cancelled: bookingsStatusMap["CANCELLED"] || 0,
      },
      recentTenants,
      monthlyStats,
    })
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 }
    )
  }
}

// Função para obter estatísticas mensais
async function getMonthlyStats() {
  const months: { month: string; tenants: number; bookings: number; revenue: number }[] = []
  const now = new Date()

  for (let i = 11; i >= 0; i--) {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

    const [tenantsCount, bookingsData] = await Promise.all([
      prisma.tenant.count({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
      prisma.booking.aggregate({
        _count: { id: true },
        _sum: { totalPrice: true },
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
      }),
    ])

    months.push({
      month: startOfMonth.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      tenants: tenantsCount,
      bookings: bookingsData._count.id,
      revenue: bookingsData._sum.totalPrice || 0,
    })
  }

  return months
}
