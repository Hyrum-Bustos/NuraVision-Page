import type { Booking } from '../types'

/**
 * Programa de puntos para clientes registrados.
 *
 * ⚠️ REGLA PROVISIONAL. El cliente aún no define cómo quiere que funcione la
 * acumulación (cuántos puntos, si dependen del servicio o del monto, si
 * caducan, en qué se canjean). Lo que hay aquí es un marcador de posición
 * para poder mostrar el flujo completo.
 *
 * Todo lo que hay que cambiar cuando llegue la definición está en este
 * archivo: el resto de la aplicación solo llama a estas funciones.
 */

/** Un punto por cada $1.000 del servicio. */
const CLP_POR_PUNTO = 1000

/** Solo las atenciones efectivamente realizadas suman. */
function suma(booking: Booking): boolean {
  return booking.status === 'completada' && !booking.guest
}

/** Puntos que corresponden a un monto, sin considerar quién reservó. */
export function pointsForPrice(price: number): number {
  return Math.floor(price / CLP_POR_PUNTO)
}

/** Puntos que otorga una reserva. Una reserva sin cuenta no otorga ninguno. */
export function pointsForBooking(booking: Booking): number {
  return suma(booking) ? pointsForPrice(booking.price) : 0
}

export interface LoyaltySummary {
  /** Puntos disponibles. */
  points: number
  /** Atenciones completadas que sumaron. */
  completed: number
  /** Puntos que se perdieron por reservar sin cuenta. */
  missed: number
}

export function loyaltySummary(bookings: Booking[]): LoyaltySummary {
  let points = 0
  let completed = 0
  let missed = 0
  for (const booking of bookings) {
    if (suma(booking)) {
      points += pointsForBooking(booking)
      completed += 1
    } else if (booking.guest && booking.status === 'completada') {
      missed += pointsForPrice(booking.price)
    }
  }
  return { points, completed, missed }
}
