import type { ServicioRepository } from '../domain/servicio.repository'
import type { Servicio } from '../domain/servicio.types'

/**
 * Caso de uso: obtener un servicio por su id.
 *
 * Devuelve `null` cuando no existe. No lo trata como error: que el visitante
 * pida un id inexistente es un caso normal, no un fallo del sistema, y la UI
 * necesita distinguirlo de una caida de red para mostrar el mensaje correcto.
 */
export async function obtenerServicioPorId(
  repositorio: ServicioRepository,
  id: string,
): Promise<Servicio | null> {
  return repositorio.obtenerPorId(id)
}

/** Variante ya enlazada a un repositorio concreto. */
export function crearObtenerServicioPorId(repositorio: ServicioRepository) {
  return (id: string): Promise<Servicio | null> => obtenerServicioPorId(repositorio, id)
}
