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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Edit, Trash2, Calendar, User, Package, MoreHorizontal, Mail, FileText, Receipt, Send, Download, FileCheck } from "lucide-react"
import { DataPagination } from "@/components/ui/data-pagination"
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
import { toast } from "sonner"
import { downloadDocumentAsPDF } from "@/lib/pdf-generator"
import { usePlanLimits } from "@/hooks/usePlanLimits"
import { LimitWarningBanner } from "@/components/plan"

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
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Concluído",
}

export default function ReservasPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Hook de limites do plano
  const { usage, isNearBookingLimit, isAtBookingLimit } = usePlanLimits()

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Calcular itens paginados
  const totalItems = bookings.length
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedBookings = bookings.slice(startIndex, startIndex + itemsPerPage)

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/bookings?${params}`)
      if (response.ok) {
        const data = await response.json()
        // Garantir que data seja sempre um array
        setBookings(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
    setCurrentPage(1) // Reset para página 1 quando filtro muda
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

  const handleSendEmail = async (bookingId: string, type: string) => {
    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, type }),
      })

      if (response.ok) {
        toast.success("Email enviado com sucesso!")
      } else {
        const data = await response.json()
        toast.error(data.error || "Erro ao enviar email")
      }
    } catch (error) {
      console.error("Error sending email:", error)
      toast.error("Erro ao enviar email")
    }
  }

  const handleGenerateDocument = async (bookingId: string, type: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })

      if (response.ok) {
        const data = await response.json()
        // Open HTML in new tab for printing/saving
        const printWindow = window.open("", "_blank")
        if (printWindow) {
          printWindow.document.write(data.html)
          printWindow.document.close()
          printWindow.focus()
        }
        toast.success("Documento gerado com sucesso!")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Erro ao gerar documento")
      }
    } catch (error) {
      console.error("Error generating document:", error)
      toast.error("Erro ao gerar documento")
    }
  }

  const handleDownloadPDF = async (bookingId: string, type: "CONTRACT" | "RECEIPT") => {
    try {
      toast.info("Gerando PDF...")
      await downloadDocumentAsPDF(bookingId, type)
      toast.success("PDF baixado com sucesso!")
    } catch (error) {
      console.error("Error downloading PDF:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao baixar PDF")
    }
  }

  const handleEmitirNFSe = async (bookingId: string) => {
    try {
      toast.info("Gerando NFS-e...")
      const response = await fetch(`/api/bookings/${bookingId}/invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendEmail: true }),
      })

      if (response.ok) {
        await response.json()
        toast.success("NFS-e gerada com sucesso!")
        // Atualizar lista de reservas
        fetchBookings()
      } else {
        const errorData = await response.json()
        console.error("Erro ao gerar NFS-e:", errorData)
        // Mostrar mensagem de erro detalhada
        toast.error(errorData.error || errorData.details || "Erro ao gerar NFS-e", {
          duration: 8000, // 8 segundos para o usuário ler
        })
      }
    } catch (error) {
      console.error("Error generating NFS-e:", error)
      toast.error("Erro ao gerar NFS-e")
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-headline tracking-wide">Orçamentos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os orçamentos de locação
          </p>
        </div>
        <Link href="/reservas/novo">
          <Button className="gap-2" disabled={isAtBookingLimit}>
            <Plus className="h-4 w-4" />
            Novo Orçamento
          </Button>
        </Link>
      </div>

      {/* Banner de Limite */}
      {usage && (isNearBookingLimit || isAtBookingLimit) && (
        <LimitWarningBanner
          type="bookings"
          current={usage.bookingsThisMonth.current}
          max={usage.bookingsThisMonth.max}
          percentage={usage.bookingsThisMonth.percentage}
        />
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline tracking-wide">Filtros</CardTitle>
          <CardDescription>Filtre os orçamentos por status</CardDescription>
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
            {loading ? "Carregando..." : `${bookings.length} orçamentos`}
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
                ) : paginatedBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Nenhum orçamento encontrado.
                      <br />
                      <Link href="/reservas/novo">
                        <Button variant="link" className="mt-2">
                          Criar primeiro orçamento
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedBookings.map((booking) => (
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
                        <div className="flex justify-end gap-1">
                          <Link href={`/reservas/${booking.id}`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleSendEmail(booking.id, "confirmation")}
                                disabled={!booking.customer.email}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Enviar Confirmação
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleSendEmail(booking.id, "reminder")}
                                disabled={!booking.customer.email}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Enviar Lembrete
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleGenerateDocument(booking.id, "CONTRACT")}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Visualizar Contrato
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDownloadPDF(booking.id, "CONTRACT")}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Baixar Contrato (PDF)
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleSendEmail(booking.id, "contract")}
                                disabled={!booking.customer.email}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Enviar Contrato por Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleGenerateDocument(booking.id, "RECEIPT")}
                              >
                                <Receipt className="h-4 w-4 mr-2" />
                                Visualizar Recibo
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDownloadPDF(booking.id, "RECEIPT")}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Baixar Recibo (PDF)
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleSendEmail(booking.id, "receiptDocument")}
                                disabled={!booking.customer.email}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Enviar Recibo por Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {["CONFIRMED", "COMPLETED"].includes(booking.status) && (
                                <DropdownMenuItem
                                  onClick={() => handleEmitirNFSe(booking.id)}
                                >
                                  <FileCheck className="h-4 w-4 mr-2" />
                                  Emitir NFS-e
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteId(booking.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          <DataPagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este orçamento? Esta ação não pode
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
