import { supabase } from '@/shared/infrastructure/supabase/client'
import type { ReservaRepository } from '../domain/reserva.repository'
import type { NuevaReserva, Reserva } from '../domain/reserva.types'
import { toReserva, toReservaInsert } from './reserva.mapper'

const TABLA = 'reservas'

/** Implementacion de `ReservaRepository` sobre Supabase. */
export class SupabaseReservaRepository implements ReservaRepository {
  async crear(nueva: NuevaReserva): Promise<void> {
    const fila = toReservaInsert(nueva)

    if (!Number.isInteger(fila.servicio_id) || !Number.isInteger(fila.profesional_id)) {
      throw new Error('La reserva apunta a un servicio o profesional que no existe en la base.')
    }

    // Sin .select(): la politica de insercion no devuelve la fila creada, y
    // pedirla haria fallar una insercion que en realidad si se guardo. Aunque
    // 0004 concede SELECT, una reserva de invitada (cliente_id NULL) sigue
    // quedando fuera de la politica de lectura.
    const { error } = await supabase.from(TABLA).insert(fila)

    if (error) {
      // 42501 es el rechazo por RLS. Es el error mas probable si alguien
      // levanta el proyecto sin aplicar las migraciones, asi que conviene que
      // el mensaje diga que revisar en vez de solo "permission denied".
      if (error.code === '42501') {
        throw new Error(
          'La base rechazó la reserva por sus políticas de seguridad. ' +
            'Revisa que las migraciones 0003 y 0004 estén aplicadas.',
        )
      }
      throw new Error(`No se pudo guardar la reserva: ${error.message}`)
    }
  }

  async listarMias(): Promise<Reserva[]> {
    // No se filtra por cliente_id aqui: lo hace la politica de RLS con
    // auth.uid(). Anteponer un .eq() con el id que cree tener el navegador
    // seria redundante y daria la falsa impresion de que la seguridad depende
    // del cliente.
    const { data, error } = await supabase
      .from(TABLA)
      .select('*')
      .order('fecha', { ascending: false })
      .order('hora_inicio', { ascending: false })

    if (error) {
      if (error.code === '42501') {
        throw new Error(
          'La base no permite leer tus reservas. ' +
            'Revisa que la migración 0004_auth_reservas_policy.sql esté aplicada.',
        )
      }
      throw new Error(`No se pudieron cargar tus reservas: ${error.message}`)
    }

    return (data ?? []).map(toReserva)
  }
}

/** Instancia lista para usar; la app no necesita mas de una. */
export const reservaRepository = new SupabaseReservaRepository()
