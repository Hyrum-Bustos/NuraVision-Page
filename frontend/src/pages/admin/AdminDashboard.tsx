import { useMemo, useState } from 'react'
import { useAppState } from '../../state/AppState'
import { getProfessionalById } from '../../data/professionals'
import { professionals } from '../../data/professionals'
import { dashboardStats, monthlyBookingTrend, topServices } from '../../data/adminStats'
import { BookingsTable } from '../../components/BookingsTable'
import { Card, StatCard } from '../../components/ui'
import type { BookingStatus } from '../../types'

const STATUS_OPTIONS: { value: BookingStatus | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'completada', label: 'Completada' },
  { value: 'cancelada', label: 'Cancelada' },
]

export default function AdminDashboard() {
  const { bookings } = useAppState()
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'todos'>('todos')
  const [professionalFilter, setProfessionalFilter] = useState<'todos' | string>('todos')

  const filtered = useMemo(() => {
    return bookings
      .filter((b) => statusFilter === 'todos' || b.status === statusFilter)
      .filter((b) => professionalFilter === 'todos' || b.professionalId === professionalFilter)
      .sort((a, b) => (a.dateISO + a.time < b.dateISO + b.time ? 1 : -1))
      .slice(0, 8)
  }, [bookings, statusFilter, professionalFilter])

  const maxTrend = Math.max(...monthlyBookingTrend.map((m) => m.value))
  const maxServiceCount = Math.max(...topServices.map((s) => s.count))

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <h1 className="font-serif-display text-4xl text-ink">Dashboard</h1>
      <p className="mt-2 text-sm text-muted">Estudio Nura · 1 de septiembre, 2026</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Reservas del mes"
          value={String(dashboardStats.reservasDelMes.value)}
          caption={dashboardStats.reservasDelMes.delta}
          captionTone="positive"
        />
        <StatCard
          label="Reservas hoy"
          value={String(dashboardStats.reservasHoy.value)}
          caption={dashboardStats.reservasHoy.caption}
        />
        <StatCard
          label="Clientes registrados"
          value={dashboardStats.clientesRegistrados.value.toLocaleString('es-CL')}
          caption={dashboardStats.clientesRegistrados.delta}
          captionTone="positive"
        />
        <StatCard
          label="Tasa de cancelación"
          value={dashboardStats.tasaCancelacion.value}
          caption={dashboardStats.tasaCancelacion.delta}
          captionTone="negative"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif-display text-2xl text-ink">Evolución de reservas</h2>
            <span className="text-sm text-muted">Marzo - septiembre</span>
          </div>
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
      </div>

      <div className="mt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-serif-display text-2xl text-ink">Reservas recientes</h2>
          <div className="flex flex-wrap gap-3">
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
                  {getProfessionalById(p.id)?.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <BookingsTable bookings={filtered} />
      </div>
    </div>
  )
}
