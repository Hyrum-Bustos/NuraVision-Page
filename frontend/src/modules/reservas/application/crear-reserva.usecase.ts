import type { ReservaRepository } from '../domain/reserva.repository'
import type { NuevaReserva } from '../domain/reserva.types'

/**
 * Caso de uso: crear una reserva.
 *
 * Valida lo que el dominio exige antes de tocar la base: que haya contacto y
 * que el bloque horario tenga sentido. La base tambien lo comprueba (hay
 * constraints y una politica de RLS), pero fallar aqui da un mensaje util en
 * vez de un error de Postgres.
 */
export async function crearReserva(
  repositorio: ReservaRepository,
  nueva: NuevaReserva,
): Promise<void> {
  if (!nueva.clienteEmail.trim()) {
    throw new Error('Necesitamos un correo para poder enviarte el detalle de la reserva.')
  }
  if (nueva.horaFin <= nueva.horaInicio) {
    throw new Error('El horario de la reserva no es válido.')
  }

  return repositorio.crear(nueva)
}
