import type { ProfesionalRepository } from '../domain/profesional.repository'
import type { Profesional } from '../domain/profesional.types'

/**
 * Caso de uso: resolver varios profesionales por id en una sola consulta.
 *
 * Pensado para listados donde hace falta el nombre de cada profesional
 * referenciado y consultarlos uno a uno seria N+1.
 */
export async function obtenerProfesionalesPorIds(
  repositorio: ProfesionalRepository,
  ids: string[],
): Promise<Profesional[]> {
  if (ids.length === 0) return []
  return repositorio.listarPorIds(ids)
}
