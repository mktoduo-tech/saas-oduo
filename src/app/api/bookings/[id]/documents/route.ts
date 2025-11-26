import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { pdfTemplates } from "@/lib/pdf-templates"

// GET - Listar documentos da reserva
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const tenantId = session.user.tenantId

    // Verificar se a reserva pertence ao tenant
    const booking = await prisma.booking.findFirst({
      where: { id, tenantId },
      select: { id: true },
    })

    if (!booking) {
      return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 })
    }

    const documents = await prisma.bookingDocument.findMany({
      where: { bookingId: id },
      orderBy: { generatedAt: "desc" },
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error("Erro ao buscar documentos:", error)
    return NextResponse.json({ error: "Erro ao buscar documentos" }, { status: 500 })
  }
}

// POST - Gerar documento (contrato ou recibo)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const tenantId = session.user.tenantId
    const body = await request.json()
    const { type } = body // CONTRACT, RECEIPT, INVOICE

    if (!type || !["CONTRACT", "RECEIPT", "INVOICE"].includes(type)) {
      return NextResponse.json({ error: "Tipo de documento inválido" }, { status: 400 })
    }

    // Buscar reserva com dados relacionados
    const booking = await prisma.booking.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        equipment: true,
        tenant: true,
        items: {
          include: {
            equipment: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 })
    }

    // Determinar equipamento principal (legado ou primeiro item)
    const mainEquipment = booking.equipment || booking.items[0]?.equipment
    if (!mainEquipment) {
      return NextResponse.json({ error: "Reserva sem equipamento associado" }, { status: 400 })
    }

    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    }

    const totalDays = Math.ceil(
      (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )

    let htmlContent = ""

    if (type === "CONTRACT") {
      htmlContent = pdfTemplates.contract({
        tenantName: booking.tenant.name,
        tenantAddress: booking.tenant.address || undefined,
        tenantPhone: booking.tenant.phone || undefined,
        tenantEmail: booking.tenant.email || undefined,
        customerName: booking.customer.name,
        customerDocument: booking.customer.cpfCnpj || undefined,
        customerPhone: booking.customer.phone || undefined,
        customerEmail: booking.customer.email || undefined,
        customerAddress: booking.customer.address || undefined,
        equipmentName: mainEquipment.name,
        equipmentDescription: mainEquipment.description || undefined,
        startDate: formatDate(booking.startDate),
        endDate: formatDate(booking.endDate),
        totalPrice: booking.totalPrice,
        pricePerDay: mainEquipment.pricePerDay,
        totalDays,
        bookingId: booking.id,
        createdAt: formatDate(new Date()),
      })
    } else if (type === "RECEIPT") {
      htmlContent = pdfTemplates.receipt({
        tenantName: booking.tenant.name,
        tenantAddress: booking.tenant.address || undefined,
        tenantPhone: booking.tenant.phone || undefined,
        customerName: booking.customer.name,
        customerDocument: booking.customer.cpfCnpj || undefined,
        equipmentName: mainEquipment.name,
        startDate: formatDate(booking.startDate),
        endDate: formatDate(booking.endDate),
        totalPrice: booking.totalPrice,
        bookingId: booking.id,
        paymentDate: formatDate(new Date()),
        paymentMethod: undefined,
      })
    }

    // Retornar o HTML para renderização no cliente
    // Em produção, você pode usar um serviço como Puppeteer, html-pdf-node, etc.
    // para converter HTML em PDF real

    // Salvar registro do documento
    const document = await prisma.bookingDocument.create({
      data: {
        type: type as "CONTRACT" | "RECEIPT" | "INVOICE",
        url: "", // Será preenchido após upload do PDF
        bookingId: id,
      },
    })

    return NextResponse.json({
      document,
      html: htmlContent,
      message: "Documento gerado com sucesso",
    })
  } catch (error) {
    console.error("Erro ao gerar documento:", error)
    return NextResponse.json({ error: "Erro ao gerar documento" }, { status: 500 })
  }
}
