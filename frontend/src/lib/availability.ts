import type {
  AvailabilityBreak,
  Booking,
  DayStatus,
  Professional,
  SlotStatus,
  Weekday,
} from '../types'
import { TODAY_ISO } from '../data/seed'
import { parseISODate, toISODate, WEEKDAYS_SHORT } from './format'

const STEP_MIN = 30

export interface Slot {
  time: string
  status: SlotStatus
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Ocupación simulada: representa las reservas de otros clientes que no están
 * en los datos de ejemplo. Es determinista, así que la agenda se ve igual
 * cada vez que se abre la misma fecha.
 */
function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function seededRandom(seed: string): number {
  return (hashString(seed) % 10000) / 10000
}

function isWithinBreak(minutes: number, breaks: AvailabilityBreak[]): AvailabilityBreak | undefined {
  return breaks.find((b) => minutes >= timeToMinutes(b.start) && minutes < timeToMinutes(b.end))
}

function bookingCovering(
  minutes: number,
  dateISO: string,
  professionalId: string,
  bookings: Booking[],
): Booking | undefined {
  return bookings.find((b) => {
    if (b.professionalId !== professionalId || b.dateISO !== dateISO) return false
    if (b.status === 'cancelada') return false
    const start = timeToMinutes(b.time)
    return minutes >= start && minutes < start + b.durationMin
  })
}

export function getDayAvailability(professional: Professional, dateISO: string) {
  const weekday = parseISODate(dateISO).getDay() as Weekday
  return professional.availability[weekday]
}

/**
 * Bloques de 30 minutos de un día. Incluye una franja previa y el borde final
 * como "fuera de horario", igual que en el diseño.
 * Devuelve [] si el profesional no atiende ese día.
 */
export function getSlotsForDate(
  dateISO: string,
  professional: Professional,
  bookings: Booking[],
): Slot[] {
  const day = getDayAvailability(professional, dateISO)
  if (!day?.enabled) return []

  const start = timeToMinutes(day.start)
  const end = timeToMinutes(day.end)
  if (end <= start) return []

  const displayStart = Math.max(0, start - 60)
  const slots: Slot[] = []

  for (let minutes = displayStart; minutes <= end; minutes += STEP_MIN) {
    const time = minutesToTime(minutes)
    let status: SlotStatus

    if (minutes < start || minutes >= end) {
      status = 'fuera_horario'
    } else if (isWithinBreak(minutes, day.breaks)) {
      status = 'bloqueado'
    } else if (bookingCovering(minutes, dateISO, professional.id, bookings)) {
      status = 'reservado'
    } else {
      const roll = seededRandom(`slot-${dateISO}-${professional.id}-${time}`)
      status = roll < 0.14 ? 'reservado' : roll < 0.19 ? 'bloqueado' : 'disponible'
    }

    slots.push({ time, status })
  }

  return slots
}

export function getMonthDays(
  year: number,
  month: number,
  professional: Professional,
  bookings: Booking[],
): DayStatus[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: DayStatus[] = []

  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
    const dateISO = toISODate(new Date(year, month, dayNumber))
    const slots = getSlotsForDate(dateISO, professional, bookings)

    let status: DayStatus['status']
    if (slots.length === 0) status = 'cerrado'
    else if (slots.some((s) => s.status === 'disponible')) status = 'con_cupos'
    else status = 'sin_cupos'

    days.push({ dateISO, day: dayNumber, status })
  }

  return days
}

export interface ScheduleBlock {
  start: string
  end: string
  minutes: number
  type: 'libre' | 'bloqueado'
  label: string
}

/** Agrupa los tramos libres y bloqueados de un día (para el panel del profesional). */
export function getScheduleBlocks(
  dateISO: string,
  professional: Professional,
  bookings: Booking[],
): ScheduleBlock[] {
  const day = getDayAvailability(professional, dateISO)
  if (!day?.enabled) return []

  const slots = getSlotsForDate(dateISO, professional, bookings).filter(
    (s) => s.status !== 'fuera_horario' && s.status !== 'reservado',
  )

  const blocks: ScheduleBlock[] = []

  for (const slot of slots) {
    const minutes = timeToMinutes(slot.time)
    const breakInfo = isWithinBreak(minutes, day.breaks)
    const type: ScheduleBlock['type'] = slot.status === 'disponible' ? 'libre' : 'bloqueado'
    const label = breakInfo?.label ?? (type === 'libre' ? 'libre' : 'Bloqueado')
    const previous = blocks[blocks.length - 1]

    if (previous && previous.label === label && timeToMinutes(previous.end) === minutes) {
      previous.end = minutesToTime(minutes + STEP_MIN)
      previous.minutes += STEP_MIN
      continue
    }

    blocks.push({
      start: slot.time,
      end: minutesToTime(minutes + STEP_MIN),
      minutes: STEP_MIN,
      type,
      label,
    })
  }

  return blocks
}

export interface NextSlot {
  dateISO: string
  time: string
  label: string
}

/** Próximas horas realmente disponibles, con etiquetas "Hoy / Mañana / Jue". */
export function getNextAvailableSlots(
  professional: Professional,
  bookings: Booking[],
  count = 3,
  fromISO: string = TODAY_ISO,
): NextSlot[] {
  const result: NextSlot[] = []
  const cursor = parseISODate(fromISO)

  for (let offset = 0; offset < 21 && result.length < count; offset++) {
    const date = new Date(cursor)
    date.setDate(cursor.getDate() + offset)
    const dateISO = toISODate(date)

    for (const slot of getSlotsForDate(dateISO, professional, bookings)) {
      if (slot.status !== 'disponible') continue

      const prefix =
        offset === 0 ? 'Hoy' : offset === 1 ? 'Mañana' : WEEKDAYS_SHORT[date.getDay()]

      result.push({ dateISO, time: slot.time, label: `${prefix} ${slot.time}` })
      if (result.length >= count) break
    }
  }

  return result
}
