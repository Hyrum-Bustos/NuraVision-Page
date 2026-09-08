import { useMemo, useState } from 'react'
import { useAppState } from '../../state/AppState'
import { professionals } from '../../data/professionals'
import { BookingsTable } from '../../components/BookingsTable'
import type { BookingStatus } from '../../types'

const STATUS_OPTIONS: { value: BookingStatus | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'completada', label: 'Completada' },
  { value: 'cancelada', label: 'Cancelada' },
]

export default function AdminBookings() {
  const { bookings } = useAppState()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'todos'>('todos')
  const [professionalFilter, setProfessionalFilter] = useState<'todos' | string>('todos')

  const filtered = useMemo(() => {
    return bookings
      .filter((b) => statusFilter === 'todos' || b.status === statusFilter)
      .filter((b) => professionalFilter === 'todos' || b.professionalId === professionalFilter)
      .filter((b) => b.clientName.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (a.dateISO + a.time < b.dateISO + b.time ? 1 : -1))
  }, [bookings, statusFilter, professionalFilter, search])

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <h1 className="font-serif-display text-4xl text-ink">Reservas</h1>
      <p className="mt-2 text-sm text-muted">Todas las reservas del estudio, en un solo lugar.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cliente…"
          className="w-56 rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink outline-none focus:border-ink"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'todos')}
          className="rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={professionalFilter}
          onChange={(e) => setProfessionalFilter(e.target.value)}
          className="rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink"
        >
          <option value="todos">Todos los profesionales</option>
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <BookingsTable bookings={filtered} />
      </div>
    </div>
  )
}
