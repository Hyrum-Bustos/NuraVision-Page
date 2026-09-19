import { useMemo, useState } from 'react'
import { useProfesionales } from '@/modules/profesionales/ui/useProfesionales'
import { useServiciosPorIds } from '@/modules/servicios/ui/useServiciosPorIds'
import { useProfesionalesPorIds } from '@/modules/profesionales/ui/useProfesionalesPorIds'
import { Button } from '@/shared/ui/ui'
import { formatLongDate } from '@/shared/lib/format'
import { ESTADOS_FILTRABLES, esConfirmable } from '../application'
import type { EstadoReserva, FiltrosReservas } from '../domain/reserva-gestion.types'
import { EstadoBadge } from './EstadoBadge'
import { useReservasGestion } from './useReservasGestion'

const TODOS = 'todos'

const ETIQUETA_ESTADO: Record<EstadoReserva, string> = {
  pendiente: 'Por confirmar',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
}

/**
 * Listado de reservas del estudio, con filtros y confirmacion.
 *
 * Los filtros se aplican en la base, no sobre una lista ya traida: el estudio
 * puede acumular miles de reservas y filtrar en memoria dejaria de funcionar
 * mucho antes de que se note.
 */
export default function AdminReservas() {
  const [estado, setEstado] = useState<EstadoReserva | typeof TODOS>(TODOS)
  const [profesionalId, setProfesionalId] = useState<string>(TODOS)
  const [busqueda, setBusqueda] = useState('')

  const filtros: FiltrosReservas = {
    estado: estado === TODOS ? undefined : estado,
    profesionalId: profesionalId === TODOS ? undefined : profesionalId,
  }

  const { reservas, cargando, error, confirmando, errorConfirmar, confirmar, recargar } =
    useReservasGestion(filtros)

  // El desplegable de profesionales sale del equipo completo, no de quienes
  // aparecen en el listado: si no, filtrar por una profesional sin reservas
  // seria imposible porque su nombre no estaria en la lista.
  const equipo = useProfesionales()

  // Una sola consulta por listado, no una por fila.
  const servicios = useServiciosPorIds(reservas.map((r) => r.servicioId))
  const profesionales = useProfesionalesPorIds(reservas.map((r) => r.profesionalId))

  /**
   * La busqueda por nombre si se hace en memoria, y a proposito: es un filtro
   * de tecleo que cambia en cada pulsacion, y mandarlo a la base seria una
   * consulta por letra. Actua sobre lo que los filtros ya acotaron.
   */
  const visibles = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    if (!termino) return reservas
    return reservas.filter(
      (r) =>
        r.clienteNombre.toLowerCase().includes(termino) ||
        r.codigo.toLowerCase().includes(termino),
    )
  }, [reservas, busqueda])

  const pendientes = reservas.filter((r) => r.estado === 'pendiente').length

  function nombreServicio(id: string): string {
    return servicios.porId.get(id)?.nombre ?? (servicios.cargando ? 'Cargando…' : '—')
  }

  function nombreProfesional(id: string): string {
    return profesionales.porId.get(id)?.nombre ?? (profesionales.cargando ? 'Cargando…' : '—')
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <h1 className="font-serif-display text-4xl text-ink">Reservas</h1>
      <p className="mt-2 text-sm text-muted">
        Todas las reservas del estudio, leídas de la base de datos.
        {pendientes > 0 && (
          <>
            {' '}
            Hay <strong className="text-ink">{pendientes}</strong>{' '}
            {pendientes === 1 ? 'reserva pendiente' : 'reservas pendientes'} de confirmar.
          </>
        )}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por cliente o código…"
          className="w-60 rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink outline-none focus:border-ink"
        />

        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value as EstadoReserva | typeof TODOS)}
          aria-label="Filtrar por estado"
          className="rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink"
        >
          <option value={TODOS}>Todos los estados</option>
          {ESTADOS_FILTRABLES.map((e) => (
            <option key={e} value={e}>
              {ETIQUETA_ESTADO[e]}
            </option>
          ))}
        </select>

        <select
          value={profesionalId}
          onChange={(e) => setProfesionalId(e.target.value)}
          aria-label="Filtrar por profesional"
          className="rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink"
        >
          <option value={TODOS}>Todos los profesionales</option>
          {equipo.profesionales.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>

        <button
          onClick={recargar}
          className="rounded-full border border-line px-4 py-2 text-sm text-ink hover:bg-ivory"
        >
          Actualizar
        </button>
      </div>

      {/* Un fallo al confirmar se informa arriba de la tabla, donde se ve sin
          desplazarse, y la fila sigue disponible para reintentar. */}
      {errorConfirmar && (
        <p className="mt-6 rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink">
          {errorConfirmar}
        </p>
      )}

      {cargando && (
        <p className="mt-8 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
          Cargando reservas…
        </p>
      )}

      {!cargando && error && (
        <div className="mt-8 rounded-2xl border border-dashed border-line p-10 text-center">
          <p className="text-sm text-ink">{error}</p>
          <button
            onClick={recargar}
            className="mt-4 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink hover:bg-ivory"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Sin política de RLS para el personal, la base responde "cero filas"
          en vez de un error. Vacío y sin permiso son indistinguibles desde
          aquí, así que se nombran los dos en vez de afirmar solo uno. */}
      {!cargando && !error && reservas.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-line p-10 text-center">
          <p className="font-medium text-ink">No hay reservas que mostrar</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            O no hay ninguna que cumpla estos filtros, o la base todavía no permite al estudio
            leer reservas ajenas. Row Level Security no distingue los dos casos: cuando falta la
            política, devuelve una lista vacía en vez de un error.
          </p>
        </div>
      )}

      {!cargando && !error && reservas.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-line-soft bg-paper">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-line-soft bg-ivory/60 text-xs uppercase tracking-wide text-muted">
                <th className="px-6 py-4 font-medium">Código</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Servicio</th>
                <th className="px-6 py-4 font-medium">Profesional</th>
                <th className="px-6 py-4 font-medium">Fecha y hora</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {visibles.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-4 text-xs tracking-wide text-muted-light">{r.codigo}</td>
                  <td className="px-6 py-4">
                    <p className="text-ink">{r.clienteNombre}</p>
                    <p className="text-xs text-muted">{r.clienteEmail}</p>
                    {/* Una reserva de invitada no tiene cuenta asociada: el
                        contacto es el único vínculo con ella. */}
                    {r.clienteId === null && (
                      <p className="mt-0.5 text-xs text-muted-light">Sin cuenta</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-ink">{nombreServicio(r.servicioId)}</td>
                  <td className="px-6 py-4 text-ink">{nombreProfesional(r.profesionalId)}</td>
                  <td className="px-6 py-4 text-ink">
                    <p className="first-letter:uppercase">{formatLongDate(r.fecha)}</p>
                    <p className="text-xs text-muted">
                      {r.horaInicio}–{r.horaFin} h
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <EstadoBadge estado={r.estado} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {esConfirmable(r) && (
                      <Button
                        variant="olive"
                        className="px-4 py-2 text-xs"
                        disabled={confirmando === r.id}
                        onClick={() => void confirmar(r)}
                      >
                        {confirmando === r.id ? 'Confirmando…' : 'Confirmar'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {visibles.length === 0 && (
            <p className="px-6 py-10 text-center text-sm text-muted">
              Ninguna reserva coincide con «{busqueda}».
            </p>
          )}
        </div>
      )}
    </div>
  )
}
