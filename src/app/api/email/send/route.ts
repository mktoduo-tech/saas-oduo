import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail, emailTemplates } from "@/lib/email"

// POST - Enviar email
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const body = await request.json()
    const { type, bookingId, customEmail } = body

    // Buscar tenant para informações
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, phone: true, email: true },
    })

    if (!tenant) {
      return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 })
    }

    // Se for email customizado
    if (customEmail) {
      await sendEmail({
        to: customEmail.to,
        subject: customEmail.subject,
        html: customEmail.html,
        from: tenant.email ? `${tenant.name} <${tenant.email}>` : undefined,
      })

      return NextResponse.json({ success: true, message: "Email enviado com sucesso" })
    }

    // Se for email baseado em reserva
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId é obrigatório" }, { status: 400 })
    }

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, tenantId },
      include: {
        customer: { select: { name: true, email: true } },
        equipment: { select: { name: true } },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 })
    }

    if (!booking.customer.email) {
      return NextResponse.json({ error: "Cliente não possui email cadastrado" }, { status: 400 })
    }

    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    }

    let emailData
    switch (type) {
      case "confirmation":
        emailData = emailTemplates.bookingConfirmation({
          customerName: booking.customer.name,
          equipmentName: booking.equipment.name,
          startDate: formatDate(booking.startDate),
          endDate: formatDate(booking.endDate),
          totalPrice: booking.totalPrice,
          tenantName: tenant.name,
          tenantPhone: tenant.phone || undefined,
        })

        // Marcar como enviado
        await prisma.booking.update({
          where: { id: bookingId },
          data: { confirmationSent: true },
        })
        break

      case "reminder":
        emailData = emailTemplates.bookingReminder({
          customerName: booking.customer.name,
          equipmentName: booking.equipment.name,
          startDate: formatDate(booking.startDate),
          tenantName: tenant.name,
          tenantPhone: tenant.phone || undefined,
        })

        // Marcar lembrete como enviado
        await prisma.booking.update({
          where: { id: bookingId },
          data: { reminderSent: true },
        })
        break

      case "receipt":
        emailData = emailTemplates.paymentReceipt({
          customerName: booking.customer.name,
          equipmentName: booking.equipment.name,
          bookingId: booking.id,
          amount: booking.totalPrice,
          paymentDate: formatDate(new Date()),
          tenantName: tenant.name,
        })
        break

      case "cancelled":
        emailData = emailTemplates.bookingCancelled({
          customerName: booking.customer.name,
          equipmentName: booking.equipment.name,
          startDate: formatDate(booking.startDate),
          tenantName: tenant.name,
          tenantPhone: tenant.phone || undefined,
        })
        break

      default:
        return NextResponse.json({ error: "Tipo de email inválido" }, { status: 400 })
    }

    await sendEmail({
      to: booking.customer.email,
      subject: emailData.subject,
      html: emailData.html,
      from: tenant.email ? `${tenant.name} <${tenant.email}>` : undefined,
    })

    return NextResponse.json({ success: true, message: "Email enviado com sucesso" })
  } catch (error) {
    console.error("Erro ao enviar email:", error)
    return NextResponse.json({ error: "Erro ao enviar email" }, { status: 500 })
  }
}
