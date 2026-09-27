import { apiClient } from './client'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  studioName: string
  ownerFullName: string
  email: string
  password: string,
  studioSlug: string
}

// TODO: ajustar conforme o retorno real do endpoint de autenticação quando existir.
export interface AuthResponse {
  accessToken: string,
  refreshToken: string,
  accessTokenExpiresAt: Date
}

/**
 * Chamadas de autenticação. Os caminhos ('/auth/login', '/auth/register') são
 * um placeholder — atualize quando os controllers da API forem criados.
 */
export const authApi = {
  login(payload: LoginRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', payload)
  },

  register(payload: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register-studio', payload)
  },
}
