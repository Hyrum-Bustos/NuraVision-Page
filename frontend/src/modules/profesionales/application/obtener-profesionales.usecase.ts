import type { ProfesionalRepository } from '../domain/profesional.repository'
import type { Profesional } from '../domain/profesional.types'

/**
 * Caso de uso: obtener el listado de profesionales activos.
 *
 * Recibe el repositorio por inyeccion, asi que no sabe que detras hay
 * Supabase y admite un doble en memoria para tests.
 */
export async function obtenerProfesionales(
  repositorio: ProfesionalRepository,
): Promise<Profesional[]> {
  return repositorio.listarActivos()
}

/** Variante ya enlazada a un repositorio concreto. */
export function crearObtenerProfesionales(repositorio: ProfesionalRepository) {
  return (): Promise<Profesional[]> => obtenerProfesionales(repositorio)
}
