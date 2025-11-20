import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Listar equipamentos disponíveis publicamente
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const { tenant } = await params
    const { searchParams } = new URL(request.url)

    // Buscar o tenant pelo slug
    const tenantData = await prisma.tenant.findUnique({
      where: { slug: tenant },
    })

    if (!tenantData || !tenantData.active) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Filtros
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")

    // Buscar equipamentos disponíveis
    const equipments = await prisma.equipment.findMany({
      where: {
        tenantId: tenantData.id,
        status: "AVAILABLE",
        ...(category && { category }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...(minPrice && { pricePerDay: { gte: parseFloat(minPrice) } }),
        ...(maxPrice && { pricePerDay: { lte: parseFloat(maxPrice) } }),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        pricePerDay: true,
        pricePerHour: true,
        images: true,
        quantity: true,
      },
    })

    return NextResponse.json({ equipments, tenant: tenantData }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar equipamentos:", error)
    return NextResponse.json(
      { error: "Erro ao buscar equipamentos" },
      { status: 500 }
    )
  }
}
