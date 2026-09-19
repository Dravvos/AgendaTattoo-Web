<script setup lang="ts">
import { computed, ref } from 'vue'
import DashboardLayout from '../components/dashboard/DashboardLayout.vue'
import ScheduleToolbar from '../components/schedule/ScheduleToolbar.vue'
import WeekGrid from '../components/schedule/WeekGrid.vue'
import NewAppointmentDialog from '../components/schedule/NewAppointmentDialog.vue'
import AppointmentDetailsDialog from '../components/schedule/AppointmentDetailsDialog.vue'
import { mockArtists, mockAppointments } from '../data/mockSchedule'
import type { Appointment } from '../types/schedule'
import { addDays, startOfWeek, toDateKey } from '../utils/date'

const artists = mockArtists
const appointments = ref<Appointment[]>([...mockAppointments])

const currentWeekStart = ref(startOfWeek(new Date()))
const selectedArtistId = ref<string>('all')

const weekDays = computed(() => Array.from({ length: 6 }, (_, i) => addDays(currentWeekStart.value, i)))
const hours = Array.from({ length: 11 }, (_, i) => 9 + i) // 09:00 – 19:00 (grade fecha às 20:00)

const visibleAppointments = computed(() => {
  const weekEnd = addDays(currentWeekStart.value, 6)
  return appointments.value.filter((appointment) => {
    const withinWeek = appointment.start >= currentWeekStart.value && appointment.start < weekEnd
    const matchesArtist = selectedArtistId.value === 'all' || appointment.artistId === selectedArtistId.value
    return withinWeek && matchesArtist
  })
})

function goToPrevWeek(): void {
  currentWeekStart.value = addDays(currentWeekStart.value, -7)
}

function goToNextWeek(): void {
  currentWeekStart.value = addDays(currentWeekStart.value, 7)
}

function goToToday(): void {
  currentWeekStart.value = startOfWeek(new Date())
}

// Diálogo de novo agendamento
const isCreateDialogOpen = ref(false)
const createPrefill = ref<{ day: Date; hour: number } | null>(null)

function openCreateDialog(prefill: { day: Date; hour: number } | null = null): void {
  createPrefill.value = prefill
  isCreateDialogOpen.value = true
}

function handleCreateSubmit(payload: {
  artistId: string
  clientName: string
  service: string
  dayKey: string
  startTime: string
  durationHours: number
}): void {
  const day = weekDays.value.find((d) => toDateKey(d) === payload.dayKey)
  if (!day) return

  const [hourStr, minuteStr] = payload.startTime.split(':')
  const start = new Date(day)
  start.setHours(Number(hourStr), Number(minuteStr), 0, 0)
  const end = new Date(start.getTime() + payload.durationHours * 60 * 60 * 1000)

  appointments.value.push({
    id: crypto.randomUUID(),
    artistId: payload.artistId,
    clientName: payload.clientName,
    service: payload.service,
    start,
    end,
    status: 'pendente',
  })
}

// Diálogo de detalhes
const isDetailsDialogOpen = ref(false)
const selectedAppointment = ref<Appointment | null>(null)

function openDetailsDialog(appointment: Appointment): void {
  selectedAppointment.value = appointment
  isDetailsDialogOpen.value = true
}

const selectedArtist = computed(() =>
  artists.find((artist) => artist.id === selectedAppointment.value?.artistId),
)

function handleCancelAppointment(target: Appointment): void {
  const found = appointments.value.find((appointment) => appointment.id === target.id)
  if (found) found.status = 'cancelado'
}
</script>

<template>
  <DashboardLayout>
    <div class="schedule-page">
      <div class="schedule-page__heading">
        <h1>Agenda</h1>
        <p>Visão semanal dos agendamentos, por tatuador.</p>
      </div>

      <ScheduleToolbar
        v-model:selected-artist-id="selectedArtistId"
        :week-start="currentWeekStart"
        :artists="artists"
        @prev-week="goToPrevWeek"
        @next-week="goToNextWeek"
        @today="goToToday"
        @create="openCreateDialog()"
      />

      <WeekGrid
        :days="weekDays"
        :hours="hours"
        :appointments="visibleAppointments"
        :artists="artists"
        @select-appointment="openDetailsDialog"
        @create-appointment="openCreateDialog"
      />
    </div>

    <NewAppointmentDialog
      v-model:visible="isCreateDialogOpen"
      :artists="artists"
      :week-days="weekDays"
      :prefill="createPrefill"
      @submit="handleCreateSubmit"
    />

    <AppointmentDetailsDialog
      v-model:visible="isDetailsDialogOpen"
      :appointment="selectedAppointment"
      :artist="selectedArtist"
      @cancel-appointment="handleCancelAppointment"
    />
  </DashboardLayout>
</template>

<style scoped>
.schedule-page__heading {
  margin-bottom: 24px;
}

.schedule-page__heading h1 {
  font-size: 28px;
  color: var(--text-on-paper);
}

.schedule-page__heading p {
  margin-top: 4px;
  font-size: 14px;
  color: var(--text-on-paper-muted);
}
</style>
