import { supabase } from '@/shared/infrastructure/supabase/client'
import type { ServicioRepository } from '../domain/servicio.repository'
import type { Servicio } from '../domain/servicio.types'
import { toServicio } from './servicio.mapper'

const TABLA = 'servicios'

/** Implementacion de `ServicioRepository` sobre Supabase. */
export class SupabaseServicioRepository implements ServicioRepository {
  async listarActivos(): Promise<Servicio[]> {
    const { data, error } = await supabase
      .from(TABLA)
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true })

    if (error) {
      throw new Error(`No se pudieron cargar los servicios: ${error.message}`)
    }

    return (data ?? []).map(toServicio)
  }

  async obtenerPorId(id: string): Promise<Servicio | null> {
    // La columna es bigint: un id no numerico nunca va a existir, y consultarlo
    // haria que PostgREST respondiera un 400. Los ids del prototipo eran slugs
    // ("manicure-ritual-nura"), asi que esos enlaces caen aqui y degradan a
    // "no encontrado". Se descarta la cadena vacia aparte, porque Number('')
    // es 0 y pasaria la comprobacion de entero.
    const idNumerico = Number(id)
    if (id.trim() === '' || !Number.isInteger(idNumerico)) {
      return null
    }

    const { data, error } = await supabase
      .from(TABLA)
      .select('*')
      .eq('id', idNumerico)
      .maybeSingle()

    if (error) {
      throw new Error(`No se pudo cargar el servicio ${id}: ${error.message}`)
    }

    return data ? toServicio(data) : null
  }
}

/** Instancia lista para usar; la app no necesita mas de una. */
export const servicioRepository = new SupabaseServicioRepository()
