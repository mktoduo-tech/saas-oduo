import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.AUTH_SECRET,
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        return null
                    }

                    // Buscar usuário no banco de dados
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email as string },
                        include: { tenant: true },
                    })

                    if (!user) {
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
                } finally {
                    await prisma.$disconnect()
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
