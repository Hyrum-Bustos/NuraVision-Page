import type { Disponibilidad } from './disponibilidad.types'
import type { Profesional } from './profesional.types'

/** Puerto de acceso a profesionales y sus horarios. */
export interface ProfesionalRepository {
  /** Profesionales activos, ordenados por nombre. */
  listarActivos(): Promise<Profesional[]>

  /**
   * Profesionales activos que realizan un servicio, via la tabla puente
   * `profesional_servicios`. Lista vacia si nadie lo tiene asignado.
   */
  listarPorServicio(servicioId: string): Promise<Profesional[]>

  /** Bloques de atencion de un profesional, ordenados por dia y hora. */
  listarDisponibilidad(profesionalId: string): Promise<Disponibilidad[]>
}
