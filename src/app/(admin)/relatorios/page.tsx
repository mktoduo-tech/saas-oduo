"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  Calendar,
  DollarSign,
  Package,
  Users,
  FileDown,
  Filter
} from "lucide-react"

interface ReportData {
  totalRevenue: number
  totalBookings: number
  activeEquipments: number
  totalCustomers: number
  recentBookings: {
    id: string
    customer: { name: string }
    equipment: { name: string }
    startDate: string
    endDate: string
    totalPrice: number
    status: string
  }[]
}

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ReportData | null>(null)
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      // Buscar dados agregados
      const [bookingsRes, equipmentsRes, customersRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/equipments"),
        fetch("/api/customers"),
      ])

      if (bookingsRes.ok && equipmentsRes.ok && customersRes.ok) {
        const bookingsData = await bookingsRes.json()
        const equipmentsData = await equipmentsRes.json()
        const customersData = await customersRes.json()

        // Garantir que todos sejam arrays
        const bookings = Array.isArray(bookingsData) ? bookingsData : []
        const equipments = Array.isArray(equipmentsData) ? equipmentsData : []
        const customers = Array.isArray(customersData) ? customersData : []

        // Calcular métricas
        const totalRevenue = bookings.reduce((sum: number, booking: any) => {
          return booking.status === "COMPLETED" ? sum + booking.totalPrice : sum
        }, 0)

        const activeEquipments = equipments.filter(
          (eq: any) => eq.status === "AVAILABLE"
        ).length

        setData({
          totalRevenue,
          totalBookings: bookings.length,
          activeEquipments,
          totalCustomers: customers.length,
          recentBookings: bookings.slice(0, 10),
        })
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      PENDING: "secondary",
      CONFIRMED: "default",
      COMPLETED: "default",
      CANCELLED: "destructive",
    }

    const labels: Record<string, string> = {
      PENDING: "Pendente",
      CONFIRMED: "Confirmado",
      COMPLETED: "Concluído",
      CANCELLED: "Cancelado",
    }

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground font-headline tracking-wide">
          Relatórios
        </h1>
        <p className="text-muted-foreground mt-1">
          Visualize o desempenho do seu negócio
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate">Data Início</Label>
              <Input
                id="startDate"
                type="date"
                value={dateFilter.startDate}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="endDate">Data Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={dateFilter.endDate}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, endDate: e.target.value })
                }
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={fetchReportData}>Aplicar Filtros</Button>
              <Button variant="outline">
                <FileDown className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data ? (
        <>
          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Receita Total</CardDescription>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(data.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  De reservas concluídas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Total de Reservas</CardDescription>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalBookings}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Todas as reservas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Equipamentos Ativos</CardDescription>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.activeEquipments}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Disponíveis para locação
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>Total de Clientes</CardDescription>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalCustomers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Clientes cadastrados
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Reservas Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Reservas Recentes
              </CardTitle>
              <CardDescription>
                Últimas 10 reservas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhuma reserva encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.recentBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          {booking.customer.name}
                        </TableCell>
                        <TableCell>{booking.equipment.name}</TableCell>
                        <TableCell>
                          {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                        </TableCell>
                        <TableCell>{formatCurrency(booking.totalPrice)}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Erro ao carregar dados. Tente novamente.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
