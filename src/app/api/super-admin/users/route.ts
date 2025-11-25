import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/super-admin"
import bcrypt from "bcryptjs"

// GET - Listar todos os usuários do sistema
export async function GET(request: NextRequest) {
  const authResult = await requireSuperAdmin()
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const url = new URL(request.url)
    const search = url.searchParams.get("search") || ""
    const role = url.searchParams.get("role") // "SUPER_ADMIN", "ADMIN", etc.
    const tenantId = url.searchParams.get("tenantId")
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    if (role) {
      whereClause.role = role
    }

    if (tenantId) {
      whereClause.tenantId = tenantId
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.user.count({ where: whereClause }),
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao listar usuários:", error)
    return NextResponse.json(
      { error: "Erro ao listar usuários" },
      { status: 500 }
    )
  }
}

// POST - Criar usuário (inclusive SUPER_ADMIN)
export async function POST(request: NextRequest) {
  const authResult = await requireSuperAdmin()
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await request.json()
    const { name, email, password, role, tenantId } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      )
    }

    // Se não for SUPER_ADMIN, precisa de tenantId
    if (role !== "SUPER_ADMIN" && !tenantId) {
      return NextResponse.json(
        { error: "TenantId é obrigatório para usuários não SUPER_ADMIN" },
        { status: 400 }
      )
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está em uso" },
        { status: 409 }
      )
    }

    // Para SUPER_ADMIN, precisamos de um tenant "sistema"
    let finalTenantId = tenantId

    if (role === "SUPER_ADMIN") {
      // Buscar ou criar tenant do sistema
      let systemTenant = await prisma.tenant.findFirst({
        where: { slug: "oduo-system" },
      })

      if (!systemTenant) {
        systemTenant = await prisma.tenant.create({
          data: {
            name: "ODuo System",
            slug: "oduo-system",
            email: "system@oduo.com.br",
            phone: "0000000000",
            active: true,
          },
        })
      }

      finalTenantId = systemTenant.id
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || "ADMIN",
        tenantId: finalTenantId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    )
  }
}
