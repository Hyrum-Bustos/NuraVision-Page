import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarX } from 'lucide-react'
import { useAppState } from '@/shared/state/AppState'
import { EmptyState, LinkButton, StatusBadge, UnderlineTabs } from '@/shared/ui/ui'
import { formatDayMonthShort, formatPrice } from '@/shared/lib/format'
import { useServiciosPorIds } from '@/modules/servicios/ui/useServiciosPorIds'
import { useProfesionalesPorIds } from '@/modules/profesionales/ui/useProfesionalesPorIds'

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

  // Una sola consulta por listado, no una por reserva.
  const servicios = useServiciosPorIds(mine.map((b) => b.serviceId))
  const profesionales = useProfesionalesPorIds(mine.map((b) => b.professionalId))

  /**
   * La base manda; los datos de ejemplo quedan de puente.
   *
   * Las reservas creadas antes de la migracion guardan ids del prototipo
   * ("manicure-ritual-nura"), que no existen en la base y nunca van a
   * resolverse contra ella. Sin este respaldo esas filas mostrarian un hueco.
   * Es transitorio: se puede quitar cuando se limpien los datos locales.
   */
  function nombreServicio(serviceId: string): string {
    const deLaBase = servicios.porId.get(serviceId)?.nombre
    if (deLaBase) return deLaBase
    const deLosSeeds = getService(serviceId)?.name
    if (deLosSeeds) return deLosSeeds
    return servicios.cargando ? 'Cargando…' : 'Servicio no disponible'
  }

  function nombreProfesional(professionalId: string): string {
    const deLaBase = profesionales.porId.get(professionalId)?.nombre
    if (deLaBase) return deLaBase
    const deLosSeeds = getProfessional(professionalId)?.name
    if (deLosSeeds) return deLosSeeds
    return profesionales.cargando ? 'Cargando…' : 'Profesional no disponible'
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="font-serif-display text-5xl text-ink">Mis reservas</h1>

      <div className="mt-8">
        <UnderlineTabs options={TABS} value={tab} onChange={setTab} />
      </div>

      <div className="mt-8 space-y-4">
        {filtered.length === 0 && (
          <EmptyState
            icon={CalendarX}
            title={
              tab === 'proximas'
                ? 'No tienes reservas próximas'
                : tab === 'completadas'
                  ? 'Todavía no hay reservas completadas'
                  : 'No tienes reservas canceladas'
            }
            description={
              tab === 'proximas'
                ? 'Cuando reserves una hora, aparecerá aquí con su detalle.'
                : undefined
            }
            action={tab === 'proximas' ? <LinkButton to="/reservar">Reservar ahora</LinkButton> : undefined}
          />
        )}
        {filtered.map((b) => {
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
                  <p className="font-medium text-ink">{nombreServicio(b.serviceId)}</p>
                  <StatusBadge status={b.status} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {nombreProfesional(b.professionalId)} · {b.time} · {b.durationMin} min ·{' '}
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
