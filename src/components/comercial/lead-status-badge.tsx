"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "WON" | "LOST"

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  NEW: {
    label: "Novo",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  CONTACTED: {
    label: "Contatado",
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  QUALIFIED: {
    label: "Qualificado",
    className: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  PROPOSAL: {
    label: "Proposta",
    className: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  WON: {
    label: "Ganho",
    className: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  LOST: {
    label: "Perdido",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
}

interface LeadStatusBadgeProps {
  status: LeadStatus
  className?: string
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}

// Badge para origem do lead
type LeadSource = "DIRECT" | "REFERRAL" | "WEBSITE" | "COLD_CALL" | "SOCIAL_MEDIA" | "EVENT" | "OTHER"

const sourceConfig: Record<LeadSource, { label: string; className: string }> = {
  DIRECT: {
    label: "Direto",
    className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
  REFERRAL: {
    label: "Indicacao",
    className: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  WEBSITE: {
    label: "Site",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  COLD_CALL: {
    label: "Cold Call",
    className: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  SOCIAL_MEDIA: {
    label: "Redes Sociais",
    className: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  },
  EVENT: {
    label: "Evento",
    className: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  OTHER: {
    label: "Outro",
    className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
}

interface LeadSourceBadgeProps {
  source: LeadSource
  className?: string
}

export function LeadSourceBadge({ source, className }: LeadSourceBadgeProps) {
  const config = sourceConfig[source]

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}

// Badge para tipo de contato
type ContactType = "PRESENCIAL" | "ONLINE"

const contactTypeConfig: Record<ContactType, { label: string; className: string }> = {
  PRESENCIAL: {
    label: "Presencial",
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  ONLINE: {
    label: "Online",
    className: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  },
}

interface ContactTypeBadgeProps {
  type: ContactType
  className?: string
}

export function ContactTypeBadge({ type, className }: ContactTypeBadgeProps) {
  const config = contactTypeConfig[type]

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
