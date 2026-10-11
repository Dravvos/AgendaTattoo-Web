<script setup lang="ts">
import { reactive, ref, computed, onMounted, watch } from 'vue'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { jwtDecode } from 'jwt-decode'
import { availabilityApi } from '@/api/availabilityApi'
import { staffApi } from '@/api/staffApi'
import type { StaffMemberDto, WorkingHoursDto, ArtistTimeOffDto, DayOfWeekNumber } from '@/types/settings'
import { useAuth } from '@/composables/useAuth'
import { addDays, formatDayOptionLabel, toDateKey } from '@/utils/date'
import DashboardLayout from '@/components/dashboard/DashboardLayout.vue'
import router from '@/router'

const toast = useToast()
const confirm = useConfirm()
const auth = useAuth()

const isOwner = computed(() => {
  const decoded: any = jwtDecode(auth.token.value)
  return decoded.role?.includes('Owner') ?? false
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

interface WorkBlock {
  startTime: Date
  endTime: Date
}

interface DayRow {
  dayOfWeek: DayOfWeekNumber
  label: string
  enabled: boolean
  blocks: WorkBlock[]
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
    blocks: [],
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

async function loadStaff() {
  try {
    staffOptions.value = await staffApi.list()
  } catch (error) {
    toast.add({
      severity: 'warn',
      summary: 'Não foi possível carregar a lista de artistas',
      detail: (error as Error).message,
      life: 5000,
    })
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
        row.blocks.push({ startTime: parseTime(entry.startTime), endTime: parseTime(entry.endTime) })
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

function onToggleDay(day: DayRow, enabled: boolean) {
  if (enabled && day.blocks.length === 0) {
    day.blocks.push({ startTime: defaultTime(9), endTime: defaultTime(18) })
  }
}

function addBlock(day: DayRow) {
  // Faixa seguinte sugerida começa 1h depois do fim da última (deixa espaço pro intervalo de
  // almoço por padrão) — o usuário ajusta os horários exatos nos seletores.
  const last = day.blocks[day.blocks.length - 1]
  const suggestedStart = last ? new Date(last.endTime.getTime() + 60 * 60 * 1000) : defaultTime(13)
  day.blocks.push({ startTime: suggestedStart, endTime: defaultTime(18) })
}

function removeBlock(day: DayRow, index: number) {
  day.blocks.splice(index, 1)
  if (day.blocks.length === 0) day.enabled = false
}

function validate(): boolean {
  let valid = true
  for (const day of days) {
    day.error = ''
    if (!day.enabled) continue

    for (const block of day.blocks) {
      if (block.endTime <= block.startTime) {
        day.error = 'O horário final deve ser depois do inicial em todas as faixas.'
        valid = false
      }
    }

    const sorted = [...day.blocks].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i]!.startTime < sorted[i - 1]!.endTime) {
        day.error = 'As faixas desse dia não podem se sobrepor.'
        valid = false
      }
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
        .flatMap((d) =>
          d.blocks.map((block) => ({
            dayOfWeek: d.dayOfWeek,
            startTime: formatTime(block.startTime),
            endTime: formatTime(block.endTime),
          })),
        ),
    })
    toast.add({ severity: 'success', summary: 'Disponibilidade salva', life: 3000 })
  } catch (error) {
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

// --- Folgas pontuais (feriado, dia de folga, saída mais cedo numa data específica) ---
const timeOffs = ref<ArtistTimeOffDto[]>([])
const loadingTimeOff = ref(false)

const timeOffDialogVisible = ref(false)
const savingTimeOff = ref(false)
const timeOffError = ref('')

const timeOffForm = reactive({
  date: new Date(),
  fullDay: true,
  startTime: defaultTime(9),
  endTime: defaultTime(18),
  reason: '',
})

async function loadTimeOff(artistId: string) {
  loadingTimeOff.value = true
  try {
    const from = toDateKey(new Date())
    const to = toDateKey(addDays(new Date(), 120))
    timeOffs.value = await availabilityApi.listTimeOff(artistId, from, to)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erro ao carregar folgas',
      detail: (error as Error).message,
      life: 5000,
    })
  } finally {
    loadingTimeOff.value = false
  }
}

function openTimeOffDialog() {
  timeOffForm.date = new Date()
  timeOffForm.fullDay = true
  timeOffForm.startTime = defaultTime(9)
  timeOffForm.endTime = defaultTime(18)
  timeOffForm.reason = ''
  timeOffError.value = ''
  timeOffDialogVisible.value = true
}

async function submitTimeOff() {
  if (!selectedArtistId.value) return
  timeOffError.value = ''

  if (!timeOffForm.fullDay && timeOffForm.endTime <= timeOffForm.startTime) {
    timeOffError.value = 'O horário final deve ser depois do inicial.'
    return
  }

  savingTimeOff.value = true
  try {
    await availabilityApi.addTimeOff(selectedArtistId.value, {
      date: toDateKey(timeOffForm.date),
      startTime: timeOffForm.fullDay ? null : formatTime(timeOffForm.startTime),
      endTime: timeOffForm.fullDay ? null : formatTime(timeOffForm.endTime),
      reason: timeOffForm.reason.trim() || null,
    })
    toast.add({ severity: 'success', summary: 'Folga registrada', life: 3000 })
    timeOffDialogVisible.value = false
    await loadTimeOff(selectedArtistId.value)
  } catch (error) {
    timeOffError.value = (error as Error).message
  } finally {
    savingTimeOff.value = false
  }
}

function confirmRemoveTimeOff(timeOff: ArtistTimeOffDto) {
  confirm.require({
    message: `Remover a folga de ${formatTimeOffDate(timeOff.date)}?`,
    header: 'Remover folga',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Remover',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: () => removeTimeOff(timeOff),
  })
}

async function removeTimeOff(timeOff: ArtistTimeOffDto) {
  if (!selectedArtistId.value) return
  try {
    await availabilityApi.removeTimeOff(selectedArtistId.value, timeOff.id)
    toast.add({ severity: 'success', summary: 'Folga removida', life: 3000 })
    await loadTimeOff(selectedArtistId.value)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Não foi possível remover',
      detail: (error as Error).message,
      life: 5000,
    })
  }
}

