"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Search, Package, Eye, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { DataPagination } from "@/components/ui/data-pagination"
import { usePlanLimits } from "@/hooks/usePlanLimits"
import { LimitWarningBanner } from "@/components/plan"

type Equipment = {
  id: string
  name: string
  description: string | null
  category: string
  images: string[]
  pricePerHour: number | null
  pricePerDay: number
  quantity: number
  status: "AVAILABLE" | "RENTED" | "MAINTENANCE" | "INACTIVE"
  createdAt: string
}

const statusLabels = {
  AVAILABLE: "Disponível",
  RENTED: "Alugado",
  MAINTENANCE: "Manutenção",
  INACTIVE: "Inativo",
}

const statusColors = {
  AVAILABLE: "bg-green-500",
  RENTED: "bg-primary",
  MAINTENANCE: "bg-accent",
  INACTIVE: "bg-muted-foreground",
}

export default function EquipamentosPage() {
  const router = useRouter()
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [filteredEquipments, setFilteredEquipments] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Hook de limites do plano
  const { usage, isNearEquipmentLimit, isAtEquipmentLimit } = usePlanLimits()

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Calcular itens paginados
  const totalItems = filteredEquipments.length
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEquipments = filteredEquipments.slice(startIndex, startIndex + itemsPerPage)

  useEffect(() => {
    fetchEquipments()
  }, [])

  useEffect(() => {
    filterEquipments()
    setCurrentPage(1) // Reset para página 1 quando filtro muda
  }, [search, statusFilter, categoryFilter, sortBy, equipments])

  // Extrair categorias únicas dos equipamentos
  const categories = [...new Set(equipments.map(eq => eq.category))].sort()

  const fetchEquipments = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/equipments")
      if (!response.ok) throw new Error("Erro ao buscar equipamentos")

      const data = await response.json()
      // Garantir que data seja sempre um array
      setEquipments(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error("Erro ao carregar equipamentos")
      setEquipments([])
    } finally {
      setLoading(false)
    }
  }

  const filterEquipments = () => {
    let filtered = equipments

    if (search) {
      filtered = filtered.filter(
        (eq) =>
          eq.name.toLowerCase().includes(search.toLowerCase()) ||
          eq.category.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((eq) => eq.status === statusFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((eq) => eq.category === categoryFilter)
    }

    // Ordenação
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "category":
          return a.category.localeCompare(b.category)
        case "priceAsc":
          return (a.pricePerDay || 0) - (b.pricePerDay || 0)
        case "priceDesc":
          return (b.pricePerDay || 0) - (a.pricePerDay || 0)
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        default:
          return 0
      }
    })

    setFilteredEquipments(filtered)
  }

  const handleDelete = async () => {
    if (!equipmentToDelete) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/equipments/${equipmentToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Erro ao deletar equipamento")

      toast.success("Equipamento deletado com sucesso!")
      setEquipments(equipments.filter((eq) => eq.id !== equipmentToDelete))
      setDeleteDialogOpen(false)
      setEquipmentToDelete(null)
    } catch (error) {
      toast.error("Erro ao deletar equipamento")
    } finally {
      setDeleting(false)
    }
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return "-"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2 font-headline tracking-wide">Equipamentos</h1>
          <p className="text-muted-foreground">
            Gerencie o catálogo de equipamentos da sua locadora
          </p>
        </div>
        <Link href="/equipamentos/novo">
          <Button disabled={isAtEquipmentLimit}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Equipamento
          </Button>
        </Link>
      </div>

      {/* Banner de Limite */}
      {usage && (isNearEquipmentLimit || isAtEquipmentLimit) && (
        <LimitWarningBanner
          type="equipments"
          current={usage.equipments.current}
          max={usage.equipments.max}
          percentage={usage.equipments.percentage}
        />
      )}

      {/* Filters */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Busca */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar equipamentos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-zinc-900/50 border-zinc-800"
                />
              </div>
            </div>

            {/* Filtro Status */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-zinc-900/50 border-zinc-800">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="AVAILABLE">Disponível</SelectItem>
                <SelectItem value="RENTED">Alugado</SelectItem>
                <SelectItem value="MAINTENANCE">Manutenção</SelectItem>
                <SelectItem value="INACTIVE">Inativo</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro Categoria */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px] bg-zinc-900/50 border-zinc-800">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Ordenação */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] bg-zinc-900/50 border-zinc-800">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome (A-Z)</SelectItem>
                <SelectItem value="category">Categoria</SelectItem>
                <SelectItem value="priceAsc">Menor Preço</SelectItem>
                <SelectItem value="priceDesc">Maior Preço</SelectItem>
                <SelectItem value="newest">Mais Recentes</SelectItem>
                <SelectItem value="oldest">Mais Antigos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline tracking-wide">Lista de Equipamentos</CardTitle>
          <CardDescription>
            {filteredEquipments.length} equipamento(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando...
            </div>
          ) : paginatedEquipments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum equipamento encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço/Dia</TableHead>
                  <TableHead>Preço/Hora</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEquipments.map((equipment) => (
                  <TableRow key={equipment.id}>
                    <TableCell>
                      <div className="relative h-14 w-14 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                        {equipment.images && equipment.images.length > 0 ? (
                          <Image
                            src={equipment.images[0]}
                            alt={equipment.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {equipment.name}
                    </TableCell>
                    <TableCell>{equipment.category}</TableCell>
                    <TableCell>{formatPrice(equipment.pricePerDay)}</TableCell>
                    <TableCell>{formatPrice(equipment.pricePerHour)}</TableCell>
                    <TableCell>{equipment.quantity}</TableCell>
                    <TableCell>
                      <Badge
                        className={statusColors[equipment.status]}
                      >
                        {statusLabels[equipment.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/equipamentos/${equipment.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEquipmentToDelete(equipment.id)
                            setDeleteDialogOpen(true)
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Paginação */}
          <DataPagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar este equipamento? Esta ação não
              pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deletando..." : "Deletar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
