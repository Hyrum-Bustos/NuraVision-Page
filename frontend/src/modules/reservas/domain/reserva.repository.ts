import type { NuevaReserva, Reserva } from './reserva.types'

/**
 * Puerto de acceso a reservas.
 *
 * La lectura esta acotada por RLS a las reservas propias
 * (0004_auth_reservas_policy.sql). No existe, ni debe existir, un metodo para
 * listarlas todas desde el navegador: eso expondria el contacto de todos los
 * clientes a cualquiera con la anon key.
 */
export interface ReservaRepository {
  /**
   * Crea la reserva en estado 'pendiente'.
   *
   * No devuelve la fila creada: la politica de insercion no la devuelve y
   * quien llama identifica la reserva por el `codigo` que el mismo genero.
   */
  crear(nueva: NuevaReserva): Promise<void>

  /**
   * Reservas de la sesion activa, de la mas proxima a la mas antigua.
   *
   * Sin sesion devuelve una lista vacia, no un error: no tener reservas que
   * mostrar es el estado normal de una visitante, no un fallo.
   *
   * Nunca incluye las reservas hechas como invitada, ni siquiera si se usaron
   * el mismo nombre y correo: quedaron guardadas con `cliente_id` NULL y la
   * politica no las alcanza.
   */
  listarMias(): Promise<Reserva[]>
}
