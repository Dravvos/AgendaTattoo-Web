// Espelha os DTOs do backend (AgendaTattoo.DTO.Scheduling / AgendaTattoo.DTO.Public).
// Mantenha este arquivo em sincronia se os DTOs do backend mudarem.

export interface ServiceDto {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  price: number
  isActive: boolean,
  nameDescription: string // name + description (se houver) — usado em selects
}

export interface CreateServiceRequest {
  name: string
  description?: string | null
  durationMinutes: number
  price: number
}

export interface UpdateServiceRequest {
  name: string
  description?: string | null
  durationMinutes: number
  price: number
  isActive: boolean
}

// System.DayOfWeek do .NET: Domingo = 0 ... Sábado = 6.
export type DayOfWeekNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface WorkingHoursDto {
  dayOfWeek: DayOfWeekNumber
  startTime: string // "HH:mm:ss" (System.TimeOnly serializado)
  endTime: string // "HH:mm:ss"
}

export interface WorkingHoursEntryRequest {
  dayOfWeek: DayOfWeekNumber
  startTime: string
  endTime: string
}

export interface SetWorkingHoursRequest {
  days: WorkingHoursEntryRequest[]
}

export type StaffRole = 'Owner' | 'Artist'


export interface StaffMemberDto {
  id: string
  fullName: string
  email: string
  role: StaffRole
  isActive: boolean
}

export interface InviteArtistRequest {
  fullName: string
  email: string
  password: string
}

export interface UpdateStaffMemberRequest {
  fullName: string
}

export interface ClientDto {
  id: string
  fullName: string
  phoneNumber: string
  email: string | null
  notes: string | null
}

export interface CreateClientRequest {
  fullName: string
  phoneNumber: string
  email?: string | null
  notes?: string | null
}

export interface UpdateClientRequest {
  fullName: string
  phoneNumber: string
  email?: string | null
  notes?: string | null
}


export interface WorkingHoursDto {
  dayOfWeek: DayOfWeekNumber
  startTime: string // "HH:mm:ss" (System.TimeOnly serializado)
  endTime: string // "HH:mm:ss"
}

export interface WorkingHoursEntryRequest {
  dayOfWeek: DayOfWeekNumber
  startTime: string
  endTime: string
}

export interface SetWorkingHoursRequest {
  days: WorkingHoursEntryRequest[]
}

// Espelha AgendaTattoo.DTO.Scheduling.ArtistTimeOffDto / CreateArtistTimeOffRequest.
// startTime/endTime nulos juntos = dia inteiro bloqueado; preenchidos = só aquele intervalo.
export interface ArtistTimeOffDto {
  id: string
  date: string // "yyyy-MM-dd" (System.DateOnly serializado)
  startTime: string | null // "HH:mm:ss"
  endTime: string | null
  reason: string | null
}

export interface CreateArtistTimeOffRequest {
  date: string
  startTime?: string | null
  endTime?: string | null
  reason?: string | null
}





