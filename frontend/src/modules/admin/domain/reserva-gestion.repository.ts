import type { FiltrosReservas, ReservaGestion } from './reserva-gestion.types'

/**
 * Puerto de gestion de reservas para el estudio.
 *
 * A diferencia del puerto de `reservas`, este SI lista las de todo el mundo:
 * es el punto del sistema donde eso es legitimo. Que lo sea de verdad depende
 * de las politicas de la base, no de este archivo, y hoy NO EXISTE una que
 * permita a nadie leer reservas ajenas ni confirmarlas (ver el README del
 * modulo). Hasta que exista, las dos operaciones devuelven vacio o fallan.
 */
export interface ReservaGestionRepository {
  /** Reservas que cumplen los filtros, de la mas reciente a la mas antigua. */
  listar(filtros: FiltrosReservas): Promise<ReservaGestion[]>

  /** Pasa la reserva a 'confirmada' y devuelve la fila actualizada. */
  confirmar(id: string): Promise<ReservaGestion>
}
