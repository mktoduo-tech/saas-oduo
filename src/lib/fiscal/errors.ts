// Erros específicos para integração fiscal

import type { FocusNfeError } from './types'

/**
 * Erro base para operações fiscais
 */
export class FiscalError extends Error {
  public readonly code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = 'FiscalError'
    this.code = code
  }
}

/**
 * Feature NFS-e não habilitada para o tenant
 */
export class FiscalFeatureDisabledError extends FiscalError {
  constructor(message = 'NFS-e não está habilitada para esta conta') {
    super(message, 'NFSE_FEATURE_DISABLED')
    this.name = 'FiscalFeatureDisabledError'
  }
}

/**
 * Configuração fiscal incompleta ou inválida
 */
export class FiscalConfigurationError extends FiscalError {
  public readonly missingFields: string[]

  constructor(message: string, missingFields: string[] = []) {
    super(message, 'FISCAL_CONFIGURATION_ERROR')
    this.name = 'FiscalConfigurationError'
    this.missingFields = missingFields
  }
}

/**
 * Erro retornado pela API do Focus NFe
 */
export class FocusNfeApiError extends FiscalError {
  public readonly focusNfeErrors: FocusNfeError[]
  public readonly httpStatus?: number

  constructor(
    message: string,
    focusNfeErrors: FocusNfeError[] = [],
    httpStatus?: number
  ) {
    super(message, 'FOCUS_NFE_API_ERROR')
    this.name = 'FocusNfeApiError'
    this.focusNfeErrors = focusNfeErrors
    this.httpStatus = httpStatus
  }
}

/**
 * Erro de autenticação com Focus NFe
 */
export class FocusNfeAuthError extends FiscalError {
  constructor(message = 'Credenciais do Focus NFe inválidas ou expiradas') {
    super(message, 'FOCUS_NFE_AUTH_ERROR')
    this.name = 'FocusNfeAuthError'
  }
}

/**
 * NFS-e não encontrada
 */
export class InvoiceNotFoundError extends FiscalError {
  public readonly invoiceId: string

  constructor(invoiceId: string) {
    super(`NFS-e não encontrada: ${invoiceId}`, 'INVOICE_NOT_FOUND')
    this.name = 'InvoiceNotFoundError'
    this.invoiceId = invoiceId
  }
}

/**
 * Operação não permitida para o status atual da NFS-e
 */
export class InvoiceStatusError extends FiscalError {
  public readonly currentStatus: string
  public readonly operation: string

  constructor(currentStatus: string, operation: string) {
    super(
      `Operação "${operation}" não permitida para NFS-e com status "${currentStatus}"`,
      'INVOICE_STATUS_ERROR'
    )
    this.name = 'InvoiceStatusError'
    this.currentStatus = currentStatus
    this.operation = operation
  }
}

/**
 * Dados do tomador (cliente) inválidos ou incompletos
 */
export class TomadorDataError extends FiscalError {
  public readonly missingFields: string[]

  constructor(message: string, missingFields: string[] = []) {
    super(message, 'TOMADOR_DATA_ERROR')
    this.name = 'TomadorDataError'
    this.missingFields = missingFields
  }
}

/**
 * Mapeia erros HTTP para erros específicos
 */
export function mapHttpError(status: number, body?: unknown): FiscalError {
  switch (status) {
    case 401:
    case 403:
      return new FocusNfeAuthError()

    case 400:
      const errors = Array.isArray((body as { erros?: unknown[] })?.erros)
        ? ((body as { erros: FocusNfeError[] }).erros)
        : []

      // Se não tem erros estruturados, tentar extrair mensagem do body
      const message400 = errors.length === 0 && body && typeof body === 'object'
        ? `Dados inválidos: ${JSON.stringify(body)}`
        : 'Dados inválidos para emissão'

      return new FocusNfeApiError(message400, errors, status)

    case 404:
      return new FiscalError('Recurso não encontrado no Focus NFe', 'FOCUS_NFE_NOT_FOUND')

    case 422:
      const validationErrors = Array.isArray((body as { erros?: unknown[] })?.erros)
        ? ((body as { erros: FocusNfeError[] }).erros)
        : []
      return new FocusNfeApiError('Erro de validação', validationErrors, status)

    case 429:
      return new FiscalError('Limite de requisições excedido', 'FOCUS_NFE_RATE_LIMIT')

    case 500:
    case 502:
    case 503:
    case 504:
      return new FiscalError('Erro no servidor do Focus NFe', 'FOCUS_NFE_SERVER_ERROR')

    default:
      return new FiscalError(`Erro inesperado: HTTP ${status}`, 'FOCUS_NFE_UNKNOWN_ERROR')
  }
}
