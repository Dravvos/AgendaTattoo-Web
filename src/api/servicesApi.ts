import { apiClient } from './client'
import type { ServiceDto, CreateServiceRequest, UpdateServiceRequest } from '@/types/settings'


export const servicesApi = {
  list: () => apiClient.get<ServiceDto[]>('/services'),
  create: (data: CreateServiceRequest) =>apiClient.post<ServiceDto>('/services', data),
  update: (id: string, data: UpdateServiceRequest) => apiClient.put<ServiceDto>(`/services/${id}`, data),
  // DELETE no backend faz soft-delete (IsActive = false), não remove o registro.
  deactivate: (id: string) => apiClient.delete<void>(`/services/${id}`),
}
