import type { Servicio } from './servicio.types'

/**
 * Puerto de acceso a servicios.
 *
 * El dominio declara QUE necesita; el COMO vive en infrastructure/. Gracias a
 * esto la capa de aplicacion no sabe que detras hay Supabase, y se puede
 * sustituir por un repositorio en memoria para tests sin tocar nada mas.
 */
export interface ServicioRepository {
  /** Servicios activos, ordenados por nombre. */
  listarActivos(): Promise<Servicio[]>

  /** Servicios activos asignados a un profesional. */
  listarPorProfesional(profesionalId: string): Promise<Servicio[]>

  /** `null` si no existe (no es un error: es una respuesta valida). */
  obtenerPorId(id: string): Promise<Servicio | null>

  /**
   * Varios servicios de una vez, para resolver nombres en un listado sin caer
   * en N+1. Incluye los inactivos a proposito: una reserva antigua puede
   * apuntar a un servicio dado de baja y su nombre debe seguir mostrandose.
   */
  listarPorIds(ids: string[]): Promise<Servicio[]>
}
