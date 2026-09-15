import type { NuevaReserva } from './reserva.types'

/**
 * Puerto de acceso a reservas.
 *
 * Solo escritura. Las politicas de RLS no otorgan SELECT al rol anonimo
 * (ver 0003_reservas.sql): sin autenticacion no hay forma de acotar la lectura
 * a "mis reservas", y abrirla expondria el contacto de todos los clientes.
 * Cuando exista Supabase Auth podran sumarse aqui los metodos de lectura.
 */
export interface ReservaRepository {
  /**
   * Crea la reserva en estado 'pendiente'.
   *
   * No devuelve la fila creada: PostgREST necesita permiso de SELECT para
   * devolverla y no lo tiene. Quien llama identifica la reserva por el
   * `codigo` que el mismo genero.
   */
  crear(nueva: NuevaReserva): Promise<void>
}
