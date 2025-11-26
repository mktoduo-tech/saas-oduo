"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface StockAlert {
  id: string
  type: "OUT_OF_STOCK" | "LOW_STOCK" | "DAMAGED" | "MAINTENANCE"
  severity: "critical" | "warning" | "info"
  equipment: {
    id: string
    name: string
    category: string
    image: string | null
  }
  message: string
}

interface AlertSummary {
  totalAlerts: number
  lowStockCount: number
  outOfStockCount: number
  damagedCount: number
  inMaintenanceCount: number
}

export function StockAlertBadge() {
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [summary, setSummary] = useState<AlertSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAlerts()
    // Atualizar a cada 5 minutos
    const interval = setInterval(loadAlerts, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadAlerts = async () => {
    try {
      const res = await fetch("/api/stock/alerts")
      if (res.ok) {
        const data = await res.json()
        setAlerts(data.alerts || [])
        setSummary(data.summary || null)
      }
    } catch (error) {
      console.error("Erro ao carregar alertas:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalAlerts = summary?.totalAlerts || 0
  const hasCritical = alerts.some((a) => a.severity === "critical")

  if (loading || totalAlerts === 0) {
    return null
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative",
            hasCritical && "text-red-500 hover:text-red-600"
          )}
        >
          <Bell className="h-5 w-5" />
          {totalAlerts > 0 && (
            <Badge
              variant="destructive"
              className={cn(
                "absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center text-xs p-0",
                hasCritical && "animate-pulse"
              )}
            >
              {totalAlerts > 99 ? "99+" : totalAlerts}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Alertas de Estoque</h4>
            <Link href="/estoque">
              <Button variant="ghost" size="sm">
                Ver Todos
              </Button>
            </Link>
          </div>
          {summary && (
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {summary.outOfStockCount > 0 && (
                <span className="text-red-600">
                  {summary.outOfStockCount} esgotado(s)
                </span>
              )}
              {summary.lowStockCount > 0 && (
                <span className="text-amber-600">
                  {summary.lowStockCount} baixo(s)
                </span>
              )}
              {summary.damagedCount > 0 && (
                <span className="text-orange-600">
                  {summary.damagedCount} avariado(s)
                </span>
              )}
            </div>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {alerts.slice(0, 5).map((alert) => (
            <Link
              key={alert.id}
              href={`/estoque/${alert.equipment.id}`}
              className="block"
            >
              <div
                className={cn(
                  "p-3 hover:bg-muted border-b last:border-b-0 transition-colors",
                  alert.severity === "critical" && "bg-red-50 hover:bg-red-100"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "p-1.5 rounded-full",
                      alert.severity === "critical" && "bg-red-100",
                      alert.severity === "warning" && "bg-amber-100",
                      alert.severity === "info" && "bg-blue-100"
                    )}
                  >
                    <AlertTriangle
                      className={cn(
                        "h-4 w-4",
                        alert.severity === "critical" && "text-red-600",
                        alert.severity === "warning" && "text-amber-600",
                        alert.severity === "info" && "text-blue-600"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {alert.equipment.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {alert.message}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {alerts.length > 5 && (
          <div className="p-2 text-center border-t">
            <Link href="/estoque">
              <Button variant="ghost" size="sm" className="w-full">
                Ver mais {alerts.length - 5} alerta(s)
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
