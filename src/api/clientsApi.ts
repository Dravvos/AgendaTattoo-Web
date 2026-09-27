import { apiClient } from './client'
import type { ClientDto, CreateClientRequest, UpdateClientRequest } from '@/types/settings'

export const clientsApi = {
  list: (search?: string) => apiClient.get<ClientDto[]>('/clients', { params: { search } }),
  get: (id: string) => apiClient.get<ClientDto>(`/clients/${id}`),
  create: (data: CreateClientRequest) => apiClient.post<ClientDto>('/clients', data),
  update: (id: string, data: UpdateClientRequest) => apiClient.put<ClientDto>(`/clients/${id}`, data),
  // Não existe endpoint de exclusão/desativação no backend — clientes nunca são removidos
  // (ficam referenciados pelos agendamentos via FK com onDelete: Restrict).
}
