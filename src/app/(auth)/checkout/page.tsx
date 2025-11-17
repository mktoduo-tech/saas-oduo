"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { signIn } from "next-auth/react"

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
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  ArrowLeft,
  CreditCard,
  Lock,
  Check,
  Building,
  User,
  Mail,
  Loader2,
} from "lucide-react"

// Plan definitions
const plans = {
  starter: {
    name: "Starter",
    price: 97,
    description: "Para locadoras iniciantes",
    features: ["Até 50 equipamentos", "100 reservas/mês", "1 usuário"],
  },
  professional: {
    name: "Professional",
    price: 197,
    description: "Para locadoras em crescimento",
    features: ["Até 200 equipamentos", "Reservas ilimitadas", "5 usuários"],
  },
  enterprise: {
    name: "Enterprise",
    price: 397,
    description: "Para grandes operações",
    features: ["Equipamentos ilimitados", "Reservas ilimitadas", "Usuários ilimitados"],
  },
}

const paymentSchema = z.object({
  cardNumber: z.string().min(16, "Número do cartão inválido"),
  cardName: z.string().min(3, "Nome no cartão inválido"),
  cardExpiry: z.string().min(5, "Data de validade inválida"),
  cardCvv: z.string().min(3, "CVV inválido"),
})

type PaymentFormData = z.infer<typeof paymentSchema>

// Force dynamic rendering due to useSearchParams
export const dynamic = 'force-dynamic'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [checkoutData, setCheckoutData] = useState<any>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>("professional")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  })

  useEffect(() => {
    // Get checkout data from localStorage
    const pendingCheckout = localStorage.getItem("pendingCheckout")
    if (!pendingCheckout) {
      toast.error("Sessão expirada. Por favor, cadastre-se novamente.")
      router.push("/planos")
      return
    }

    const data = JSON.parse(pendingCheckout)

    // Check if session is older than 30 minutes
    if (Date.now() - data.timestamp > 30 * 60 * 1000) {
      localStorage.removeItem("pendingCheckout")
      toast.error("Sessão expirada. Por favor, cadastre-se novamente.")
      router.push("/planos")
      return
    }

    setCheckoutData(data)
    setSelectedPlan(data.plan || searchParams.get("plano") || "professional")
  }, [router, searchParams])

  const onSubmit = async (data: PaymentFormData) => {
    setIsLoading(true)

    try {
      // In production, this would integrate with Stripe, Mercado Pago, etc.
      // For now, we'll simulate a payment processing

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Process payment
      const response = await fetch("/api/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          tenantId: checkoutData.tenantId,
          plan: selectedPlan,
          amount: plans[selectedPlan as keyof typeof plans].price,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || "Erro ao processar pagamento")
        return
      }

      toast.success("Pagamento processado com sucesso!")

      // Auto-login the user using the secure token
      if (checkoutData.autoLoginToken) {
        try {
          const loginResult = await signIn("auto-login", {
            token: checkoutData.autoLoginToken,
            redirect: false,
          })

          if (loginResult?.error) {
            console.error("Auto-login failed:", loginResult.error)
            toast.error("Por favor, faça login para acessar seu painel.")
            // Clean up and redirect to login
            localStorage.removeItem("pendingCheckout")
            localStorage.removeItem("selectedPlan")
            router.push(`/login?email=${encodeURIComponent(checkoutData.email)}`)
            return
          }
        } catch (error) {
          console.error("Auto-login error:", error)
          toast.error("Erro ao fazer login. Por favor, faça login manualmente.")
          localStorage.removeItem("pendingCheckout")
          localStorage.removeItem("selectedPlan")
          router.push(`/login?email=${encodeURIComponent(checkoutData.email)}`)
          return
        }
      }

      // Clear all temporary data
      localStorage.removeItem("pendingCheckout")
      localStorage.removeItem("selectedPlan")

      // Redirect to success page
      router.push(
        `/sucesso?tenant=${checkoutData.tenantSlug}&plano=${selectedPlan}`
      )
    } catch (error) {
      toast.error("Erro ao processar pagamento. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!checkoutData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const currentPlan = plans[selectedPlan as keyof typeof plans]

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 xl:p-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link
          href="/cadastro"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Link>

        <div className="grid gap-6 lg:gap-10 xl:gap-12 lg:grid-cols-2">
          {/* Order Summary */}
          <div className="space-y-6">
            <div>
              <h1 className="font-headline tracking-wide text-2xl sm:text-3xl font-bold mb-2 text-gray-900">Finalizar Pagamento</h1>
              <p className="text-sm sm:text-base text-gray-600">
                Revise seu pedido e complete o pagamento
              </p>
            </div>

            {/* Account Info */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="font-headline tracking-wide text-lg text-gray-900">Informações da Conta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Locadora</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {checkoutData.tenantSlug}.seudominio.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {checkoutData.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plan Details */}
            <Card className="border-2 border-primary/20 bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-headline tracking-wide text-lg">{currentPlan.name}</CardTitle>
                  <Badge variant="secondary" className="text-base">
                    R$ {currentPlan.price}/mês
                  </Badge>
                </div>
                <CardDescription>{currentPlan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Pricing Breakdown */}
            <Card className="bg-white border-gray-200">
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Plano {currentPlan.name}</span>
                  <span>R$ {currentPlan.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>14 dias grátis</span>
                  <span>- R$ {currentPlan.price.toFixed(2)}</span>
                </div>
                <div className="border-t border-border" />
                <div className="flex justify-between font-bold">
                  <span>Total hoje</span>
                  <span className="text-xl">R$ 0,00</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Você será cobrado R$ {currentPlan.price.toFixed(2)} após o período de teste
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <Card className="sticky top-6 bg-white border-gray-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  <CardTitle className="font-headline tracking-wide text-lg">Informações de Pagamento</CardTitle>
                </div>
                <CardDescription>
                  Seus dados estão protegidos e criptografados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Número do Cartão</Label>
                    <Input
                      id="cardNumber"
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      disabled={isLoading}
                      {...register("cardNumber")}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s/g, "")
                        const formatted = value.match(/.{1,4}/g)?.join(" ") || value
                        e.target.value = formatted
                        register("cardNumber").onChange(e)
                      }}
                    />
                    {errors.cardNumber && (
                      <p className="text-sm text-red-500">{errors.cardNumber.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardName">Nome no Cartão</Label>
                    <Input
                      id="cardName"
                      placeholder="João Silva"
                      disabled={isLoading}
                      {...register("cardName")}
                    />
                    {errors.cardName && (
                      <p className="text-sm text-red-500">{errors.cardName.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardExpiry">Validade</Label>
                      <Input
                        id="cardExpiry"
                        placeholder="MM/AA"
                        maxLength={5}
                        disabled={isLoading}
                        {...register("cardExpiry")}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "")
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + "/" + value.slice(2, 4)
                          }
                          e.target.value = value
                          register("cardExpiry").onChange(e)
                        }}
                      />
                      {errors.cardExpiry && (
                        <p className="text-sm text-red-500">{errors.cardExpiry.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardCvv">CVV</Label>
                      <Input
                        id="cardCvv"
                        placeholder="123"
                        maxLength={4}
                        disabled={isLoading}
                        {...register("cardCvv")}
                      />
                      {errors.cardCvv && (
                        <p className="text-sm text-red-500">{errors.cardCvv.message}</p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full text-base"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Confirmar Pagamento
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span>Pagamento seguro e criptografado</span>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
