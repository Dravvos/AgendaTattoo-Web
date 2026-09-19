import { ApiError } from './apiError'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestOptions {
  /** Vira query string: /path?chave=valor. Valores undefined são omitidos. */
  params?: Record<string, string | number | boolean | undefined>
  headers?: HeadersInit
  /** Para cancelar a requisição externamente (ex.: ao desmontar um componente). */
  signal?: AbortSignal
  /** Tempo máximo de espera pela resposta, em milissegundos. */
  timeoutMs?: number
}

interface RequestConfig extends RequestOptions {
  method: HttpMethod
  body?: unknown
}

const DEFAULT_TIMEOUT_MS = 15_000

function buildUrl(baseUrl: string, path: string, params?: RequestOptions['params']): string {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  const url = new URL(path.replace(/^\//, ''), normalizedBase)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined

  const contentType = response.headers.get('content-type') ?? ''
  try {
    if (contentType.includes('application/json')) {
      return await response.json()
    }
    const text = await response.text()
    return text.length > 0 ? text : undefined
  } catch (cause) {
    throw new ApiError({
      kind: 'parse',
      message: 'Não foi possível interpretar a resposta do servidor.',
      url: response.url,
      status: response.status,
      statusText: response.statusText,
      cause,
    })
  }
}

/** Tenta extrair uma mensagem legível de um corpo de erro no formato ProblemDetails do ASP.NET Core. */
function extractErrorMessage(data: unknown): string | undefined {
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>
    if (typeof record.detail === 'string') return record.detail
    if (typeof record.title === 'string') return record.title
    if (typeof record.message === 'string') return record.message
  }
  return undefined
}

/**
 * Cliente HTTP fino sobre o `fetch` nativo do navegador — sem dependências de
 * terceiros. Todo erro (rede, timeout, HTTP ou corpo inválido) sai como um
 * único tipo, `ApiError`, para o chamador tratar de forma consistente.
 */
export class HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly defaultHeaders: HeadersInit = { 'Content-Type': 'application/json' },
  ) {}

  private async request<T>(path: string, config: RequestConfig): Promise<T> {
    const url = buildUrl(this.baseUrl, path, config.params)

    const controller = new AbortController()
    const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    config.signal?.addEventListener('abort', () => controller.abort(), { once: true })

    let response: Response
    try {
      response = await fetch(url, {
        method: config.method,
        headers: { ...this.defaultHeaders, ...config.headers },
        body: config.body !== undefined ? JSON.stringify(config.body) : undefined,
        signal: controller.signal,
      })
    } catch (cause) {
      const timedOut = controller.signal.aborted
      throw new ApiError({
        kind: timedOut ? 'timeout' : 'network',
        message: timedOut
          ? 'A requisição demorou demais para responder.'
          : 'Não foi possível se conectar ao servidor. Verifique sua conexão.',
        url,
        cause,
      })
    } finally {
      clearTimeout(timeoutId)
    }

    const data = await parseBody(response)

    if (!response.ok) {
      throw new ApiError({
        kind: 'http',
        message: extractErrorMessage(data) ?? `Erro ${response.status} ao chamar a API.`,
        url,
        status: response.status,
        statusText: response.statusText,
        data,
      })
    }

    return data as T
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' })
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body })
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PUT', body })
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PATCH', body })
  }

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' })
  }
}
