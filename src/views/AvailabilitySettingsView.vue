<script setup lang="ts">
import { reactive, ref, computed, onMounted, watch } from 'vue'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { availabilityApi } from '@/api/availabilityApi'
import type { StaffMemberDto, WorkingHoursDto, DayOfWeekNumber } from '@/types/settings'
import { useAuth } from '@/composables/useAuth'
import { jwtDecode } from 'jwt-decode'
import DashboardLayout from '@/components/dashboard/DashboardLayout.vue'
import { apiClient } from '@/api'
import { useSchedule } from '@/composables/useSchedule'
import type { Artist } from '@/types/schedule'
import router from '@/router'
const toast = useToast()
const auth = useAuth()

const isOwner = computed(() => {
  const token = auth.token;
  const decodedToken: any = jwtDecode(token.value);

  return decodedToken.role.includes('Owner');
})

// System.DayOfWeek do .NET: Domingo = 0 ... Sábado = 6.
const DAY_LABELS: Record<DayOfWeekNumber, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
}

interface DayRow {
  dayOfWeek: DayOfWeekNumber
  label: string
  enabled: boolean
  startTime: Date
  endTime: Date
  error: string
}

function defaultTime(hour: number): Date {
  return new Date(1970, 0, 1, hour, 0, 0)
}

function buildEmptyDays(): DayRow[] {
  return ([0, 1, 2, 3, 4, 5, 6] as DayOfWeekNumber[]).map((dayOfWeek) => ({
    dayOfWeek,
    label: DAY_LABELS[dayOfWeek],
    enabled: false,
    startTime: defaultTime(9),
    endTime: defaultTime(18),
    error: '',
  }))
}

function parseTime(value: string): Date {
  const [hours, minutes] = value.split(':').map(Number)
  return new Date(1970, 0, 1, hours, minutes, 0)
}

function formatTime(value: Date): string {
  const hours = value.getHours().toString().padStart(2, '0')
  const minutes = value.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}:00`
}

const staffOptions = ref<StaffMemberDto[]>([])
const selectedArtistId = ref<string | null>(null)
const days = reactive<DayRow[]>(buildEmptyDays())
const loading = ref(false)
const saving = ref(false)
const schedule = useSchedule();

async function loadStaff() {
  try {

    const studio = await apiClient.get<any>('/me/getStudio');
    await schedule.loadArtists(studio.slug);

    staffOptions.value = schedule.artists.value.map(toStaffMember);
  } catch (error) {
    toast.add({
      severity: 'warn',
      summary: 'Não foi possível carregar a lista de artistas',
      detail: (error as Error).message,
      life: 5000,
    })
  }
}

function toStaffMember(dto: Artist, index: number): StaffMemberDto {
  return {
    id: dto.id,
    fullName: dto.name
  }
}

async function loadWorkingHours(artistId: string) {
  loading.value = true
  try {
    const result: WorkingHoursDto[] = await availabilityApi.get(artistId)
    const fresh = buildEmptyDays()
    for (const entry of result) {
      const row = fresh.find((d) => d.dayOfWeek === entry.dayOfWeek)
      if (row) {
        row.enabled = true
        row.startTime = parseTime(entry.startTime)
        row.endTime = parseTime(entry.endTime)
      }
    }
    days.splice(0, days.length, ...fresh)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erro ao carregar disponibilidade',
      detail: (error as Error).message,
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

function validate(): boolean {
  let valid = true
  for (const day of days) {
    day.error = ''
    if (day.enabled && day.endTime <= day.startTime) {
      day.error = 'O horário final deve ser depois do inicial.'
      valid = false
    }
  }
  return valid
}

async function save() {
  if (!selectedArtistId.value) return
  if (!validate()) return

  saving.value = true
  try {
    await availabilityApi.set(selectedArtistId.value, {
      days: days
        .filter((d) => d.enabled)
        .map((d) => ({
          dayOfWeek: d.dayOfWeek,
          startTime: formatTime(d.startTime),
          endTime: formatTime(d.endTime),
        })),
    })
    toast.add({ severity: 'success', summary: 'Disponibilidade salva', life: 3000 })
  } catch (error) {
    console.log('Erro detalhado: ', error);
    toast.add({
      severity: 'error',
      summary: 'Não foi possível salvar',
      detail: (error as Error).message,
      life: 5000,
    })
  } finally {
    saving.value = false
  }
}

watch(selectedArtistId, (artistId) => {
  if (artistId) loadWorkingHours(artistId)
})

onMounted(async () => {
if (!auth.isAuthenticated) {
    router.push('/login');
    auth.logout();
  }

  if (isOwner.value) {
    await loadStaff()
  }
  // O dono também é um usuário (potencialmente um artista) — assume-se que ele configura
  // a própria grade por padrão, podendo trocar no seletor acima.
  const token = auth.token;
  const decodedToken = jwtDecode(token.value);

  selectedArtistId.value = decodedToken.sub as string
})
</script>

<template>
  <DashboardLayout>
    <div class="availability-settings">
      <div class="availability-settings__header">
        <h1>Disponibilidade</h1>
        <p>Grade semanal de horários de trabalho — usada para calcular os horários livres na agenda pública.</p>
      </div>

      <div v-if="isOwner" class="availability-settings__artist-picker">
        <label for="artist-picker">Artista</label>
        <Select id="artist-picker" v-model="selectedArtistId" :options="staffOptions" optionLabel="fullName"
          optionValue="id" placeholder="Selecione um artista" />
      </div>

      <table v-if="selectedArtistId" class="availability-settings__table">
        <thead>
          <tr>
            <th></th>
            <th>Dia</th>
            <th>Início</th>
            <th>Fim</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="day in days" :key="day.dayOfWeek">
            <td>
              <ToggleSwitch v-model="day.enabled" />
            </td>
            <td>{{ day.label }}</td>
            <td>
              <DatePicker v-model="day.startTime" timeOnly hourFormat="24" :disabled="!day.enabled" />
            </td>
            <td>
              <DatePicker v-model="day.endTime" timeOnly hourFormat="24" :disabled="!day.enabled" />
              <small v-if="day.error" class="availability-settings__error">{{ day.error }}</small>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="availability-settings__footer">
        <Button label="Salvar disponibilidade" :loading="saving" :disabled="loading || !selectedArtistId"
          @click="save" />
      </div>
    </div>
  </DashboardLayout>

</template>

<style scoped>
.availability-settings__header {
  margin-bottom: 1.5rem;
}

.availability-settings__header h1 {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  color: var(--text-on-paper);
}

.availability-settings__header p {
  margin: 0;
  color: var(--text-on-paper);

}

.availability-settings__artist-picker {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  max-width: 20rem;
  margin-bottom: 1.5rem;
  color: var(--text-on-paper, #6b7280);
}

.availability-settings__table {
  width: 100%;
  border-collapse: collapse;
  color:var(--p-surface-600)
}

.availability-settings__table th,
.availability-settings__table td {
  padding: 0.5rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--p-surface-200, #e5e7eb);
}

.availability-settings__error {
  display: block;
  color: var(--p-red-500, #ef4444);
}

.availability-settings__footer {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}
</style>
