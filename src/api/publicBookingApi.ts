import { apiClient } from './client'
import type {
  PublicStudioDto,
  PublicServiceDto,
  PublicArtistDto,
  AvailableSlotDto,
  CreatePublicBookingRequest,
  PublicBookingResponse,
} from '../types/public'

// Sem prefixo /api (já incluso em API_BASE_URL) — rotas [AllowAnonymous] no backend.
export const publicBookingApi = {
  getStudio: (slug: string) => apiClient.get<PublicStudioDto>(`/public/studios/${slug}`),
  listServices: (slug: string) => apiClient.get<PublicServiceDto[]>(`/public/studios/${slug}/services`),
  listArtists: (slug: string) => apiClient.get<PublicArtistDto[]>(`/public/studios/${slug}/artists`),
  getAvailability: (slug: string, artistId: string, serviceId: string, date: string) =>
    apiClient.get<AvailableSlotDto[]>(`/public/studios/${slug}/availability`, {
      params: { artistId, serviceId, date },
    }),
  createBooking: (slug: string, data: CreatePublicBookingRequest) =>
    apiClient.post<PublicBookingResponse>(`/public/studios/${slug}/bookings`, data),
}
