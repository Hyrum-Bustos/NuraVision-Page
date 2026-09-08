import { useAppState } from '../../state/AppState'
import { AppImage, Card } from '../../components/ui'

export default function AdminProfessionals() {
  const { bookings, professionals } = useAppState()

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <h1 className="font-serif-display text-4xl text-ink">Profesionales</h1>
      <p className="mt-2 text-sm text-muted">Equipo del estudio y su carga de trabajo.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {professionals.map((p) => {
          const activeBookings = bookings.filter(
            (b) => b.professionalId === p.id && b.status !== 'cancelada',
          ).length
          return (
            <Card key={p.id} className="flex gap-4 p-5">
              <AppImage
                src={p.imageUrl}
                label="Retrato"
                alt={p.name}
                className="aspect-square w-20 shrink-0 rounded-xl"
              />
              <div>
                <p className="font-serif-display text-xl text-ink">{p.name}</p>
                <p className="text-sm text-muted">{p.role}</p>
                <p className="mt-2 text-xs text-muted-light">
                  {p.serviceIds.length} servicios · {activeBookings} reservas activas
                </p>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
