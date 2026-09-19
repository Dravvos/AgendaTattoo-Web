<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import type { Artist } from '../../types/schedule'
import { formatDayOptionLabel, toDateKey } from '../../utils/date'

const props = defineProps<{
  artists: Artist[]
  weekDays: Date[]
  /** Preenche o formulário quando o diálogo é aberto a partir de um clique na grade. */
  prefill: { day: Date; hour: number } | null
}>()

const emit = defineEmits<{
  submit: [payload: {
    artistId: string
    clientName: string
    service: string
    dayKey: string
    startTime: string
    durationHours: number
  }]
}>()

const visible = defineModel<boolean>('visible', { required: true })

interface FormState {
  clientName: string
  artistId: string
  service: string
  dayKey: string
  startTime: string
  durationHours: number
}

function emptyForm(): FormState {
  return {
    clientName: '',
    artistId: '',
    service: '',
    dayKey: '',
    startTime: '',
    durationHours: 1,
  }
}

const form = reactive<FormState>(emptyForm())

const errors = reactive({
  clientName: '',
  artistId: '',
  service: '',
  dayKey: '',
  startTime: '',
})

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

// Pré-preenche dia/horário quando o diálogo é aberto a partir de um clique na grade.
watch(
  () => [visible.value, props.prefill] as const,
  ([isVisible, prefill]) => {
    if (!isVisible) return
    Object.assign(form, emptyForm())
    Object.assign(errors, { clientName: '', artistId: '', service: '', dayKey: '', startTime: '' })
    if (prefill) {
      form.dayKey = toDateKey(prefill.day)
      form.startTime = `${String(prefill.hour).padStart(2, '0')}:00`
    }
  },
)

function validate(): boolean {
  errors.clientName = form.clientName.trim() ? '' : 'Informe o nome do cliente.'
  errors.artistId = form.artistId ? '' : 'Escolha o tatuador.'
  errors.service = form.service.trim() ? '' : 'Descreva o serviço.'
  errors.dayKey = form.dayKey ? '' : 'Escolha o dia.'
  errors.startTime = form.startTime ? '' : 'Escolha o horário.'
  return !Object.values(errors).some(Boolean)
}

function handleSubmit(): void {
  if (!validate()) return

  emit('submit', {
    artistId: form.artistId,
    clientName: form.clientName.trim(),
    service: form.service.trim(),
    dayKey: form.dayKey,
    startTime: form.startTime,
    durationHours: form.durationHours,
  })
  visible.value = false
}
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Novo agendamento" :style="{ width: '420px' }">
    <form class="new-appointment-form" novalidate @submit.prevent="handleSubmit">
      <div class="field">
        <label for="client-name">Cliente</label>
        <InputText
          id="client-name"
          v-model="form.clientName"
          placeholder="Nome do cliente"
          :invalid="!!errors.clientName"
          fluid
        />
        <small v-if="errors.clientName" class="field__error">{{ errors.clientName }}</small>
      </div>

      <div class="field">
        <label for="artist">Tatuador</label>
        <Select
          id="artist"
          v-model="form.artistId"
          :options="artists"
          optionLabel="name"
          optionValue="id"
          placeholder="Selecione"
          :invalid="!!errors.artistId"
          fluid
        />
        <small v-if="errors.artistId" class="field__error">{{ errors.artistId }}</small>
      </div>

      <div class="field">
        <label for="service">Serviço</label>
        <InputText
          id="service"
          v-model="form.service"
          placeholder="Ex.: Fechamento de braço — blackwork"
          :invalid="!!errors.service"
          fluid
        />
        <small v-if="errors.service" class="field__error">{{ errors.service }}</small>
      </div>

      <div class="field-row">
        <div class="field">
          <label for="day">Dia</label>
          <Select
            id="day"
            v-model="form.dayKey"
            :options="dayOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecione"
            :invalid="!!errors.dayKey"
            fluid
          />
          <small v-if="errors.dayKey" class="field__error">{{ errors.dayKey }}</small>
        </div>

        <div class="field">
          <label for="start-time">Início</label>
          <Select
            id="start-time"
            v-model="form.startTime"
            :options="timeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Horário"
            :invalid="!!errors.startTime"
            fluid
          />
          <small v-if="errors.startTime" class="field__error">{{ errors.startTime }}</small>
        </div>
      </div>

      <div class="field">
        <label for="duration">Duração</label>
        <Select
          id="duration"
          v-model="form.durationHours"
          :options="durationOptions"
          optionLabel="label"
          optionValue="value"
          fluid
        />
      </div>
    </form>

    <template #footer>
      <Button label="Cancelar" text @click="visible = false" />
      <Button label="Salvar agendamento" @click="handleSubmit" />
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
</style>
