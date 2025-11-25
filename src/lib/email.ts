import { Resend } from "resend"

// Inicializa Resend apenas se a chave existir
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

export async function sendEmail({
  to,
  subject,
  html,
  from = "Locadora <noreply@resend.dev>",
  replyTo,
}: SendEmailOptions) {
  if (!resend) {
    console.warn("RESEND_API_KEY não configurada. Email não enviado.")
    return { id: "mock-id", message: "Email service not configured" }
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo,
    })

    if (error) {
      console.error("Erro ao enviar email:", error)
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error("Erro ao enviar email:", error)
    throw error
  }
}

// Templates de email
export const emailTemplates = {
  // Confirmação de reserva
  bookingConfirmation: (data: {
    customerName: string
    equipmentName: string
    startDate: string
    endDate: string
    totalPrice: number
    tenantName: string
    tenantPhone?: string
  }) => ({
    subject: `Reserva Confirmada - ${data.equipmentName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .total { font-size: 1.2em; font-weight: bold; color: #2563eb; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reserva Confirmada!</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${data.customerName}</strong>,</p>
              <p>Sua reserva foi confirmada com sucesso!</p>

              <div class="details">
                <h3>Detalhes da Reserva</h3>
                <div class="details-row">
                  <span>Equipamento:</span>
                  <strong>${data.equipmentName}</strong>
                </div>
                <div class="details-row">
                  <span>Data de Início:</span>
                  <strong>${data.startDate}</strong>
                </div>
                <div class="details-row">
                  <span>Data de Término:</span>
                  <strong>${data.endDate}</strong>
                </div>
                <div class="details-row total">
                  <span>Valor Total:</span>
                  <strong>R$ ${data.totalPrice.toFixed(2)}</strong>
                </div>
              </div>

              <p>Em caso de dúvidas, entre em contato conosco${data.tenantPhone ? ` pelo telefone ${data.tenantPhone}` : ""}.</p>

              <p>Atenciosamente,<br><strong>${data.tenantName}</strong></p>
            </div>
            <div class="footer">
              <p>Este é um email automático, por favor não responda.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Lembrete de reserva
  bookingReminder: (data: {
    customerName: string
    equipmentName: string
    startDate: string
    tenantName: string
    tenantPhone?: string
  }) => ({
    subject: `Lembrete: Sua reserva começa amanhã - ${data.equipmentName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .highlight { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Lembrete de Reserva</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${data.customerName}</strong>,</p>

              <div class="highlight">
                <p>Sua reserva do equipamento <strong>${data.equipmentName}</strong> começa <strong>amanhã (${data.startDate})</strong>!</p>
              </div>

              <p>Por favor, certifique-se de estar disponível para a retirada/entrega do equipamento.</p>

              <p>Em caso de dúvidas ou necessidade de alteração, entre em contato conosco${data.tenantPhone ? ` pelo telefone ${data.tenantPhone}` : ""}.</p>

              <p>Atenciosamente,<br><strong>${data.tenantName}</strong></p>
            </div>
            <div class="footer">
              <p>Este é um email automático, por favor não responda.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Recibo de pagamento
  paymentReceipt: (data: {
    customerName: string
    equipmentName: string
    bookingId: string
    amount: number
    paymentDate: string
    tenantName: string
  }) => ({
    subject: `Recibo de Pagamento - Reserva #${data.bookingId.slice(-6)}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .receipt { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border: 1px solid #ddd; }
            .receipt-header { border-bottom: 2px solid #10b981; padding-bottom: 10px; margin-bottom: 15px; }
            .amount { font-size: 1.5em; color: #10b981; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Pagamento Confirmado</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${data.customerName}</strong>,</p>
              <p>Confirmamos o recebimento do seu pagamento.</p>

              <div class="receipt">
                <div class="receipt-header">
                  <h3>Recibo de Pagamento</h3>
                  <p>Reserva #${data.bookingId.slice(-6)}</p>
                </div>
                <p><strong>Equipamento:</strong> ${data.equipmentName}</p>
                <p><strong>Data do Pagamento:</strong> ${data.paymentDate}</p>
                <p class="amount">Valor: R$ ${data.amount.toFixed(2)}</p>
              </div>

              <p>Guarde este email como comprovante de pagamento.</p>

              <p>Atenciosamente,<br><strong>${data.tenantName}</strong></p>
            </div>
            <div class="footer">
              <p>Este é um email automático, por favor não responda.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Reserva cancelada
  bookingCancelled: (data: {
    customerName: string
    equipmentName: string
    startDate: string
    tenantName: string
    tenantPhone?: string
  }) => ({
    subject: `Reserva Cancelada - ${data.equipmentName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .notice { background: #fee2e2; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reserva Cancelada</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${data.customerName}</strong>,</p>

              <div class="notice">
                <p>Sua reserva do equipamento <strong>${data.equipmentName}</strong> prevista para <strong>${data.startDate}</strong> foi cancelada.</p>
              </div>

              <p>Se você não solicitou este cancelamento ou tem alguma dúvida, entre em contato conosco${data.tenantPhone ? ` pelo telefone ${data.tenantPhone}` : ""}.</p>

              <p>Atenciosamente,<br><strong>${data.tenantName}</strong></p>
            </div>
            <div class="footer">
              <p>Este é um email automático, por favor não responda.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
}
