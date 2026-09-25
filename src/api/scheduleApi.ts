import { apiClient } from './client'

// Formato como a API deve devolver cada artista.
// TODO: ajustar quando o endpoint real existir (ex.: campo de cor/avatar).
export interface ArtistDto {
  id: string
  name: string
}

// Formato como a API deve devolver cada agendamento. Datas chegam como string
// ISO (JSON não tem tipo Date) — a conversão pra Date acontece no mapper.
export interface AppointmentDto {
  id: string
  artistId: string
  clientName: string
  service: string
  start: string
  end: string
  status: string
}

export interface CreateAppointmentRequest {
  artistId: string
  clientName: string
  service: string
  start: string
  end: string
}

export interface ListAppointmentsParams {
  /** ISO — início do intervalo (inclusivo). */
  from: string
  /** ISO — fim do intervalo (exclusivo). */
  to: string
}

/**
 * Chamadas de agenda. Os caminhos abaixo são placeholders — ajuste quando os
 * controllers de agenda existirem na API (ver TODOs).
 */
export const scheduleApi = {
  // TODO: confirmar a rota real (pode virar algo como /studios/{studioId}/artists
  // quando o multi-tenant estiver definido no backend).
  listArtists(): Promise<ArtistDto[]> {
    return apiClient.get<ArtistDto[]>('/studios/me/artists')
  },

  listAppointments(params: ListAppointmentsParams): Promise<AppointmentDto[]> {
    return apiClient.get<AppointmentDto[]>('/appointments', {
      params: { from: params.from, to: params.to },
    })
  },

  createAppointment(payload: CreateAppointmentRequest): Promise<AppointmentDto> {
    return apiClient.post<AppointmentDto>('/appointments', payload)
  },

  // TODO: decidir entre PATCH .../cancel (usado aqui) ou DELETE quando o
  // controller for criado.
  cancelAppointment(id: string): Promise<void> {
    return apiClient.patch<void>(`/appointments/${id}/cancel`)
  },
}
