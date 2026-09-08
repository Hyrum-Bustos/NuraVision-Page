import { Link, useNavigate, useParams } from 'react-router-dom'
import { getProfessionalById } from '../data/professionals'
import { getServiceById } from '../data/services'
import { getSlotsForDate } from '../lib/availability'
import { useAppState } from '../state/AppState'
import { Kicker, Placeholder } from '../components/ui'
import { formatPrice } from '../lib/format'

const WEEK_DATES = [
  { label: 'MAR', day: 1, iso: '2026-09-01' },
  { label: 'MIÉ', day: 2, iso: '2026-09-02' },
  { label: 'JUE', day: 3, iso: '2026-09-03' },
  { label: 'VIE', day: 4, iso: '2026-09-04' },
  { label: 'SÁB', day: 5, iso: '2026-09-05' },
  { label: 'DOM', day: 6, iso: '2026-09-06' },
]

export default function ProfessionalDetail() {
  const { id } = useParams()
  const professional = id ? getProfessionalById(id) : undefined
  const navigate = useNavigate()
  const { setBookingDraft } = useAppState()

  if (!professional) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-center">
        <p className="text-muted">Profesional no encontrado.</p>
        <Link to="/profesionales" className="mt-4 inline-block text-ink underline">
          Volver a profesionales
        </Link>
      </div>
    )
  }

  function goToBooking(serviceId: string) {
    setBookingDraft(() => ({ serviceId, professionalId: professional!.id }))
    navigate('/reservar')
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Link to="/profesionales" className="text-sm text-muted hover:text-ink">
        ← Profesionales
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <Placeholder label="Retrato profesional" className="aspect-[3/4] w-full rounded-2xl" />

        <div>
          <h1 className="font-serif-display text-4xl text-ink">{professional.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {professional.role} · {professional.experienceYears} años de experiencia
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">{professional.bio}</p>

          <div className="mt-8 border-t border-line-soft pt-6">
            <Kicker>Servicios que realiza</Kicker>
            <div className="mt-3 divide-y divide-line-soft">
              {professional.serviceIds.map((serviceId) => {
                const service = getServiceById(serviceId)
                if (!service) return null
                return (
                  <div key={serviceId} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{service.name}</p>
                      <p className="text-xs text-muted">{service.durationMin} min</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-ink">{formatPrice(service.price)}</span>
                      <button
                        onClick={() => goToBooking(service.id)}
                        className="text-sm font-medium text-ink hover:text-olive-700"
                      >
                        Reservar →
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-8 border-t border-line-soft pt-6">
            <div className="mb-4 flex items-center justify-between">
              <Kicker>Disponibilidad esta semana</Kicker>
              <button
                onClick={() => {
                  setBookingDraft(() => ({ professionalId: professional.id }))
                  navigate('/reservar')
                }}
                className="text-sm font-medium text-ink hover:text-olive-700"
              >
                Ver agenda completa
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {WEEK_DATES.map((d) => {
                const isSunday = d.label === 'DOM'
                const slots = isSunday ? [] : getSlotsForDate(d.iso, professional.id).slice(2, 10)
                const preview = slots.filter((s) => s.status !== 'fuera_horario').slice(0, 3)
                return (
                  <div key={d.iso} className="rounded-xl border border-line-soft p-3 text-center">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">{d.label}</p>
                    <p className="font-serif-display text-lg text-ink">{d.day}</p>
                    <div className="mt-2 space-y-1">
                      {isSunday && <p className="text-xs text-muted-light">Cerrado</p>}
                      {preview.map((s) => (
                        <p
                          key={s.time}
                          className={`text-xs ${
                            s.status === 'reservado' ? 'text-muted-light line-through' : 'text-ink'
                          }`}
                        >
                          {s.time}
                        </p>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
