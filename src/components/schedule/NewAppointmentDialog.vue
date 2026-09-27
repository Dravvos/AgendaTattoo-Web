<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'

import Select from 'primevue/select'
import Button from 'primevue/button'
import Message from 'primevue/message'
import type { Artist } from '../../types/schedule'
import type { ScheduleActionResult } from '../../composables/useSchedule'
import { formatDayOptionLabel, toDateKey } from '../../utils/date'
import type { ClientDto, ServiceDto } from '@/types/settings'
import { Label } from 'primevue'

export interface NewAppointmentPayload {
  artistId: string
  clientId: string
  serviceId: string
  dayKey: string
  startsAt: string
}

const props = defineProps<{
  artists: Artist[]
  weekDays: Date[]
  clients: ClientDto[]
  services: ServiceDto[]
  /** Preenche o formulário quando o diálogo é aberto a partir de um clique na grade. */
  prefill: { day: Date; hour: number } | null
  /** Faz a chamada à API e devolve o resultado — o diálogo só fecha sozinho em caso de sucesso. */
  onSubmit: (payload: NewAppointmentPayload) => Promise<ScheduleActionResult>
}>()

const visible = defineModel<boolean>('visible', { required: true })

interface FormState {
  clientId: string,
  artistId: string,
  serviceId: string,
  dayKey: string
  startsAt: string
}

function emptyForm(): FormState {
  return {
    clientId: '',
    artistId: '',
    serviceId: '',
    dayKey: '',
    startsAt: '',
  }
}

const form = reactive<FormState>(emptyForm())

const errors = reactive({
  clientId: '',
  artistId: '',
  serviceId: '',
  dayKey: '',
  startsAt: '',
})

const submitting = ref(false)
const generalError = ref('')

const dayOptions = computed(() =>
  props.weekDays.map((day) => ({
    label: formatDayOptionLabel(day),
    value: toDateKey(day),
  })),
)

const timeOptions = computed(() => {
  const options: { label: string; value: string }[] = []
  for (let hour = 9; hour <= 19; hour += 1) {
    for (const minute of [0, 30]) {
      const label = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      options.push({ label, value: label })
    }
  }
  return options
})

const durationOptions = [
  { label: '1h', value: 1 },
  { label: '1h30', value: 1.5 },
  { label: '2h', value: 2 },
  { label: '3h', value: 3 },
  { label: '4h', value: 4 },
  { label: '6h', value: 6 },
  { label: 'Dia inteiro (8h)', value: 8 },
]

// Pré-preenche dia/horário quando o diálogo é aberto a partir de um clique na grade,
// e limpa o formulário e os erros de uma submissão anterior.
watch(
  () => [visible.value, props.prefill] as const,
  ([isVisible, prefill]) => {
    if (!isVisible) return
    Object.assign(form, emptyForm())
    Object.assign(errors, { clientName: '', artistId: '', service: '', dayKey: '', startTime: '' })
    generalError.value = ''
    if (prefill) {
      form.dayKey = toDateKey(prefill.day)
      form.startsAt = `${String(prefill.hour).padStart(2, '0')}:00`
    }
  },
)

function validate(): boolean {
  errors.clientId = form.clientId.trim() ? '' : 'Selecione o cliente.'
  errors.artistId = form.artistId ? '' : 'Escolha o tatuador.'
  errors.serviceId = form.serviceId.trim() ? '' : 'Escolha o serviço.'
  errors.dayKey = form.dayKey ? '' : 'Escolha o dia.'
  errors.startsAt = form.startsAt ? '' : 'Escolha o horário.'
  return !Object.values(errors).some(Boolean)
}

const FIELD_ERROR_MAP: Record<string, keyof typeof errors> = {
  clientid: 'clientId',
  artistid: 'artistId',
  serviceid: 'serviceId',
}

async function handleSubmit(): Promise<void> {
  generalError.value = ''
  if (!validate()) return

  submitting.value = true
  try {
    debugger;
    let start = new Date(form.dayKey).setHours(parseInt(form.startsAt.substring(0, 2)))
    const result = await props.onSubmit({
      artistId: form.artistId,
      clientId: form.clientId.trim(),
      serviceId: form.serviceId,
      dayKey: form.dayKey,
      startsAt: new Date(start).toISOString(),
    })

    if (result.success) {
      visible.value = false
      return
    }

    generalError.value = result.message
    if (result.fieldErrors) {
      for (const [key, message] of Object.entries(result.fieldErrors)) {
        const target = FIELD_ERROR_MAP[key]
        if (target) errors[target] = message
      }
    }
  } finally {
    submitting.value = false
  }
}

function formatMinutes(totalMinutes: number | null | undefined): string {
  if (totalMinutes == null || totalMinutes == undefined)
    return '0';

  const totalSeconds = Math.round(totalMinutes * 60);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => String(num).padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

</script>

<template>
  <Dialog v-model:visible="visible" modal header="Novo agendamento" :style="{ width: '420px' }">
    <Message v-if="generalError" severity="error" :closable="false" class="dialog-message">
      {{ generalError }}
    </Message>

    <form class="new-appointment-form" novalidate @submit.prevent="handleSubmit">
      <div class="field">
        <label for="client">Cliente</label>
        <Select id="client" :options="clients" optionLabel="fullName" optionValue="id" v-model="form.clientId"
          placeholder="Selecione" :invalid="!!errors.clientId" fluid />
        <small v-if="errors.clientId" class="field__error">{{ errors.clientId }}</small>
      </div>

      <div class="field">
        <label for="artist">Tatuador</label>
        <Select id="artist" v-model="form.artistId" :options="artists" optionLabel="name" optionValue="id"
          placeholder="Selecione" :invalid="!!errors.artistId" fluid />
        <small v-if="errors.artistId" class="field__error">{{ errors.artistId }}</small>
      </div>

      <div class="field">
        <label for="service">Serviço</label>
        <Select id="service" v-model="form.serviceId" :options="services" placeholder="Selecione"
          :invalid="!!errors.serviceId" fluid optionLabel="nameDescription" optionValue="id" />
        <small v-if="errors.serviceId" class="field__error">{{ errors.serviceId }}</small>
      </div>

      <div class="field-row">
        <div class="field">
          <label for="day">Dia</label>
          <Select id="day" v-model="form.dayKey" :options="dayOptions" optionLabel="label" optionValue="value"
            placeholder="Selecione" :invalid="!!errors.dayKey" fluid />
          <small v-if="errors.dayKey" class="field__error">{{ errors.dayKey }}</small>
        </div>

        <div class="field">
          <label for="start-time">Início</label>
          <Select id="start-time" v-model="form.startsAt" :options="timeOptions" optionLabel="label" optionValue="value"
            placeholder="Horário" :invalid="!!errors.startsAt" fluid />
          <small v-if="errors.startsAt" class="field__error">{{ errors.startsAt }}</small>
        </div>
      </div>

      <div class="field">
        <label for="duration">Duração</label>
        <Label>{{formatMinutes(services.find(x => x.id == form.serviceId)?.durationMinutes)}}</Label>
      </div>
    </form>

    <template #footer>
      <Button label="Cancelar" text :disabled="submitting" @click="visible = false" />
      <Button label="Salvar agendamento" :loading="submitting" @click="handleSubmit" />
    </template>
  </Dialog>
</template>

<style scoped>
.new-appointment-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.dialog-message {
  margin-bottom: 16px;
}
</style>
