import type { ProfesionalRepository } from '../domain/profesional.repository'
import type { Profesional } from '../domain/profesional.types'

/**
 * Caso de uso: profesionales que realizan un servicio.
 *
 * Una lista vacia es una respuesta valida (nadie asignado todavia), no un
 * error: la UI debe poder distinguirla de un fallo de red.
 */
export async function obtenerProfesionalesPorServicio(
  repositorio: ProfesionalRepository,
  servicioId: string,
): Promise<Profesional[]> {
  return repositorio.listarPorServicio(servicioId)
}
