export { HttpClient } from './httpClient'
export type { RequestOptions } from './httpClient'
export { ApiError, extractValidationErrors } from './apiError'
export type { ApiErrorKind } from './apiError'
export { apiClient, API_BASE_URL } from './client'
export { authApi } from './authApi'
export type { LoginRequest, RegisterRequest, AuthResponse, ForgotPasswordRequest, ResetPasswordRequest } from './authApi'
export type {
  ArtistDto,
  AppointmentDto,
  CreateAppointmentRequest,
  ListAppointmentsParams,
} from './scheduleApi'
