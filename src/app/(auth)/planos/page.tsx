"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ArrowRight, Sparkles } from "lucide-react"
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
    localStorage.setItem("selectedPlan", planId)
    router.push(`/cadastro?plano=${planId}`)
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12 bg-[#030712] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-blue-400 mb-4">
            <Sparkles className="h-4 w-4" />
            Planos flexíveis
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white tracking-tight">
            Escolha o plano ideal
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Comece com 14 dias grátis. Cancele a qualquer momento.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-[1400px] mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative bg-white/5 border-white/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 ${plan.popular
                  ? "border-blue-500/50 shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)]"
                  : "hover:border-white/20 hover:bg-white/10"
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 px-4 py-1 text-sm font-medium shadow-lg">
                    MAIS POPULAR
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-8 pt-8">
                <CardTitle className="text-2xl text-white mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-gray-400">
                  {plan.description}
                </CardDescription>
                <div className="pt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      R$ {plan.price}
                    </span>
                    <span className="text-gray-400">
                      /{plan.period}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3.5 w-3.5 text-blue-400" />
                      </div>
                      <span className="text-sm text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full h-12 text-base ${plan.popular
                      ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                      : "bg-white/10 hover:bg-white/20 text-white border-0"
                    }`}
                >
                  Selecionar Plano
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-400" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-400" />
              <span>14 dias grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-400" />
              <span>Cancele quando quiser</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
