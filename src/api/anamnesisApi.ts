import { apiClient } from './client'
import type { AnamnesisFormStatusDto, CreateAnamnesisFormRequest, AnamnesisFormDto } from '../types/anamnesis'

export const anamnesisApi = {
  // Sem prefixo /api (já incluso em API_BASE_URL) — rotas [AllowAnonymous] no backend, mesma
  // convenção de publicBookingApi.ts.
  getPublicStatus: (slug: string, appointmentId: string) =>
    apiClient.get<AnamnesisFormStatusDto>(`/public/studios/${slug}/appointments/${appointmentId}/anamnesis`),

  submit: (slug: string, appointmentId: string, data: CreateAnamnesisFormRequest) =>
    apiClient.post<AnamnesisFormStatusDto>(`/public/studios/${slug}/appointments/${appointmentId}/anamnesis`, data),

  // Visão interna (autenticada) para a equipe do estúdio — dono ou o próprio artista do agendamento.
  // Retorna null quando o backend responde 204 (cliente ainda não enviou).
  getForAppointment: (appointmentId: string) =>
    apiClient.get<AnamnesisFormDto | null>(`/appointments/${appointmentId}/anamnesis`),
}