export interface StudioDto {
  id: string
  name: string
  slug: string
  description: string | null
  phoneNumber: string | null
  address: string | null
  timeZoneId: string
}


export interface UpdateStudioRequest {
  name: string
  slug: string
  description?: string | null
  phoneNumber?: string | null
  address?: string | null
  timeZoneId: string
}
