import { supabase } from '@/shared/infrastructure/supabase/client'
import type { Disponibilidad } from '../domain/disponibilidad.types'
import type { ProfesionalRepository } from '../domain/profesional.repository'
import type { Profesional } from '../domain/profesional.types'
import { toDisponibilidad } from './disponibilidad.mapper'
import { toProfesional } from './profesional.mapper'

const TABLA = 'profesionales'
const TABLA_PUENTE = 'profesional_servicios'
const TABLA_DISPONIBILIDAD = 'disponibilidad'

/** Los ids del dominio son string; las columnas son bigint. */
function aIdNumerico(id: string): number | null {
  const numero = Number(id)
  return id.trim() !== '' && Number.isInteger(numero) ? numero : null
}

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

  /**
   * Se resuelve en dos consultas en vez de un embedded select. Hay clave
   * foranea declarada y el join funcionaria, pero estos tipos estan escritos
   * a mano y su array `Relationships` esta vacio, que es de donde supabase-js
   * deduce el tipo del anidado. Dos consultas simples se tipan solas; cuando
   * el archivo se genere con `supabase gen types`, conviene volver al join.
   */
  async listarPorServicio(servicioId: string): Promise<Profesional[]> {
    const idServicio = aIdNumerico(servicioId)
    if (idServicio === null) return []

    const { data: vinculos, error: errorVinculos } = await supabase
      .from(TABLA_PUENTE)
      .select('profesional_id')
      .eq('servicio_id', idServicio)

    if (errorVinculos) {
      throw new Error(`No se pudieron cargar los profesionales: ${errorVinculos.message}`)
    }

    const ids = (vinculos ?? []).map((v) => v.profesional_id)
    if (ids.length === 0) return []

    const { data, error } = await supabase
      .from(TABLA)
      .select('*')
      .in('id', ids)
      .eq('activo', true)
      .order('nombre', { ascending: true })

    if (error) {
      throw new Error(`No se pudieron cargar los profesionales: ${error.message}`)
    }

    return (data ?? []).map(toProfesional)
  }

  async listarPorIds(ids: string[]): Promise<Profesional[]> {
    // Los ids que no son enteros (los del prototipo) se descartan aqui: no
    // existen en la base y colarlos daria un 400 de PostgREST.
    const numericos = ids
      .map((id) => Number(id))
      .filter((id, i) => ids[i].trim() !== '' && Number.isInteger(id))

    if (numericos.length === 0) return []

    const { data, error } = await supabase.from(TABLA).select('*').in('id', numericos)

    if (error) {
      throw new Error(`No se pudieron cargar los profesionales: ${error.message}`)
    }

    return (data ?? []).map(toProfesional)
  }

  async listarDisponibilidad(profesionalId: string): Promise<Disponibilidad[]> {
    const id = aIdNumerico(profesionalId)
    if (id === null) return []

    const { data, error } = await supabase
      .from(TABLA_DISPONIBILIDAD)
      .select('*')
      .eq('profesional_id', id)
      .order('dia_semana', { ascending: true })
      .order('hora_inicio', { ascending: true })

    if (error) {
      throw new Error(`No se pudo cargar la disponibilidad: ${error.message}`)
    }

    return (data ?? []).map(toDisponibilidad)
  }

  async listarDisponibilidadDeVarios(profesionalIds: string[]): Promise<Disponibilidad[]> {
    const ids = profesionalIds
      .map(aIdNumerico)
      .filter((id): id is number => id !== null)

    if (ids.length === 0) return []

    const { data, error } = await supabase
      .from(TABLA_DISPONIBILIDAD)
      .select('*')
      .in('profesional_id', ids)
      .order('dia_semana', { ascending: true })
      .order('hora_inicio', { ascending: true })

    if (error) {
      throw new Error(`No se pudo cargar la disponibilidad: ${error.message}`)
    }

    return (data ?? []).map(toDisponibilidad)
  }
}

/** Instancia lista para usar; la app no necesita mas de una. */
export const profesionalRepository = new SupabaseProfesionalRepository()
