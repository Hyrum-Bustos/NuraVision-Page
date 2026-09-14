import type { ServicioRepository } from '../domain/servicio.repository'
import type { Servicio } from '../domain/servicio.types'

/**
 * Caso de uso: resolver varios servicios por id en una sola consulta.
 *
 * Pensado para listados (por ejemplo "mis reservas") donde hace falta el
 * nombre de cada servicio referenciado y consultarlos uno a uno seria N+1.
 */
export async function obtenerServiciosPorIds(
  repositorio: ServicioRepository,
  ids: string[],
): Promise<Servicio[]> {
  if (ids.length === 0) return []
  return repositorio.listarPorIds(ids)
}
