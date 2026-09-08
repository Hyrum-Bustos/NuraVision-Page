import { useMemo } from 'react'
import { useAppState } from '../../state/AppState'
import { formatDayMonthShort } from '../../lib/format'
import { StatusBadge } from '../../components/ui'

export default function ProHistory() {
  const { currentUser, bookings, getService } = useAppState()
  const professionalId = currentUser?.professionalId ?? ''

  const mine = useMemo(
    () =>
      bookings
        .filter((b) => b.professionalId === professionalId)
        .sort((a, b) => (a.dateISO + a.time < b.dateISO + b.time ? 1 : -1)),
    [bookings, professionalId],
  )

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <h1 className="font-serif-display text-4xl text-ink">Reservas e historial</h1>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-line-soft bg-paper">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line-soft bg-ivory/60 text-xs uppercase tracking-wide text-muted">
              <th className="px-6 py-4 font-medium">Código</th>
              <th className="px-6 py-4 font-medium">Cliente</th>
              <th className="px-6 py-4 font-medium">Servicio</th>
              <th className="px-6 py-4 font-medium">Fecha y hora</th>
              <th className="px-6 py-4 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {mine.map((b) => {
              const service = getService(b.serviceId)
              const { day, month } = formatDayMonthShort(b.dateISO)
              return (
                <tr key={b.id}>
                  <td className="px-6 py-4 text-muted-light">{b.code.split('-').slice(-1)[0]}</td>
                  <td className="px-6 py-4 font-medium text-ink">{b.clientName}</td>
                  <td className="px-6 py-4 text-ink">{service?.name ?? '—'}</td>
                  <td className="px-6 py-4 text-ink">
                    {day} {month} · {b.time}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              )
            })}
            {mine.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted">
                  Todavía no tienes reservas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
