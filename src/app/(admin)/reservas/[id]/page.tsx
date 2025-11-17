"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Calculator, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const bookingSchema = z.object({
  customerId: z.string().min(1, "Cliente é obrigatório"),
  equipmentId: z.string().min(1, "Equipamento é obrigatório"),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().min(1, "Data de término é obrigatória"),
  totalPrice: z.number().min(0, "Preço deve ser maior ou igual a zero"),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
  notes: z.string().optional(),
})

type BookingForm = z.infer<typeof bookingSchema>

interface Customer {
  id: string
  name: string
}

interface Equipment {
  id: string
  name: string
  pricePerDay: number
}

interface Booking {
  id: string
  customerId: string
  equipmentId: string
  startDate: string
  endDate: string
  totalPrice: number
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  notes: string | null
  customer: {
    id: string
    name: string
  }
  equipment: {
    id: string
    name: string
    pricePerDay: number
  }
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

export default function EditReservaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null
  )
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
  })

  const watchEquipmentId = watch("equipmentId")
  const watchStartDate = watch("startDate")
  const watchEndDate = watch("endDate")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingRes, customersRes, equipmentsRes] = await Promise.all([
          fetch(`/api/bookings/${id}`),
          fetch("/api/customers"),
          fetch("/api/equipments"),
        ])

        if (bookingRes.ok) {
          const bookingData = await bookingRes.json()
          setBooking(bookingData)

          // Format dates for input
          const startDate = new Date(bookingData.startDate)
            .toISOString()
            .split("T")[0]
          const endDate = new Date(bookingData.endDate)
            .toISOString()
            .split("T")[0]

          reset({
            customerId: bookingData.customerId,
            equipmentId: bookingData.equipmentId,
            startDate,
            endDate,
            totalPrice: bookingData.totalPrice,
            status: bookingData.status,
            notes: bookingData.notes || "",
          })
        } else {
          alert("Reserva não encontrada")
          router.push("/reservas")
        }

        if (customersRes.ok) {
          const customersData = await customersRes.json()
          setCustomers(customersData)
        }

        if (equipmentsRes.ok) {
          const equipmentsData = await equipmentsRes.json()
          setEquipments(equipmentsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        alert("Erro ao carregar dados")
      } finally {
        setFetchLoading(false)
      }
    }

    fetchData()
  }, [id, router, reset])

  useEffect(() => {
    if (watchEquipmentId) {
      const equipment = equipments.find((e) => e.id === watchEquipmentId)
      setSelectedEquipment(equipment || null)
    } else {
      setSelectedEquipment(null)
    }
  }, [watchEquipmentId, equipments])

  useEffect(() => {
    if (selectedEquipment && watchStartDate && watchEndDate) {
      const start = new Date(watchStartDate)
      const end = new Date(watchEndDate)
      const days = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (days > 0) {
        const price = days * selectedEquipment.pricePerDay
        setCalculatedPrice(price)
      } else {
        setCalculatedPrice(0)
      }
    }
  }, [selectedEquipment, watchStartDate, watchEndDate])

  const onSubmit = async (data: BookingForm) => {
    try {
      setLoading(true)

      const cleanData = {
        ...data,
        notes: data.notes || null,
      }

      const response = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanData),
      })

      if (response.ok) {
        router.push("/reservas")
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao atualizar reserva")
      }
    } catch (error) {
      console.error("Error updating booking:", error)
      alert("Erro ao atualizar reserva")
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

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!booking) {
    return null
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/reservas">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground font-headline tracking-wide">
            Editar Reserva
          </h1>
          <p className="text-muted-foreground mt-1">
            Atualize as informações da reserva
          </p>
        </div>
        <Badge
          className={statusColors[booking.status]}
          variant="secondary"
        >
          {statusLabels[booking.status]}
        </Badge>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações da Reserva */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline tracking-wide">Informações da Reserva</CardTitle>
            <CardDescription>
              Selecione o cliente e o equipamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerId">
                  Cliente <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch("customerId")}
                  onValueChange={(value) => setValue("customerId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customerId && (
                  <p className="text-sm text-destructive">
                    {errors.customerId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipmentId">
                  Equipamento <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch("equipmentId")}
                  onValueChange={(value) => setValue("equipmentId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um equipamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipments.map((equipment) => (
                      <SelectItem key={equipment.id} value={equipment.id}>
                        {equipment.name} -{" "}
                        {formatCurrency(equipment.pricePerDay)}/dia
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.equipmentId && (
                  <p className="text-sm text-destructive">
                    {errors.equipmentId.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Período e Valor */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline tracking-wide">Período e Valor</CardTitle>
            <CardDescription>
              Defina as datas e o valor da reserva
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Data de Início <span className="text-destructive">*</span>
                </Label>
                <Input id="startDate" type="date" {...register("startDate")} />
                {errors.startDate && (
                  <p className="text-sm text-destructive">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">
                  Data de Término <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  min={watchStartDate}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            {calculatedPrice > 0 && (
              <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <Calculator className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Valor Calculado</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(calculatedPrice)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setValue("totalPrice", calculatedPrice)}
                >
                  Aplicar
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="totalPrice">
                Valor Total <span className="text-destructive">*</span>
              </Label>
              <Input
                id="totalPrice"
                type="number"
                step="0.01"
                {...register("totalPrice", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.totalPrice && (
                <p className="text-sm text-destructive">
                  {errors.totalPrice.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                O valor é calculado automaticamente com base nas datas, mas pode
                ser ajustado
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status e Observações */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline tracking-wide">Status e Observações</CardTitle>
            <CardDescription>
              Atualize o status e adicione observações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("status")}
                onValueChange={(value: any) => setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                  <SelectItem value="COMPLETED">Concluída</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">
                  {errors.status.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Adicione observações sobre a reserva..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/reservas">
            <Button type="button" variant="outline" disabled={loading}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="gap-2">
            <Save className="h-4 w-4" />
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </div>
  )
}
