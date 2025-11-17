"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ArrowLeft, Check } from "lucide-react"

const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string(),
  tenantName: z.string().min(3, "Nome da locadora deve ter no mínimo 3 caracteres"),
  tenantSlug: z.string()
    .min(3, "Slug deve ter no mínimo 3 caracteres")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens"),
  phone: z.string().min(10, "Telefone inválido"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

// Plan definitions
const plans = {
  starter: { name: "Starter", price: 97, color: "bg-gray-100" },
  professional: { name: "Professional", price: 197, color: "bg-primary/10" },
  enterprise: { name: "Enterprise", price: 397, color: "bg-purple-100" },
}

// Force dynamic rendering due to useSearchParams
export const dynamic = 'force-dynamic'

function CadastroContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>("professional")

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const tenantName = watch("tenantName")

  // Get plan from URL parameter or localStorage
  useEffect(() => {
    const planFromUrl = searchParams.get("plano")
    const planFromStorage = localStorage.getItem("selectedPlan")
    const plan = planFromUrl || planFromStorage || "professional"

    if (plan && (plan === "starter" || plan === "professional" || plan === "enterprise")) {
      setSelectedPlan(plan)
    }
  }, [searchParams])

  // Auto-generate slug from tenant name
  const handleTenantNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    setValue("tenantSlug", slug)
  }

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          tenantName: data.tenantName,
          tenantSlug: data.tenantSlug,
          phone: data.phone,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || "Erro ao criar conta")
        return
      }

      toast.success("Conta criada com sucesso!")

      // Store registration data for checkout
      localStorage.setItem("pendingCheckout", JSON.stringify({
        tenantId: result.tenant.id,
        tenantSlug: result.tenant.slug,
        email: data.email,
        plan: selectedPlan,
        autoLoginToken: result.autoLoginToken,
        timestamp: Date.now()
      }))

      // Redirect to checkout
      router.push(`/checkout?plano=${selectedPlan}`)
    } catch (error) {
      toast.error("Erro ao criar conta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const currentPlan = plans[selectedPlan as keyof typeof plans]

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12">
      <div className="w-full max-w-3xl space-y-4">
        {/* Back to Plans Link */}
        <Link href="/planos" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para planos
        </Link>

      {/* Selected Plan Badge */}
      <Card className={`border-2 ${currentPlan.color}`}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Plano selecionado</p>
              <p className="text-base sm:text-lg font-bold">{currentPlan.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm sm:text-base">
                R$ {currentPlan.price}/mês
              </Badge>
              <Check className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader className="space-y-1 sm:space-y-2 px-4 sm:px-6 pt-6 sm:pt-8">
          <CardTitle className="font-headline tracking-wide text-xl sm:text-2xl text-center">Criar Conta</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Cadastre sua locadora e comece a usar o sistema
          </CardDescription>
        </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Seu Nome</Label>
              <Input
                id="name"
                placeholder="João Silva"
                disabled={isLoading}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                disabled={isLoading}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenantName">Nome da Locadora</Label>
            <Input
              id="tenantName"
              placeholder="Locadora ABC"
              disabled={isLoading}
              {...register("tenantName")}
              onChange={(e) => {
                register("tenantName").onChange(e)
                handleTenantNameChange(e)
              }}
            />
            {errors.tenantName && (
              <p className="text-sm text-red-500">{errors.tenantName.message}</p>
            )}
          </div>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tenantSlug" className="text-sm">Slug da Locadora</Label>
              <Input
                id="tenantSlug"
                placeholder="locadora-abc"
                disabled={isLoading}
                {...register("tenantSlug")}
              />
              {errors.tenantSlug && (
                <p className="text-xs sm:text-sm text-red-500">{errors.tenantSlug.message}</p>
              )}
              <p className="text-[10px] sm:text-xs text-muted-foreground break-all">
                {watch("tenantSlug") || "seu-slug"}.seudominio.com
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                disabled={isLoading}
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Criando conta..." : "Criar Conta"}
          </Button>
        </form>
      </CardContent>
        <CardFooter className="flex flex-col space-y-2 px-4 sm:px-6 pb-6 sm:pb-8">
          <div className="text-xs sm:text-sm text-muted-foreground text-center">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Faça login
            </Link>
          </div>
        </CardFooter>
      </Card>
      </div>
    </div>
  )
}

export default function CadastroPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <CadastroContent />
    </Suspense>
  )
}