function formatTimeOffDate(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  return formatDayOptionLabel(new Date(year!, month! - 1, day))
}

function formatTimeOffRange(timeOff: ArtistTimeOffDto): string {
  if (!timeOff.startTime || !timeOff.endTime) return 'Dia inteiro'
  return `${timeOff.startTime.slice(0, 5)} – ${timeOff.endTime.slice(0, 5)}`
}

watch(selectedArtistId, (artistId) => {
  if (!artistId) return
  loadWorkingHours(artistId)
  loadTimeOff(artistId)
})

onMounted(async () => {
  if (!auth.isAuthenticated.value) {
    router.push('/login')
    auth.logout()
    return
  }

  if (isOwner.value) {
    await loadStaff()
  }
  // O dono também é um usuário (potencialmente um artista) — assume-se que ele configura
  // a própria grade por padrão, podendo trocar no seletor acima.
  const decoded: any = jwtDecode(auth.token.value)
  selectedArtistId.value = decoded.sub as string
})
</script>

<template>
  <DashboardLayout>
    <div class="availability-settings">
      <div class="availability-settings__header">
        <h1>Disponibilidade</h1>
        <p>Grade semanal de horários, intervalos e folgas — usados para calcular os horários livres na agenda pública.</p>
      </div>

      <div v-if="isOwner" class="availability-settings__artist-picker">
        <label for="artist-picker">Artista</label>
        <Select
          id="artist-picker"
          v-model="selectedArtistId"
          :options="staffOptions"
          optionLabel="fullName"
          optionValue="id"
          placeholder="Selecione um artista"
        />
      </div>

      <template v-if="selectedArtistId">
        <section class="availability-settings__section">
          <h2>Horários de trabalho</h2>
          <p class="availability-settings__hint">
            Adicione mais de uma faixa no mesmo dia pra abrir um intervalo no meio (ex.: almoço).
          </p>

          <div class="availability-settings__days">
            <div v-for="day in days" :key="day.dayOfWeek" class="availability-day">
              <div class="availability-day__header">
                <ToggleSwitch v-model="day.enabled" @update:modelValue="(v) => onToggleDay(day, v as boolean)" />
                <span class="availability-day__label">{{ day.label }}</span>
              </div>

              <div v-if="day.enabled" class="availability-day__blocks">
                <div v-for="(block, index) in day.blocks" :key="index" class="availability-day__block">
                  <DatePicker v-model="block.startTime" timeOnly hourFormat="24" />
                  <span class="availability-day__block-sep">–</span>
                  <DatePicker v-model="block.endTime" timeOnly hourFormat="24" />
                  <Button
                    icon="pi pi-trash"
                    text
                    rounded
                    severity="danger"
                    aria-label="Remover faixa"
                    @click="removeBlock(day, index)"
                  />
                </div>

                <Button
                  label="Adicionar intervalo"
                  icon="pi pi-plus"
                  text
                  size="small"
                  class="availability-day__add"
                  @click="addBlock(day)"
                />

                <small v-if="day.error" class="availability-settings__error">{{ day.error }}</small>
              </div>
              <span v-else class="availability-day__off">Não trabalha</span>
            </div>
          </div>

          <div class="availability-settings__footer">
            <Button label="Salvar disponibilidade" :loading="saving" :disabled="loading" @click="save" />
          </div>
        </section>

        <section class="availability-settings__section">
          <div class="availability-settings__section-header">
            <h2>Folgas</h2>
            <Button label="Nova folga" icon="pi pi-plus" text size="small" @click="openTimeOffDialog" />
          </div>
          <p class="availability-settings__hint">
            Feriados, dias de folga ou saídas mais cedo numa data específica — sem afetar a grade semanal recorrente.
          </p>

          <p v-if="!loadingTimeOff && timeOffs.length === 0" class="availability-settings__empty">
            Nenhuma folga registrada nos próximos 120 dias.
          </p>

          <ul v-else class="availability-timeoff-list">
            <li v-for="timeOff in timeOffs" :key="timeOff.id" class="availability-timeoff-item">
              <div class="availability-timeoff-item__info">
                <span class="availability-timeoff-item__date">{{ formatTimeOffDate(timeOff.date) }}</span>
                <span class="availability-timeoff-item__range">{{ formatTimeOffRange(timeOff) }}</span>
                <span v-if="timeOff.reason" class="availability-timeoff-item__reason">{{ timeOff.reason }}</span>
              </div>
              <Button
                icon="pi pi-trash"
                text
                rounded
                severity="danger"
                aria-label="Remover folga"
                @click="confirmRemoveTimeOff(timeOff)"
              />
            </li>
          </ul>
        </section>
      </template>

      <Dialog v-model:visible="timeOffDialogVisible" modal header="Nova folga" :style="{ width: '24rem' }">
        <Message v-if="timeOffError" severity="error" :closable="false" class="availability-settings__dialog-error">
          {{ timeOffError }}
        </Message>

        <div class="availability-settings__field">
          <label for="timeoff-date">Data</label>
          <DatePicker id="timeoff-date" v-model="timeOffForm.date" dateFormat="dd/mm/yy" :minDate="new Date()" showIcon fluid />
        </div>

        <div class="availability-settings__field availability-settings__field--row">
          <ToggleSwitch v-model="timeOffForm.fullDay" inputId="timeoff-fullday" />
          <label for="timeoff-fullday">Dia inteiro</label>
        </div>

        <div v-if="!timeOffForm.fullDay" class="availability-settings__field-row">
          <div class="availability-settings__field">
            <label for="timeoff-start">Início</label>
            <DatePicker id="timeoff-start" v-model="timeOffForm.startTime" timeOnly hourFormat="24" />
          </div>
          <div class="availability-settings__field">
            <label for="timeoff-end">Fim</label>
            <DatePicker id="timeoff-end" v-model="timeOffForm.endTime" timeOnly hourFormat="24" />
          </div>
        </div>

        <div class="availability-settings__field">
          <label for="timeoff-reason">Motivo (opcional)</label>
          <InputText id="timeoff-reason" v-model="timeOffForm.reason" placeholder="Ex.: Feriado, consulta médica" fluid />
        </div>

        <template #footer>
          <Button label="Cancelar" text @click="timeOffDialogVisible = false" />
          <Button label="Salvar" :loading="savingTimeOff" @click="submitTimeOff" />
        </template>
      </Dialog>
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
  color: var(--p-text-muted-color, #6b7280);
}

