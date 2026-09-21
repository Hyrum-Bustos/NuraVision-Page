import type { ServiceCategoryId } from '@/shared/types'

/**
 * Imagen de cada servicio del catalogo.
 *
 * Mientras la tabla `servicios` no tenga columna de imagen, las tarjetas caian
 * en el marcador a rayas. Esto las llena sin tocar el esquema.
 *
 * SE ASOCIA POR NOMBRE, NO POR ID. Los ids salen de una secuencia de Postgres:
 * cambian si se re-ejecuta el seed, si se borra un servicio o si el estudio
 * carga el catalogo en otro orden. Un mapa por id se habria desalineado en
 * silencio —cada servicio con la foto de otro— y nada lo habria detectado. El
 * nombre es lo unico estable que la aplicacion conoce de los dos lados.
 *
 * Cuando `servicios` tenga su propia columna, este archivo se borra y la URL
 * pasa a venir de la base.
 */

const BASE = 'https://images.unsplash.com'

/** Recorte y compresion iguales para todas: 600px basta para una tarjeta. */
const PARAMS = 'auto=format&fit=crop&w=600&q=80'

function foto(id: string): string {
  return `${BASE}/${id}?${PARAMS}`
}

/**
 * Normaliza para comparar: sin tildes, en minusculas y con los espacios
 * colapsados. Misma convencion que `servicio.mapper.ts`, de modo que
 * "Coloración", "COLORACION" y " coloracion " sean la misma clave.
 */
function normalizar(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

/**
 * Imagen por servicio, con la clave ya normalizada.
 *
 * Cubre los 14 servicios del seed. Un servicio que el estudio agregue despues
 * no estara aqui y caera en la imagen de su categoria, que es el motivo de que
 * exista ese segundo nivel.
 */
const POR_NOMBRE: Record<string, string> = {
  // Cabello
  'corte de pelo': foto('photo-1562322140-8baeececf3df'),
  peinado: foto('photo-1560869713-7d0a29430803'),
  brushing: foto('photo-1519699047748-de8e457a634e'),
  coloracion: foto('photo-1522337360788-8b13dee7a37e'),
  'tratamiento capilar': foto('photo-1595476108010-b4d1f102b1b1'),

  // Uñas
  'manicura completa': foto('photo-1632345031435-8727f6897d53'),
  'esmaltado tradicional': foto('photo-1610992015732-2449b76344bc'),
  'esmaltado permanente': foto('photo-1604654894610-df63bc536371'),
  'esculpido de unas': foto('photo-1519014816548-bf5fe059798b'),
  // Sin entrada propia a proposito: es el mismo servicio que "Manicura
  // Completa" pero mas corto, asi que cae en la imagen de la categoria.

  // Piel y cuidado corporal
  'tratamiento facial': foto('photo-1570172619644-dfd03ed5d881'),
  depilacion: foto('photo-1519823551278-64ac92734fb1'),
  'cejas y pestanas': foto('photo-1487412947147-5cebf100ffc2'),
  maquillaje: foto('photo-1571875257727-256c39da42af'),
}

/**
 * Respaldo por categoria, para un servicio que no este en el mapa de arriba.
 *
 * Son imagenes deliberadamente genericas: representan el area, no un servicio
 * concreto, porque no se sabe cual va a caer aqui.
 */
const POR_CATEGORIA: Record<ServiceCategoryId, string> = {
  unas: foto('photo-1632345031435-8727f6897d53'),
  cabello: foto('photo-1560066984-138dadb4c035'),
  piel: foto('photo-1616394584738-fc6e612e71b9'),
  diagnostico: foto('photo-1560750588-73207b1ef5b8'),
}

/** Ultimo recurso: una imagen neutra del estudio. */
export const IMAGEN_POR_DEFECTO = foto('photo-1560750588-73207b1ef5b8')

/**
 * Devuelve la imagen de un servicio.
 *
 * Nunca devuelve undefined: siempre hay algo que pintar. Esa es la diferencia
 * con dejarlo en manos de `AppImage`, que caeria en el marcador a rayas.
 *
 * Tres niveles, del mas especifico al mas general:
 *   1. el nombre exacto del servicio,
 *   2. su categoria,
 *   3. la imagen por defecto.
 */
export function imagenDeServicio(nombre: string, categoria?: ServiceCategoryId): string {
  const porNombre = POR_NOMBRE[normalizar(nombre)]
  if (porNombre) return porNombre

  if (categoria) {
    const porCategoria = POR_CATEGORIA[categoria]
    if (porCategoria) return porCategoria
  }

  return IMAGEN_POR_DEFECTO
}
