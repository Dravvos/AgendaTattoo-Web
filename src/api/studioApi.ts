import { apiClient } from './client'
import type { StudioDto, UpdateStudioRequest } from '@/types/studio'

export const studioApi = {
  get: () => apiClient.get<StudioDto>('/studio'),
  update: (data: UpdateStudioRequest) => apiClient.put<StudioDto>('/studio', data),
}
