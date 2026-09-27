<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Message from 'primevue/message'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import DashboardLayout from '../components/dashboard/DashboardLayout.vue'
import ScheduleToolbar from '../components/schedule/ScheduleToolbar.vue'
import WeekGrid from '../components/schedule/WeekGrid.vue'
import NewAppointmentDialog, {
  type NewAppointmentPayload,
} from '../components/schedule/NewAppointmentDialog.vue'
import AppointmentDetailsDialog from '../components/schedule/AppointmentDetailsDialog.vue'
import { useSchedule, type ScheduleActionResult } from '../composables/useSchedule'
import type { Appointment } from '../types/schedule'
import { addDays, startOfWeek, toDateKey } from '../utils/date'
import { apiClient } from '@/api/client.ts'
import { useAuth } from '@/composables/useAuth.ts'
import router from '@/router/index.ts'

const { artists, appointments, isLoading, error, loadArtists, loadAppointments, createAppointment, cancelAppointment } =
  useSchedule()

const currentWeekStart = ref(startOfWeek(new Date()))
const selectedArtistId = ref<string>('all')

const weekDays = computed(() => Array.from({ length: 6 }, (_, i) => addDays(currentWeekStart.value, i)))
const hours = Array.from({ length: 11 }, (_, i) => 9 + i) // 09:00 – 19:00 (grade fecha às 20:00)

const visibleAppointments = computed(() => {
  if (selectedArtistId.value === 'all') return appointments.value
  return appointments.value.filter((appointment) => appointment.artistId === selectedArtistId.value)
})

async function refreshAll(): Promise<void> {
  let me = await apiClient.get<any>('/me');

  await Promise.all([loadArtists(me.studioSlug), loadAppointments(currentWeekStart.value)])
}

const auth = useAuth();

onMounted(() => {
  if (!auth.isAuthenticated) {
    router.push('/login');
    auth.logout();
  }
  refreshAll()
})

watch(currentWeekStart, (weekStart) => {
  loadAppointments(weekStart)
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

async function handleCreateSubmit(payload: NewAppointmentPayload): Promise<ScheduleActionResult> {
  const day = weekDays.value.find((d) => toDateKey(d) === payload.dayKey)
  if (!day) {
    return { success: false, message: 'Dia inválido — selecione novamente.' }
  }

  const [hourStr, minuteStr] = payload.startTime.split(':')
  const start = new Date(day)
  start.setHours(Number(hourStr), Number(minuteStr), 0, 0)
  const end = new Date(start.getTime() + payload.durationHours * 60 * 60 * 1000)

  return createAppointment({
    artistId: payload.artistId,
    clientName: payload.clientName,
    service: payload.service,
    start,
    end,
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
  artists.value.find((artist) => artist.id === selectedAppointment.value?.artistId),
)

async function handleCancelAppointment(appointment: Appointment): Promise<ScheduleActionResult> {
  return cancelAppointment(appointment.id)
}
</script>

<template>
  <DashboardLayout>
    <div class="schedule-page">
      <div class="schedule-page__heading">
        <h1>Agenda</h1>
        <p>Visão semanal dos agendamentos, por tatuador.</p>
      </div>

      <Message v-if="error" severity="error" :closable="false" class="schedule-page__error">
        <div class="schedule-page__error-row">
          <span>{{ error }}</span>
          <Button label="Tentar novamente" text size="small" @click="refreshAll" />
        </div>
      </Message>

      <ScheduleToolbar v-model:selected-artist-id="selectedArtistId" :week-start="currentWeekStart" :artists="artists"
        @prev-week="goToPrevWeek" @next-week="goToNextWeek" @today="goToToday" @create="openCreateDialog()" />

      <Skeleton v-if="isLoading" height="620px" />
      <WeekGrid v-else :days="weekDays" :hours="hours" :appointments="visibleAppointments" :artists="artists"
        @select-appointment="openDetailsDialog" @create-appointment="openCreateDialog" />
    </div>

    <NewAppointmentDialog v-model:visible="isCreateDialogOpen" :artists="artists" :week-days="weekDays"
      :prefill="createPrefill" :on-submit="handleCreateSubmit" />

    <AppointmentDetailsDialog v-model:visible="isDetailsDialogOpen" :appointment="selectedAppointment"
      :artist="selectedArtist" :on-cancel="handleCancelAppointment" />
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

.schedule-page__error {
  margin-bottom: 16px;
}

.schedule-page__error-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}
</style>
