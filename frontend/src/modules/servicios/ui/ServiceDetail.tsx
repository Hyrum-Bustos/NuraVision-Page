import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppState } from '@/shared/state/AppState'
import { categoryLabel } from '@/modules/servicios/domain/serviceCategories'
import { AppImage, Avatar, Button, Kicker, Placeholder } from '@/shared/ui/ui'
import { formatPrice } from '@/shared/lib/format'

export default function ServiceDetail() {
  const { id } = useParams()
  const { getService, professionalsForService, setBookingDraft, nextSlotsFor } = useAppState()
  const navigate = useNavigate()

  const service = id ? getService(id) : undefined

  if (!service) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-center">
        <p className="text-muted">Servicio no encontrado.</p>
        <Link to="/servicios" className="mt-4 inline-block text-ink underline">
          Volver a servicios
        </Link>
      </div>
    )
  }

  const professionals = professionalsForService(service.id)
  const nextSlots = professionals[0] ? nextSlotsFor(professionals[0], { count: 4 }) : []

  function handleReservar() {
    setBookingDraft(() => ({ serviceId: service!.id }))
    navigate('/reservar')
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Link to="/servicios" className="text-sm text-muted hover:text-ink">
        ← Servicios
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <AppImage
            src={service.imageUrl}
            label={service.name.split(' ')[0].toUpperCase()}
            alt={service.name}
            className="aspect-[4/3] w-full rounded-2xl"
          />
          <div className="mt-3 grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Placeholder key={i} className="aspect-square w-full rounded-xl" />
            ))}
          </div>

          <Kicker className="mt-8">{categoryLabel(service.category)}</Kicker>
          <h1 className="mt-1 font-serif-display text-4xl text-ink">{service.name}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            {service.longDescription}
          </p>

          {service.includes.length > 0 && (
            <div className="mt-8 border-t border-line-soft pt-6">
              <Kicker>Incluye</Kicker>
              <ul className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                {service.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-ink">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-olive-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 border-t border-line-soft pt-6">
            <Kicker>Profesionales que lo realizan</Kicker>
            {professionals.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                Este servicio aún no tiene profesionales asignados.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-4">
                {professionals.map((p) => (
                  <Link key={p.id} to={`/profesionales/${p.id}`} className="flex items-center gap-3">
                    {p.imageUrl ? (
                      <AppImage
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-9 w-9 shrink-0 rounded-full"
                      />
                    ) : (
                      <Avatar
                        initials={p.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-ink">{p.name}</p>
                      <p className="text-xs text-muted">{p.role}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="h-fit rounded-2xl border border-line-soft bg-paper p-6">
          <div className="flex items-baseline justify-between">
            <p className="font-serif-display text-4xl text-ink">{formatPrice(service.price)}</p>
            <span className="text-sm text-muted">{service.durationMin} min</span>
          </div>

          <div className="mt-5 space-y-3 border-t border-line-soft pt-5 text-sm">
            <Row label="Duración" value={`${service.durationMin} min`} />
            <Row label="Categoría" value={categoryLabel(service.category)} />
            <Row label="Modalidad" value="Presencial · Estudio Nura" />
          </div>

          {nextSlots.length > 0 && (
            <div className="mt-5 border-t border-line-soft pt-5">
              <Kicker>Próximas horas</Kicker>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {nextSlots.map((slot) => (
                  <span
                    key={`${slot.dateISO}-${slot.time}`}
                    className="rounded-lg border border-line px-3 py-2 text-center text-sm text-ink"
                  >
                    {slot.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Button full className="mt-6" onClick={handleReservar}>
            Reservar este servicio
          </Button>
          <p className="mt-3 text-center text-xs text-muted">
            Cancelación gratuita hasta 12 h antes
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
