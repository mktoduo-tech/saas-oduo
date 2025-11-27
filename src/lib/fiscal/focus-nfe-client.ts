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
  async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`

    // Focus NFe usa Basic Auth com token:''
    const auth = Buffer.from(`${this.token}:`).toString('base64')

    console.log('[Focus NFe] Request:', { method, url, hasBody: !!body })

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await response.json().catch(() => ({}))

    console.log('[Focus NFe] Response:', {
      status: response.status,
      ok: response.ok,
      data: JSON.stringify(data, null, 2)
    })

    if (!response.ok) {
      throw mapHttpError(response.status, data)
    }

    return data as T
  }

  /**
   * Emite uma NFS-e Municipal (sistema antigo)
   * @param ref - Referência única (gerada internamente)
   * @param payload - Dados da NFS-e
   */
  async emitirNfseMunicipal(ref: string, payload: NfsePayload): Promise<FocusNfeResponse> {
    return this.request<FocusNfeResponse>('POST', `/nfse?ref=${ref}`, payload)
  }

  /**
   * Emite uma NFS-e Nacional (Sistema Nacional NFS-e)
   * Usar para códigos como 990401 (Locação de Bens Móveis)
   * @param ref - Referência única (gerada internamente)
   * @param payload - Dados da NFS-e Nacional
   */
  async emitirNfseNacional(ref: string, payload: NfsePayload | any): Promise<FocusNfeResponse> {
    return this.request<FocusNfeResponse>('POST', `/nfsen?ref=${ref}`, payload)
  }

  /**
   * Emite uma NFS-e (detecta automaticamente se é Municipal ou Nacional)
   * @param ref - Referência única (gerada internamente)
   * @param payload - Dados da NFS-e
   */
  async emitirNfse(ref: string, payload: NfsePayload): Promise<FocusNfeResponse> {
    // Códigos do Sistema Nacional NFS-e começam com 99
    const codigoNacional = payload.servico.codigo_tributacao_nacional_iss
    const isNacional = codigoNacional?.startsWith('99')

    console.log(`[Focus NFe] Usando endpoint: ${isNacional ? '/nfsen (Nacional)' : '/nfse (Municipal)'}`)

    if (isNacional) {
      // Converter payload para formato Nacional
      const payloadNacional = this.convertToNacionalPayload(payload)
      return this.emitirNfseNacional(ref, payloadNacional)
    } else {
      return this.emitirNfseMunicipal(ref, payload)
    }
  }

  /**
   * Converte payload Municipal para Nacional
   */
  private convertToNacionalPayload(payload: NfsePayload): any {
    const dataEmissao = new Date(payload.data_emissao)
    const dataCompetencia = dataEmissao.toISOString().split('T')[0] // YYYY-MM-DD

    return {
      data_emissao: payload.data_emissao,
      data_competencia: dataCompetencia,
      codigo_municipio_emissora: payload.prestador.codigo_municipio,

      // Prestador
      cnpj_prestador: payload.prestador.cnpj,
      inscricao_municipal_prestador: payload.prestador.inscricao_municipal,
      codigo_opcao_simples_nacional: payload.optante_simples_nacional ? 1 : 2,
      regime_especial_tributacao: payload.regime_especial_tributacao,

      // Tomador
      cnpj_tomador: payload.tomador.cnpj,
      cpf_tomador: payload.tomador.cpf,
      razao_social_tomador: payload.tomador.razao_social,
      codigo_municipio_tomador: payload.tomador.endereco?.codigo_municipio,
      cep_tomador: payload.tomador.endereco?.cep,
      logradouro_tomador: payload.tomador.endereco?.logradouro,
      numero_tomador: payload.tomador.endereco?.numero,
      complemento_tomador: payload.tomador.endereco?.complemento,
      bairro_tomador: payload.tomador.endereco?.bairro,
      telefone_tomador: payload.tomador.telefone,
      email_tomador: payload.tomador.email,

      // Serviço
      codigo_municipio_prestacao: payload.prestador.codigo_municipio,
      codigo_tributacao_nacional_iss: payload.servico.codigo_tributacao_nacional_iss,
      descricao_servico: payload.servico.discriminacao,
      valor_servico: payload.servico.valor_servicos,
      tributacao_iss: 1, // 1 = Tributável
      tipo_retencao_iss: payload.servico.iss_retido ? 1 : 2, // 1 = Retido, 2 = Não retido
    }
  }

  /**
   * Consulta o status de uma NFS-e Municipal
   * @param ref - Referência da NFS-e
   */
  async consultarNfseMunicipal(ref: string): Promise<FocusNfeResponse> {
    return this.request<FocusNfeResponse>('GET', `/nfse/${ref}`)
  }

  /**
   * Consulta o status de uma NFS-e Nacional
   * @param ref - Referência da NFS-e
   */
  async consultarNfseNacional(ref: string): Promise<FocusNfeResponse> {
    return this.request<FocusNfeResponse>('GET', `/nfsen/${ref}`)
  }

  /**
   * Consulta o status de uma NFS-e (tenta ambos os endpoints)
   * @param ref - Referência da NFS-e
   */
  async consultarNfse(ref: string): Promise<FocusNfeResponse> {
    // Tenta primeiro o endpoint nacional, depois o municipal
    try {
      return await this.consultarNfseNacional(ref)
    } catch (error) {
      return await this.consultarNfseMunicipal(ref)
    }
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
