"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Users, Calendar, TrendingUp, Loader2, Plus } from "lucide-react"

interface DashboardStats {
  customers: {
    total: number
  }
  equipment: {
    total: number
    available: number
  }
  bookings: {
    total: number
    active: number
    pending: number
  }
  revenue: {
    total: number
    thisMonth: number
    pending: number
  }
  recentBookings: Array<{
    id: string
    startDate: string
    endDate: string
    totalPrice: number
    status: string
    customer: {
      name: string
    }
    equipment: {
      name: string
    }
  }>
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  const statusLabels = {
    PENDING: "Pendente",
    CONFIRMED: "Confirmada",
    CANCELLED: "Cancelada",
    COMPLETED: "Concluída",
  }

  const statusColors = {
    PENDING: "bg-accent",
    CONFIRMED: "bg-primary",
    CANCELLED: "bg-red-500",
    COMPLETED: "bg-green-500",
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-headline tracking-wide">
          Olá, {session?.user?.name?.split(" ")[0]}!
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Bem-vindo ao painel da {session?.user?.tenantName}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Equipamentos
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.equipment.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.equipment.available || 0} disponíveis
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.customers.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reservas Ativas
            </CardTitle>
            <Calendar className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.bookings.active || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.bookings.pending || 0} pendentes
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita do Mês
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.revenue.thisMonth || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total: {formatCurrency(stats?.revenue.total || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings and Quick Actions */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div>
                <CardTitle className="text-base sm:text-lg font-headline tracking-wide">Reservas Recentes</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Últimas 5 reservas criadas
                </CardDescription>
              </div>
              <Link href="/reservas">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Ver todas
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recentBookings && stats.recentBookings.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {stats.recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{booking.customer.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {booking.equipment.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                      </p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start sm:text-right gap-2 sm:gap-0">
                      <p className="font-semibold text-sm">
                        {formatCurrency(booking.totalPrice)}
                      </p>
                      <Badge
                        className={`${
                          statusColors[booking.status as keyof typeof statusColors]
                        } text-white text-xs`}
                        variant="secondary"
                      >
                        {statusLabels[booking.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm sm:text-base">Nenhuma reserva ainda</p>
                <Link href="/reservas/novo">
                  <Button variant="link" className="mt-2 text-sm">
                    Criar primeira reserva
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline tracking-wide">Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse rapidamente as principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/reservas/novo">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Nova Reserva</h3>
                    <p className="text-xs text-muted-foreground">
                      Criar reserva de equipamento
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/clientes/novo">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-secondary hover:bg-secondary/5 transition-all cursor-pointer">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                    <Users className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Novo Cliente</h3>
                    <p className="text-xs text-muted-foreground">
                      Cadastrar novo cliente
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/equipamentos/novo">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-accent hover:bg-accent/5 transition-all cursor-pointer">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <Package className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Novo Equipamento</h3>
                    <p className="text-xs text-muted-foreground">
                      Adicionar equipamento ao catálogo
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/equipamentos">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Ver Equipamentos</h3>
                    <p className="text-xs text-muted-foreground">
                      Gerenciar catálogo
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account and Company Info */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-headline tracking-wide">Informações da Conta</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Seus dados de acesso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Nome</p>
              <p className="text-base sm:text-lg font-semibold truncate">{session?.user?.name}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base sm:text-lg truncate">{session?.user?.email}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Função</p>
              <Badge variant="secondary" className="mt-1 text-xs">
                {session?.user?.role}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-headline tracking-wide">Sua Locadora</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Informações da empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Nome</p>
              <p className="text-base sm:text-lg font-semibold truncate">{session?.user?.tenantName}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Slug</p>
              <p className="font-mono text-xs sm:text-sm bg-muted p-2 rounded break-all">
                {session?.user?.tenantSlug}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Subdomínio
              </p>
              <p className="font-mono text-xs sm:text-sm bg-muted p-2 rounded break-all">
                {session?.user?.tenantSlug}.localhost:3000
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