.availability-settings__artist-picker {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  max-width: 20rem;
  margin-bottom: 2rem;
  color: var(--text-on-paper, #6b7280);
}

.availability-settings__section {
  margin-bottom: 2.5rem;
  max-width: 34rem;
}

.availability-settings__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.availability-settings__section h2 {
  font-size: 1.1rem;
  margin: 0 0 0.25rem;
  color: var(--text-on-paper);
}

.availability-settings__hint {
  margin: 0 0 1rem;
  font-size: 0.85rem;
  color: var(--p-text-muted-color, #6b7280);
}

.availability-settings__empty {
  color: var(--p-text-muted-color, #6b7280);
  font-size: 0.9rem;
}

.availability-settings__days {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.availability-day {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--p-surface-200, #e5e7eb);
}

.availability-day__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.availability-day__label {
  font-weight: 600;
  color: var(--text-on-paper);
}

.availability-day__off {
  display: block;
  margin-top: 0.4rem;
  font-size: 0.85rem;
  color: var(--p-text-muted-color, #6b7280);
}

.availability-day__blocks {
  margin-top: 0.6rem;
  margin-left: 3.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}

.availability-day__block {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.availability-day__block-sep {
  color: var(--p-text-muted-color, #6b7280);
}

.availability-day__add {
  padding-left: 0;
}

.availability-settings__error {
  color: var(--p-red-500, #ef4444);
}

.availability-settings__footer {
  margin-top: 1.5rem;
}

.availability-settings__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.availability-settings__field--row {
  flex-direction: row;
  align-items: center;
  gap: 0.6rem;
}

.availability-settings__field-row {
  display: flex;
  gap: 1rem;
}

.availability-settings__field-row .availability-settings__field {
  flex: 1;
}

.availability-settings__dialog-error {
  margin-bottom: 1rem;
}

.availability-timeoff-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.availability-timeoff-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--p-surface-200, #e5e7eb);
}

.availability-timeoff-item__info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.availability-timeoff-item__date {
  font-weight: 600;
  color: var(--text-on-paper);
}

.availability-timeoff-item__range {
  font-size: 0.85rem;
  color: var(--p-text-muted-color, #6b7280);
}

.availability-timeoff-item__reason {
  font-size: 0.8rem;
  color: var(--p-text-muted-color, #6b7280);
  font-style: italic;
}
</style>
