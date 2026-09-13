import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppState } from '../state/AppState'
import { categoryLabel } from '../data/seed'
import { getMonthDays, getSlotsForDate } from '../lib/availability'
import { Stepper } from '../components/Stepper'
import { useScrollToTopOnChange } from '../components/ScrollToTop'
import { Calendar } from '../components/Calendar'
import { TimeSlotGrid } from '../components/TimeSlotGrid'
import { AppImage, Avatar, Button, Kicker, Tag } from '../components/ui'
import { formatLongDate, formatPrice, formatWeekdayLong, monthLabel } from '../lib/format'
import { TextField } from '../components/form'
import type { Booking, CurrentUser, Professional, Service } from '../types'

type Step = 'service' | 'professional' | 'date' | 'time' | 'confirm'

/** Datos de quien reserva: de la cuenta si hay sesión, del formulario si no. */
type Contact = { name: string; email: string; phone: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function generateCode(dateISO: string): string {
  const [, m, d] = dateISO.split('-')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `NV-${d}${m}-${random}`
}

export default function BookingFlow() {
  const {
    currentUser,
    bookingDraft,
    setBookingDraft,
    addBooking,
    activeServices: services,
    bookings,
    getService,
    getProfessional,
    professionalsForService,
    nextSlotsFor,
  } = useAppState()
  const [calendarView, setCalendarView] = useState({ year: 2026, month: 8 })
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null)

  // Reservar no exige cuenta. Si hay un cliente con sesión, sus datos se
  // completan solos; si no, se piden en el paso de confirmación.
  const account = currentUser?.role === 'cliente' ? currentUser : null

  const step: Step = !bookingDraft.serviceId
    ? 'service'
    : !bookingDraft.professionalId
      ? 'professional'
      : !bookingDraft.dateISO
        ? 'date'
        : !bookingDraft.time
          ? 'time'
          : 'confirm'

  // Cada paso del asistente vuelve al inicio de la pantalla.
  useScrollToTopOnChange(confirmedBooking ? 'success' : step)

  if (confirmedBooking) {
    return <SuccessScreen booking={confirmedBooking} registered={Boolean(account)} />
  }

  const service = bookingDraft.serviceId ? getService(bookingDraft.serviceId) : undefined
  const professional = bookingDraft.professionalId
    ? getProfessional(bookingDraft.professionalId)
    : undefined

  const stepIndex = { service: 0, professional: 1, date: 2, time: 3, confirm: 4 }[step]

  function clearFrom(field: 'service' | 'professional' | 'date' | 'time') {
    setBookingDraft((d) => {
      const next = { ...d }
      if (field === 'service') {
        delete next.serviceId
        delete next.professionalId
        delete next.dateISO
        delete next.time
      } else if (field === 'professional') {
        delete next.professionalId
        delete next.dateISO
        delete next.time
      } else if (field === 'date') {
        delete next.dateISO
        delete next.time
      } else {
        delete next.time
      }
      return next
    })
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10 overflow-x-auto">
        <div className="min-w-[560px]">
          <Stepper currentIndex={stepIndex} />
        </div>
      </div>

      {step === 'service' && (
        <ServiceStep
          services={services}
          preselectedProfessional={professional}
          onSelect={(serviceId) => setBookingDraft((d) => ({ ...d, serviceId }))}
        />
      )}

      {step === 'professional' && service && (
        <ProfessionalStep
          service={service}
          options={professionalsForService(service.id)}
          nextSlotLabels={(p) => nextSlotsFor(p, { count: 2 }).map((s) => s.label)}
          onBack={() => clearFrom('service')}
          onSelect={(professionalId) => setBookingDraft((d) => ({ ...d, professionalId }))}
        />
      )}

      {step === 'date' && service && professional && (
        <DateStep
          service={service}
          professional={professional}
          days={getMonthDays(calendarView.year, calendarView.month, professional, bookings)}
          calendarView={calendarView}
          onChangeView={setCalendarView}
          onBack={() => clearFrom('professional')}
          onSelect={(dateISO) => setBookingDraft((d) => ({ ...d, dateISO }))}
        />
      )}

      {step === 'time' && service && professional && bookingDraft.dateISO && (
        <TimeStep
          dateISO={bookingDraft.dateISO}
          professional={professional}
          slots={getSlotsForDate(bookingDraft.dateISO, professional, bookings)}
          onBack={() => clearFrom('date')}
          onChangeDate={() => clearFrom('date')}
          onSelect={(time) => setBookingDraft((d) => ({ ...d, time }))}
        />
      )}

      {step === 'confirm' && service && professional && bookingDraft.dateISO && bookingDraft.time && (
        <ConfirmStep
          service={service}
          professionalName={professional.name}
          dateISO={bookingDraft.dateISO}
          time={bookingDraft.time}
          account={account}
          onBack={() => clearFrom('time')}
          onConfirm={(contact) => {
            const booking: Booking = {
              id: `b-${Date.now()}`,
              code: generateCode(bookingDraft.dateISO!),
              serviceId: service.id,
              professionalId: professional.id,
              clientName: contact.name,
              clientEmail: contact.email,
              clientPhone: contact.phone,
              guest: !account,
              dateISO: bookingDraft.dateISO!,
              time: bookingDraft.time!,
              durationMin: service.durationMin,
              price: service.price,
              status: 'confirmada',
            }
            addBooking(booking)
            setBookingDraft(() => ({}))
            setConfirmedBooking(booking)
          }}
        />
      )}
    </div>
  )
}

