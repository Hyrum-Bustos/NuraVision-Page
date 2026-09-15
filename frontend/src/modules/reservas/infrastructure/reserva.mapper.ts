import type { Database } from '@/shared/types/supabase'
import type { NuevaReserva } from '../domain/reserva.types'

export type ReservaInsert = Database['public']['Tables']['reservas']['Insert']

/**
 * Entidad de dominio -> fila para insertar.
 *
 * `estado` se fija en 'pendiente' y no se recibe por parametro: es lo unico
 * que acepta la politica de RLS desde el navegador. Confirmar una hora es una
 * decision del estudio, no de quien reserva.
 */
export function toReservaInsert(nueva: NuevaReserva): ReservaInsert {
  return {
    servicio_id: Number(nueva.servicioId),
    profesional_id: Number(nueva.profesionalId),
    fecha: nueva.fecha,
    hora_inicio: nueva.horaInicio,
    hora_fin: nueva.horaFin,
    cliente_nombre: nueva.clienteNombre,
    cliente_email: nueva.clienteEmail,
    // Cadena vacia a NULL: para la base son el mismo caso (sin telefono) y
    // asi no hay que comprobar los dos.
    cliente_telefono: nueva.clienteTelefono.trim() || null,
    codigo: nueva.codigo,
    estado: 'pendiente',
  }
}
