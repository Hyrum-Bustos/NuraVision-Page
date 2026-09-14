import type { Tables } from '@/shared/types/supabase'
import type { Profesional } from '../domain/profesional.types'

export type ProfesionalRow = Tables<'profesionales'>

/** Fila de la base de datos -> entidad de dominio. */
export function toProfesional(row: ProfesionalRow): Profesional {
  return {
    id: String(row.id),
    nombre: row.nombre,
    especialidad: row.especialidad,
    // Se normaliza la cadena vacia a null: para la vista son el mismo caso
    // (no hay foto) y asi no hay que comprobar los dos.
    avatarUrl: row.avatar_url?.trim() ? row.avatar_url : null,
    activo: row.activo,
  }
}
