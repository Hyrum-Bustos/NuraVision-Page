import type { ServicioRepository } from '../domain/servicio.repository'
import type { Servicio } from '../domain/servicio.types'

/**
 * Caso de uso: obtener el catalogo de servicios activos.
 *
 * Recibe el repositorio por inyeccion en vez de importarlo, asi que no sabe
 * que detras hay Supabase. En un test se le pasa un doble en memoria y este
 * archivo no cambia.
 */
export async function obtenerServicios(repositorio: ServicioRepository): Promise<Servicio[]> {
  return repositorio.listarActivos()
}

/**
 * Variante ya enlazada a un repositorio concreto, para quien solo quiere
 * llamar `obtener()` sin arrastrar la dependencia en cada invocacion.
 */
export function crearObtenerServicios(repositorio: ServicioRepository) {
  return (): Promise<Servicio[]> => obtenerServicios(repositorio)
}