function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="mb-4 text-sm text-muted hover:text-ink">
      ← {label}
    </button>
  )
}

function ServiceStep({
  services,
  preselectedProfessional,
  onSelect,
}: {
  services: Service[]
  preselectedProfessional?: Professional
  onSelect: (serviceId: string) => void
}) {
  const list = preselectedProfessional
    ? services.filter((s) => preselectedProfessional.serviceIds.includes(s.id))
    : services

  return (
    <div>
      <h1 className="font-serif-display text-4xl text-ink">¿Qué servicio quieres?</h1>
      <p className="mt-2 text-sm text-muted">
        {preselectedProfessional ? (
          <>
            Servicios que realiza <strong className="text-ink">{preselectedProfessional.name}</strong>.
          </>
        ) : (
          'Explora el catálogo y elige el que prefieras.'
        )}
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className="flex flex-col overflow-hidden rounded-2xl border border-line-soft bg-paper text-left transition-shadow hover:shadow-md"
          >
            <AppImage
              src={s.imageUrl}
              label={s.name.split(' ')[0].toUpperCase()}
              alt={s.name}
              className="aspect-[4/3] w-full"
            />
            <div className="p-5">
              <Kicker>{categoryLabel(s.category)}</Kicker>
              <h3 className="mt-1 font-serif-display text-lg text-ink">{s.name}</h3>
              <div className="mt-3 flex items-center justify-between text-sm text-ink">
                <span>{s.durationMin} min</span>
                <span className="font-medium">{formatPrice(s.price)}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {list.length === 0 && (
        <p className="mt-8 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
          No hay servicios disponibles por ahora.
        </p>
      )}
    </div>
  )
}

