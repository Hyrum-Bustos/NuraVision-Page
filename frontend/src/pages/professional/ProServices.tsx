import { useAppState } from '@/shared/state/AppState'
import { categoryLabel } from '@/modules/servicios/domain/serviceCategories'
import { AppImage, Card, Kicker } from '@/shared/ui/ui'
import { formatPrice } from '@/shared/lib/format'

export default function ProServices() {
  const { currentUser, getProfessional, getService } = useAppState()
  const professional = getProfessional(currentUser?.professionalId ?? '')

  if (!professional) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
        <p className="text-sm text-muted">No encontramos tu ficha de profesional.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <h1 className="font-serif-display text-4xl text-ink">Mis servicios</h1>
      <p className="mt-2 text-sm text-muted">
        Servicios del catálogo que realizas actualmente. La administración del estudio define
        precios y duraciones.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {professional.serviceIds.map((id) => {
          const service = getService(id)
          if (!service) return null
          return (
            <Card key={id} className="flex items-center gap-4 p-5">
              <AppImage
                src={service.imageUrl}
                label={service.name.split(' ')[0].toUpperCase()}
                alt={service.name}
                className="h-16 w-16 shrink-0 rounded-xl"
              />
              <div className="flex-1">
                <Kicker>{categoryLabel(service.category)}</Kicker>
                <p className="mt-1 font-serif-display text-xl text-ink">{service.name}</p>
                <p className="mt-1 text-sm text-muted">
                  {service.durationMin} min · {formatPrice(service.price)}
                </p>
              </div>
              <span className="rounded-full bg-olive-50 px-3 py-1 text-xs font-medium text-olive-700">
                Activo
              </span>
            </Card>
          )
        })}
      </div>

      {professional.serviceIds.length === 0 && (
        <p className="mt-8 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
          Aún no tienes servicios asignados.
        </p>
      )}
    </div>
  )
}
