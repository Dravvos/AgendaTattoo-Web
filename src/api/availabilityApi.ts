import { apiClient } from './client'
import type { WorkingHoursDto, SetWorkingHoursRequest, StaffMemberDto } from '@/types/settings'

export const availabilityApi = {
  get: (artistId: string) => apiClient.get<WorkingHoursDto[]>(`/artists/${artistId}/working-hours`),
  set: (artistId: string, data: SetWorkingHoursRequest) =>
    apiClient.put<void>(`/artists/${artistId}/working-hours`, data),
}

// ATENÇÃO: /api/studio/members ainda NÃO existe no backend fornecido.
// O único endpoint que lista artistas hoje é o público (PublicBookingController.ListArtists,
// por slug, sem autenticação, só retorna quem está ativo). Para o dono escolher de quem
// configurar a disponibilidade nesta tela, é necessário criar um endpoint interno autenticado
// que liste os membros (Owner + Artists) do estúdio do usuário logado.
export const staffApi = {
  list: () => apiClient.get<StaffMemberDto[]>('/api/me/members'),
}
