import type { Weekday } from '@/shared/types'

/**
 * Un bloque de atencion de un profesional en un dia de la semana.
 *
 * Un mismo dia puede tener varios bloques (manana y tarde, por ejemplo); el
 * hueco entre ellos se interpreta como colacion al armar el horario semanal.
 */
export interface Disponibilidad {
  id: string
  profesionalId: string
  diaSemana: Weekday
  /** "HH:MM" */
  horaInicio: string
  /** "HH:MM" */
  horaFin: string
}
