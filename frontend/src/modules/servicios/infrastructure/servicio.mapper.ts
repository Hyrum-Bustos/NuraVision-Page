import type { ServiceCategoryId } from '@/shared/types'
import type { Tables } from '@/shared/types/supabase'
import { serviceCategories } from '../domain/serviceCategories'
import type { Servicio } from '../domain/servicio.types'

export type ServicioRow = Tables<'servicios'>

/** Categoria que se asigna cuando la fila no trae una reconocible. */
const CATEGORIA_POR_DEFECTO: ServiceCategoryId = 'unas'

/**
 * Solo los sinonimos que NO son ya un id del dominio.
 *
 * `categoria` es texto libre en el esquema, asi que llega con la
 * nomenclatura que use quien carga los datos. Los ids canonicos
 * ('unas', 'cabello', 'piel', 'diagnostico') no se repiten aqui: se aceptan
 * leyendo `serviceCategories`, de modo que agregar una categoria al dominio
 * baste para que el mapper la reconozca y no haya que recordar esta tabla.
 *
 * Nota: 'diagnostico' NO se traduce a 'piel'. Es una categoria propia del
 * dominio y colapsarla dejaria los servicios de diagnostico etiquetados como
 * tratamientos de piel, que es otra cosa.
 */
const SINONIMOS: Record<string, ServiceCategoryId> = {
  manicure: 'unas',
  estilismo: 'cabello',
  estetica: 'piel',
}

/**
 * Minusculas, sin tildes y sin espacios sobrantes.
 *
 * La descomposicion NFD separa la tilde de su letra, de modo que al quitar
 * los diacriticos "Uñas" queda en "unas" y cruza con el dominio.
 */
function normalizar(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

/**
 * Texto de la base -> categoria del dominio.
 *
 * Nunca lanza: una categoria desconocida degrada al valor por defecto para no
 * tumbar el listado completo por una fila mal cargada. Queda un aviso en
 * consola porque el dato sigue estando mal y conviene que se note.
 */
function toCategoria(value: string | null | undefined, servicioId: number): ServiceCategoryId {
  if (!value) return CATEGORIA_POR_DEFECTO

  const normalizada = normalizar(value)
  if (!normalizada) return CATEGORIA_POR_DEFECTO

  // Primero el catalogo del dominio, despues los sinonimos.
  const canonica = serviceCategories.find((categoria) => categoria.id === normalizada)
  if (canonica) return canonica.id

  const sinonimo = SINONIMOS[normalizada]
  if (sinonimo) return sinonimo

  const aceptados = [...serviceCategories.map((c) => c.id), ...Object.keys(SINONIMOS)].join(', ')
  console.warn(
    `[servicios] El servicio ${servicioId} tiene la categoria "${value}", que no se reconoce. ` +
      `Se usa "${CATEGORIA_POR_DEFECTO}". Valores aceptados: ${aceptados}.`,
  )
  return CATEGORIA_POR_DEFECTO
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
