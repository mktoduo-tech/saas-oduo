"use client"

import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
})

type LoginFormData = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      // signIn with callbackUrl will redirect automatically on success
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl: callbackUrl,
      })
      // If we reach here without redirect, login failed
      toast.error("Email ou senha incorretos")
      setIsLoading(false)
    } catch (error) {
      toast.error("Erro ao fazer login. Tente novamente.")
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 sm:space-y-2 px-4 sm:px-6 pt-6 sm:pt-8">
        <CardTitle className="text-xl sm:text-2xl text-center font-headline tracking-wide">Login</CardTitle>
        <CardDescription className="text-center text-sm sm:text-base">
          Entre com suas credenciais para acessar o painel
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              disabled={isLoading}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 px-4 sm:px-6 pb-6 sm:pb-8">
        <div className="text-xs sm:text-sm text-muted-foreground text-center">
          Não tem uma conta?{" "}
          <Link href="/cadastro" className="text-primary hover:underline">
            Cadastre-se
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12">
      <div className="w-full max-w-md">
        <Suspense fallback={<div>Carregando...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
