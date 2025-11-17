"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, Loader2, ArrowRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const plans = {
  starter: { name: "Starter", price: 97 },
  professional: { name: "Professional", price: 197 },
  enterprise: { name: "Enterprise", price: 397 },
}

// Force dynamic rendering due to useSearchParams
export const dynamic = 'force-dynamic'

function SucessoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(5)
  const [tenantSlug, setTenantSlug] = useState<string>("")
  const [plan, setPlan] = useState<string>("professional")
  const [tenantDomain, setTenantDomain] = useState<string>("")

  useEffect(() => {
    const tenant = searchParams.get("tenant")
    const planParam = searchParams.get("plano")

    if (!tenant) {
      router.push("/planos")
      return
    }

    setTenantSlug(tenant)
    if (planParam) setPlan(planParam)

    // Set tenant domain for display
    const isLocalhost = window.location.hostname === 'localhost'
    const domain = isLocalhost
      ? `${tenant}.localhost:3000`
      : `${tenant}.${window.location.hostname}`
    setTenantDomain(domain)

    // Countdown to redirect to dashboard
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Redirect to dashboard (user is already logged in from checkout)
          router.push(`/dashboard`)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [searchParams, router])

  const currentPlan = plans[plan as keyof typeof plans]

  const handleRedirectNow = () => {
    // Redirect to dashboard (user is already logged in)
    router.push('/dashboard')
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12">
      <div className="w-full max-w-3xl">
        <Card className="border-2 border-green-500/20 bg-green-50/5">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="font-headline tracking-wide text-2xl sm:text-3xl">
              Pagamento Confirmado!
            </CardTitle>
            <CardDescription className="text-base">
              Sua conta foi criada com sucesso
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Account Details */}
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sua locadora</p>
                  <p className="font-semibold break-all">
                    {tenantDomain || `${tenantSlug}.seudominio.com`}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {currentPlan.name}
                </Badge>
              </div>

              <div className="border-t pt-3">
                <p className="text-sm text-muted-foreground">Plano selecionado</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="font-semibold">{currentPlan.name}</p>
                  <p className="text-lg font-bold">R$ {currentPlan.price}/mês</p>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  ✓ 14 dias grátis - Primeiro pagamento em{" "}
                  {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(
                    "pt-BR"
                  )}
                </p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-3">
              <h3 className="font-headline tracking-wide font-semibold text-base sm:text-lg">Próximos passos:</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Acesse seu painel</p>
                    <p className="text-sm text-muted-foreground">
                      Configure sua locadora e adicione equipamentos
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Cadastre seus equipamentos</p>
                    <p className="text-sm text-muted-foreground">
                      Adicione fotos, preços e disponibilidade
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Comece a receber reservas</p>
                    <p className="text-sm text-muted-foreground">
                      Compartilhe o link da sua locadora com clientes
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Redirect Button */}
            <div className="pt-4 space-y-3">
              <Button
                onClick={handleRedirectNow}
                className="w-full text-base"
                size="lg"
              >
                Acessar Minha Locadora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecionando em {countdown} segundo{countdown !== 1 ? "s" : ""}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Redirecionando...</p>
                )}
              </div>
            </div>

            {/* Help Text */}
            <div className="pt-4 border-t text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Um email de confirmação foi enviado para sua caixa de entrada
              </p>
              <p className="text-xs text-muted-foreground">
                Precisa de ajuda?{" "}
                <a href="mailto:suporte@seudominio.com" className="text-primary hover:underline">
                  Fale com nosso suporte
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SucessoPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SucessoContent />
    </Suspense>
  )
}
