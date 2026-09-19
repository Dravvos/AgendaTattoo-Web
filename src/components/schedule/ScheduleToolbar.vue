<script setup lang="ts">
import Button from 'primevue/button'
import type { Artist } from '../../types/schedule'
import { formatWeekRangeLabel } from '../../utils/date'

const props = defineProps<{
  weekStart: Date
  artists: Artist[]
}>()

const selectedArtistId = defineModel<string>('selectedArtistId', { required: true })

defineEmits<{
  prevWeek: []
  nextWeek: []
  today: []
  create: []
}>()

const weekLabel = () => formatWeekRangeLabel(props.weekStart)
</script>

<template>
  <div class="toolbar">
    <div class="toolbar__week">
      <button type="button" class="toolbar__nav-btn" aria-label="Semana anterior" @click="$emit('prevWeek')">
        ‹
      </button>
      <div class="toolbar__week-label">
        <span>{{ weekLabel() }}</span>
        <button type="button" class="toolbar__today-btn" @click="$emit('today')">Hoje</button>
      </div>
      <button type="button" class="toolbar__nav-btn" aria-label="Próxima semana" @click="$emit('nextWeek')">
        ›
      </button>
    </div>

    <div class="toolbar__filters">
      <button
        type="button"
        class="toolbar__pill"
        :class="{ 'toolbar__pill--active': selectedArtistId === 'all' }"
        @click="selectedArtistId = 'all'"
      >
        Todos
      </button>
      <button
        v-for="artist in artists"
        :key="artist.id"
        type="button"
        class="toolbar__pill"
        :class="{ 'toolbar__pill--active': selectedArtistId === artist.id }"
        :style="{ '--pill-color': `var(${artist.colorVar})` }"
        @click="selectedArtistId = artist.id"
      >
        <span class="toolbar__pill-dot" />
        {{ artist.name }}
      </button>
    </div>

    <Button label="Novo agendamento" size="small" @click="$emit('create')" />
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.toolbar__week {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar__nav-btn {
  width: 30px;
  height: 30px;
  border: 1px solid var(--line-on-paper);
  background: transparent;
  color: var(--text-on-paper);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.toolbar__nav-btn:hover {
  border-color: var(--brass-400);
  color: var(--brass-300);
}

.toolbar__week-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-on-paper);
  min-width: 190px;
  justify-content: center;
}

.toolbar__today-btn {
  border: 1px solid var(--line-on-paper);
  background: transparent;
  color: var(--text-on-paper-muted);
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 12px;
  cursor: pointer;
}

.toolbar__today-btn:hover {
  color: var(--text-on-paper);
  border-color: var(--brass-400);
}

.toolbar__filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.toolbar__pill {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--line-on-paper);
  background: transparent;
  color: var(--text-on-paper-muted);
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 13px;
  cursor: pointer;
}

.toolbar__pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--pill-color, currentColor);
}

.toolbar__pill:hover {
  color: var(--text-on-paper);
}

.toolbar__pill--active {
  border-color: var(--brass-400);
  color: var(--text-on-paper);
  background: var(--paper-300);
}
</style>
