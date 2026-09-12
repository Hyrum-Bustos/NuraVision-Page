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

  /**
   * Varios profesionales de una vez, para resolver nombres en un listado sin
   * caer en N+1. Incluye los inactivos a proposito: una reserva antigua puede
   * apuntar a alguien que ya no atiende y su nombre debe seguir mostrandose.
   */
  listarPorIds(ids: string[]): Promise<Profesional[]>

  /** Bloques de atencion de un profesional, ordenados por dia y hora. */
  listarDisponibilidad(profesionalId: string): Promise<Disponibilidad[]>
}
