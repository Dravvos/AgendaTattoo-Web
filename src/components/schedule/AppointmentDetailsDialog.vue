<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Message from 'primevue/message'
import type { Appointment, Artist } from '../../types/schedule'
import { APPOINTMENT_STATUS_LABEL } from '../../types/schedule'
import type { ScheduleActionResult } from '../../composables/useSchedule'
import { formatDayOptionLabel, formatTimeRange } from '../../utils/date'

const props = defineProps<{
  appointment: Appointment | null
  artist: Artist | undefined
  /** Faz a chamada à API e devolve o resultado — o diálogo só fecha em caso de sucesso. */
  onCancel: (appointment: Appointment) => Promise<ScheduleActionResult>
}>()

const visible = defineModel<boolean>('visible', { required: true })

const cancelling = ref(false)
const cancelError = ref('')

watch(visible, (isVisible) => {
  if (isVisible) cancelError.value = ''
})

async function handleCancel(): Promise<void> {
  if (!props.appointment) return
  cancelling.value = true
  cancelError.value = ''
  try {
    const result = await props.onCancel(props.appointment)
    if (result.success) {
      visible.value = false
    } else {
      cancelError.value = result.message
    }
  } finally {
    cancelling.value = false
  }
}
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Detalhes do agendamento" :style="{ width: '380px' }">
    <Message v-if="cancelError" severity="error" :closable="false" class="dialog-message">
      {{ cancelError }}
    </Message>

    <div v-if="appointment" class="details">
      <div class="details__row">
        <span class="details__label">Cliente</span>
        <span class="details__value">{{ appointment.clientName }}</span>
      </div>
      <div class="details__row">
        <span class="details__label">Serviço</span>
        <span class="details__value">{{ appointment.service }}</span>
      </div>
      <div class="details__row">
        <span class="details__label">Tatuador</span>
        <span class="details__value">{{ artist?.name ?? 'Não definido' }}</span>
      </div>
      <div class="details__row">
        <span class="details__label">Quando</span>
        <span class="details__value">
          {{ formatDayOptionLabel(appointment.start) }} · {{ formatTimeRange(appointment.start, appointment.end) }}
        </span>
      </div>
      <div class="details__row">
        <span class="details__label">Status</span>
        <span class="details__value">{{ APPOINTMENT_STATUS_LABEL[appointment.status] }}</span>
      </div>
    </div>

    <template #footer>
      <Button label="Fechar" text :disabled="cancelling" @click="visible = false" />
      <Button
        v-if="appointment && appointment.status !== 'cancelado' && appointment.status !== 'concluido'"
        label="Cancelar agendamento"
        severity="danger"
        text
        :loading="cancelling"
        @click="handleCancel"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.details {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.details__row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.details__label {
  font-size: 12px;
  color: var(--text-on-paper-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.details__value {
  font-size: 15px;
  color: var(--text-on-paper);
}

.dialog-message {
  margin-bottom: 16px;
}
</style>
