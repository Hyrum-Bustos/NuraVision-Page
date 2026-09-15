/** Valores del enum `estado_reserva` en la base de datos. */
export type EstadoReserva = 'pendiente' | 'confirmada' | 'completada' | 'cancelada'

/**
 * Datos necesarios para crear una reserva.
 *
 * Es una entidad de entrada, no una lectura: hoy la tabla `reservas` es de
 * solo escritura desde el navegador (ver 0003_reservas.sql), asi que no existe
 * una entidad `Reserva` completa que leer de vuelta.
 *
 * El contacto es obligatorio aunque haya cuenta: quien reserva sin sesion no
 * tiene perfil, y el correo es el unico vinculo con su hora.
 */
export interface NuevaReserva {
  servicioId: string
  profesionalId: string
  /** ISO corto, "YYYY-MM-DD". */
  fecha: string
  /** "HH:MM" */
  horaInicio: string
  /** "HH:MM". Se calcula con la duracion del servicio al momento de reservar. */
  horaFin: string
  clienteNombre: string
  clienteEmail: string
  clienteTelefono: string
  /** Codigo visible que se le muestra a quien reserva sin cuenta. */
  codigo: string
}
