import { getServiceById } from '../data/services'
import { getProfessionalById } from '../data/professionals'
import { formatDayMonthShort } from '../lib/format'
import { StatusBadge } from './ui'
import type { Booking } from '../types'

export function BookingsTable({ bookings }: { bookings: Booking[] }) {
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
            const service = getServiceById(b.serviceId)
            const professional = getProfessionalById(b.professionalId)
            const { day, month } = formatDayMonthShort(b.dateISO)
            return (
              <tr key={b.id}>
                <td className="px-6 py-4 text-muted-light">{b.code}</td>
                <td className="px-6 py-4 font-medium text-ink">{b.clientName}</td>
                <td className="px-6 py-4 text-ink">{service?.name}</td>
                <td className="px-6 py-4 text-ink">{professional?.name}</td>
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
