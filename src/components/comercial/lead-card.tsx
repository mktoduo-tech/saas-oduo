"use client"

import { Card } from "@/components/ui/card"
import { LeadStatusBadge, LeadSourceBadge } from "./lead-status-badge"
import {
  Phone,
  Mail,
  DollarSign,
  Clock,
  Building2,
  MessageCircle,
  MapPin,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Lead {
  id: string
  name: string
  company?: string | null
  email?: string | null
  phone?: string | null
  whatsapp?: string | null
  city?: string | null
  state?: string | null
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "WON" | "LOST"
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

interface LeadCardProps {
  lead: Lead
  className?: string
}

export function LeadCard({ lead, className }: LeadCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const isOverdue = lead.nextActionDate && new Date(lead.nextActionDate) < new Date()

  return (
    <Link href={`/comercial/${lead.id}`}>
      <Card
        className={cn(
          "p-4 min-h-[100px] cursor-pointer",
          "bg-zinc-900/50 border-zinc-800",
          "hover:bg-zinc-800/50 hover:border-zinc-700",
          "active:scale-[0.98] transition-all duration-200",
          className
        )}
      >
        {/* Header */}
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="flex-1 min-w-0">
            {lead.company && (
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-0.5">
                <Building2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{lead.company}</span>
              </div>
            )}
            <h3 className="font-semibold text-white text-sm truncate">
              {lead.name}
            </h3>
          </div>
          <LeadSourceBadge source={lead.source} className="text-[10px] px-1.5 py-0" />
        </div>

        {/* Contact Info */}
        <div className="space-y-1.5 text-xs">
          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <Phone className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{lead.phone}</span>
            </a>
          )}

          {lead.whatsapp && (
            <a
              href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{lead.whatsapp}</span>
            </a>
          )}

          {(lead.city || lead.state) && (
            <div className="flex items-center gap-2 text-zinc-500">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">
                {[lead.city, lead.state].filter(Boolean).join(" - ")}
              </span>
            </div>
          )}
        </div>

        {/* Value & Next Action */}
        <div className="mt-3 pt-3 border-t border-zinc-800 space-y-1.5">
          {lead.expectedValue && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <DollarSign className="h-4 w-4 flex-shrink-0" />
              <span>{formatCurrency(lead.expectedValue)}</span>
            </div>
          )}

          {lead.nextAction && (
            <div
              className={cn(
                "flex items-center gap-2 text-xs",
                isOverdue ? "text-red-400" : "text-amber-400"
              )}
            >
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{lead.nextAction}</span>
            </div>
          )}

          {lead.nextActionDate && (
            <div
              className={cn(
                "text-[10px] pl-5",
                isOverdue ? "text-red-500" : "text-zinc-500"
              )}
            >
              {isOverdue ? "Vencido: " : ""}
              {formatDistanceToNow(new Date(lead.nextActionDate), {
                addSuffix: true,
                locale: ptBR,
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {lead.assignedTo && (
          <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center gap-1.5 text-[10px] text-zinc-500">
            <User className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{lead.assignedTo.name || lead.assignedTo.email}</span>
          </div>
        )}
      </Card>
    </Link>
  )
}
