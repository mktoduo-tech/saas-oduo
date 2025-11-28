/**
 * Serviço de consulta de CNPJ usando a API OpenCNPJ (gratuita)
 * Limite: 50 requisições por segundo
 * Dados atualizados mensalmente
 */

export interface CNPJData {
  cnpj: string
  razaoSocial: string
  nomeFantasia: string | null
  situacaoCadastral: string
  dataSituacaoCadastral: string | null
  dataAbertura: string | null
  naturezaJuridica: string | null
  porte: string | null
  capitalSocial: number | null
  cnaePrincipal: {
    codigo: string
    descricao: string
  } | null
  cnaesSecundarios: Array<{
    codigo: string
    descricao: string
  }>
  endereco: {
    logradouro: string | null
    numero: string | null
    complemento: string | null
    bairro: string | null
    cidade: string | null
    uf: string | null
    cep: string | null
    codigoMunicipio: string | null
  }
  telefones: string[]
  email: string | null
  socios: Array<{
    nome: string
    qualificacao: string
  }>
}

export interface CNPJError {
  error: true
  message: string
  code?: string
}

export type CNPJResult = CNPJData | CNPJError

/**
 * Remove caracteres não numéricos do CNPJ
 */
export function cleanCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, "")
}

/**
 * Valida se o CNPJ tem 14 dígitos
 */
export function isValidCNPJFormat(cnpj: string): boolean {
  const cleaned = cleanCNPJ(cnpj)
  return cleaned.length === 14
}

/**
 * Consulta dados de CNPJ na API OpenCNPJ
 * @param cnpj - CNPJ com ou sem formatação
 * @returns Dados da empresa ou erro
 */
export async function consultarCNPJ(cnpj: string): Promise<CNPJResult> {
  const cleanedCNPJ = cleanCNPJ(cnpj)

  if (!isValidCNPJFormat(cleanedCNPJ)) {
    return {
      error: true,
      message: "CNPJ deve ter 14 dígitos",
      code: "INVALID_FORMAT",
    }
  }

  try {
    const response = await fetch(`https://api.opencnpj.org/${cleanedCNPJ}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return {
          error: true,
          message: "CNPJ não encontrado na base de dados",
          code: "NOT_FOUND",
        }
      }
      if (response.status === 429) {
        return {
          error: true,
          message: "Limite de requisições excedido. Tente novamente em alguns segundos.",
          code: "RATE_LIMIT",
        }
      }
      return {
        error: true,
        message: `Erro ao consultar CNPJ: ${response.statusText}`,
        code: "API_ERROR",
      }
    }

    const data = await response.json()

    // Mapear resposta da API para nosso formato
    return {
      cnpj: cleanedCNPJ,
      razaoSocial: data.razao_social || "",
      nomeFantasia: data.nome_fantasia || null,
      situacaoCadastral: data.situacao_cadastral || "Desconhecida",
      dataSituacaoCadastral: data.data_situacao_cadastral || null,
      dataAbertura: data.data_inicio_atividade || null,
      naturezaJuridica: data.natureza_juridica || null,
      porte: data.porte_empresa || null,
      capitalSocial: data.capital_social ? parseFloat(data.capital_social) : null,
      cnaePrincipal: data.cnae_principal ? {
        codigo: data.cnae_principal,
        descricao: data.cnae_principal_descricao || "",
      } : null,
      cnaesSecundarios: Array.isArray(data.cnaes_secundarios)
        ? data.cnaes_secundarios.map((cnae: { codigo: string; descricao: string }) => ({
            codigo: cnae.codigo,
            descricao: cnae.descricao,
          }))
        : [],
      endereco: {
        logradouro: data.logradouro || null,
        numero: data.numero || null,
        complemento: data.complemento || null,
        bairro: data.bairro || null,
        cidade: data.municipio || null,
        uf: data.uf || null,
        cep: data.cep || null,
        codigoMunicipio: data.codigo_municipio || null,
      },
      telefones: data.telefones
        ? (Array.isArray(data.telefones)
            ? data.telefones.map((t: { ddd?: string; numero?: string }) => `${t.ddd || ""}${t.numero || ""}`.trim())
            : [data.telefones])
        : [],
      email: data.email || null,
      socios: Array.isArray(data.socios)
        ? data.socios.map((socio: { nome: string; qualificacao?: string }) => ({
            nome: socio.nome,
            qualificacao: socio.qualificacao || "",
          }))
        : [],
    }
  } catch (error) {
    console.error("Erro ao consultar CNPJ:", error)
    return {
      error: true,
      message: "Erro de conexão ao consultar CNPJ. Verifique sua internet.",
      code: "NETWORK_ERROR",
    }
  }
}

/**
 * Verifica se o resultado é um erro
 */
export function isCNPJError(result: CNPJResult): result is CNPJError {
  return "error" in result && result.error === true
}

/**
 * Formata CNPJ para exibição
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = cleanCNPJ(cnpj)
  if (cleaned.length !== 14) return cnpj
  return cleaned.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  )
}

/**
 * Retorna a cor do badge baseado na situação cadastral
 */
export function getSituacaoColor(situacao: string): "success" | "warning" | "destructive" | "secondary" {
  const situacaoLower = situacao.toLowerCase()
  if (situacaoLower.includes("ativa")) return "success"
  if (situacaoLower.includes("suspensa")) return "warning"
  if (situacaoLower.includes("inapta") || situacaoLower.includes("baixada")) return "destructive"
  return "secondary"
}
