import type { ServiceCategoryId } from '@/shared/types'

/**
 * Entidad de dominio de un servicio.
 *
 * Es la forma que consume la aplicacion, no la de la base de datos: usa
 * camelCase, `categoria` ya validada contra el catalogo del modulo y el id
 * como string, porque asi viaja en las rutas (`/servicios/:id`).
 *
 * Convive con el tipo `Service` de @/shared/types, que es el del prototipo
 * basado en seeds. Cuando la UI migre a la base de datos, `Service` deberia
 * desaparecer y quedar solo este.
 */
export interface Servicio {
  id: string
  nombre: string
  categoria: ServiceCategoryId
  descripcion: string
  duracionMinutos: number
  precioBase: number
  activo: boolean
}
