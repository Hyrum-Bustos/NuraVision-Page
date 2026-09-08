import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../state/AppState'
import { TODAY_ISO } from '../../data/bookings'
import { getServiceById } from '../../data/services'
import { getMonthDays, getSlotsForDate } from '../../lib/availability'
import { formatDayMonthShort, getWeekDates, parseISODate, WEEKDAYS_SHORT } from '../../lib/format'
import { Button, StatusBadge } from '../../components/ui'
import type { Booking } from '../../types'

type View = 'dia' | 'semana' | 'mes'

export default function ProAgenda() {
  const { currentUser, bookings } = useAppState()
  const navigate = useNavigate()
  const professionalId = currentUser!.professionalId!
  const [view, setView] = useState<View>('dia')

  const myBookings = useMemo(
    () => bookings.filter((b) => b.professionalId === professionalId),
    [bookings, professionalId],
  )

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-4xl text-ink">Mi agenda</h1>
          <p className="mt-2 text-sm text-muted">1 – 6 de septiembre, 2026</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-full border border-line bg-paper p-1">
            {(['dia', 'semana', 'mes'] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                  view === v ? 'bg-ink text-white' : 'text-ink hover:bg-ivory'
                }`}
              >
                {v === 'dia' ? 'Día' : v === 'semana' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
          <Button onClick={() => navigate('/profesional/disponibilidad')}>Disponibilidad</Button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line-soft bg-paper px-5 py-3 text-xs text-muted">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <LegendDot className="bg-line-soft" label="Disponible" />
          <LegendDot className="bg-olive-600" label="Reservado" />
          <LegendDot className="placeholder-stripes" label="Bloqueado" />
          <LegendDot className="border border-dashed border-line" label="Fuera de horario" />
        </div>
        <span>Vista: {view === 'dia' ? 'Día' : view === 'semana' ? 'Semana' : 'Mes'}</span>
      </div>

      {view === 'dia' && <DayView bookings={myBookings} />}
      {view === 'semana' && <WeekView professionalId={professionalId} bookings={myBookings} />}
      {view === 'mes' && <MonthView bookings={myBookings} />}
    </div>
  )
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded ${className}`} />
      {label}
    </span>
  )
}

function DayView({ bookings }: { bookings: Booking[] }) {
  const today = bookings
    .filter((b) => b.dateISO === TODAY_ISO)
    .sort((a, b) => a.time.localeCompare(b.time))

  return (
    <div className="overflow-hidden rounded-2xl border border-line-soft bg-paper">
      {today.map((b) => {
        const service = getServiceById(b.serviceId)
        return (
          <div key={b.id} className="flex items-center justify-between border-b border-line-soft p-5 last:border-0">
            <div className="flex items-center gap-6">
              <span className="w-14 text-sm font-medium text-ink">{b.time}</span>
              <div>
                <p className="font-medium text-ink">{service?.name}</p>
                <p className="text-sm text-muted">{b.clientName}</p>
              </div>
            </div>
            <StatusBadge status={b.status} />
          </div>
        )
      })}
      {today.length === 0 && <p className="p-5 text-sm text-muted">Sin atenciones hoy.</p>}
    </div>
  )
}

const HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

function WeekView({ professionalId, bookings }: { professionalId: string; bookings: Booking[] }) {
  const weekDates = getWeekDates(TODAY_ISO)

  return (
    <div className="overflow-x-auto rounded-2xl border border-line-soft bg-paper">
      <div className="grid min-w-[840px] grid-cols-[80px_repeat(7,1fr)]">
        <div />
        {weekDates.map((iso) => {
          const { day } = formatDayMonthShort(iso)
          return (
            <div key={iso} className="border-b border-l border-line-soft px-2 py-3 text-center">
              <p className="text-xs uppercase tracking-wide text-muted">
                {WEEKDAYS_SHORT[parseISODate(iso).getDay()]}
              </p>
              <p className="font-serif-display text-lg text-ink">{day}</p>
            </div>
          )
        })}

        {HOURS.map((hour) => (
          <FragmentRow key={hour} hour={hour} weekDates={weekDates} professionalId={professionalId} bookings={bookings} />
        ))}
      </div>
    </div>
  )
}

function FragmentRow({
  hour,
  weekDates,
  professionalId,
  bookings,
}: {
  hour: string
  weekDates: string[]
  professionalId: string
  bookings: Booking[]
}) {
  return (
    <>
      <div className="border-b border-line-soft px-3 py-3 text-xs text-muted">{hour}</div>
      {weekDates.map((iso) => {
        const isSunday = parseISODate(iso).getDay() === 0
        const isMonday = parseISODate(iso).getDay() === 1
        if (isSunday || isMonday) {
          return (
            <div key={iso} className="border-b border-l border-line-soft" />
          )
        }
        const booking = bookings.find((b) => b.dateISO === iso && b.time === hour)
        if (booking) {
          const surname = booking.clientName.split(' ').slice(1).join(' ') || booking.clientName
          return (
            <div key={iso} className="border-b border-l border-line-soft p-1">
              <div className="flex h-full items-center justify-center rounded bg-olive-600 px-1 py-2 text-center text-xs text-white">
                {surname}
              </div>
            </div>
          )
        }
        const slot = getSlotsForDate(iso, professionalId).find((s) => s.time === hour)
        return (
          <div key={iso} className="border-b border-l border-line-soft p-1">
            {slot?.status === 'bloqueado' ? (
              <div className="placeholder-stripes flex h-full items-center justify-center rounded px-1 py-2 text-center text-xs text-muted">
                Bloqueado
              </div>
            ) : (
              <div className="h-full rounded bg-line-soft/70 py-2" />
            )}
          </div>
        )
      })}
    </>
  )
}

function MonthView({ bookings }: { bookings: Booking[] }) {
  const days = getMonthDays(2026, 8)

  return (
    <div className="grid grid-cols-7 gap-2">
      {WEEKDAYS_SHORT.map((w, i) => (
        <div key={`${w}-${i}`} className="text-center text-xs font-medium uppercase text-muted">
          {w}
        </div>
      ))}
      {Array.from({ length: (parseISODate(days[0].dateISO).getDay() + 6) % 7 }).map((_, i) => (
        <div key={`blank-${i}`} />
      ))}
      {days.map((day) => {
        const count = bookings.filter((b) => b.dateISO === day.dateISO && b.status !== 'cancelada').length
        return (
          <div
            key={day.dateISO}
            className={`min-h-[86px] rounded-xl border p-3 text-sm ${
              day.dateISO === TODAY_ISO
                ? 'border-ink bg-ink text-white'
                : day.status === 'cerrado'
                  ? 'border-dashed border-line text-muted-light'
                  : 'border-line-soft bg-paper text-ink'
            }`}
          >
            <p>{day.day}</p>
            {day.status !== 'cerrado' && (
              <p
                className={`mt-2 text-xs ${
                  day.dateISO === TODAY_ISO ? 'text-white/70' : 'text-muted'
                }`}
              >
                {count > 0 ? `${count} reservas` : 'Sin reservas'}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
