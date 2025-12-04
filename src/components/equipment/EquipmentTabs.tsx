"use client"

import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface EquipmentTabsProps {
  equipmentId: string
  activeTab: "detalhes" | "unidades" | "estoque" | "manutencao" | "financeiro" | "documentos"
  trackingType?: "SERIALIZED" | "QUANTITY"
}

export function EquipmentTabs({ equipmentId, activeTab, trackingType = "SERIALIZED" }: EquipmentTabsProps) {
  // Definir todas as abas
  const allTabs = [
    { value: "detalhes", label: "Detalhes", href: `/equipamentos/${equipmentId}`, showFor: ["SERIALIZED", "QUANTITY"] },
    { value: "unidades", label: "Unidades", href: `/equipamentos/${equipmentId}/unidades`, showFor: ["SERIALIZED"] },
    { value: "estoque", label: "Estoque", href: `/equipamentos/${equipmentId}/estoque`, showFor: ["SERIALIZED", "QUANTITY"] },
    { value: "manutencao", label: "Manutenção", href: `/equipamentos/${equipmentId}/manutencao`, showFor: ["SERIALIZED"] },
    { value: "financeiro", label: "Financeiro", href: `/equipamentos/${equipmentId}/financeiro`, showFor: ["SERIALIZED", "QUANTITY"] },
    { value: "documentos", label: "Documentos", href: `/equipamentos/${equipmentId}/documentos`, showFor: ["SERIALIZED", "QUANTITY"] },
  ]

  // Filtrar abas baseado no trackingType
  const tabs = allTabs.filter(tab => tab.showFor.includes(trackingType))

  return (
    <Tabs value={activeTab} className="w-full">
      <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1 h-auto flex-wrap justify-start gap-1">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "data-[state=active]:bg-zinc-800 data-[state=active]:text-white",
              "px-4 py-2 text-sm font-medium transition-all",
              "hover:bg-zinc-800/50"
            )}
            asChild
          >
            <Link href={tab.href}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
