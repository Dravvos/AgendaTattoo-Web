export interface Artist {
  id: string
  name: string
  /** Nome da variável CSS de cor usada pra identificar o artista na agenda (ex.: '--artist-1'). */
  colorVar: string
}

export type AppointmentStatus = 'pendente' | 'confirmado' | 'concluido' | 'cancelado'

export interface Appointment {
  id: string
  artistId: string
  clientName: string
  service: string
  start: Date
  end: Date
  status: AppointmentStatus
}

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  pendente: 'Aguardando sinal',
  confirmado: 'Confirmado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}
