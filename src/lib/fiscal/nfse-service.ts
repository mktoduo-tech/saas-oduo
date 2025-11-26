// Serviço de NFS-e - Lógica de negócio para emissão de notas fiscais

import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { FocusNfeClient, createFocusNfeClient } from './focus-nfe-client'
import { decryptToken } from './encryption'
import { requireNfseEnabled, requireFiscalConfig } from './feature-check'
import {
  FiscalConfigurationError,
  InvoiceNotFoundError,
  InvoiceStatusError,
  TomadorDataError,
  FocusNfeApiError,
} from './errors'
import {
  processTemplate,
  formatCurrency,
  formatDate,
  calculateDays,
  formatItemsList,
  DEFAULT_DESCRIPTION_TEMPLATE,
} from './template-engine'
import { onlyNumbers, validateCpfCnpj } from './validators'
import type {
  InvoiceStatus,
  FocusNfeEnvironment,
  NfsePayload,
  TemplateVariables,
  CreateInvoiceResult,
} from './types'

/**
 * Serviço para gerenciamento de NFS-e
 */
export class NfseService {
  /**
   * Gera uma NFS-e a partir de uma reserva
   */
  async createFromBooking(
    bookingId: string,
    tenantId: string,
    options: { sendEmail?: boolean } = {}
  ): Promise<CreateInvoiceResult> {
    // 1. Verificar pré-requisitos
    await requireNfseEnabled(tenantId)
    await requireFiscalConfig(tenantId)

    // 2. Buscar dados necessários
    const [booking, tenant] = await Promise.all([
      this.getBookingData(bookingId, tenantId),
      this.getTenantFiscalData(tenantId),
    ])

    if (!booking) {
      throw new InvoiceNotFoundError(bookingId)
    }

    // 3. Validar dados do cliente
    this.validateTomadorData(booking.customer)

    // 4. Gerar referência única
    const internalRef = `nfse-${nanoid(12)}`

    // 5. Construir payload
    const payload = this.buildNfsePayload(booking, tenant)

    // 6. Criar registro no banco
    const invoice = await prisma.invoice.create({
      data: {
        internalRef,
        status: 'PENDING',
        valorServicos: booking.totalPrice,
        valorTotal: booking.totalPrice,
        aliquotaIss: tenant.fiscalConfig?.aliquotaIss || 0,
        valorIss: booking.totalPrice * ((tenant.fiscalConfig?.aliquotaIss || 0) / 100),
        issRetido: tenant.fiscalConfig?.issRetido || false,
        descricaoServico: payload.servico.discriminacao,
        codigoServico: tenant.fiscalConfig?.codigoServico || undefined,
        tomadorNome: booking.customer.name,
        tomadorCpfCnpj: booking.customer.cpfCnpj || undefined,
        tomadorEmail: booking.customer.email || undefined,
        tomadorEndereco: booking.customer.address
          ? {
              logradouro: booking.customer.address,
              cidade: booking.customer.city,
              uf: booking.customer.state,
              cep: booking.customer.zipCode,
            }
          : undefined,
        bookingId,
        tenantId,
      },
    })

    try {
      // 7. Enviar para Focus NFe
      if (!tenant.fiscalConfig) {
        throw new FiscalConfigurationError('Configuração fiscal não encontrada')
      }
      const client = this.createClient(tenant.fiscalConfig)
      const response = await client.emitirNfse(internalRef, payload)

      // 8. Atualizar status
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: this.mapFocusStatus(response.status),
          focusNfeStatus: response.status,
          numero: response.numero,
          codigoVerificacao: response.codigo_verificacao,
          xmlUrl: response.caminho_xml_nota_fiscal || response.url,
          pdfUrl: response.url_danfse,
          emittedAt: response.status === 'autorizado' ? new Date() : undefined,
        },
      })

      // 9. Se autorizado e opção de email, enviar
      if (response.status === 'autorizado' && options.sendEmail && booking.customer.email) {
        await this.sendInvoiceEmail(invoice.id)
      }

      return {
        success: true,
        invoice: {
          id: invoice.id,
          internalRef,
          status: this.mapFocusStatus(response.status),
        },
      }
    } catch (error) {
      // Atualizar com erro
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      const focusErrors = error instanceof FocusNfeApiError ? error.focusNfeErrors : undefined

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'ERROR',
          errorCode: error instanceof FocusNfeApiError ? 'FOCUS_API_ERROR' : 'UNKNOWN_ERROR',
          errorMessage,
          retryCount: { increment: 1 },
        },
      })

      return {
        success: false,
        invoice: {
          id: invoice.id,
          internalRef,
          status: 'ERROR',
        },
        error: errorMessage,
        focusNfeErrors: focusErrors,
      }
    }
  }

  /**
   * Consulta e atualiza o status de uma NFS-e
   */
  async syncStatus(invoiceId: string, tenantId: string): Promise<InvoiceStatus> {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      include: {
        tenant: {
          include: { fiscalConfig: true },
        },
      },
    })

    if (!invoice) {
      throw new InvoiceNotFoundError(invoiceId)
    }

    // Se já está em status final, não consulta
    if (['AUTHORIZED', 'CANCELLED', 'REJECTED'].includes(invoice.status)) {
      return invoice.status as InvoiceStatus
    }

    const client = this.createClient({
      focusNfeToken: invoice.tenant.fiscalConfig?.focusNfeToken || '',
      focusNfeEnvironment: (invoice.tenant.fiscalConfig?.focusNfeEnvironment || 'HOMOLOGACAO') as FocusNfeEnvironment,
    })

    const response = await client.consultarNfse(invoice.internalRef)

    const newStatus = this.mapFocusStatus(response.status)

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: newStatus,
        focusNfeStatus: response.status,
        numero: response.numero || invoice.numero,
        codigoVerificacao: response.codigo_verificacao || invoice.codigoVerificacao,
        xmlUrl: response.caminho_xml_nota_fiscal || response.url || invoice.xmlUrl,
        pdfUrl: response.url_danfse || invoice.pdfUrl,
        emittedAt: response.status === 'autorizado' && !invoice.emittedAt ? new Date() : invoice.emittedAt,
        errorMessage: response.erros?.map(e => e.mensagem).join('; ') || null,
      },
    })

    return newStatus
  }

  /**
   * Cancela uma NFS-e
   */
  async cancel(
    invoiceId: string,
    tenantId: string,
    justificativa: string
  ): Promise<void> {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      include: {
        tenant: {
          include: { fiscalConfig: true },
        },
      },
    })

    if (!invoice) {
      throw new InvoiceNotFoundError(invoiceId)
    }

    if (invoice.status !== 'AUTHORIZED') {
      throw new InvoiceStatusError(invoice.status, 'cancelar')
    }

    const client = this.createClient({
      focusNfeToken: invoice.tenant.fiscalConfig?.focusNfeToken || '',
      focusNfeEnvironment: (invoice.tenant.fiscalConfig?.focusNfeEnvironment || 'HOMOLOGACAO') as FocusNfeEnvironment,
    })

    await client.cancelarNfse(invoice.internalRef, justificativa)

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: justificativa,
      },
    })
  }

  /**
   * Reenvia email com a NFS-e
   */
  async sendInvoiceEmail(invoiceId: string, emails?: string[]): Promise<void> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        tenant: {
          include: { fiscalConfig: true },
        },
        booking: {
          include: { customer: true },
        },
      },
    })

    if (!invoice) {
      throw new InvoiceNotFoundError(invoiceId)
    }

    if (invoice.status !== 'AUTHORIZED') {
      throw new InvoiceStatusError(invoice.status, 'enviar email')
    }

    const targetEmails = emails || (invoice.tomadorEmail ? [invoice.tomadorEmail] : [])

    if (targetEmails.length === 0) {
      throw new TomadorDataError('Nenhum email disponível para envio')
    }

    const client = this.createClient({
      focusNfeToken: invoice.tenant.fiscalConfig?.focusNfeToken || '',
      focusNfeEnvironment: (invoice.tenant.fiscalConfig?.focusNfeEnvironment || 'HOMOLOGACAO') as FocusNfeEnvironment,
    })

    await client.reenviarEmail(invoice.internalRef, targetEmails)

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        sentToCustomerAt: new Date(),
      },
    })
  }

  // ========== Métodos privados ==========

  private async getBookingData(bookingId: string, tenantId: string) {
    return prisma.booking.findFirst({
      where: { id: bookingId, tenantId },
      include: {
        customer: true,
        items: {
          include: {
            equipment: {
              select: { name: true },
            },
          },
        },
      },
    })
  }

  private async getTenantFiscalData(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { fiscalConfig: true },
    })

    if (!tenant) {
      throw new FiscalConfigurationError('Tenant não encontrado')
    }

    if (!tenant.cnpj || !tenant.inscricaoMunicipal || !tenant.codigoMunicipio) {
      throw new FiscalConfigurationError('Dados fiscais do tenant incompletos')
    }

    if (!tenant.fiscalConfig?.focusNfeToken) {
      throw new FiscalConfigurationError('Token do Focus NFe não configurado')
    }

    return tenant
  }

  private validateTomadorData(customer: { name: string; cpfCnpj?: string | null }) {
    if (!customer.name) {
      throw new TomadorDataError('Nome do cliente é obrigatório', ['name'])
    }

    if (customer.cpfCnpj && !validateCpfCnpj(customer.cpfCnpj)) {
      throw new TomadorDataError('CPF/CNPJ do cliente é inválido', ['cpfCnpj'])
    }
  }

  private createClient(config: {
    focusNfeToken?: string | null
    focusNfeEnvironment?: string | null
  }): FocusNfeClient {
    if (!config.focusNfeToken) {
      throw new FiscalConfigurationError('Token do Focus NFe não configurado')
    }

    // Descriptografar token
    const decryptedToken = decryptToken(config.focusNfeToken)

    return createFocusNfeClient(
      decryptedToken,
      (config.focusNfeEnvironment || 'HOMOLOGACAO') as FocusNfeEnvironment
    )
  }

  private buildNfsePayload(
    booking: NonNullable<Awaited<ReturnType<typeof this.getBookingData>>>,
    tenant: NonNullable<Awaited<ReturnType<typeof this.getTenantFiscalData>>>
  ): NfsePayload {
    // Construir descrição do serviço usando template
    const template = tenant.fiscalConfig?.descricaoTemplate || DEFAULT_DESCRIPTION_TEMPLATE

    const variables: TemplateVariables = {
      bookingNumber: booking.bookingNumber,
      startDate: formatDate(booking.startDate),
      endDate: formatDate(booking.endDate),
      totalDays: calculateDays(booking.startDate, booking.endDate),
      customerName: booking.customer.name,
      itemsList: formatItemsList(
        booking.items.map(item => ({
          equipmentName: item.equipment.name,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
        }))
      ),
      totalPrice: formatCurrency(booking.totalPrice),
    }

    const discriminacao = processTemplate(template, variables)

    // Montar payload
    const payload: NfsePayload = {
      prestador: {
        cnpj: onlyNumbers(tenant.cnpj!),
        inscricao_municipal: onlyNumbers(tenant.inscricaoMunicipal!),
        codigo_municipio: tenant.codigoMunicipio!,
      },
      tomador: {
        razao_social: booking.customer.name,
        email: booking.customer.email || undefined,
        telefone: booking.customer.phone || undefined,
      },
      servico: {
        valor_servicos: booking.totalPrice,
        discriminacao,
        aliquota: tenant.fiscalConfig?.aliquotaIss || 0,
        iss_retido: tenant.fiscalConfig?.issRetido || false,
      },
    }

    // Adicionar CPF ou CNPJ do tomador
    if (booking.customer.cpfCnpj) {
      const doc = onlyNumbers(booking.customer.cpfCnpj)
      if (doc.length === 11) {
        payload.tomador.cpf = doc
      } else if (doc.length === 14) {
        payload.tomador.cnpj = doc
      }
    }

    // Adicionar endereço se disponível
    if (booking.customer.address && booking.customer.city && booking.customer.state) {
      payload.tomador.endereco = {
        logradouro: booking.customer.address,
        numero: 'S/N', // Número não separado no modelo atual
        bairro: 'Centro', // Bairro não disponível no modelo atual
        codigo_municipio: tenant.codigoMunicipio!, // Usar do tenant por enquanto
        uf: booking.customer.state,
        cep: onlyNumbers(booking.customer.zipCode || ''),
      }
    }

    // Adicionar código do serviço se configurado
    if (tenant.fiscalConfig?.codigoServico) {
      payload.servico.codigo_tributario_municipio = tenant.fiscalConfig.codigoServico
    }

    return payload
  }

  private mapFocusStatus(focusStatus: string): InvoiceStatus {
    switch (focusStatus) {
      case 'autorizado':
        return 'AUTHORIZED'
      case 'processando_autorizacao':
        return 'PROCESSING'
      case 'erro_autorizacao':
        return 'REJECTED'
      case 'cancelado':
        return 'CANCELLED'
      default:
        return 'PENDING'
    }
  }
}

// Singleton
export const nfseService = new NfseService()
