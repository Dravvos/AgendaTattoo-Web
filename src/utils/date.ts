/** Segunda-feira 00:00 da semana que contém `date`. */
export function startOfWeek(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay() // 0 = domingo, 1 = segunda, ...
  const diffToMonday = day === 0 ? -6 : 1 - day
  result.setDate(result.getDate() + diffToMonday)
  result.setHours(0, 0, 0, 0)
  return result
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Ex.: "seg", "ter" — sem ponto, primeira letra maiúscula. */
export function formatWeekdayShort(date: Date): string {
  const label = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date)
  const clean = label.replace('.', '')
  return clean.charAt(0).toUpperCase() + clean.slice(1)
}

export function formatDayNumber(date: Date): string {
  return String(date.getDate()).padStart(2, '0')
}

/** Ex.: "15 – 20 de set. de 2026". */
export function formatWeekRangeLabel(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 5)
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth()
  const monthYear = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(
    weekEnd,
  )
  if (sameMonth) {
    return `${formatDayNumber(weekStart)} – ${formatDayNumber(weekEnd)} de ${monthYear}`
  }
  const startMonth = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(weekStart)
  return `${formatDayNumber(weekStart)} de ${startMonth} – ${formatDayNumber(weekEnd)} de ${monthYear}`
}

export function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`
}

export function formatTimeRange(start: Date, end: Date): string {
  const fmt = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return `${fmt(start)} – ${fmt(end)}`
}

/** Diferença entre duas datas, em horas fracionadas (ex.: 1h30 → 1.5). */
export function diffInHours(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
}

/** Ex.: "Segunda-feira, 15/09" — usado nas opções do formulário de novo agendamento. */
export function formatDayOptionLabel(date: Date): string {
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date)
  const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  const day = formatDayNumber(date)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${capitalized}, ${day}/${month}`
}

/** ISO local (YYYY-MM-DD) só com a data, sem depender do fuso do `toISOString`. */
export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
