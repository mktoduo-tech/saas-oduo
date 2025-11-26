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

    // Verificar módulos habilitados
    useEffect(() => {
        async function fetchModules() {
            try {
                const response = await fetch("/api/tenant/modules")
                if (response.ok) {
                    const data = await response.json()
                    setModules(data)
                }
            } catch {
                // Silently fail - usa valores padrão
            }
        }
        fetchModules()
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
        <div className={cn("space-y-4 py-4 flex flex-col h-full bg-gray-900/50 backdrop-blur-xl border-r border-white/10", className)}>
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-lg blur opacity-75 animate-pulse" />
                        <div className="relative w-full h-full bg-black rounded-lg border border-white/10 flex items-center justify-center">
                            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">O</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        SaaS Oduo
                    </h1>
                </Link>
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
            <div className="px-3 py-2">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-white/5 mb-4">
                    <h4 className="text-sm font-semibold text-white mb-1">Plano Pro</h4>
                    <p className="text-xs text-zinc-400 mb-3">Sua licença expira em 15 dias</p>
                    <Button size="sm" variant="glass" className="w-full text-xs h-8">
                        Renovar Agora
                    </Button>
                </div>
            </div>
        </div>
    )
}
