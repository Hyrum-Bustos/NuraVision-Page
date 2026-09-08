import type { DayStatus, SlotStatus } from '../types'
import { toISODate } from './format'

function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function seededRandom(seed: string): number {
  const h = hashString(seed)
  return (h % 10000) / 10000
}

const CLOSED_WEEKDAYS = new Set([0, 1]) // domingo y lunes cerrado ("Mar a Sáb")

export function getMonthDays(year: number, month: number): DayStatus[] {
  const days: DayStatus[] = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateISO = toISODate(date)
    const weekday = date.getDay()

    let status: DayStatus['status']
    if (CLOSED_WEEKDAYS.has(weekday)) {
      status = 'cerrado'
    } else {
      status = seededRandom(`day-${dateISO}`) < 0.14 ? 'sin_cupos' : 'con_cupos'
    }

    days.push({ dateISO, day, status })
  }

  return days
}

const OPERATING_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
]

const OUT_OF_HOURS = new Set(['09:00', '09:30', '19:00'])
export const LUNCH_BREAK = new Set(['13:00', '13:30'])

export interface Slot {
  time: string
  status: SlotStatus
}

export function getSlotsForDate(dateISO: string, professionalId: string): Slot[] {
  return OPERATING_SLOTS.map((time) => {
    let status: SlotStatus

    if (OUT_OF_HOURS.has(time)) {
      status = 'fuera_horario'
    } else if (LUNCH_BREAK.has(time)) {
      status = 'bloqueado'
    } else {
      const roll = seededRandom(`slot-${dateISO}-${professionalId}-${time}`)
      if (roll < 0.55) status = 'disponible'
      else if (roll < 0.85) status = 'reservado'
      else status = 'bloqueado'
    }

    return { time, status }
  })
}

export function getUpcomingFreeSlots(professionalId: string, dateISO: string, limit = 4): string[] {
  return getSlotsForDate(dateISO, professionalId)
    .filter((s) => s.status === 'disponible')
    .slice(0, limit)
    .map((s) => s.time)
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export interface ScheduleBlock {
  start: string
  end: string
  minutes: number
  type: 'libre' | 'colacion' | 'bloqueado'
}

export function getScheduleBlocks(dateISO: string, professionalId: string): ScheduleBlock[] {
  const slots = getSlotsForDate(dateISO, professionalId).filter((s) => s.status !== 'fuera_horario')
  const blocks: ScheduleBlock[] = []

  let i = 0
  while (i < slots.length) {
    const slot = slots[i]
    if (slot.status === 'reservado') {
      i++
      continue
    }
    const type: ScheduleBlock['type'] = LUNCH_BREAK.has(slot.time)
      ? 'colacion'
      : slot.status === 'bloqueado'
        ? 'bloqueado'
        : 'libre'

    let j = i
    while (
      j < slots.length &&
      slots[j].status !== 'reservado' &&
      (LUNCH_BREAK.has(slots[j].time) ? 'colacion' : slots[j].status === 'bloqueado' ? 'bloqueado' : 'libre') ===
        type
    ) {
      j++
    }

    const start = slots[i].time
    const end = minutesToTime(timeToMinutes(slots[j - 1].time) + 30)
    blocks.push({ start, end, minutes: timeToMinutes(end) - timeToMinutes(start), type })
    i = j
  }

  return blocks
}
