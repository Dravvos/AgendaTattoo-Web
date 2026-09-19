<script setup lang="ts">
import { computed } from 'vue'
import type { Appointment, Artist } from '../../types/schedule'
import AppointmentBlock from './AppointmentBlock.vue'
import { diffInHours, formatDayNumber, formatWeekdayShort, isSameDay } from '../../utils/date'

const props = defineProps<{
  days: Date[]
  hours: number[]
  appointments: Appointment[]
  artists: Artist[]
}>()

const emit = defineEmits<{
  selectAppointment: [appointment: Appointment]
  createAppointment: [payload: { day: Date; hour: number }]
}>()

const ROW_HEIGHT = 64
const today = new Date()

function artistById(id: string): Artist | undefined {
  return props.artists.find((artist) => artist.id === id)
}

function appointmentsForDay(day: Date): Appointment[] {
  return props.appointments.filter((appointment) => isSameDay(appointment.start, day))
}

function blockTop(appointment: Appointment, day: Date): number {
  const dayStart = new Date(day)
  dayStart.setHours(props.hours[0] ?? 0, 0, 0, 0)
  return Math.max(0, diffInHours(dayStart, appointment.start)) * ROW_HEIGHT
}

function blockHeight(appointment: Appointment): number {
  return Math.max(diffInHours(appointment.start, appointment.end), 0.5) * ROW_HEIGHT
}

const gridHeight = computed(() => props.hours.length * ROW_HEIGHT)
</script>

<template>
  <div class="week-grid">
    <div class="week-grid__header">
      <div class="week-grid__gutter-header" />
      <div
        v-for="day in days"
        :key="day.toISOString()"
        class="week-grid__day-header"
        :class="{ 'week-grid__day-header--today': isSameDay(day, today) }"
      >
        <span class="week-grid__weekday">{{ formatWeekdayShort(day) }}</span>
        <span class="week-grid__day-number">{{ formatDayNumber(day) }}</span>
      </div>
    </div>

    <div class="week-grid__body" :style="{ height: `${gridHeight}px` }">
      <div class="week-grid__gutter">
        <div v-for="hour in hours" :key="hour" class="week-grid__hour-label" :style="{ height: `${ROW_HEIGHT}px` }">
          {{ String(hour).padStart(2, '0') }}:00
        </div>
      </div>

      <div
        v-for="day in days"
        :key="day.toISOString()"
        class="week-grid__day-column"
        :class="{ 'week-grid__day-column--today': isSameDay(day, today) }"
      >
        <div class="week-grid__slots">
          <button
            v-for="hour in hours"
            :key="hour"
            type="button"
            class="week-grid__slot"
            :style="{ height: `${ROW_HEIGHT}px` }"
            :aria-label="`Criar agendamento às ${hour}:00`"
            @click="emit('createAppointment', { day, hour })"
          />
        </div>

        <div class="week-grid__events">
          <AppointmentBlock
            v-for="appointment in appointmentsForDay(day)"
            :key="appointment.id"
            :appointment="appointment"
            :artist="artistById(appointment.artistId)"
            :top="blockTop(appointment, day)"
            :height="blockHeight(appointment)"
            @select="emit('selectAppointment', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.week-grid {
  border: 1px solid var(--line-on-paper);
  background: var(--paper-100);
  overflow-x: auto;
}

.week-grid__header {
  display: grid;
  grid-template-columns: 56px repeat(6, minmax(120px, 1fr));
  border-bottom: 1px solid var(--line-on-paper);
  position: sticky;
  top: 0;
  background: var(--paper-100);
  z-index: 2;
}

.week-grid__gutter-header {
  border-right: 1px solid var(--line-on-paper);
}

.week-grid__day-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 4px;
  border-left: 1px solid var(--line-on-paper);
}

.week-grid__weekday {
  font-size: 11px;
  color: var(--text-on-paper-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.week-grid__day-number {
  font-family: var(--font-display);
  font-size: 20px;
  color: var(--text-on-paper);
}

.week-grid__day-header--today .week-grid__day-number {
  color: var(--brass-600);
}

.week-grid__body {
  display: grid;
  grid-template-columns: 56px repeat(6, minmax(120px, 1fr));
}

.week-grid__gutter {
  border-right: 1px solid var(--line-on-paper);
}

.week-grid__hour-label {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 2px 8px 0 0;
  font-size: 11px;
  color: var(--text-on-paper-muted);
  transform: translateY(-6px);
}

.week-grid__day-column {
  position: relative;
}

.week-grid__day-column--today {
  background: color-mix(in srgb, var(--brass-300) 6%, transparent);
}

.week-grid__slots {
  display: flex;
  flex-direction: column;
}

.week-grid__slot {
  width: 100%;
  border: none;
  border-bottom: 1px solid var(--line-on-paper);
  border-left: 1px solid var(--line-on-paper);
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.week-grid__slot:hover {
  background: color-mix(in srgb, var(--brass-300) 14%, transparent);
}

.week-grid__events {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
</style>
