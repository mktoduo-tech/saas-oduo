// Cliente HTTP para API Focus NFe

import type {
  FocusNfeEnvironment,
  NfsePayload,
  FocusNfeResponse,
} from './types'
import {
  FocusNfeApiError,
  FocusNfeAuthError,
  mapHttpError,
} from './errors'

interface FocusNfeClientConfig {
  token: string
  environment: FocusNfeEnvironment
}

const BASE_URLS: Record<FocusNfeEnvironment, string> = {
  HOMOLOGACAO: 'https://homologacao.focusnfe.com.br/v2',
  PRODUCAO: 'https://api.focusnfe.com.br/v2',
}

/**
 * Cliente para comunicação com a API Focus NFe
 */
export class FocusNfeClient {
  private baseUrl: string
  private token: string

  constructor(config: FocusNfeClientConfig) {
    if (!config.token) {
      throw new FocusNfeAuthError('Token do Focus NFe não configurado')
    }

    this.baseUrl = BASE_URLS[config.environment]
    this.token = config.token
  }

  /**
   * Faz uma requisição autenticada para a API
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`

    // Focus NFe usa Basic Auth com token:''
    const auth = Buffer.from(`${this.token}:`).toString('base64')

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw mapHttpError(response.status, data)
    }

    return data as T
  }

  /**
   * Emite uma NFS-e
   * @param ref - Referência única (gerada internamente)
   * @param payload - Dados da NFS-e
   */
  async emitirNfse(ref: string, payload: NfsePayload): Promise<FocusNfeResponse> {
    return this.request<FocusNfeResponse>('POST', `/nfse?ref=${ref}`, payload)
  }

  /**
   * Consulta o status de uma NFS-e
   * @param ref - Referência da NFS-e
   */
  async consultarNfse(ref: string): Promise<FocusNfeResponse> {
    return this.request<FocusNfeResponse>('GET', `/nfse/${ref}`)
  }

  /**
   * Cancela uma NFS-e autorizada
   * @param ref - Referência da NFS-e
   * @param justificativa - Motivo do cancelamento (mínimo 15 caracteres)
   */
  async cancelarNfse(ref: string, justificativa: string): Promise<FocusNfeResponse> {
    if (justificativa.length < 15) {
      throw new FocusNfeApiError(
        'Justificativa de cancelamento deve ter no mínimo 15 caracteres',
        [{ codigo: 'JUSTIFICATIVA_CURTA', mensagem: 'Mínimo 15 caracteres' }]
      )
    }

    return this.request<FocusNfeResponse>('DELETE', `/nfse/${ref}`, {
      justificativa,
    })
  }

  /**
   * Reenvia email com a NFS-e para os destinatários
   * @param ref - Referência da NFS-e
   * @param emails - Lista de emails para envio
   */
  async reenviarEmail(ref: string, emails: string[]): Promise<void> {
    if (emails.length === 0) {
      throw new FocusNfeApiError(
        'É necessário informar pelo menos um email',
        [{ codigo: 'EMAIL_REQUIRED', mensagem: 'Informe ao menos um email' }]
      )
    }

    await this.request('POST', `/nfse/${ref}/email`, {
      emails: emails,
    })
  }

  /**
   * Testa a conexão com a API
   * @returns true se a conexão está funcionando
   */
  async testarConexao(): Promise<boolean> {
    try {
      // Faz uma consulta a uma NFS-e inexistente para testar auth
      await this.request('GET', '/nfse/teste-conexao-inexistente')
      return true
    } catch (error) {
      // 404 significa que autenticou mas não encontrou (esperado)
      if (error instanceof Error && error.message.includes('não encontrado')) {
        return true
      }
      // Erro de auth significa credenciais inválidas
      if (error instanceof FocusNfeAuthError) {
        return false
      }
      // Outros erros podem ser de rede
      throw error
    }
  }
}

/**
 * Cria uma instância do cliente Focus NFe
 */
export function createFocusNfeClient(
  token: string,
  environment: FocusNfeEnvironment
): FocusNfeClient {
  return new FocusNfeClient({ token, environment })
}
