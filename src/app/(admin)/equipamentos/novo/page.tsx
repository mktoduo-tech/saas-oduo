"use client"

import { useState } from "react"
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
import { RentalPeriodInput, type RentalPeriod } from "@/components/equipment"
import { toast } from "sonner"

const equipmentSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  category: z.string().min(2, "Categoria é obrigatória"),
  images: z.array(z.string()),
  pricePerHour: z.string().optional(),
})

type EquipmentFormData = z.infer<typeof equipmentSchema>

export default function NovoEquipamentoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [rentalPeriods, setRentalPeriods] = useState<RentalPeriod[]>([])
  const [trackingType, setTrackingType] = useState<"SERIALIZED" | "QUANTITY">("SERIALIZED")
  const [quantity, setQuantity] = useState<number>(1)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      images: [],
    },
  })

  const images = watch("images")

  const onSubmit = async (data: EquipmentFormData) => {
    // Validar períodos de locação
    if (rentalPeriods.length === 0) {
      toast.error("Adicione pelo menos um período de locação")
      return
    }

    // Validar quantidade para tipo QUANTITY
    if (trackingType === "QUANTITY" && quantity < 1) {
      toast.error("Informe a quantidade do estoque")
      return
    }

    setIsLoading(true)

    try {
      // Converter strings para números
      const payload = {
        name: data.name,
        description: data.description || null,
        category: data.category,
        images: data.images,
        pricePerHour: data.pricePerHour ? parseFloat(data.pricePerHour) : null,
        status: "AVAILABLE",
        rentalPeriods: rentalPeriods,
        trackingType: trackingType,
        // Para tipo QUANTITY, enviar a quantidade inicial do estoque
        quantity: trackingType === "QUANTITY" ? quantity : 0,
      }

      const response = await fetch("/api/equipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao criar equipamento")
      }

      const createdEquipment = await response.json()

      if (trackingType === "SERIALIZED") {
        toast.success("Equipamento criado! Agora cadastre as unidades físicas (números de série).")
        // Redirecionar para a página de unidades do equipamento criado
        router.push(`/equipamentos/${createdEquipment.id}/unidades`)
      } else {
        toast.success("Equipamento criado com sucesso!")
        // Redirecionar para a página de estoque para definir quantidade
        router.push(`/equipamentos/${createdEquipment.id}/estoque`)
      }
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar equipamento")
    } finally {
      setIsLoading(false)
    }
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
        <h1 className="text-4xl font-bold mb-2 font-headline tracking-wide">Novo Equipamento</h1>
        <p className="text-muted-foreground">
          Adicione um novo equipamento ao catálogo
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline tracking-wide">Informações do Equipamento</CardTitle>
            <CardDescription>
              Preencha os dados do equipamento
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

            {/* Tipo de Rastreamento */}
            <div className="space-y-2">
              <Label>Tipo de Controle de Estoque *</Label>
              <Select
                value={trackingType}
                onValueChange={(value) => setTrackingType(value as "SERIALIZED" | "QUANTITY")}
                disabled={isLoading}
              >
                <SelectTrigger className="max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SERIALIZED">
                    <div className="flex flex-col">
                      <span className="font-medium">Por Número de Série</span>
                      <span className="text-xs text-muted-foreground">
                        Cada unidade tem um serial único (ex: ferramentas, máquinas)
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="QUANTITY">
                    <div className="flex flex-col">
                      <span className="font-medium">Por Quantidade</span>
                      <span className="text-xs text-muted-foreground">
                        Controle apenas por quantidade total (ex: mesas, cadeiras)
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {trackingType === "SERIALIZED"
                  ? "Você poderá cadastrar cada unidade com número de série após criar o equipamento."
                  : "Apenas controle de quantidade disponível, sem rastreio individual."}
              </p>
            </div>

            {/* Quantidade - Apenas para tipo QUANTITY */}
            {trackingType === "QUANTITY" && (
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade em Estoque *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  disabled={isLoading}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Informe a quantidade total disponível deste equipamento
                </p>
              </div>
            )}

            {/* Imagens */}
            <div className="space-y-2">
              <Label>Imagens do Equipamento</Label>
              <ImageUpload
                value={images}
                onChange={(urls) => setValue("images", urls)}
                maxImages={5}
                disabled={isLoading}
              />
              {errors.images && (
                <p className="text-sm text-red-500">{errors.images.message}</p>
              )}
            </div>

            {/* Períodos de Locação */}
            <RentalPeriodInput
              value={rentalPeriods}
              onChange={setRentalPeriods}
              disabled={isLoading}
            />

            {/* Preço por Hora (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="pricePerHour">Preço por Hora (R$) - Opcional</Label>
              <Input
                id="pricePerHour"
                type="number"
                step="0.01"
                placeholder="0.00 (para locações por hora)"
                disabled={isLoading}
                className="max-w-xs"
                {...register("pricePerHour")}
              />
              <p className="text-xs text-muted-foreground">
                Preencha apenas se oferecer locação por hora
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Criando..." : "Criar Equipamento"}
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
