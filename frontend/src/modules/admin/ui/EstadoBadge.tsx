import type { EstadoReserva } from '../domain/reserva-gestion.types'

/**
 * Insignia de estado propia del modulo.
 *
 * No se reutiliza `StatusBadge` de shared/ui porque tipa su prop como
 * `BookingStatus`, que es el vocabulario del prototipo: tiene 'en_curso' y NO
 * tiene 'pendiente'. La base usa el enum `estado_reserva`, donde pasa lo
 * contrario. Forzar uno en el otro obligaria a inventar una equivalencia para
 * 'pendiente', y cualquiera que se elija miente sobre el estado real.
 *
 * Cuando el prototipo desaparezca y quede un solo vocabulario, las dos
 * insignias se pueden unificar.
 */
const ESTILOS: Record<EstadoReserva, string> = {
  pendiente: 'bg-line-soft text-ink',
  confirmada: 'bg-olive-50 text-olive-700',
  completada: 'bg-line-soft text-muted',
  cancelada: 'bg-danger-soft text-danger',
}

const ETIQUETAS: Record<EstadoReserva, string> = {
  pendiente: 'Por confirmar',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
}

export function EstadoBadge({ estado }: { estado: EstadoReserva }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${ESTILOS[estado]}`}>
      {ETIQUETAS[estado]}
    </span>
  )
}
