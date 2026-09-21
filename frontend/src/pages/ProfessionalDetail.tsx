import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppState } from '@/shared/state/AppState'
import { useProfesionalesPorIds } from '@/modules/profesionales/ui/useProfesionalesPorIds'
import { useServiciosPorProfesional } from '@/modules/servicios/ui/useServiciosPorProfesional'
import { AppImage, Kicker } from '@/shared/ui/ui'
import { formatPrice } from '@/shared/lib/format'

export default function ProfessionalDetail() {
  const { id } = useParams()
  const { setBookingDraft } = useAppState()
  const navigate = useNavigate()
  const equipo = useProfesionalesPorIds(id ? [id] : [])
  const catalogo = useServiciosPorProfesional(id)
  const professional = id ? equipo.porId.get(id) : undefined

  if (equipo.cargando || equipo.error || !professional?.activo) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-center">
        <p className="text-muted" role={equipo.error ? 'alert' : 'status'}>
          {equipo.cargando ? 'Cargando profesional…' : equipo.error ? `No pudimos cargar el profesional: ${equipo.error}` : 'Profesional no encontrado.'}
        </p>
        <Link to="/profesionales" className="mt-4 inline-block text-ink underline">Volver a profesionales</Link>
      </div>
    )
  }

  function goToBooking(serviceId: string) {
    setBookingDraft(() => ({ serviceId, professionalId: professional!.id }))
    navigate('/reservar')
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Link to="/profesionales" className="text-sm text-muted hover:text-ink">← Profesionales</Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <AppImage src={professional.avatarUrl ?? undefined} label="Retrato profesional" alt={professional.nombre} className="aspect-[3/4] w-full rounded-2xl" />
        <div>
          <h1 className="font-serif-display text-4xl text-ink">{professional.nombre}</h1>
          <p className="mt-1 text-sm text-muted">{professional.especialidad}</p>
          <div className="mt-8 border-t border-line-soft pt-6">
            <Kicker>Servicios que realiza</Kicker>
            <p className="mt-3 text-sm text-muted">Elige un servicio para consultar los horarios y reservar.</p>
            {catalogo.cargando && <p className="mt-3 text-sm text-muted">Cargando servicios…</p>}
            {catalogo.error && <p role="alert" className="mt-3 text-sm text-muted">No pudimos cargar los servicios: {catalogo.error}</p>}
            {!catalogo.cargando && !catalogo.error && (
              <div className="mt-3 divide-y divide-line-soft">
                {catalogo.servicios.map((service) => (
                  <div key={service.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{service.nombre}</p>
                      <p className="text-xs text-muted">{service.duracionMinutos} min</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-ink">{formatPrice(service.precioBase)}</span>
                      <button onClick={() => goToBooking(service.id)} className="text-sm font-medium text-ink hover:text-olive-700">Reservar →</button>
                    </div>
                  </div>
                ))}
                {catalogo.servicios.length === 0 && <p className="py-3 text-sm text-muted">Sin servicios asignados por ahora.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
