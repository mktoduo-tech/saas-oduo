"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart, ArrowRight } from "lucide-react"

interface Equipment {
  id: string
  name: string
  description: string | null
  category: string
  pricePerDay: number
  pricePerHour: number | null
  images: string[]
  quantity: number
}

interface Tenant {
  id: string
  name: string
  slug: string
  email: string
  phone: string
}

export default function StorefrontHome() {
  const params = useParams()
  const router = useRouter()
  const tenant = params.tenant as string

  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [tenantData, setTenantData] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchEquipments()
  }, [tenant])

  const fetchEquipments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/storefront/${tenant}/equipments`)

      if (response.ok) {
        const data = await response.json()
        setEquipments(data.equipments)
        setTenantData(data.tenant)
      } else if (response.status === 404) {
        // Loja não encontrada
        alert("Loja não encontrada")
      }
    } catch (error) {
      console.error("Erro ao buscar equipamentos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/storefront/${tenant}/equipments?search=${search}`)

      if (response.ok) {
        const data = await response.json()
        setEquipments(data.equipments)
      }
    } catch (error) {
      console.error("Erro ao buscar equipamentos:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  if (loading && !tenantData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando loja...</p>
        </div>
      </div>
    )
  }

  if (!tenantData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Loja não encontrada</h1>
          <p className="text-muted-foreground">A loja que você está procurando não existe ou está inativa.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{tenantData.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {tenantData.phone} • {tenantData.email}
              </p>
            </div>
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Alugue Equipamentos com Facilidade
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Encontre os melhores equipamentos para sua necessidade. Reserva rápida e segura.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar equipamentos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="text-lg h-12"
              />
              <Button onClick={handleSearch} size="lg" className="h-12">
                <Search className="h-5 w-5 mr-2" />
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Equipment Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold">Equipamentos Disponíveis</h3>
            <p className="text-muted-foreground mt-1">
              {equipments.length} {equipments.length === 1 ? "equipamento disponível" : "equipamentos disponíveis"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="h-48 bg-muted"></div>
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : equipments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Nenhum equipamento disponível no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipments.map((equipment) => (
              <Card key={equipment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-muted overflow-hidden">
                  {equipment.images && equipment.images.length > 0 ? (
                    <img
                      src={equipment.images[0]}
                      alt={equipment.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      Sem imagem
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1">{equipment.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {equipment.description || "Sem descrição"}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{equipment.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">{formatPrice(equipment.pricePerDay)}</span>
                      <span className="text-sm text-muted-foreground">/dia</span>
                    </div>
                    {equipment.pricePerHour && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg">{formatPrice(equipment.pricePerHour)}</span>
                        <span className="text-sm text-muted-foreground">/hora</span>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {equipment.quantity} {equipment.quantity === 1 ? "unidade disponível" : "unidades disponíveis"}
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/${tenant}/equipamento/${equipment.id}`)}
                  >
                    Ver Detalhes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} {tenantData.name}. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
