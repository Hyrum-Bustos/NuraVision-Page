import { useAppState } from '../state/AppState'
import { formatDayMonthShort } from '../lib/format'
import { StatusBadge } from './ui'
import type { Booking } from '../types'

export function BookingsTable({ bookings }: { bookings: Booking[] }) {
  const { getService, getProfessional } = useAppState()

  return (
    <div className="overflow-x-auto rounded-2xl border border-line-soft bg-paper">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-b border-line-soft bg-ivory/60 text-xs uppercase tracking-wide text-muted">
            <th className="px-6 py-4 font-medium">Código</th>
            <th className="px-6 py-4 font-medium">Cliente</th>
            <th className="px-6 py-4 font-medium">Servicio</th>
            <th className="px-6 py-4 font-medium">Profesional</th>
            <th className="px-6 py-4 font-medium">Fecha y hora</th>
            <th className="px-6 py-4 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft">
          {bookings.map((b) => {
            const service = getService(b.serviceId)
            const professional = getProfessional(b.professionalId)
            const { day, month } = formatDayMonthShort(b.dateISO)
            return (
              <tr key={b.id} className="transition-colors hover:bg-ivory/70">
                <td className="px-6 py-4 text-muted-light">{b.code}</td>
                <td className="px-6 py-4">
                  <p className="font-medium text-ink">{b.clientName}</p>
                  {/* Quien reserva sin cuenta solo deja su correo: el equipo
                      necesita verlo para poder contactarlo. */}
                  {b.guest && (
                    <p className="mt-0.5 text-xs text-muted">
                      <span className="rounded-full bg-line-soft px-2 py-0.5">Sin cuenta</span>{' '}
                      {b.clientEmail}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 text-ink">{service?.name ?? '—'}</td>
                <td className="px-6 py-4 text-ink">{professional?.name ?? '—'}</td>
                <td className="px-6 py-4 text-ink">
                  {day} {month} · {b.time}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={b.status} />
                </td>
              </tr>
            )
          })}
          {bookings.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted">
                No hay reservas para este filtro.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
