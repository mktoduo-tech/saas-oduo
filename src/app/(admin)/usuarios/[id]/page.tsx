"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { type Role } from "@/lib/permissions"

const userSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .optional()
    .or(z.literal("")),
  role: z.enum(["ADMIN", "MANAGER", "OPERATOR", "VIEWER"]),
})

type UserForm = z.infer<typeof userSchema>

interface User {
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
  updatedAt: string
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  OPERATOR: "Operador",
  VIEWER: "Visualizador",
}

const roleDescriptions: Record<string, string> = {
  ADMIN: "Controle total do sistema (exceto gestão de tenants)",
  MANAGER: "Pode criar e editar, mas não deletar",
  OPERATOR: "Cria reservas e visualiza clientes e equipamentos",
  VIEWER: "Apenas visualização de dados",
}

const roleColors: Record<Role, "default" | "destructive" | "secondary" | "outline"> = {
  SUPER_ADMIN: "destructive",
  ADMIN: "default",
  MANAGER: "secondary",
  OPERATOR: "outline",
  VIEWER: "outline",
}

export default function EditUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${id}`)
        if (response.ok) {
          const data = await response.json()
          setUser(data)
          reset({
            name: data.name,
            email: data.email,
            password: "",
            role: data.role,
          })
        } else {
          alert("Usuário não encontrado")
          router.push("/usuarios")
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        alert("Erro ao carregar usuário")
      } finally {
        setFetchLoading(false)
      }
    }

    fetchUser()
  }, [id, router, reset])

  const onSubmit = async (data: UserForm) => {
    try {
      setLoading(true)

      // Remove password if empty
      const updateData: any = {
        name: data.name,
        email: data.email,
        role: data.role,
      }

      if (data.password && data.password.length > 0) {
        updateData.password = data.password
      }

      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        router.push("/usuarios")
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao atualizar usuário")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      alert("Erro ao atualizar usuário")
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Check if user is a SUPER_ADMIN (can't be edited)
  if (user.role === "SUPER_ADMIN") {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/usuarios">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Editar Usuário
            </h1>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Badge variant="destructive" className="mb-4">
                Super Admin
              </Badge>
              <p className="text-muted-foreground">
                Super Admins não podem ser editados através deste painel.
              </p>
              <Link href="/usuarios">
                <Button className="mt-4">Voltar para Usuários</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/usuarios">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground font-headline tracking-wide">
            Editar Usuário
          </h1>
          <p className="text-muted-foreground mt-1">
            Atualize as informações do usuário
          </p>
        </div>
        <Badge variant={roleColors[user.role]}>
          {roleLabels[user.role]}
        </Badge>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline tracking-wide">Informações Básicas</CardTitle>
            <CardDescription>
              Dados do usuário para acesso ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome Completo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Nome do usuário"
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="usuario@exemplo.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha (opcional)</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Deixe em branco para manter a senha atual"
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Apenas preencha se desejar alterar a senha do usuário
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Função e Permissões */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline tracking-wide">Função e Permissões</CardTitle>
            <CardDescription>
              Defina o nível de acesso do usuário no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">
                Função <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      {(["ADMIN", "MANAGER", "OPERATOR", "VIEWER"] as const).map(
                        (role) => (
                          <SelectItem key={role} value={role}>
                            <div className="flex flex-col gap-1">
                              <div className="font-medium">{roleLabels[role]}</div>
                              <div className="text-xs text-muted-foreground">
                                {roleDescriptions[role]}
                              </div>
                            </div>
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-sm text-destructive">
                  {errors.role.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline tracking-wide">Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 text-sm">
              <div>
                <Label className="text-muted-foreground">Cadastrado em</Label>
                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  Última atualização
                </Label>
                <p className="font-medium">
                  {new Date(user.updatedAt).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/usuarios">
            <Button type="button" variant="outline" disabled={loading}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="gap-2">
            <Save className="h-4 w-4" />
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </div>
  )
}
