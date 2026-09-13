import type { Disponibilidad } from '../domain/disponibilidad.types'
import type { ProfesionalRepository } from '../domain/profesional.repository'

/** Caso de uso: bloques de atencion de un profesional. */
export async function obtenerDisponibilidad(
  repositorio: ProfesionalRepository,
  profesionalId: string,
): Promise<Disponibilidad[]> {
  return repositorio.listarDisponibilidad(profesionalId)
}
