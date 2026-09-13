/**
 * Entidad de dominio de un profesional.
 *
 * Convive con el tipo `Professional` de @/shared/types, que es el del
 * prototipo basado en seeds. Ese trae ademas `availability`, `serviceIds`,
 * `experienceYears` y `bio`, campos que la tabla `profesionales` todavia no
 * tiene: por eso el asistente de reserva sigue necesitando el otro para
 * calcular horarios. Cuando el esquema los incorpore, `Professional` deberia
 * desaparecer y quedar solo este.
 */
export interface Profesional {
  id: string
  nombre: string
  especialidad: string
  /** `null` cuando no hay foto cargada. */
  avatarUrl: string | null
  activo: boolean
}
