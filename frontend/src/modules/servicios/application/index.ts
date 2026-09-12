/**
 * Punto de entrada de la capa de aplicacion del modulo servicios.
 * La UI importa desde aqui y no desde los archivos sueltos.
 */
export { obtenerServicios, crearObtenerServicios } from './obtener-servicios.usecase'
export {
  obtenerServicioPorId,
  crearObtenerServicioPorId,
} from './obtener-servicio-por-id.usecase'
export { obtenerServiciosPorIds } from './obtener-servicios-por-ids.usecase'
export type { Servicio } from '../domain/servicio.types'
export type { ServicioRepository } from '../domain/servicio.repository'
