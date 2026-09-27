// Espelha os DTOs do backend (AgendaTattoo.DTO.Scheduling / AgendaTattoo.DTO.Public).
// Mantenha este arquivo em sincronia se os DTOs do backend mudarem.

export interface ServiceDto {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  price: number
  isActive: boolean
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

// NÃO existe ainda no backend fornecido — ver observação em services/availabilityApi.ts.
// Endpoint sugerido: GET /api/studio/members (autenticado, retorna Owner + Artists do estúdio do usuário logado).
export interface StaffMemberDto {
  id: string
  fullName: string
}
