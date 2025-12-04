"use client"

import { useState, useMemo } from "react"
import { LeadCard } from "./lead-card"
import { LeadStatusBadge } from "./lead-status-badge"
import { cn } from "@/lib/utils"
import { DollarSign } from "lucide-react"

type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "WON" | "LOST"

interface Lead {
  id: string
  name: string
  company?: string | null
  email?: string | null
  phone?: string | null
  whatsapp?: string | null
  city?: string | null
  state?: string | null
  status: LeadStatus
  source: "DIRECT" | "REFERRAL" | "WEBSITE" | "COLD_CALL" | "SOCIAL_MEDIA" | "EVENT" | "OTHER"
  contactType: "PRESENCIAL" | "ONLINE"
  expectedValue?: number | null
  nextAction?: string | null
  nextActionDate?: string | null
  assignedTo?: {
    id: string
    name: string | null
    email: string | null
  } | null
  _count?: {
    activities: number
  }
  updatedAt: string
}

interface LeadKanbanProps {
  leads: Lead[]
  className?: string
}

const columns: { status: LeadStatus; label: string; color: string }[] = [
  { status: "NEW", label: "Novo", color: "border-blue-500/30" },
  { status: "CONTACTED", label: "Contatado", color: "border-yellow-500/30" },
  { status: "QUALIFIED", label: "Qualificado", color: "border-purple-500/30" },
  { status: "PROPOSAL", label: "Proposta", color: "border-orange-500/30" },
  { status: "WON", label: "Ganho", color: "border-green-500/30" },
  { status: "LOST", label: "Perdido", color: "border-red-500/30" },
]

export function LeadKanban({ leads, className }: LeadKanbanProps) {
  const [activeTab, setActiveTab] = useState<LeadStatus>("NEW")

  // Agrupar leads por status
  const leadsByStatus = useMemo(() => {
    const grouped: Record<LeadStatus, Lead[]> = {
      NEW: [],
      CONTACTED: [],
      QUALIFIED: [],
      PROPOSAL: [],
      WON: [],
      LOST: [],
    }

    leads.forEach((lead) => {
      grouped[lead.status].push(lead)
    })

    return grouped
  }, [leads])

  // Calcular totais por status
  const totalsByStatus = useMemo(() => {
    const totals: Record<LeadStatus, { count: number; value: number }> = {
      NEW: { count: 0, value: 0 },
      CONTACTED: { count: 0, value: 0 },
      QUALIFIED: { count: 0, value: 0 },
      PROPOSAL: { count: 0, value: 0 },
      WON: { count: 0, value: 0 },
      LOST: { count: 0, value: 0 },
    }

    leads.forEach((lead) => {
      totals[lead.status].count++
      totals[lead.status].value += lead.expectedValue || 0
    })

    return totals
  }, [leads])

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Mobile: Tabs
  const MobileView = () => (
    <div className="md:hidden">
      {/* Tabs */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-1 p-1 min-w-max">
          {columns.map((column) => (
            <button
              key={column.status}
              onClick={() => setActiveTab(column.status)}
              className={cn(
                "flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                "flex flex-col items-center gap-0.5 min-w-[80px]",
                activeTab === column.status
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              )}
            >
              <span>{column.label}</span>
              <span className="text-xs opacity-70">
                ({totalsByStatus[column.status].count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="mt-4 space-y-3">
        {leadsByStatus[activeTab].length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            Nenhum lead nesta etapa
          </div>
        ) : (
          leadsByStatus[activeTab].map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))
        )}
      </div>
    </div>
  )

  // Desktop: Kanban columns
  const DesktopView = () => (
    <div className="hidden md:block">
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {columns.map((column) => (
            <div
              key={column.status}
              className={cn(
                "flex-shrink-0 w-[300px] rounded-lg",
                "bg-zinc-900/30 border border-zinc-800",
                column.color
              )}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LeadStatusBadge status={column.status} />
                    <span className="text-sm text-zinc-500">
                      ({totalsByStatus[column.status].count})
                    </span>
                  </div>
                  {totalsByStatus[column.status].value > 0 && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(totalsByStatus[column.status].value)}
                    </span>
                  )}
                </div>
              </div>

              {/* Cards */}
              <div className="p-2 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
                {leadsByStatus[column.status].length === 0 ? (
                  <div className="text-center py-8 text-zinc-600 text-sm">
                    Nenhum lead
                  </div>
                ) : (
                  leadsByStatus[column.status].map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className={className}>
      <MobileView />
      <DesktopView />
    </div>
  )
}
