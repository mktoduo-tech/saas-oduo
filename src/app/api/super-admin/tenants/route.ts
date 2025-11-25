import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/super-admin"

// GET - Listar todos os tenants
export async function GET(request: NextRequest) {
  const authResult = await requireSuperAdmin()
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const url = new URL(request.url)
    const search = url.searchParams.get("search") || ""
    const status = url.searchParams.get("status") // "active", "inactive", "all"
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status === "active") {
      whereClause.active = true
    } else if (status === "inactive") {
      whereClause.active = false
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          email: true,
          phone: true,
          active: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              users: true,
              equipments: true,
              bookings: true,
              customers: true,
            },
          },
        },
      }),
      prisma.tenant.count({ where: whereClause }),
    ])

    // Buscar receita de cada tenant
    const tenantsWithRevenue = await Promise.all(
      tenants.map(async (tenant) => {
        const revenue = await prisma.booking.aggregate({
          _sum: { totalPrice: true },
          where: {
            tenantId: tenant.id,
            status: { in: ["CONFIRMED", "COMPLETED"] },
          },
        })

        return {
          ...tenant,
          totalRevenue: revenue._sum.totalPrice || 0,
        }
      })
    )

    return NextResponse.json({
      tenants: tenantsWithRevenue,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao listar tenants:", error)
    return NextResponse.json(
      { error: "Erro ao listar tenants" },
      { status: 500 }
    )
  }
}

// POST - Criar novo tenant (via super admin)
export async function POST(request: NextRequest) {
  const authResult = await requireSuperAdmin()
  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await request.json()
    const { name, slug, email, phone, address } = body

    if (!name || !slug || !email || !phone) {
      return NextResponse.json(
        { error: "Nome, slug, email e telefone são obrigatórios" },
        { status: 400 }
      )
    }

    // Verificar se slug já existe
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    })

    if (existingTenant) {
      return NextResponse.json(
        { error: "Este slug já está em uso" },
        { status: 409 }
      )
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        email,
        phone,
        address,
        active: true,
      },
    })

    return NextResponse.json(tenant, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar tenant:", error)
    return NextResponse.json(
      { error: "Erro ao criar tenant" },
      { status: 500 }
    )
  }
}
