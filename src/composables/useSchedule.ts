import { computed, ref } from 'vue'
import type { Appointment, AppointmentStatus, Artist } from '../types/schedule'
import {  extractValidationErrors, type ArtistDto, type AppointmentDto } from '../api'
import { scheduleApi } from '@/api/scheduleApi'
import { getErrorMessage } from '@/api/apiError'
import { addDays } from '../utils/date'

const ARTIST_COLOR_VARS:string[] = ['--artist-1', '--artist-2', '--artist-3', '--artist-4']
const KNOWN_STATUSES: AppointmentStatus[] = ['pendente', 'confirmado', 'concluido', 'cancelado']

function toArtist(dto: ArtistDto, index: number): Artist {
  return {
    id: dto.id,
    name: dto.name,
    colorVar: ARTIST_COLOR_VARS[index % ARTIST_COLOR_VARS.length],
  }
}

function toAppointment(dto: AppointmentDto): Appointment {
  const status = KNOWN_STATUSES.includes(dto.status as AppointmentStatus)
    ? (dto.status as AppointmentStatus)
    : 'pendente'

  return {
    id: dto.id,
    artistId: dto.artistId,
    clientName: dto.clientName,
    service: dto.service,
    start: new Date(dto.start),
    end: new Date(dto.end),
    status,
  }
}

export interface CreateAppointmentInput {
  artistId: string
  clientName: string
  service: string
  start: Date
  end: Date
}

export type ScheduleActionResult =
  | { success: true }
  | { success: false; message: string; fieldErrors?: Record<string, string> }

/**
 * Estado e ações da agenda (artistas + agendamentos), já ligados à API.
 * Cada view que usa a agenda chama isso uma vez e trabalha com o que ele expõe.
 */
export function useSchedule() {
  const artists = ref<Artist[]>([])
  const appointments = ref<Appointment[]>([])

  const isLoadingArtists = ref(false)
  const isLoadingAppointments = ref(false)
  const isLoading = computed(() => isLoadingArtists.value || isLoadingAppointments.value)

  const error = ref<string | null>(null)

  async function loadArtists(): Promise<void> {
    isLoadingArtists.value = true
    try {
      const dtos = await scheduleApi.listArtists()
      artists.value = dtos.map(toArtist)
      error.value = null
    } catch (err) {
      error.value = getErrorMessage(err, 'Não foi possível carregar os tatuadores.')
    } finally {
      isLoadingArtists.value = false
    }
  }

  async function loadAppointments(weekStart: Date): Promise<void> {
    isLoadingAppointments.value = true
    try {
      const weekEnd = addDays(weekStart, 7)
      const dtos = await scheduleApi.listAppointments({
        from: weekStart.toISOString(),
        to: weekEnd.toISOString(),
      })
      appointments.value = dtos.map(toAppointment)
      error.value = null
    } catch (err) {
      error.value = getErrorMessage(err, 'Não foi possível carregar os agendamentos desta semana.')
    } finally {
      isLoadingAppointments.value = false
    }
  }

  async function createAppointment(input: CreateAppointmentInput): Promise<ScheduleActionResult> {
    try {
      const dto = await scheduleApi.createAppointment({
        artistId: input.artistId,
        clientName: input.clientName,
        service: input.service,
        start: input.start.toISOString(),
        end: input.end.toISOString(),
      })
      appointments.value.push(toAppointment(dto))
      return { success: true }
    } catch (err) {
      const fieldErrors = extractValidationErrors(err)
      if (fieldErrors) {
        return { success: false, message: 'Verifique os campos destacados.', fieldErrors }
      }
      return { success: false, message: getErrorMessage(err, 'Não foi possível salvar o agendamento.') }
    }
  }

  async function cancelAppointment(id: string): Promise<ScheduleActionResult> {
    const target = appointments.value.find((appointment) => appointment.id === id)
    if (!target) return { success: false, message: 'Agendamento não encontrado.' }

    // Atualização otimista: já reflete o cancelamento na tela e desfaz se a API recusar.
    const previousStatus = target.status
    target.status = 'cancelado'
    try {
      await scheduleApi.cancelAppointment(id)
      return { success: true }
    } catch (err) {
      target.status = previousStatus
      return { success: false, message: getErrorMessage(err, 'Não foi possível cancelar o agendamento.') }
    }
  }

  return {
    artists,
    appointments,
    isLoading,
    error,
    loadArtists,
    loadAppointments,
    createAppointment,
    cancelAppointment,
  }
}
