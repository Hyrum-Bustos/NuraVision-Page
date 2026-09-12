import type { Profesional } from './profesional.types'

/**
 * Puerto de acceso a profesionales.
 *
 * No expone un `listarPorServicio` a proposito. La tabla puente
 * `profesional_servicios` existe, pero su columna `profesional_id` es uuid
 * mientras que `profesionales.id` es bigint: los tipos no cruzan y no hay
 * clave foranea declarada, asi que hoy no hay forma de resolver que
 * profesional realiza que servicio. Agregar el metodo seria prometer algo
 * que el esquema no puede cumplir.
 */
export interface ProfesionalRepository {
  /** Profesionales activos, ordenados por nombre. */
  listarActivos(): Promise<Profesional[]>
}
