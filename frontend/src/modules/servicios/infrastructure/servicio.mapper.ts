import type { ServiceCategoryId } from '@/shared/types'
import type { Tables } from '@/shared/types/supabase'
import { serviceCategories } from '../domain/serviceCategories'
import type { Servicio } from '../domain/servicio.types'

export type ServicioRow = Tables<'servicios'>

/**
 * `categoria` es texto libre en la base de datos, pero el dominio la tipa como
 * union cerrada. Aqui se valida el cruce: si la fila trae una categoria que la
 * app no conoce, es un desajuste entre esquema y codigo y conviene que falle
 * con un mensaje claro en vez de degradar a un valor por defecto silencioso.
 */
function toCategoria(value: string, servicioId: number): ServiceCategoryId {
  const conocida = serviceCategories.find((categoria) => categoria.id === value)
  if (!conocida) {
    const validas = serviceCategories.map((categoria) => categoria.id).join(', ')
    throw new Error(
      `El servicio ${servicioId} tiene la categoria "${value}", que no existe en el dominio. Validas: ${validas}.`,
    )
  }
  return conocida.id
}

/** Fila de la base de datos -> entidad de dominio. */
export function toServicio(row: ServicioRow): Servicio {
  return {
    id: String(row.id),
    nombre: row.nombre,
    categoria: toCategoria(row.categoria, row.id),
    descripcion: row.descripcion ?? '',
    duracionMinutos: row.duracion_minutos,
    precioBase: row.precio_base,
    activo: row.activo,
  }
}
