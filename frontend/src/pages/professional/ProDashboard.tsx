import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../state/AppState'
import { TODAY_ISO } from '../../data/bookings'
import { getServiceById } from '../../data/services'
import { getScheduleBlocks } from '../../lib/availability'
import { formatWeekdayLong } from '../../lib/format'
import { Button, Card, StatCard, StatusBadge } from '../../components/ui'

export default function ProDashboard() {
  const { currentUser, bookings } = useAppState()
  const navigate = useNavigate()
  const professionalId = currentUser!.professionalId!

  const today = useMemo(
    () =>
      bookings
        .filter((b) => b.professionalId === professionalId && b.dateISO === TODAY_ISO)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [bookings, professionalId],
  )

  const week = useMemo(
    () => bookings.filter((b) => b.professionalId === professionalId && b.dateISO.startsWith('2026-09')),
    [bookings, professionalId],
  )

  const blocks = useMemo(() => getScheduleBlocks(TODAY_ISO, professionalId), [professionalId])
  const freeBlocks = blocks.filter((b) => b.type === 'libre')
  const occupiedMinutes = today.reduce((sum, b) => sum + b.durationMin, 0)
  const inProgress = today.filter((b) => b.status === 'en_curso').length

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-4xl text-ink">Buenos días, {currentUser!.firstName}</h1>
          <p className="mt-2 text-sm capitalize text-muted">
            {formatWeekdayLong(TODAY_ISO)} · {today.length} atenciones programadas
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => navigate('/profesional/disponibilidad')}>
            Configurar disponibilidad
          </Button>
          <Button onClick={() => navigate('/profesional/agenda')}>Ver mi agenda</Button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Atenciones hoy" value={String(today.length)} caption={`${inProgress} en curso`} />
        <StatCard
          label="Horas ocupadas"
          value={`${(occupiedMinutes / 60).toFixed(1).replace('.', ',')} / 8`}
          caption={`${Math.round((occupiedMinutes / 60 / 8) * 100)}% de la jornada`}
        />
        <StatCard label="Esta semana" value={String(week.length)} caption="reservas de septiembre" />
        <StatCard
          label="Bloques libres hoy"
          value={String(freeBlocks.length)}
          caption={freeBlocks.map((b) => b.start).join(' · ') || 'Sin bloques libres'}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 font-serif-display text-2xl text-ink">Hoy</h2>
          <Card className="divide-y divide-line-soft">
            {today.map((b) => {
              const service = getServiceById(b.serviceId)
              return (
                <div key={b.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <span className="w-14 text-sm font-medium text-ink">{b.time}</span>
                    <div>
                      <p className="text-sm font-medium text-ink">{service?.name}</p>
                      <p className="text-xs text-muted">{b.clientName}</p>
                    </div>
                  </div>
                  {(b.status === 'completada' || b.status === 'en_curso') && (
                    <StatusBadge status={b.status} />
                  )}
                </div>
              )
            })}
            {today.length === 0 && <p className="p-4 text-sm text-muted">Sin atenciones hoy.</p>}
          </Card>
        </div>

        <div>
          <h2 className="mb-3 font-serif-display text-2xl text-ink">Bloques libres hoy</h2>
          <Card className="p-4">
            <div className="space-y-2">
              {blocks
                .filter((b) => b.type !== 'bloqueado')
                .map((b, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm ${
                      b.type === 'colacion' ? 'placeholder-stripes text-muted' : 'bg-olive-50 text-ink'
                    }`}
                  >
                    <span>
                      {b.start} – {b.end}
                    </span>
                    <span className="text-xs">{b.type === 'colacion' ? 'Colación' : `${b.minutes} min libres`}</span>
                  </div>
                ))}
            </div>
            <Button variant="outline" full className="mt-4">
              Bloquear un tramo
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
