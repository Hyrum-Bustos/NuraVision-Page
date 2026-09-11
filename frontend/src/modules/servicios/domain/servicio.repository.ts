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

  /** `null` si no existe (no es un error: es una respuesta valida). */
  obtenerPorId(id: string): Promise<Servicio | null>
}
