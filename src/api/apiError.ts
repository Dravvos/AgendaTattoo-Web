/**
 * Motivo pelo qual uma chamada de API falhou.
 * - 'network'  → a requisição não conseguiu sair (sem internet, CORS, servidor fora do ar).
 * - 'timeout'  → o servidor não respondeu dentro do prazo configurado.
 * - 'http'     → o servidor respondeu, mas com um status de erro (4xx/5xx).
 * - 'parse'    → o servidor respondeu, mas o corpo da resposta não pôde ser interpretado.
 */
export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'parse'

interface ApiErrorParams {
  kind: ApiErrorKind
  message: string
  url: string
  status?: number
  statusText?: string
  data?: unknown
  cause?: unknown
}

/**
 * Erro único lançado por todas as chamadas do HttpClient.
 * Sempre é uma instância de ApiError — nunca um erro cru do fetch — para que
 * quem consome a API só precise tratar um tipo de exceção.
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly url: string
  readonly status?: number
  readonly statusText?: string
  readonly data?: unknown

  constructor(params: ApiErrorParams) {
    super(params.message, params.cause !== undefined ? { cause: params.cause } : undefined)
    this.name = 'ApiError'
    this.kind = params.kind
    this.url = params.url
    this.status = params.status
    this.statusText = params.statusText
    this.data = params.data
  }

  get isNetworkError(): boolean {
    return this.kind === 'network'
  }

  get isTimeout(): boolean {
    return this.kind === 'timeout'
  }

  get isHttpError(): boolean {
    return this.kind === 'http'
  }

  /** Ex.: status === 401, para tratar "sessão expirada" em um só lugar. */
  hasStatus(status: number): boolean {
    return this.status === status
  }
}

/**
 * Formato padrão de erro de validação do ASP.NET Core (ValidationProblemDetails):
 * { "errors": { "Email": ["campo obrigatório"], "Password": ["muito curta"] } }
 */
interface ValidationProblemDetailsLike {
  errors?: Record<string, string[]>
}

/**
 * Extrai erros de validação por campo de um ApiError vindo de um 400 do
 * ASP.NET Core Identity/ValidationProblemDetails, normalizando as chaves para
 * minúsculo (ex.: "Email" → "email") para facilitar o cruzamento com os
 * campos do formulário no frontend.
 *
 * Retorna undefined se o erro não tiver esse formato — ajuste os nomes de
 * campo aqui quando os DTOs reais do backend forem definidos.
 */
export function extractValidationErrors(error: unknown): Record<string, string> | undefined {
  if (!(error instanceof ApiError) || !error.isHttpError) return undefined

  const data = error.data as ValidationProblemDetailsLike | undefined
  if (!data?.errors || typeof data.errors !== 'object') return undefined

  const normalized: Record<string, string> | any = {}
  for (const [field, messages] of Object.entries(data.errors)) {
    if (Array.isArray(messages) && messages.length > 0) {

      normalized[field.toLowerCase()] = messages[0]
    }
  }
  return Object.keys(normalized).length > 0 ? normalized : undefined
}

/** Mensagem segura para mostrar na UI: usa a mensagem do ApiError quando existe, senão um fallback. */
export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}
