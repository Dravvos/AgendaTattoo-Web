import { HttpClient } from './httpClient'
import { useAuth } from '../composables/useAuth'

// Ajuste para a URL real da API assim que os controllers existirem.
// Em desenvolvimento, o profile "http" do launchSettings.json da API sobe em
// http://localhost:5205 — o "/api" assume um prefixo de rota a ser confirmado.
const DEFAULT_BASE_URL = 'http://localhost:5205/api'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL

/**
 * Instância única do cliente HTTP, usada por todos os serviços de API do app.
 * O terceiro argumento é lido a cada requisição, então login/logout mudam o
 * header `Authorization` das próximas chamadas sem precisar recriar o client.
 */
export const apiClient = new HttpClient(API_BASE_URL, undefined, () => useAuth().token.value)
