import { useMemo, useState } from 'react'
import { CalendarCheck, Clock, TrendingDown, Users } from 'lucide-react'
import { useAppState } from '../../state/AppState'
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
  const { bookings, professionals } = useAppState()
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
          icon={CalendarCheck}
        />
        <StatCard
          label="Reservas hoy"
          value={String(dashboardStats.reservasHoy.value)}
          caption={dashboardStats.reservasHoy.caption}
          icon={Clock}
        />
        <StatCard
          label="Clientes registrados"
          value={dashboardStats.clientesRegistrados.value.toLocaleString('es-CL')}
          caption={dashboardStats.clientesRegistrados.delta}
          captionTone="positive"
          icon={Users}
        />
        <StatCard
          label="Tasa de cancelación"
          value={dashboardStats.tasaCancelacion.value}
          caption={dashboardStats.tasaCancelacion.delta}
          captionTone="negative"
          icon={TrendingDown}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif-display text-2xl text-ink">Evolución de reservas</h2>
            <span className="text-sm text-muted">Marzo - septiembre</span>
          </div>
          {/* La fila no usa items-end: cada columna debe estirarse para que la
              altura porcentual de la barra tenga una referencia definida. */}
          <div className="mt-8 flex h-52 gap-4">
            {monthlyBookingTrend.map((m, i) => (
              <div key={m.label} className="group flex flex-1 flex-col">
                <div className="flex flex-1 items-end">
                  <div
                    title={`${m.label}: ${m.value} reservas`}
                    className="animate-grow-bar w-full rounded-t-md bg-olive-100 transition-colors group-hover:bg-olive-400"
                    style={{
                      height: `${(m.value / maxTrend) * 100}%`,
                      animationDelay: `${i * 60}ms`,
                    }}
                  />
                </div>
                <span className="mt-2 text-center text-xs text-muted">{m.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-serif-display text-2xl text-ink">Servicios más solicitados</h2>
          <div className="mt-6 space-y-4">
            {topServices.map((s, i) => (
              <div key={s.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink">{s.name}</span>
                  <span className="text-ink">{s.count}</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line-soft">
                  <div
                    className="animate-grow-width h-1.5 rounded-full bg-olive-600"
                    style={{
                      width: `${(s.count / maxServiceCount) * 100}%`,
                      animationDelay: `${i * 80}ms`,
                    }}
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
                  {p.name}
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
