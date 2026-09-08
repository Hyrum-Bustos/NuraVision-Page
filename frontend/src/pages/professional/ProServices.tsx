import { useAppState } from '../../state/AppState'
import { getProfessionalById } from '../../data/professionals'
import { getServiceById } from '../../data/services'
import { Card, Kicker } from '../../components/ui'
import { formatPrice } from '../../lib/format'

export default function ProServices() {
  const { currentUser } = useAppState()
  const professional = getProfessionalById(currentUser!.professionalId!)!

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <h1 className="font-serif-display text-4xl text-ink">Mis servicios</h1>
      <p className="mt-2 text-sm text-muted">Servicios del catálogo que realizas actualmente.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {professional.serviceIds.map((id) => {
          const service = getServiceById(id)
          if (!service) return null
          return (
            <Card key={id} className="flex items-center justify-between p-5">
              <div>
                <Kicker>{service.categoryLabel}</Kicker>
                <p className="mt-1 font-serif-display text-xl text-ink">{service.name}</p>
                <p className="mt-1 text-sm text-muted">{service.durationMin} min · {formatPrice(service.price)}</p>
              </div>
              <span className="rounded-full bg-olive-50 px-3 py-1 text-xs font-medium text-olive-700">
                Activo
              </span>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
