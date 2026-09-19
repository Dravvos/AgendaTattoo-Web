<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import type { Appointment, Artist } from '../../types/schedule'
import { APPOINTMENT_STATUS_LABEL } from '../../types/schedule'
import { formatDayOptionLabel, formatTimeRange } from '../../utils/date'

const props = defineProps<{
  appointment: Appointment | null
  artist: Artist | undefined
}>()

const emit = defineEmits<{
  cancelAppointment: [appointment: Appointment]
}>()

const visible = defineModel<boolean>('visible', { required: true })

function handleCancel(): void {
  if (props.appointment) emit('cancelAppointment', props.appointment)
  visible.value = false
}
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Detalhes do agendamento" :style="{ width: '380px' }">
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
      <Button label="Fechar" text @click="visible = false" />
      <Button
        v-if="appointment && appointment.status !== 'cancelado' && appointment.status !== 'concluido'"
        label="Cancelar agendamento"
        severity="danger"
        text
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
</style>
