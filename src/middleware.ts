import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
    // Verifica se o usuário está logado através do token de sessão
    const token = req.cookies.get("authjs.session-token") || req.cookies.get("__Secure-authjs.session-token")
    const isLoggedIn = !!token

    // Rotas protegidas que requerem autenticação
    const protectedRoutes = [
        "/dashboard",
        "/equipamentos",
        "/clientes",
        "/reservas",
        "/usuarios",
        "/financeiro",
        "/configuracoes",
        "/integracoes",
        "/marketing",
        "/logs",
        "/ajuda",
        "/relatorios"
    ]

    const isOnProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))

    // Se está em rota protegida e não está logado, redireciona para login
    if (isOnProtectedRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", req.nextUrl))
    }

    // Se está logado e tenta acessar login ou cadastro, redireciona para dashboard
    if (isLoggedIn && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/cadastro")) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
