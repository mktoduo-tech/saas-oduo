"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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
import { ImageUpload } from "@/components/ui/image-upload"
import { toast } from "sonner"

const equipmentSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  category: z.string().min(2, "Categoria é obrigatória"),
  images: z.array(z.string()),
  pricePerHour: z.string().optional(),
  pricePerDay: z.string().min(1, "Preço por dia é obrigatório"),
  quantity: z.string().min(1, "Quantidade é obrigatória"),
  status: z.enum(["AVAILABLE", "RENTED", "MAINTENANCE", "INACTIVE"]),
})

type EquipmentFormData = z.infer<typeof equipmentSchema>

export default function EditarEquipamentoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
  })

  const status = watch("status")
  const images = watch("images")

  useEffect(() => {
    fetchEquipment()
  }, [])

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/equipments/${resolvedParams.id}`)

      if (!response.ok) {
        throw new Error("Equipamento não encontrado")
      }

      const equipment = await response.json()

      // Preencher formulário
      setValue("name", equipment.name)
      setValue("description", equipment.description || "")
      setValue("category", equipment.category)
      setValue("images", equipment.images || [])
      setValue(
        "pricePerHour",
        equipment.pricePerHour ? String(equipment.pricePerHour) : ""
      )
      setValue("pricePerDay", String(equipment.pricePerDay))
      setValue("quantity", String(equipment.quantity))
      setValue("status", equipment.status)
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar equipamento")
      router.push("/equipamentos")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: EquipmentFormData) => {
    setIsLoading(true)

    try {
      // Converter strings para números
      const payload = {
        name: data.name,
        description: data.description || null,
        category: data.category,
        images: data.images,
        pricePerHour: data.pricePerHour ? parseFloat(data.pricePerHour) : null,
        pricePerDay: parseFloat(data.pricePerDay),
        quantity: parseInt(data.quantity),
        status: data.status,
      }

      const response = await fetch(`/api/equipments/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao atualizar equipamento")
      }

      toast.success("Equipamento atualizado com sucesso!")
      router.push("/equipamentos")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar equipamento")
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link href="/equipamentos">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-4xl font-bold mb-2 font-headline tracking-wide">Editar Equipamento</h1>
        <p className="text-muted-foreground">
          Atualize as informações do equipamento
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Button variant="secondary" size="sm">
          Editar
        </Button>
        <Link href={`/equipamentos/${resolvedParams.id}/financeiro`}>
          <Button variant="ghost" size="sm">
            Financeiro
          </Button>
        </Link>
        <Link href={`/equipamentos/${resolvedParams.id}/documentos`}>
          <Button variant="ghost" size="sm">
            Documentos
          </Button>
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline tracking-wide">Informações do Equipamento</CardTitle>
            <CardDescription>
              Atualize os dados do equipamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Ex: Betoneira 400L"
                disabled={isLoading}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o equipamento, características, especificações..."
                rows={4}
                disabled={isLoading}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Input
                id="category"
                placeholder="Ex: Construção, Jardinagem, Festa"
                disabled={isLoading}
                {...register("category")}
              />
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>

            {/* Imagens */}
            <div className="space-y-2">
              <Label>Imagens do Equipamento</Label>
              <ImageUpload
                value={images || []}
                onChange={(urls) => setValue("images", urls)}
                maxImages={5}
                disabled={isLoading}
              />
              {errors.images && (
                <p className="text-sm text-red-500">{errors.images.message}</p>
              )}
            </div>

            {/* Preços */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pricePerDay">Preço por Dia (R$) *</Label>
                <Input
                  id="pricePerDay"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  disabled={isLoading}
                  {...register("pricePerDay")}
                />
                {errors.pricePerDay && (
                  <p className="text-sm text-red-500">
                    {errors.pricePerDay.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerHour">Preço por Hora (R$)</Label>
                <Input
                  id="pricePerHour"
                  type="number"
                  step="0.01"
                  placeholder="0.00 (opcional)"
                  disabled={isLoading}
                  {...register("pricePerHour")}
                />
                {errors.pricePerHour && (
                  <p className="text-sm text-red-500">
                    {errors.pricePerHour.message}
                  </p>
                )}
              </div>
            </div>

            {/* Quantidade e Status */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  disabled={isLoading}
                  {...register("quantity")}
                />
                {errors.quantity && (
                  <p className="text-sm text-red-500">
                    {errors.quantity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={status}
                  onValueChange={(value) =>
                    setValue("status", value as any)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Disponível</SelectItem>
                    <SelectItem value="RENTED">Alugado</SelectItem>
                    <SelectItem value="MAINTENANCE">Manutenção</SelectItem>
                    <SelectItem value="INACTIVE">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status.message}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Link href="/equipamentos" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  className="w-full"
                >
                  Cancelar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
