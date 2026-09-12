import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '@/shared/state/AppState'
import { useToast } from '@/shared/state/Toast'
import { categoryLabel } from '@/modules/servicios/domain/serviceCategories'
import type { Servicio } from '@/modules/servicios/domain/servicio.types'
import { useServicioDetalle } from '@/modules/servicios/ui/useServicioDetalle'
import { useServicios } from '@/modules/servicios/ui/useServicios'
import { useProfesionalesPorServicio } from '@/modules/profesionales/ui/useProfesionalesPorServicio'
import { useDisponibilidad } from '@/modules/profesionales/ui/useDisponibilidad'
import { getMonthDays, getSlotsForDate } from '@/shared/lib/availability'
import { Stepper } from '@/shared/ui/Stepper'
import { useScrollToTopOnChange } from '@/shared/components/ScrollToTop'
import { Calendar } from '@/shared/components/Calendar'
import { TimeSlotGrid } from '@/shared/components/TimeSlotGrid'
import { AppImage, Avatar, Button, Kicker } from '@/shared/ui/ui'
import { formatLongDate, formatPrice, formatWeekdayLong, monthLabel } from '@/shared/lib/format'
import type { Booking, Professional, ServiceCategoryId } from '@/shared/types'
import type { Profesional } from '@/modules/profesionales/domain/profesional.types'

type Step = 'service' | 'professional' | 'date' | 'time' | 'confirm'

/**
 * Lo que el asistente necesita del servicio. Se construye desde la entidad de
 * dominio con valores por defecto para lo que la tabla aun no tiene, de modo
 * que una columna faltante nunca deje el resumen del borrador a medias.
 */
interface ServicioReservaVista {
  id: string
  nombre: string
  categoria: ServiceCategoryId
  duracionMinutos: number
  precioBase: number
  /** Sin columna de imagen en la base: AppImage cae en su placeholder. */
  imagenUrl: string | undefined
}

function toVista(servicio: Servicio): ServicioReservaVista {
  return {
    id: servicio.id,
    nombre: servicio.nombre,
    categoria: servicio.categoria,
    duracionMinutos: servicio.duracionMinutos,
    precioBase: servicio.precioBase,
    imagenUrl: undefined,
  }
}

function generateCode(dateISO: string): string {
  const [, m, d] = dateISO.split('-')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `NV-${d}${m}-${random}`
}

function Aviso({
  titulo,
  descripcion,
  accion,
}: {
  titulo: string
  descripcion: string
  accion?: { label: string; onClick: () => void }
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line p-10 text-center">
      <p className="font-medium text-ink">{titulo}</p>
      <p className="mt-2 text-sm text-muted">{descripcion}</p>
      {accion && (
        <button
          onClick={accion.onClick}
          className="mt-5 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink hover:bg-ivory"
        >
          {accion.label}
        </button>
      )}
    </div>
  )
}

