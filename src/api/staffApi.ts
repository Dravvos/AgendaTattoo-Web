import { apiClient } from './client'
import type { StaffMemberDto, InviteArtistRequest, UpdateStaffMemberRequest } from '@/types/settings'

export const staffApi = {
  list: () => apiClient.get<StaffMemberDto[]>('/studio/members'),
  invite: (data: InviteArtistRequest) => apiClient.post<StaffMemberDto>('/studio/members', data),
  update: (id: string, data: UpdateStaffMemberRequest) =>
    apiClient.put<StaffMemberDto>(`/studio/members/${id}`, data),
  // DELETE faz soft-delete (IsActive = false) — mesma convenção usada em servicesApi.ts.
  deactivate: (id: string) => apiClient.delete<void>(`/studio/members/${id}`),
  reactivate: (id: string) => apiClient.post<void>(`/studio/members/${id}/reactivate`, undefined),
}
