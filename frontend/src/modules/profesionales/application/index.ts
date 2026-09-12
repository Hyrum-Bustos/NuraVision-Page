/**
 * Punto de entrada de la capa de aplicacion del modulo profesionales.
 * La UI importa desde aqui y no desde los archivos sueltos.
 */
export {
  obtenerProfesionales,
  crearObtenerProfesionales,
} from './obtener-profesionales.usecase'
export type { Profesional } from '../domain/profesional.types'
export type { ProfesionalRepository } from '../domain/profesional.repository'
