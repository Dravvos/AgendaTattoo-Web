import { apiClient } from './client'
import type {
  WorkingHoursDto,
  SetWorkingHoursRequest,
  ArtistTimeOffDto,
  CreateArtistTimeOffRequest,
} from '@/types/settings'

export const availabilityApi = {
  get: (artistId: string) => apiClient.get<WorkingHoursDto[]>(`/artists/${artistId}/working-hours`),
  set: (artistId: string, data: SetWorkingHoursRequest) =>
    apiClient.put<void>(`/artists/${artistId}/working-hours`, data),

  listTimeOff: (artistId: string, from: string, to: string) =>
    apiClient.get<ArtistTimeOffDto[]>(`/artists/${artistId}/time-off`, { params: { from, to } }),
  addTimeOff: (artistId: string, data: CreateArtistTimeOffRequest) =>
    apiClient.post<ArtistTimeOffDto>(`/artists/${artistId}/time-off`, data),
  removeTimeOff: (artistId: string, timeOffId: string) =>
    apiClient.delete<void>(`/artists/${artistId}/time-off/${timeOffId}`),
}

// O antigo placeholder `staffApi` que morava aqui (apontando pra `/api/me/members`, com um bug
// de prefixo duplicado) foi removido — a lista de artistas/equipe agora vive em src/api/staffApi.ts,
// contra o endpoint real api/studio/members.
