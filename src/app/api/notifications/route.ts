import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Buscar notificações do tenant (baseadas em atividades recentes)
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const now = new Date()
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Buscar eventos recentes para criar notificações
    const [
      recentBookings,
      pendingBookings,
      upcomingBookings,
      lowStockEquipments,
      recentPayments,
    ] = await Promise.all([
      // Reservas criadas nas últimas 24h
      prisma.booking.findMany({
        where: {
          tenantId,
          createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        },
        include: {
          customer: { select: { name: true } },
          equipment: { select: { name: true } },
          items: { include: { equipment: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Reservas pendentes de confirmação
      prisma.booking.count({
        where: { tenantId, status: "PENDING" },
      }),

      // Reservas que começam nas próximas 24h
      prisma.booking.findMany({
        where: {
          tenantId,
          status: "CONFIRMED",
          startDate: {
            gte: now,
            lte: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        include: {
          customer: { select: { name: true } },
          equipment: { select: { name: true } },
          items: { include: { equipment: { select: { name: true } } } },
        },
        take: 5,
      }),

      // Equipamentos em manutenção
      prisma.equipment.count({
        where: { tenantId, status: "MAINTENANCE" },
      }),

      // Reservas com pagamento recente
      prisma.booking.findMany({
        where: {
          tenantId,
          paidAt: { gte: last7Days },
        },
        include: {
          customer: { select: { name: true } },
        },
        orderBy: { paidAt: "desc" },
        take: 5,
      }),
    ])

    // Criar lista de notificações
    const notifications: Array<{
      id: string
      type: "info" | "warning" | "success"
      title: string
      message: string
      time: string
      link?: string
    }> = []

    // Notificações de novas reservas
    recentBookings.forEach((booking) => {
      const timeAgo = getTimeAgo(booking.createdAt)
      const equipmentName = booking.equipment?.name || booking.items[0]?.equipment?.name || "Equipamento"
      notifications.push({
        id: `booking-${booking.id}`,
        type: "info",
        title: "Nova reserva",
        message: `${booking.customer.name} fez uma reserva de ${equipmentName}`,
        time: timeAgo,
        link: `/reservas/${booking.id}`,
      })
    })

    // Notificação de pendentes
    if (pendingBookings > 0) {
      notifications.push({
        id: "pending-bookings",
        type: "warning",
        title: "Reservas pendentes",
        message: `Você tem ${pendingBookings} reserva(s) aguardando confirmação`,
        time: "Agora",
        link: "/reservas?status=PENDING",
      })
    }

    // Notificações de reservas próximas
    upcomingBookings.forEach((booking) => {
      const equipmentName = booking.equipment?.name || booking.items[0]?.equipment?.name || "Equipamento"
      notifications.push({
        id: `upcoming-${booking.id}`,
        type: "info",
        title: "Reserva amanhã",
        message: `${equipmentName} para ${booking.customer.name} começa em breve`,
        time: "Próximas 24h",
        link: `/reservas/${booking.id}`,
      })
    })

    // Notificação de equipamentos em manutenção
    if (lowStockEquipments > 0) {
      notifications.push({
        id: "maintenance",
        type: "warning",
        title: "Equipamentos em manutenção",
        message: `${lowStockEquipments} equipamento(s) em manutenção`,
        time: "Atenção",
        link: "/equipamentos?status=MAINTENANCE",
      })
    }

    // Notificações de pagamentos recebidos
    recentPayments.forEach((booking) => {
      if (booking.paidAt) {
        const timeAgo = getTimeAgo(booking.paidAt)
        notifications.push({
          id: `payment-${booking.id}`,
          type: "success",
          title: "Pagamento recebido",
          message: `Pagamento de R$ ${booking.totalPrice.toFixed(2)} de ${booking.customer.name}`,
          time: timeAgo,
          link: `/reservas/${booking.id}`,
        })
      }
    })

    // Ordenar por relevância (warnings primeiro, depois por tempo)
    notifications.sort((a, b) => {
      if (a.type === "warning" && b.type !== "warning") return -1
      if (b.type === "warning" && a.type !== "warning") return 1
      return 0
    })

    return NextResponse.json({
      notifications: notifications.slice(0, 10),
      unreadCount: notifications.filter(n => n.type === "warning").length,
    })
  } catch (error) {
    console.error("Erro ao buscar notificações:", error)
    return NextResponse.json(
      { error: "Erro ao buscar notificações" },
      { status: 500 }
    )
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return "Agora"
  if (diffMins < 60) return `${diffMins} min`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays === 1) return "Ontem"
  if (diffDays < 7) return `${diffDays} dias`
  return date.toLocaleDateString("pt-BR")
}
