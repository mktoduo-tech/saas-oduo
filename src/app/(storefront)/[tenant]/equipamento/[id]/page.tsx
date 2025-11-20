"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, DollarSign, Package, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface Equipment {
  id: string
  name: string
  description: string | null
  category: string
  pricePerDay: number
  pricePerHour: number | null
  images: string[]
  quantity: number
}

interface Tenant {
  id: string
  name: string
  slug: string
  email: string
  phone: string
}

interface ActiveBooking {
  startDate: string
  endDate: string
}

export default function EquipmentDetails() {
  const params = useParams()
  const router = useRouter()
  const tenant = params.tenant as string
  const equipmentId = params.id as string

  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [tenantData, setTenantData] = useState<Tenant | null>(null)
  const [activeBookings, setActiveBookings] = useState<ActiveBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerCpfCnpj: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    notes: "",
  })

  useEffect(() => {
    fetchEquipment()
  }, [tenant, equipmentId])

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/storefront/${tenant}/equipments/${equipmentId}`)

      if (response.ok) {
        const data = await response.json()
        setEquipment(data.equipment)
        setTenantData(data.tenant)
        setActiveBookings(data.activeBookings)
      } else {
        toast.error("Equipamento não encontrado")
        router.push(`/${tenant}`)
      }
    } catch (error) {
      console.error("Erro ao buscar equipamento:", error)
      toast.error("Erro ao carregar equipamento")
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    if (!equipment || !formData.startDate || !formData.endDate) return 0

    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    return days * equipment.pricePerDay
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error("Selecione as datas de início e fim")
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch(`/api/storefront/${tenant}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentId: equipment!.id,
          ...formData,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        // Limpar formulário
        setFormData({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          customerCpfCnpj: "",
          startDate: "",
          endDate: "",
          startTime: "",
          endTime: "",
          notes: "",
        })
      } else {
        toast.error(data.error || "Erro ao criar reserva")
      }
    } catch (error) {
      console.error("Erro ao criar reserva:", error)
      toast.error("Erro ao criar reserva")
    } finally {
      setSubmitting(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando equipamento...</p>
        </div>
      </div>
    )
  }

  if (!equipment || !tenantData) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/${tenant}`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{tenantData.name}</h1>
              <p className="text-sm text-muted-foreground">
                {tenantData.phone} • {tenantData.email}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Imagens e Detalhes */}
          <div className="space-y-6">
            {/* Imagem Principal */}
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              {equipment.images && equipment.images.length > 0 ? (
                <img
                  src={equipment.images[0]}
                  alt={equipment.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Package className="h-24 w-24" />
                </div>
              )}
            </div>

            {/* Informações do Equipamento */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl">{equipment.name}</CardTitle>
                    <CardDescription className="mt-2 text-base">
                      {equipment.description || "Sem descrição disponível"}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-base">
                    {equipment.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{formatPrice(equipment.pricePerDay)}</span>
                      <span className="text-muted-foreground">/dia</span>
                    </div>
                    {equipment.pricePerHour && (
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl">{formatPrice(equipment.pricePerHour)}</span>
                        <span className="text-sm text-muted-foreground">/hora</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Disponibilidade</p>
                    <p className="text-sm text-muted-foreground">
                      {equipment.quantity} {equipment.quantity === 1 ? "unidade disponível" : "unidades disponíveis"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulário de Reserva */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Fazer Reserva</CardTitle>
              <CardDescription>
                Preencha o formulário abaixo para solicitar a reserva deste equipamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Dados do Cliente */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Seus Dados</h3>

                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                    <Input
                      id="cpfCnpj"
                      value={formData.customerCpfCnpj}
                      onChange={(e) => setFormData({ ...formData, customerCpfCnpj: e.target.value })}
                    />
                  </div>
                </div>

                {/* Período da Reserva */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Período da Reserva
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Data Início *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="endDate">Data Fim *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        min={formData.startDate || new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Hora Início</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="endTime">Hora Fim</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Informações adicionais sobre a reserva..."
                    rows={3}
                  />
                </div>

                {/* Total */}
                {formData.startDate && formData.endDate && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-medium">Valor Total</span>
                      <span className="text-3xl font-bold">{formatPrice(calculateTotal())}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      * Valor calculado com base nas diárias. O valor final será confirmado após análise.
                    </p>
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? (
                    "Enviando..."
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Solicitar Reserva
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Ao enviar, você receberá um email de confirmação e entraremos em contato para finalizar os detalhes.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