function ProfessionalStep({
  service,
  options,
  nextSlotLabels,
  onBack,
  onSelect,
}: {
  service: Service
  options: Professional[]
  nextSlotLabels: (professional: Professional) => string[]
  onBack: () => void
  onSelect: (professionalId: string) => void
}) {
  return (
    <div>
      <BackLink label="Cambiar servicio" onClick={onBack} />
      <h1 className="font-serif-display text-4xl text-ink">¿Con quién?</h1>
      <p className="mt-2 text-sm text-muted">
        Profesionales que realizan <strong className="text-ink">{service.name}</strong>.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {options.map((p) => {
          const labels = nextSlotLabels(p)
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="flex items-center gap-4 rounded-2xl border border-line-soft bg-paper p-5 text-left hover:shadow-md"
            >
              {p.imageUrl ? (
                <AppImage src={p.imageUrl} alt={p.name} className="h-12 w-12 shrink-0 rounded-full" />
              ) : (
                <Avatar
                  initials={p.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink">{p.name}</p>
                  {p.specialistBadge && <Tag>{p.specialistBadge}</Tag>}
                </div>
                <p className="text-sm text-muted">
                  {p.role} · {p.experienceYears} años de experiencia
                </p>
                <p className="mt-1 text-xs text-muted-light">
                  {labels.length > 0 ? `Próximas: ${labels.join(' · ')}` : 'Sin horas próximas'}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {options.length === 0 && (
        <p className="mt-8 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
          Todavía no hay profesionales asignados a este servicio.
        </p>
      )}
    </div>
  )
}

function DateStep({
  service,
  professional,
  days,
  calendarView,
  onChangeView,
  onBack,
  onSelect,
}: {
  service: Service
  professional: Professional
  days: ReturnType<typeof getMonthDays>
  calendarView: { year: number; month: number }
  onChangeView: (v: { year: number; month: number }) => void
  onBack: () => void
  onSelect: (dateISO: string) => void
}) {
  return (
    <div>
      <BackLink label="Cambiar profesional" onClick={onBack} />
      <h1 className="font-serif-display text-4xl text-ink">Elige una fecha</h1>
      <p className="mt-2 text-sm text-muted">
        {service.name} con {professional.name} · {service.durationMin} min
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <Calendar
          monthLabel={monthLabel(calendarView.year, calendarView.month)}
          days={days}
          onSelectDate={onSelect}
          onPrevMonth={() =>
            onChangeView(
              calendarView.month === 0
                ? { year: calendarView.year - 1, month: 11 }
                : { year: calendarView.year, month: calendarView.month - 1 },
            )
          }
          onNextMonth={() =>
            onChangeView(
              calendarView.month === 11
                ? { year: calendarView.year + 1, month: 0 }
                : { year: calendarView.year, month: calendarView.month + 1 },
            )
          }
        />

        <div className="h-fit rounded-2xl bg-line-soft/60 p-6">
          <Kicker>Tu reserva</Kicker>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="text-muted">Servicio</dt>
              <dd className="mt-0.5 font-medium text-ink">{service.name}</dd>
            </div>
            <div>
              <dt className="text-muted">Profesional</dt>
              <dd className="mt-0.5 font-medium text-ink">{professional.name}</dd>
            </div>
            <div>
              <dt className="text-muted">Duración</dt>
              <dd className="mt-0.5 font-medium text-ink">{service.durationMin} min</dd>
            </div>
          </dl>
          <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
            <span className="text-sm text-muted">Total</span>
            <span className="font-serif-display text-2xl text-ink">{formatPrice(service.price)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TimeStep({
  dateISO,
  professional,
  slots,
  onBack,
  onChangeDate,
  onSelect,
}: {
  dateISO: string
  professional: Professional
  slots: ReturnType<typeof getSlotsForDate>
  onBack: () => void
  onChangeDate: () => void
  onSelect: (time: string) => void
}) {
  return (
    <div>
      <BackLink label="Cambiar fecha" onClick={onBack} />
      <h1 className="font-serif-display text-4xl text-ink">Elige tu hora</h1>
      <p className="mt-2 text-sm text-muted first-letter:uppercase">
        {formatWeekdayLong(dateISO)} · {professional.name}
      </p>

      <div className="mt-8">
        {slots.length > 0 ? (
          <TimeSlotGrid slots={slots} onSelect={onSelect} />
        ) : (
          <p className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
            {professional.name} no atiende este día.
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-line p-6">
        <div>
          <p className="font-medium text-ink">¿Ninguna hora te sirve?</p>
          <p className="text-sm text-muted">
            Revisa otro día o cambia de profesional. Solo mostramos bloques realmente disponibles.
          </p>
        </div>
        <button
          onClick={onChangeDate}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink hover:bg-ivory"
        >
          Ver otra fecha
        </button>
      </div>
    </div>
  )
}

function ConfirmStep({
  service,
  professionalName,
  dateISO,
  time,
  account,
  onBack,
  onConfirm,
}: {
  service: Service
  professionalName: string
  dateISO: string
  time: string
  account: CurrentUser | null
  onBack: () => void
  onConfirm: (contact: Contact) => void
}) {
  const [contact, setContact] = useState<Contact>(() =>
    account
      ? { name: account.name, email: account.email, phone: account.phone }
      : { name: '', email: '', phone: '' },
  )
  const [showErrors, setShowErrors] = useState(false)

  const errors = useMemo(() => {
    const next: Partial<Record<keyof Contact, string>> = {}
    if (!contact.name.trim()) next.name = 'Necesitamos tu nombre.'
    if (!contact.email.trim()) next.email = 'Necesitamos un correo para enviarte el detalle.'
    else if (!EMAIL_RE.test(contact.email.trim())) next.email = 'El formato del correo no es válido.'
    if (!contact.phone.trim()) next.phone = 'Necesitamos un teléfono de contacto.'
    return next
  }, [contact])

  return (
    <div>
      <BackLink label="Cambiar hora" onClick={onBack} />
      <h1 className="font-serif-display text-4xl text-ink">Revisa y confirma</h1>
      <p className="mt-2 text-sm text-muted">
        Aún no está reservado. Verificamos la disponibilidad al confirmar.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-line-soft bg-paper">
          <div className="flex items-center gap-4 p-6">
            <AppImage
              src={service.imageUrl}
              label={service.name.split(' ')[0].toUpperCase()}
              alt={service.name}
              className="h-16 w-16 shrink-0 rounded-xl"
            />
            <div>
              <p className="font-serif-display text-xl text-ink">{service.name}</p>
              <p className="text-sm text-muted">{categoryLabel(service.category)}</p>
            </div>
          </div>
          <div className="space-y-4 border-t border-line-soft p-6 text-sm">
            <Row label="Servicio" value={service.name} />
            <Row label="Profesional" value={professionalName} />
            <Row label="Fecha" value={formatLongDate(dateISO)} />
            <Row label="Hora" value={`${time} h`} />
            <Row label="Duración" value={`${service.durationMin} min`} />
            <Row label="Lugar" value="Av. Libertad 1250, Viña del Mar" />
          </div>

          {/* Sin cuenta, el correo y el teléfono son el único vínculo con la
              reserva: no hay perfil donde consultarla después. */}
          <div className="border-t border-line-soft p-6">
            <Kicker>{account ? 'Tus datos' : 'Tus datos de contacto'}</Kicker>
            {account ? (
              <p className="mt-3 text-sm text-muted">
                Reservas como <span className="text-ink">{account.name}</span> ({account.email}).
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                <TextField
                  label="Nombre y apellido"
                  value={contact.name}
                  onChange={(name) => setContact({ ...contact, name })}
                  error={showErrors ? errors.name : undefined}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Correo electrónico"
                    value={contact.email}
                    onChange={(email) => setContact({ ...contact, email })}
                    error={showErrors ? errors.email : undefined}
                  />
                  <TextField
                    label="Teléfono"
                    value={contact.phone}
                    onChange={(phone) => setContact({ ...contact, phone })}
                    error={showErrors ? errors.phone : undefined}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-fit rounded-2xl bg-line-soft/60 p-6">
          <p className="text-sm text-muted">Total a pagar en el salón</p>
          <p className="mt-1 font-serif-display text-4xl text-ink">{formatPrice(service.price)}</p>
          <Button
            full
            className="mt-6"
            onClick={() => {
              setShowErrors(true)
              if (Object.keys(errors).length > 0) return
              onConfirm({
                name: contact.name.trim(),
                email: contact.email.trim(),
                phone: contact.phone.trim(),
              })
            }}
          >
            Confirmar reserva
          </Button>
          <p className="mt-3 text-center text-xs text-muted">
            Puedes cancelar sin costo hasta 12 h antes de tu hora.
          </p>

          {!account && (
            <div className="mt-5 border-t border-line pt-5 text-xs text-muted">
              <p>
                Estás reservando sin cuenta. Tu hora queda igual de confirmada, pero no quedará
                guardada en un perfil ni sumará beneficios de cliente registrado.
              </p>
              <Link
                to="/registro"
                className="mt-2 inline-block font-medium text-ink underline underline-offset-2"
              >
                Crear una cuenta
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  )
}

function SuccessScreen({ booking, registered }: { booking: Booking; registered: boolean }) {
  const navigate = useNavigate()
  const { getService, getProfessional } = useAppState()
  const service = getService(booking.serviceId)
  const professional = getProfessional(booking.professionalId)

  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-olive-50 text-2xl text-olive-700">
        ✓
      </div>
      <h1 className="mt-6 font-serif-display text-4xl text-ink">Tu reserva está confirmada</h1>
      <p className="mt-3 text-sm text-muted">
        {registered
          ? 'Te enviamos el detalle a tu correo y un recordatorio 24 h antes.'
          : `Enviamos el detalle a ${booking.clientEmail}. Guarda tu código: es lo que necesitas para consultar o modificar tu hora.`}
      </p>

      <div className="mt-8 rounded-2xl border border-line-soft bg-paper p-6 text-left">
        <p className="text-xs font-medium tracking-wide text-muted-light">{booking.code}</p>
        <div className="mt-4 space-y-3 divide-y divide-line-soft text-sm [&>div]:pt-3 [&>div:first-child]:pt-0">
          <Row label="Servicio" value={service?.name ?? '—'} />
          <Row label="Profesional" value={professional?.name ?? '—'} />
          <Row label="Fecha" value={formatLongDate(booking.dateISO)} />
          <Row label="Hora" value={`${booking.time} h`} />
          <Row label="Duración" value={`${booking.durationMin} min`} />
          <Row label="Lugar" value="Av. Libertad 1250, Viña del Mar" />
        </div>
      </div>

      {/* Sin cuenta no hay perfil donde volver a ver la reserva; el registro
          es lo único que convierte esta hora en historial. */}
      {!registered && (
        <div className="mt-6 rounded-2xl border border-line-soft bg-line-soft/50 p-6 text-left">
          <p className="font-medium text-ink">Crea tu cuenta y no vuelvas a escribir tus datos</p>
          <p className="mt-2 text-sm text-muted">
            Con una cuenta ves tu historial completo, reprogramas o cancelas con un clic y accedes
            a los beneficios para clientes registrados.
          </p>
          <Button className="mt-4" onClick={() => navigate('/registro')}>
            Crear mi cuenta
          </Button>
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {registered && <Button onClick={() => navigate('/mis-reservas')}>Ver mis reservas</Button>}
        <Button variant={registered ? 'outline' : 'solid'} onClick={() => navigate('/')}>
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}
