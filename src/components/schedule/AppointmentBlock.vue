<script setup lang="ts">
import type { Appointment, Artist } from '../../types/schedule'
import { APPOINTMENT_STATUS_LABEL } from '../../types/schedule'
import { formatTimeRange } from '../../utils/date'

const props = defineProps<{
  appointment: Appointment
  artist: Artist | undefined
  top: number
  height: number
}>()

defineEmits<{
  select: [appointment: Appointment]
}>()

const isCancelled = props.appointment.status === 'cancelado'
</script>

<template>
  <button
    type="button"
    class="appointment-block"
    :class="{ 'appointment-block--cancelled': isCancelled }"
    :style="{
      top: `${top}px`,
      height: `${height}px`,
      '--block-color': `var(${artist?.colorVar ?? '--artist-1'})`,
    }"
    @click.stop="$emit('select', appointment)"
  >
    <span class="appointment-block__client">{{ appointment.clientName }}</span>
    <span class="appointment-block__time">{{ formatTimeRange(appointment.start, appointment.end) }}</span>
    <span class="appointment-block__status">{{ APPOINTMENT_STATUS_LABEL[appointment.status] }}</span>
  </button>
</template>

<style scoped>
.appointment-block {
  position: absolute;
  left: 4px;
  right: 4px;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: 1px;
  text-align: left;
  padding: 5px 8px;
  border: none;
  border-left: 3px solid var(--block-color);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  background: color-mix(in srgb, var(--block-color) 16%, var(--paper-100));
  color: var(--text-on-paper);
  cursor: pointer;
  overflow: hidden;
  font-family: var(--font-body);
}

.appointment-block:hover {
  background: color-mix(in srgb, var(--block-color) 26%, var(--paper-100));
}

.appointment-block__client {
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.appointment-block__time {
  font-size: 11px;
  color: var(--text-on-paper-muted);
}

.appointment-block__status {
  font-size: 10.5px;
  color: color-mix(in srgb, var(--block-color) 70%, var(--text-on-paper));
  font-weight: 500;
}

.appointment-block--cancelled {
  opacity: 0.55;
}

.appointment-block--cancelled .appointment-block__client {
  text-decoration: line-through;
}
</style>
