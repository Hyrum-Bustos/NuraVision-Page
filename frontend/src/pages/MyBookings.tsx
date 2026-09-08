import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../state/AppState'
import { StatusBadge, UnderlineTabs } from '../components/ui'
import { formatDayMonthShort, formatPrice } from '../lib/format'

type Tab = 'proximas' | 'completadas' | 'canceladas'

const TABS: { value: Tab; label: string }[] = [
  { value: 'proximas', label: 'Próximas' },
  { value: 'completadas', label: 'Completadas' },
  { value: 'canceladas', label: 'Canceladas' },
]

export default function MyBookings() {
  const { currentUser, bookings, getService, getProfessional } = useAppState()
  const [tab, setTab] = useState<Tab>('proximas')

  const mine = useMemo(
    () => bookings.filter((b) => b.clientName === currentUser?.name),
    [bookings, currentUser],
  )

  const filtered = useMemo(() => {
    if (tab === 'proximas') return mine.filter((b) => b.status === 'confirmada' || b.status === 'en_curso')
    if (tab === 'completadas') return mine.filter((b) => b.status === 'completada')
    return mine.filter((b) => b.status === 'cancelada')
  }, [mine, tab])

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="font-serif-display text-5xl text-ink">Mis reservas</h1>

      <div className="mt-8">
        <UnderlineTabs options={TABS} value={tab} onChange={setTab} />
      </div>

      <div className="mt-8 space-y-4">
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">
            No tienes reservas en esta categoría.
          </p>
        )}
        {filtered.map((b) => {
          const service = getService(b.serviceId)
          const professional = getProfessional(b.professionalId)
          const { day, month } = formatDayMonthShort(b.dateISO)
          return (
            <div
              key={b.id}
              className="flex flex-wrap items-center gap-6 rounded-2xl border border-line-soft bg-paper p-6"
            >
              <div className="text-center">
                <p className="font-serif-display text-3xl text-ink">{day}</p>
                <p className="text-xs uppercase tracking-wide text-muted">{month}</p>
              </div>
              <div className="min-w-[200px] flex-1">
                <div className="flex items-center gap-3">
                  <p className="font-medium text-ink">{service?.name ?? 'Servicio no disponible'}</p>
                  <StatusBadge status={b.status} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {professional?.name ?? '—'} · {b.time} · {b.durationMin} min ·{' '}
                  {formatPrice(b.price)}
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  to={`/mis-reservas/${b.id}`}
                  className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink hover:bg-ivory"
                >
                  Detalle
                </Link>
                {(b.status === 'confirmada' || b.status === 'en_curso') && (
                  <Link
                    to={`/mis-reservas/${b.id}`}
                    className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink hover:bg-ivory"
                  >
                    Reprogramar
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
