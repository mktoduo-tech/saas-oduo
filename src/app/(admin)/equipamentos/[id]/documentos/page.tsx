"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  FileText,
  Upload,
  Trash2,
  Download,
  Plus,
  File,
  FileCheck,
  Shield,
  Receipt,
  HelpCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Document {
  id: string
  name: string
  type: string
  url: string
  fileSize: number | null
  uploadedAt: string
}

interface Equipment {
  id: string
  name: string
  category: string
}

const docTypeLabels: Record<string, string> = {
  MANUAL: "Manual",
  WARRANTY: "Garantia",
  CERTIFICATE: "Certificado",
  INVOICE: "Nota Fiscal",
  OTHER: "Outro",
}

const docTypeIcons: Record<string, React.ReactNode> = {
  MANUAL: <FileText className="h-4 w-4" />,
  WARRANTY: <Shield className="h-4 w-4" />,
  CERTIFICATE: <FileCheck className="h-4 w-4" />,
  INVOICE: <Receipt className="h-4 w-4" />,
  OTHER: <HelpCircle className="h-4 w-4" />,
}

export default function DocumentosEquipamentoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [docName, setDocName] = useState("")
  const [docType, setDocType] = useState<string>("OTHER")
  const [docUrl, setDocUrl] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Buscar equipamento
      const eqResponse = await fetch(`/api/equipments/${resolvedParams.id}`)
      if (!eqResponse.ok) {
        throw new Error("Equipamento não encontrado")
      }
      const eqData = await eqResponse.json()
      setEquipment(eqData)

      // Buscar documentos
      const docsResponse = await fetch(
        `/api/equipments/${resolvedParams.id}/documents`
      )
      if (docsResponse.ok) {
        const docsData = await docsResponse.json()
        setDocuments(Array.isArray(docsData) ? docsData : [])
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao carregar dados"
      toast.error(message)
      router.push("/equipamentos")
    } finally {
      setLoading(false)
    }
  }

  const handleAddDocument = async () => {
    if (!docName || !docUrl) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(
        `/api/equipments/${resolvedParams.id}/documents`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: docName,
            type: docType,
            url: docUrl,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao adicionar documento")
      }

      toast.success("Documento adicionado com sucesso!")
      setDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao adicionar documento"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    try {
      const response = await fetch(
        `/api/equipments/${resolvedParams.id}/documents/${docId}`,
        { method: "DELETE" }
      )

      if (!response.ok) {
        throw new Error("Erro ao excluir documento")
      }

      toast.success("Documento excluído com sucesso!")
      fetchData()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao excluir documento"
      toast.error(message)
    }
  }

  const resetForm = () => {
    setDocName("")
    setDocType("OTHER")
    setDocUrl("")
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "-"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link href={`/equipamentos/${resolvedParams.id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Equipamento
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 font-headline tracking-wide">
              Documentos
            </h1>
            <p className="text-muted-foreground">
              {equipment?.name} - {equipment?.category}
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Documento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Documento</DialogTitle>
                <DialogDescription>
                  Adicione um documento ao equipamento (manual, garantia, etc.)
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="docName">Nome do Documento *</Label>
                  <Input
                    id="docName"
                    placeholder="Ex: Manual do Usuário"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="docType">Tipo *</Label>
                  <Select value={docType} onValueChange={setDocType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                      <SelectItem value="WARRANTY">Garantia</SelectItem>
                      <SelectItem value="CERTIFICATE">Certificado</SelectItem>
                      <SelectItem value="INVOICE">Nota Fiscal</SelectItem>
                      <SelectItem value="OTHER">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="docUrl">URL do Documento *</Label>
                  <Input
                    id="docUrl"
                    placeholder="https://..."
                    value={docUrl}
                    onChange={(e) => setDocUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Cole o link do documento hospedado (Google Drive, Dropbox,
                    etc.)
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false)
                    resetForm()
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddDocument} disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Adicionar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Link href={`/equipamentos/${resolvedParams.id}`}>
          <Button variant="ghost" size="sm">
            Editar
          </Button>
        </Link>
        <Link href={`/equipamentos/${resolvedParams.id}/financeiro`}>
          <Button variant="ghost" size="sm">
            Financeiro
          </Button>
        </Link>
        <Button variant="secondary" size="sm">
          Documentos
        </Button>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline tracking-wide flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos Anexados
          </CardTitle>
          <CardDescription>
            Manuais, garantias, certificados e outros documentos do equipamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum documento anexado</p>
              <p className="text-sm">
                Clique em &quot;Adicionar Documento&quot; para começar
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Data Upload</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        {docTypeIcons[doc.type]}
                        {docTypeLabels[doc.type] || doc.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                    <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doc.url, "_blank")}
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Excluir documento?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. O documento
                                será removido permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
