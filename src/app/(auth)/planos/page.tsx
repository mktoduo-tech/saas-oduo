"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Plan {
  id: string
  name: string
  price: number
  period: string
  description: string
  popular?: boolean
  features: string[]
}

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 97,
    period: "mês",
    description: "Para locadoras iniciantes",
    features: [
      "Até 50 equipamentos",
      "100 reservas/mês",
      "1 usuário",
      "Suporte por email",
      "Relatórios básicos",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 197,
    period: "mês",
    description: "Para locadoras em crescimento",
    popular: true,
    features: [
      "Até 200 equipamentos",
      "Reservas ilimitadas",
      "5 usuários",
      "Suporte prioritário",
      "Relatórios avançados",
      "API de integração",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 397,
    period: "mês",
    description: "Para grandes operações",
    features: [
      "Equipamentos ilimitados",
      "Reservas ilimitadas",
      "Usuários ilimitados",
      "Suporte 24/7",
      "Gerente dedicado",
      "Personalização completa",
    ],
  },
]

export default function PlanosPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
    // Store selected plan in localStorage for use in signup
    localStorage.setItem("selectedPlan", planId)
    // Navigate to signup with plan parameter
    router.push(`/cadastro?plano=${planId}`)
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="font-headline tracking-wide text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-gray-900">
            Escolha seu plano
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
            Selecione o plano ideal para o tamanho da sua locadora.
            Todos os planos incluem 14 dias de teste grátis.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 sm:gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-[1400px] mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative bg-white border-2 transition-all hover:shadow-xl ${
                plan.popular
                  ? "border-primary shadow-lg lg:scale-105"
                  : "border-gray-200 hover:border-primary/50"
              } ${
                selectedPlan === plan.id
                  ? "border-primary ring-2 ring-primary/20"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-yellow-500 text-yellow-900 hover:bg-yellow-500 px-3 py-1 text-xs sm:text-sm font-bold whitespace-nowrap">
                    MAIS POPULAR
                  </Badge>
                </div>
              )}

              <CardHeader className="space-y-2 pb-6 sm:pb-8 pt-6 sm:pt-8">
                <CardTitle className="font-headline tracking-wide text-xl sm:text-2xl text-gray-900">{plan.name}</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-600">
                  {plan.description}
                </CardDescription>
                <div className="pt-2 sm:pt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                      R$ {plan.price}
                    </span>
                    <span className="text-sm sm:text-base text-gray-600">
                      /{plan.period}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 sm:space-y-6">
                {/* Features List */}
                <ul className="space-y-2 sm:space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-gray-900">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full text-sm sm:text-base ${
                    plan.popular
                      ? "bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  Selecionar Plano
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-8 sm:mt-12 text-center space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>14 dias grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Cancele quando quiser</span>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Após o período de teste, você será cobrado automaticamente
          </p>
        </div>
      </div>
    </div>
  )
}
