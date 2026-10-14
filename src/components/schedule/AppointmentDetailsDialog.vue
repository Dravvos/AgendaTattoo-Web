<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Message from 'primevue/message'
import type { Appointment, Artist } from '../../types/schedule'
import { APPOINTMENT_STATUS_LABEL } from '../../types/schedule'
import type { ScheduleActionResult } from '../../composables/useSchedule'
import { formatDayOptionLabel, formatTimeRange } from '../../utils/date'

import { anamnesisApi } from '@/api/anamnesisApi'
import type { AnamnesisFormDto } from '@/types/anamnesis'

const anamnesis = ref<AnamnesisFormDto | null>(null)
const anamnesisLoading = ref(false)
const visible = defineModel<boolean>('visible', { required: true })

watch(visible, async (isVisible) => {
  if (!isVisible) return
  cancelError.value = ''
  anamnesis.value = null
  if (!props.appointment) return
  anamnesisLoading.value = true
  try {
    anamnesis.value = await anamnesisApi.getForAppointment(props.appointment.id)
  } finally {
    anamnesisLoading.value = false
  }
})

const props = defineProps<{
  appointment: Appointment | null
  artist: Artist | undefined
  /** Faz a chamada à API e devolve o resultado — o diálogo só fecha em caso de sucesso. */
  onCancel: (appointment: Appointment) => Promise<ScheduleActionResult>
}>()


const cancelling = ref(false)
const cancelError = ref('')


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
      <div class="details__row" v-if="!anamnesisLoading">
  <span class="details__label">Ficha de anamnese</span>
  <span v-if="anamnesis" class="details__value">Enviada — assinada por {{ anamnesis.signatureFullName }}</span>
  <span v-else class="details__value">Ainda não enviada pelo cliente</span>
</div>
<div v-if="anamnesis?.hasAllergies || anamnesis?.hasSkinConditions || anamnesis?.hadPreviousTattooReaction"
  class="details__row">
  <span class="details__label">Alertas de saúde</span>
  <span class="details__value">
    <span v-if="anamnesis.hasAllergies">Alergias: {{ anamnesis.allergiesDescription || 'não especificado' }}. </span>
    <span v-if="anamnesis.hasSkinConditions">Pele: {{ anamnesis.skinConditionsDescription || 'não especificado' }}. </span>
    <span v-if="anamnesis.hadPreviousTattooReaction">
      Reação anterior: {{ anamnesis.previousTattooReactionDescription || 'não especificado' }}.
    </span>
  </span>
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
