"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Calendar,
    CalendarDays,
    Users,
    Package,
    Settings,
    HelpCircle,
    CreditCard,
    BarChart3,
    FileCode,
    Warehouse,
    FileText,
    AlertTriangle,
    Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
    className?: string
}

interface TenantModules {
    nfseEnabled: boolean
    stockEnabled: boolean
    financialEnabled: boolean
    reportsEnabled: boolean
    apiEnabled: boolean
    webhooksEnabled: boolean
    multiUserEnabled: boolean
    customDomainsEnabled: boolean
}

interface SubscriptionInfo {
    hasSubscription: boolean
    plan: { name: string; slug: string } | null
    status: string | null
    daysRemaining: number
    isInTrial: boolean
    expiresAt: string | null
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()
    const [modules, setModules] = useState<TenantModules>({
        nfseEnabled: false,
        stockEnabled: true,
        financialEnabled: true,
        reportsEnabled: true,
        apiEnabled: false,
        webhooksEnabled: false,
        multiUserEnabled: true,
        customDomainsEnabled: false,
    })
    const [subscription, setSubscription] = useState<SubscriptionInfo>({
        hasSubscription: false,
        plan: null,
        status: null,
        daysRemaining: 0,
        isInTrial: false,
        expiresAt: null,
    })

    // Verificar módulos habilitados e assinatura
    useEffect(() => {
        async function fetchData() {
            try {
                const [modulesRes, subscriptionRes] = await Promise.all([
                    fetch("/api/tenant/modules"),
                    fetch("/api/tenant/subscription"),
                ])

                if (modulesRes.ok) {
                    const data = await modulesRes.json()
                    setModules(data)
                }

                if (subscriptionRes.ok) {
                    const data = await subscriptionRes.json()
                    setSubscription(data)
                }
            } catch {
                // Silently fail - usa valores padrão
            }
        }
        fetchData()
    }, [])

    const routes = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/dashboard",
            color: "text-blue-400",
        },
        {
            label: "Reservas",
            icon: Calendar,
            href: "/reservas",
            color: "text-purple-400",
        },
        {
            label: "Calendário",
            icon: CalendarDays,
            href: "/calendario",
            color: "text-indigo-400",
        },
        {
            label: "Clientes",
            icon: Users,
            href: "/clientes",
            color: "text-emerald-400",
        },
        {
            label: "Equipamentos",
            icon: Package,
            href: "/equipamentos",
            color: "text-amber-400",
        },
        // Estoque - condicional
        ...(modules.stockEnabled ? [{
            label: "Estoque",
            icon: Warehouse,
            href: "/estoque",
            color: "text-teal-400",
        }] : []),
        // Financeiro - condicional
        ...(modules.financialEnabled ? [{
            label: "Financeiro",
            icon: CreditCard,
            href: "/financeiro",
            color: "text-pink-400",
        }] : []),
        // Notas Fiscais - condicional
        ...(modules.nfseEnabled ? [{
            label: "Notas Fiscais",
            icon: FileText,
            href: "/notas-fiscais",
            color: "text-green-400",
        }] : []),
        // Relatórios - condicional
        ...(modules.reportsEnabled ? [{
            label: "Relatórios",
            icon: BarChart3,
            href: "/relatorios",
            color: "text-cyan-400",
        }] : []),
        {
            label: "Configurações",
            icon: Settings,
            href: "/configuracoes",
            color: "text-gray-400",
        },
        {
            label: "Ajuda",
            icon: HelpCircle,
            href: "/ajuda",
            color: "text-orange-400",
        },
        // API Docs - condicional
        ...(modules.apiEnabled ? [{
            label: "API Docs",
            icon: FileCode,
            href: "/api-docs",
            color: "text-violet-400",
        }] : []),
    ]

    return (
        <div className={cn("py-4 flex flex-col h-full bg-gray-900/50 backdrop-blur-xl border-r border-white/10", className)}>
            {/* Logo - Fixo no topo */}
            <div className="px-3 py-2 flex-shrink-0">
                <Link href="/dashboard" className="flex items-center justify-center mb-6">
                    <img src="/logo.svg" alt="ODuoLoc" className="h-24 w-auto" />
                </Link>
            </div>

            {/* Navegação - Scrollável */}
            <div className="px-3 py-2 flex-1 overflow-y-auto sidebar-scroll">
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 border border-transparent",
                                pathname === route.href
                                    ? "text-white bg-white/10 border-white/10 shadow-[0_0_15px_-3px_rgba(255,255,255,0.1)]"
                                    : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3 transition-colors", route.color)} />
                                {route.label}
                            </div>
                            {pathname === route.href && (
                                <div className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_5px_#3b82f6]" />
                            )}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Plano - Fixo no rodapé */}
            <div className="px-3 py-2 flex-shrink-0">
                {subscription.hasSubscription ? (
                    <div className={cn(
                        "p-4 rounded-xl border mb-4",
                        subscription.daysRemaining <= 7
                            ? "bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20"
                            : subscription.daysRemaining <= 15
                            ? "bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20"
                            : "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-white/5"
                    )}>
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-white">
                                {subscription.plan?.name || "Plano"}
                            </h4>
                            {subscription.isInTrial && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-medium">
                                    TRIAL
                                </span>
                            )}
                        </div>
                        <p className={cn(
                            "text-xs mb-3 flex items-center gap-1",
                            subscription.daysRemaining <= 7 ? "text-red-400" : "text-zinc-400"
                        )}>
                            {subscription.daysRemaining <= 7 && <AlertTriangle className="h-3 w-3" />}
                            {subscription.daysRemaining <= 0 ? (
                                "Sua licença expirou!"
                            ) : subscription.daysRemaining === 1 ? (
                                "Sua licença expira amanhã"
                            ) : (
                                `Sua licença expira em ${subscription.daysRemaining} dias`
                            )}
                        </p>
                        <Link href="/renovar">
                            <Button
                                size="sm"
                                variant={subscription.daysRemaining <= 7 ? "destructive" : "glass"}
                                className="w-full text-xs h-8"
                            >
                                <Clock className="h-3 w-3 mr-1" />
                                {subscription.daysRemaining <= 0 ? "Renovar Agora" : "Renovar Plano"}
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-white/5 mb-4">
                        <h4 className="text-sm font-semibold text-white mb-1">Sem Plano Ativo</h4>
                        <p className="text-xs text-zinc-400 mb-3">Escolha um plano para continuar</p>
                        <Link href="/planos">
                            <Button size="sm" variant="glass" className="w-full text-xs h-8">
                                Ver Planos
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
