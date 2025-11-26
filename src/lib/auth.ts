import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Domínio raiz para cookies (permite compartilhar sessão entre subdomínios)
const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.split(":")[0] || ""
const isProduction = process.env.NODE_ENV === "production"

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.AUTH_SECRET,
    // Configurar cookies para funcionar em todos os subdomínios
    cookies: {
        sessionToken: {
            name: isProduction ? "__Secure-authjs.session-token" : "authjs.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: isProduction,
                // Domínio com ponto no início permite todos os subdomínios
                domain: isProduction && rootDomain ? `.${rootDomain}` : undefined,
            },
        },
    },
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                tenantSlug: { label: "Tenant", type: "text" },
            },
            authorize: async (credentials) => {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        return null
                    }

                    const tenantSlug = credentials.tenantSlug as string | undefined

                    // Buscar usuário no banco de dados
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email as string },
                        include: { tenant: true },
                    })

                    if (!user) {
                        return null
                    }

                    // Validação de tenant: se acessando via subdomínio, usuário deve pertencer ao tenant
                    // SUPER_ADMIN pode acessar de qualquer subdomínio
                    if (tenantSlug && user.role !== "SUPER_ADMIN") {
                        if (user.tenant.slug !== tenantSlug) {
                            console.warn(`Tentativa de login em tenant incorreto: ${tenantSlug} por usuário do tenant ${user.tenant.slug}`)
                            return null
                        }
                    }

                    // Verifica se o tenant está ativo (exceto SUPER_ADMIN)
                    if (user.role !== "SUPER_ADMIN" && !user.tenant.active) {
                        console.warn(`Tentativa de login em tenant inativo: ${user.tenant.slug}`)
                        return null
                    }

                    // Verificar senha
                    const passwordMatch = await bcrypt.compare(
                        credentials.password as string,
                        user.passwordHash
                    )

                    if (!passwordMatch) {
                        return null
                    }

                    // Retornar dados do usuário
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        tenantId: user.tenantId,
                        tenantName: user.tenant.name,
                        tenantSlug: user.tenant.slug,
                        role: user.role,
                    }
                } catch (error) {
                    console.error("Erro na autenticação:", error)
                    return null
                }
            },
        }),
    ],
    pages: {
        signIn: "/login",
        error: "/auth/error",
    },
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string
                session.user.tenantId = token.tenantId as string
                session.user.tenantName = token.tenantName as string
                session.user.tenantSlug = token.tenantSlug as string
                session.user.role = token.role as string
            }
            return session
        },
        async jwt({ token, user }) {
            if (user && user.id) {
                token.id = user.id
                token.tenantId = user.tenantId
                token.tenantName = user.tenantName
                token.tenantSlug = user.tenantSlug
                token.role = user.role
            }
            return token
        },
    },
})
