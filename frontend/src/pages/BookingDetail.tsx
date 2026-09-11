import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppState } from '../state/AppState'
import { useToast } from '../state/Toast'
import { ConfirmDialog } from '../shared/ui/Modal'
import { getMonthDays, getSlotsForDate } from '../lib/availability'
import { Calendar } from '../shared/components/Calendar'
import { TimeSlotGrid } from '../shared/components/TimeSlotGrid'
import { Button, StatusBadge } from '../shared/ui/ui'
import { formatLongDate, formatPrice, monthLabel } from '../lib/format'

export default function BookingDetail() {
  const { id } = useParams()
  const { bookings, rescheduleBooking, updateBookingStatus, getService, getProfessional } =
    useAppState()
  const { toast } = useToast()
  const [rescheduling, setRescheduling] = useState(false)
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [draftDate, setDraftDate] = useState<string | undefined>()
  const [draftTime, setDraftTime] = useState<string | undefined>()
  const [calendarView, setCalendarView] = useState({ year: 2026, month: 8 })

  const booking = bookings.find((b) => b.id === id)

  if (!booking) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-muted">Reserva no encontrada.</p>
        <Link to="/mis-reservas" className="mt-4 inline-block text-ink underline">
          Volver a mis reservas
        </Link>
      </div>
    )
  }

  const service = getService(booking.serviceId)
  const professional = getProfessional(booking.professionalId)
  const canManage = booking.status === 'confirmada' || booking.status === 'en_curso'

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link to="/mis-reservas" className="text-sm text-muted hover:text-ink">
        ← Mis reservas
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <StatusBadge status={booking.status} />
        <span className="text-xs tracking-wide text-muted-light">{booking.code}</span>
      </div>
      <h1 className="mt-2 font-serif-display text-4xl text-ink">{service?.name}</h1>

      <div className="mt-6 divide-y divide-line-soft rounded-2xl border border-line-soft bg-paper">
        <Row label="Servicio" value={service?.name ?? '—'} />
        <Row label="Profesional" value={professional?.name ?? '—'} />
        <Row label="Fecha" value={formatLongDate(booking.dateISO)} />
        <Row label="Hora" value={`${booking.time} h`} />
        <Row label="Duración" value={`${booking.durationMin} min`} />
        <Row label="Lugar" value="Av. Libertad 1250, Viña del Mar" />
        <Row label="Total" value={formatPrice(booking.price)} />
      </div>

      <div className="mt-6 rounded-2xl bg-line-soft/60 p-6">
        <Kicker>Antes de tu hora</Kicker>
        <p className="mt-2 text-sm text-muted">
          Llega 5 minutos antes. Si necesitas cancelar, hazlo con al menos 12 horas de anticipación
          para liberar el bloque.
        </p>
      </div>

      {canManage && professional && !rescheduling && (
        <div className="mt-6 flex gap-4">
          <Button onClick={() => setRescheduling(true)}>Reprogramar</Button>
          <Button variant="danger-outline" onClick={() => setConfirmingCancel(true)}>
            Cancelar reserva
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmingCancel}
        onClose={() => setConfirmingCancel(false)}
        onConfirm={() => {
          updateBookingStatus(booking.id, 'cancelada')
          toast({ title: 'Reserva cancelada', description: service?.name, tone: 'info' })
        }}
        title="Cancelar reserva"
        confirmLabel="Cancelar reserva"
        description={
          <>
            Se liberará el bloque de {formatLongDate(booking.dateISO)} a las {booking.time} h. Esta
            acción no se puede deshacer.
          </>
        }
      />

      {canManage && professional && rescheduling && (
        <div className="mt-8 rounded-2xl border border-line-soft bg-paper p-6">
          <h2 className="font-serif-display text-2xl text-ink">Elige nueva fecha y hora</h2>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
            <Calendar
              monthLabel={monthLabel(calendarView.year, calendarView.month)}
              days={getMonthDays(calendarView.year, calendarView.month, professional, bookings)}
              selectedDateISO={draftDate}
              onSelectDate={(d) => {
                setDraftDate(d)
                setDraftTime(undefined)
              }}
              onPrevMonth={() =>
                setCalendarView((v) =>
                  v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 },
                )
              }
              onNextMonth={() =>
                setCalendarView((v) =>
                  v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 },
                )
              }
            />
            <div>
              {draftDate ? (
                <TimeSlotGrid
                  slots={getSlotsForDate(draftDate, professional, bookings)}
                  selectedTime={draftTime}
                  onSelect={setDraftTime}
                />
              ) : (
                <p className="text-sm text-muted">Elige primero una fecha.</p>
              )}
            </div>
          </div>
          <div className="mt-6 flex gap-4">
            <Button
              disabled={!draftDate || !draftTime}
              onClick={() => {
                rescheduleBooking(booking.id, draftDate!, draftTime!)
                setRescheduling(false)
                toast({
                  title: 'Reserva reprogramada',
                  description: `${formatLongDate(draftDate!)} · ${draftTime} h`,
                })
              }}
            >
              Guardar cambios
            </Button>
            <Button variant="outline" onClick={() => setRescheduling(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function Kicker({ children }: { children: string }) {
  return <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">{children}</p>
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  )
}
