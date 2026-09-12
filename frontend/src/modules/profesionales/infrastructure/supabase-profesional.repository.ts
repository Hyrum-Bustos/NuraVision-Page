import { supabase } from '@/shared/infrastructure/supabase/client'
import type { ProfesionalRepository } from '../domain/profesional.repository'
import type { Profesional } from '../domain/profesional.types'
import { toProfesional } from './profesional.mapper'

const TABLA = 'profesionales'

/** Implementacion de `ProfesionalRepository` sobre Supabase. */
export class SupabaseProfesionalRepository implements ProfesionalRepository {
  async listarActivos(): Promise<Profesional[]> {
    const { data, error } = await supabase
      .from(TABLA)
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true })

    if (error) {
      throw new Error(`No se pudieron cargar los profesionales: ${error.message}`)
    }

    return (data ?? []).map(toProfesional)
  }
}

/** Instancia lista para usar; la app no necesita mas de una. */
export const profesionalRepository = new SupabaseProfesionalRepository()
