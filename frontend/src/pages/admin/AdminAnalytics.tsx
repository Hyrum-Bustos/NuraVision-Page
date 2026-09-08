import { monthlyBookingTrend, topServices } from '../../data/adminStats'
import { serviceCategories } from '../../data/seed'
import { useAppState } from '../../state/AppState'
import { Card } from '../../components/ui'

export default function AdminAnalytics() {
  const { services } = useAppState()
  const maxTrend = Math.max(...monthlyBookingTrend.map((m) => m.value))
  const maxServiceCount = Math.max(...topServices.map((s) => s.count))

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <h1 className="font-serif-display text-4xl text-ink">Analítica</h1>
      <p className="mt-2 text-sm text-muted">Visión general del desempeño del estudio.</p>

      <Card className="mt-8 p-6">
        <h2 className="font-serif-display text-2xl text-ink">Evolución de reservas</h2>
        <div className="mt-8 flex h-48 items-end gap-4">
          {monthlyBookingTrend.map((m) => (
            <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md bg-olive-100"
                style={{ height: `${(m.value / maxTrend) * 100}%` }}
              />
              <span className="text-xs text-muted">{m.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-serif-display text-2xl text-ink">Servicios más solicitados</h2>
          <div className="mt-6 space-y-4">
            {topServices.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink">{s.name}</span>
                  <span className="text-ink">{s.count}</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-line-soft">
                  <div
                    className="h-1.5 rounded-full bg-olive-600"
                    style={{ width: `${(s.count / maxServiceCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-serif-display text-2xl text-ink">Catálogo por categoría</h2>
          <div className="mt-6 space-y-4">
            {serviceCategories.map((c) => {
              const count = services.filter((s) => s.category === c.id).length
              return (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink">{c.label}</span>
                  <span className="rounded-full bg-line-soft px-3 py-1 text-xs text-muted">
                    {count} servicios
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
