"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Plus, Edit, Trash2, Calendar, User, Package } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Booking {
  id: string
  startDate: string
  endDate: string
  totalPrice: number
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  notes: string | null
  equipment: {
    id: string
    name: string
    category: string
    pricePerDay: number
  }
  customer: {
    id: string
    name: string
    email: string | null
    phone: string
  }
}

const statusColors = {
  PENDING: "bg-accent",
  CONFIRMED: "bg-primary",
  CANCELLED: "bg-red-500",
  COMPLETED: "bg-green-500",
}

const statusLabels = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Concluída",
}

export default function ReservasPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/bookings?${params}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [statusFilter])

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/bookings/${deleteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setBookings(bookings.filter((b) => b.id !== deleteId))
        setDeleteId(null)
      } else {
        const data = await response.json()
        alert(data.error || "Erro ao excluir reserva")
      }
    } catch (error) {
      console.error("Error deleting booking:", error)
      alert("Erro ao excluir reserva")
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

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-headline tracking-wide">Reservas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todas as reservas de equipamentos
          </p>
        </div>
        <Link href="/reservas/novo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Reserva
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline tracking-wide">Filtros</CardTitle>
          <CardDescription>Filtre as reservas por status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="w-64">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                  <SelectItem value="COMPLETED">Concluída</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline tracking-wide">
            {loading ? "Carregando..." : `${bookings.length} reservas`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Carregando reservas...
                    </TableCell>
                  </TableRow>
                ) : bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Nenhuma reserva encontrada.
                      <br />
                      <Link href="/reservas/novo">
                        <Button variant="link" className="mt-2">
                          Criar primeira reserva
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {booking.customer.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {booking.customer.phone}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <Package className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {booking.equipment.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {booking.equipment.category}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div className="text-sm">
                            <div>{formatDate(booking.startDate)}</div>
                            <div className="text-muted-foreground">
                              até {formatDate(booking.endDate)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">
                          {formatCurrency(booking.totalPrice)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={statusColors[booking.status]}
                          variant="secondary"
                        >
                          {statusLabels[booking.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/reservas/${booking.id}`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(booking.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta reserva? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
