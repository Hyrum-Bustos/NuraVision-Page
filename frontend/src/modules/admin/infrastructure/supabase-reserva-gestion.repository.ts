import { supabase } from '@/shared/infrastructure/supabase/client'
import type { ReservaGestionRepository } from '../domain/reserva-gestion.repository'
import type { FiltrosReservas, ReservaGestion } from '../domain/reserva-gestion.types'
import { toReservaGestion } from './reserva-gestion.mapper'

const TABLA = 'reservas'

/**
 * Mensaje unico para el caso que hoy se da SIEMPRE: la base no deja al estudio
 * tocar reservas ajenas porque no hay una politica que lo permita.
 *
 * Merece un texto propio porque es indistinguible de "no hay reservas": RLS no
 * da error, simplemente no devuelve filas. Sin decirlo, el panel parece vacio y
 * nadie sabria que falta una migracion.
 */
const FALTA_POLITICA =
  'La base no permite al estudio gestionar reservas: todavía no existe una política ' +
  'de RLS para el personal. Revisa supabase/migrations.'

/** El id viaja como texto en el dominio, pero la columna es bigint. */
function aIdNumerico(id: string): number {
  const numero = Number(id)
  if (!Number.isInteger(numero)) throw new Error('Esa reserva no existe.')
  return numero
}

/** Implementacion de `ReservaGestionRepository` sobre Supabase. */
export class SupabaseReservaGestionRepository implements ReservaGestionRepository {
  async listar(filtros: FiltrosReservas): Promise<ReservaGestion[]> {
    // El filtrado se hace en la base y no en memoria: el estudio puede llegar a
    // tener miles de reservas, y traerlas todas para descartarlas en el
    // navegador dejaria de funcionar mucho antes de que se note.
    let consulta = supabase.from(TABLA).select('*')

    if (filtros.estado) consulta = consulta.eq('estado', filtros.estado)
    if (filtros.profesionalId) {
      consulta = consulta.eq('profesional_id', aIdNumerico(filtros.profesionalId))
    }

    const { data, error } = await consulta
      .order('fecha', { ascending: false })
      .order('hora_inicio', { ascending: false })

    if (error) {
      if (error.code === '42501') throw new Error(FALTA_POLITICA)
      throw new Error(`No se pudieron cargar las reservas: ${error.message}`)
    }

    return (data ?? []).map(toReservaGestion)
  }

  async confirmar(id: string): Promise<ReservaGestion> {
    const { data, error } = await supabase
      .from(TABLA)
      .update({ estado: 'confirmada' })
      .eq('id', aIdNumerico(id))
      .select()

    if (error) {
      if (error.code === '42501') throw new Error(FALTA_POLITICA)
      throw new Error(`No se pudo confirmar la reserva: ${error.message}`)
    }

    // Un UPDATE que RLS rechaza NO da error: PostgREST responde 200 con una
    // lista vacia, porque "ninguna fila cumplia" es un resultado legitimo. Sin
    // esta comprobacion, confirmar se veria como un exito y la tabla mostraria
    // un estado que la base nunca guardo.
    if (!data || data.length === 0) throw new Error(FALTA_POLITICA)

    return toReservaGestion(data[0])
  }
}

/** Instancia lista para usar; la app no necesita mas de una. */
export const reservaGestionRepository = new SupabaseReservaGestionRepository()