export default function BookingFlow() {
  const { currentUser, bookingDraft, setBookingDraft, addBooking, bookings } = useAppState()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [calendarView, setCalendarView] = useState({ year: 2026, month: 8 })
  const [confirmado, setConfirmado] = useState<{ booking: Booking; servicioNombre: string } | null>(
    null,
  )

  // Servicio, profesionales y horario salen de la base, no de los seeds.
  const servicioState = useServicioDetalle(bookingDraft.serviceId)
  const profesionalesState = useProfesionalesPorServicio(bookingDraft.serviceId)
  const disponibilidad = useDisponibilidad(bookingDraft.professionalId)

  /**
   * El calculo de horas (getMonthDays, getSlotsForDate) espera el `Professional`
   * del prototipo. En vez de duplicar esa logica, se arma uno con los datos de
   * la base y el horario ya convertido: asi la agenda sigue siendo el mismo
   * codigo, probado, y solo cambia de donde salen los datos.
   */
  const professional: Professional | undefined = useMemo(() => {
    const elegido = profesionalesState.profesionales.find((p) => p.id === bookingDraft.professionalId)
    if (!elegido) return undefined
    return {
      id: elegido.id,
      name: elegido.nombre,
      role: elegido.especialidad,
      experienceYears: 0,
      bio: '',
      serviceIds: [],
      imageUrl: elegido.avatarUrl ?? undefined,
      availability: disponibilidad.horario,
    }
  }, [profesionalesState.profesionales, bookingDraft.professionalId, disponibilidad.horario])

  // El aviso se emite una sola vez: en desarrollo StrictMode monta el efecto
  // dos veces y, sin esta guarda, el toast aparecía duplicado.
  const notifiedRef = useRef(false)

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'cliente') {
      if (!notifiedRef.current) {
        notifiedRef.current = true
        // Sin el aviso, el rebote al login parece un error de la aplicación.
        toast({
          title: 'Inicia sesión para reservar',
          description: 'Necesitamos identificarte para confirmar tu hora.',
          tone: 'info',
        })
      }
      navigate('/login')
    }
  }, [currentUser, navigate, toast])

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
  useScrollToTopOnChange(confirmado ? 'success' : step)

  if (!currentUser || currentUser.role !== 'cliente') return null

  if (confirmado) {
    return <SuccessScreen booking={confirmado.booking} servicioNombre={confirmado.servicioNombre} />
  }

  const service = servicioState.estado === 'listo' ? toVista(servicioState.servicio) : undefined

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

  // Pasados el primer paso, todo depende del servicio: si aún no llega, no se
  // puede pintar nada coherente debajo del Stepper.
  const esperandoServicio = step !== 'service' && servicioState.estado !== 'listo'

  // De la fecha en adelante todo depende del horario del profesional: si aún
  // no llega, falta o falló, no hay fechas que ofrecer.
  const pasosConAgenda = step === 'date' || step === 'time' || step === 'confirm'
  const esperandoHorario =
    !esperandoServicio &&
    pasosConAgenda &&
    (disponibilidad.cargando || disponibilidad.error !== null || disponibilidad.sinHorario)

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10 overflow-x-auto">
        <div className="min-w-[560px]">
          <Stepper currentIndex={stepIndex} />
        </div>
      </div>

      {esperandoServicio && servicioState.estado === 'cargando' && (
        <Aviso titulo="Cargando el servicio…" descripcion="Estamos leyendo los datos de tu reserva." />
      )}

      {esperandoServicio && servicioState.estado === 'error' && (
        <Aviso
          titulo="No pudimos cargar el servicio"
          descripcion={servicioState.mensaje}
          accion={{ label: 'Elegir otro servicio', onClick: () => clearFrom('service') }}
        />
      )}

      {esperandoServicio && servicioState.estado === 'no-encontrado' && (
        <Aviso
          titulo="Ese servicio ya no está disponible"
          descripcion="Puede que haya cambiado de nombre o se haya dado de baja del catálogo."
          accion={{ label: 'Elegir otro servicio', onClick: () => clearFrom('service') }}
        />
      )}

      {step === 'service' && (
        <ServiceStep
          preselectedProfessional={professional}
          onSelect={(serviceId) => setBookingDraft((d) => ({ ...d, serviceId }))}
        />
      )}

      {step === 'professional' && service && (
        <ProfessionalStep
          service={service}
          profesionales={profesionalesState.profesionales}
          cargando={profesionalesState.cargando}
          error={profesionalesState.error}
          onBack={() => clearFrom('service')}
          onSelect={(professionalId) => setBookingDraft((d) => ({ ...d, professionalId }))}
        />
      )}

      {esperandoHorario && disponibilidad.cargando && (
        <Aviso titulo="Cargando la agenda…" descripcion="Estamos leyendo el horario del profesional." />
      )}

      {esperandoHorario && disponibilidad.error && (
        <Aviso
          titulo="No pudimos cargar la agenda"
          descripcion={disponibilidad.error}
          accion={{ label: 'Elegir otro profesional', onClick: () => clearFrom('professional') }}
        />
      )}

      {/* El profesional existe pero no tiene ni un bloque en `disponibilidad`:
          sin horario no hay fechas que ofrecer. Sin este aviso los pasos
          siguientes no renderizarian nada y la pantalla quedaria en blanco. */}
      {esperandoHorario && disponibilidad.sinHorario && (
        <Aviso
          titulo="Este profesional todavía no tiene agenda"
          descripcion="Aún no tiene horarios cargados, así que no podemos mostrar fechas ni horas disponibles."
          accion={{ label: 'Elegir otro profesional', onClick: () => clearFrom('professional') }}
        />
      )}

      {step === 'date' && !esperandoHorario && service && professional && (
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

      {step === 'time' && !esperandoHorario && service && professional && bookingDraft.dateISO && (
        <TimeStep
          dateISO={bookingDraft.dateISO}
          professional={professional}
          slots={getSlotsForDate(bookingDraft.dateISO, professional, bookings)}
          onBack={() => clearFrom('date')}
          onChangeDate={() => clearFrom('date')}
          onSelect={(time) => setBookingDraft((d) => ({ ...d, time }))}
        />
      )}

      {step === 'confirm' && !esperandoHorario && service && professional && bookingDraft.dateISO && bookingDraft.time && (
        <ConfirmStep
          service={service}
          professionalName={professional.name}
          dateISO={bookingDraft.dateISO}
          time={bookingDraft.time}
          onBack={() => clearFrom('time')}
          onConfirm={() => {
            const booking: Booking = {
              id: `b-${Date.now()}`,
              code: generateCode(bookingDraft.dateISO!),
              serviceId: service.id,
              professionalId: professional.id,
              clientName: currentUser.name,
              dateISO: bookingDraft.dateISO!,
              time: bookingDraft.time!,
              durationMin: service.duracionMinutos,
              price: service.precioBase,
              status: 'confirmada',
            }
            addBooking(booking)
            setBookingDraft(() => ({}))
            // Se guarda el nombre junto a la reserva: la pantalla de éxito ya no
            // puede resolverlo desde los datos de ejemplo.
            setConfirmado({ booking, servicioNombre: service.nombre })
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
  preselectedProfessional,
  onSelect,
}: {
  preselectedProfessional?: Professional
  onSelect: (serviceId: string) => void
}) {
  const { servicios, cargando, error } = useServicios()

  // Los profesionales siguen viniendo de los datos de ejemplo y referencian
  // servicios por los ids del prototipo, que no coinciden con los de la base.
  // Hasta que se migren, este filtro no cruza y la lista llega vacía.
  const list = preselectedProfessional
    ? servicios.filter((s) => preselectedProfessional.serviceIds.includes(s.id))
    : servicios

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

      {cargando && (
        <p className="mt-8 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
          Cargando el catálogo…
        </p>
      )}

      {error && (
        <p className="mt-8 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
          No pudimos cargar el catálogo: {error}
        </p>
      )}

      {!cargando && !error && (
        <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelect(s.id)}
                className="flex flex-col overflow-hidden rounded-2xl border border-line-soft bg-paper text-left transition-shadow hover:shadow-md"
              >
                <AppImage
                  src={undefined}
                  label={s.nombre.split(' ')[0].toUpperCase()}
                  alt={s.nombre}
                  className="aspect-[4/3] w-full"
                />
                <div className="p-5">
                  <Kicker>{categoryLabel(s.categoria)}</Kicker>
                  <h3 className="mt-1 font-serif-display text-lg text-ink">{s.nombre}</h3>
                  <div className="mt-3 flex items-center justify-between text-sm text-ink">
                    <span>{s.duracionMinutos} min</span>
                    <span className="font-medium">{formatPrice(s.precioBase)}</span>
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
        </>
      )}
    </div>
  )
}

function ProfessionalStep({
  service,
  profesionales,
  cargando,
  error,
  onBack,
  onSelect,
}: {
  service: ServicioReservaVista
  profesionales: Profesional[]
  cargando: boolean
  error: string | null
  onBack: () => void
  onSelect: (professionalId: string) => void
}) {
  return (
    <div>
      <BackLink label="Cambiar servicio" onClick={onBack} />
      <h1 className="font-serif-display text-4xl text-ink">¿Con quién?</h1>
      <p className="mt-2 text-sm text-muted">
        Profesionales que realizan <strong className="text-ink">{service.nombre}</strong>.
      </p>

      {cargando && (
        <p className="mt-8 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
          Cargando profesionales…
        </p>
      )}

      {error && (
        <p className="mt-8 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
          No pudimos cargar los profesionales: {error}
        </p>
      )}

      {!cargando && !error && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {profesionales.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className="flex items-center gap-4 rounded-2xl border border-line-soft bg-paper p-5 text-left hover:shadow-md"
              >
                {p.avatarUrl ? (
                  <AppImage
                    src={p.avatarUrl}
                    alt={p.nombre}
                    className="h-12 w-12 shrink-0 rounded-full"
                  />
                ) : (
                  <Avatar
                    initials={p.nombre
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  />
                )}
                <div>
                  <p className="font-medium text-ink">{p.nombre}</p>
                  <p className="text-sm text-muted">{p.especialidad}</p>
                </div>
              </button>
            ))}
          </div>

          {profesionales.length === 0 && (
            <p className="mt-8 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
              Este servicio aún no tiene profesionales asignados.
            </p>
          )}
        </>
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
  service: ServicioReservaVista
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
        {service.nombre} con {professional.name} · {service.duracionMinutos} min
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
              <dd className="mt-0.5 font-medium text-ink">{service.nombre}</dd>
            </div>
            <div>
              <dt className="text-muted">Profesional</dt>
              <dd className="mt-0.5 font-medium text-ink">{professional.name}</dd>
            </div>
            <div>
              <dt className="text-muted">Duración</dt>
              <dd className="mt-0.5 font-medium text-ink">{service.duracionMinutos} min</dd>
            </div>
          </dl>
          <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
            <span className="text-sm text-muted">Total</span>
            <span className="font-serif-display text-2xl text-ink">
              {formatPrice(service.precioBase)}
            </span>
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
  onBack,
  onConfirm,
}: {
  service: ServicioReservaVista
  professionalName: string
  dateISO: string
  time: string
  onBack: () => void
  onConfirm: () => void
}) {
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
              src={service.imagenUrl}
              label={service.nombre.split(' ')[0].toUpperCase()}
              alt={service.nombre}
              className="h-16 w-16 shrink-0 rounded-xl"
            />
            <div>
              <p className="font-serif-display text-xl text-ink">{service.nombre}</p>
              <p className="text-sm text-muted">{categoryLabel(service.categoria)}</p>
            </div>
          </div>
          <div className="space-y-4 border-t border-line-soft p-6 text-sm">
            <Row label="Servicio" value={service.nombre} />
            <Row label="Profesional" value={professionalName} />
            <Row label="Fecha" value={formatLongDate(dateISO)} />
            <Row label="Hora" value={`${time} h`} />
            <Row label="Duración" value={`${service.duracionMinutos} min`} />
            <Row label="Lugar" value="Av. Libertad 1250, Viña del Mar" />
          </div>
        </div>

        <div className="h-fit rounded-2xl bg-line-soft/60 p-6">
          <p className="text-sm text-muted">Total a pagar en el salón</p>
          <p className="mt-1 font-serif-display text-4xl text-ink">
            {formatPrice(service.precioBase)}
          </p>
          <Button full className="mt-6" onClick={onConfirm}>
            Confirmar reserva
          </Button>
          <p className="mt-3 text-center text-xs text-muted">
            Puedes cancelar sin costo hasta 12 h antes de tu hora.
          </p>
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

function SuccessScreen({ booking, servicioNombre }: { booking: Booking; servicioNombre: string }) {
  const navigate = useNavigate()
  const { getProfessional } = useAppState()
  const professional = getProfessional(booking.professionalId)

  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-olive-50 text-2xl text-olive-700">
        ✓
      </div>
      <h1 className="mt-6 font-serif-display text-4xl text-ink">Tu reserva está confirmada</h1>
      <p className="mt-3 text-sm text-muted">
        Te enviamos el detalle a tu correo y un recordatorio 24 h antes.
      </p>

      <div className="mt-8 rounded-2xl border border-line-soft bg-paper p-6 text-left">
        <p className="text-xs font-medium tracking-wide text-muted-light">{booking.code}</p>
        <div className="mt-4 space-y-3 divide-y divide-line-soft text-sm [&>div]:pt-3 [&>div:first-child]:pt-0">
          <Row label="Servicio" value={servicioNombre} />
          <Row label="Profesional" value={professional?.name ?? '—'} />
          <Row label="Fecha" value={formatLongDate(booking.dateISO)} />
          <Row label="Hora" value={`${booking.time} h`} />
          <Row label="Duración" value={`${booking.durationMin} min`} />
          <Row label="Lugar" value="Av. Libertad 1250, Viña del Mar" />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button onClick={() => navigate('/mis-reservas')}>Ver mis reservas</Button>
        <Button variant="outline" onClick={() => navigate('/')}>
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}
