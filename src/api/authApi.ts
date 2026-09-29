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


export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  token: string
  newPassword: string
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

    // Sempre resolve (204), mesmo se o e-mail não existir — não dá pra saber pela resposta
  // se o e-mail tem conta ou não (por desenho, ver AuthController.ForgotPassword).
  forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
    return apiClient.post<void>('/auth/forgot-password', payload)
  },

  resetPassword(payload: ResetPasswordRequest): Promise<void> {
    return apiClient.post<void>('/auth/reset-password', payload)
  },


}
