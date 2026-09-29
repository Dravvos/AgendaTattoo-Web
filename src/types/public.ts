// Espelha AgendaTattoo.DTO.Public.* — PublicBookingController (api/public/studios/{slug}/...).
// Usado só pela página pública de agendamento (sem login).

export interface PublicStudioDto {
  name: string
  description: string | null
  address: string | null
  phoneNumber: string | null
  slug?: string | null
}

export interface PublicServiceDto {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  price: number
}

export interface PublicArtistDto {
  id: string
  fullName: string
}

export interface AvailableSlotDto {
  startsAt: string // ISO — DateTimeOffset serializado
  endsAt: string
}

export interface CreatePublicBookingRequest {
  artistId: string
  serviceId: string
  startsAt: string // ISO
  clientFullName: string
  clientPhoneNumber: string
  clientEmail?: string | null
  notes?: string | null
}

export interface PublicBookingResponse {
  appointmentId: string
  startsAt: string
  endsAt: string
  status: string
}
