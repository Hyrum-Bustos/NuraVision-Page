import { supabase } from '@/shared/infrastructure/supabase/client'
import type { ReservaRepository } from '../domain/reserva.repository'
import type { NuevaReserva } from '../domain/reserva.types'
import { toReservaInsert } from './reserva.mapper'

const TABLA = 'reservas'

/** Implementacion de `ReservaRepository` sobre Supabase. */
export class SupabaseReservaRepository implements ReservaRepository {
  async crear(nueva: NuevaReserva): Promise<void> {
    const fila = toReservaInsert(nueva)

    if (!Number.isInteger(fila.servicio_id) || !Number.isInteger(fila.profesional_id)) {
      throw new Error('La reserva apunta a un servicio o profesional que no existe en la base.')
    }

    // Sin .select(): PostgREST necesita permiso de SELECT para devolver la
    // fila insertada, y la politica no lo otorga. Pedirlo haria fallar una
    // insercion que en realidad si se guardo.
    const { error } = await supabase.from(TABLA).insert(fila)

    if (error) {
      // 42501 es el rechazo por RLS. Es el error mas probable si alguien
      // levanta el proyecto sin aplicar 0003_reservas.sql, asi que conviene
      // que el mensaje diga que revisar en vez de solo "permission denied".
      if (error.code === '42501') {
        throw new Error(
          'La base rechazó la reserva por sus políticas de seguridad. ' +
            'Revisa que la migración 0003_reservas.sql esté aplicada.',
        )
      }
      throw new Error(`No se pudo guardar la reserva: ${error.message}`)
    }
  }
}

/** Instancia lista para usar; la app no necesita mas de una. */
export const reservaRepository = new SupabaseReservaRepository()
