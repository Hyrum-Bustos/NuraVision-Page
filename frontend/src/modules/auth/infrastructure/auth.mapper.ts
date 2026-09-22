import type { User } from '@supabase/supabase-js'
import type { UsuarioAuth } from '../domain/auth.types'

/**
 * Claves con las que se guardan el nombre y el telefono en `user_metadata`.
 *
 * Se exportan porque el registro las escribe y el mapper las lee: si solo una
 * de las dos partes las conociera, un cambio de nombre aqui pasaria inadvertido
 * y el dato se leeria siempre como null.
 */
export const META_NOMBRE = 'nombre'
export const META_TELEFONO = 'telefono'

/**
 * Clave que marca al personal del estudio dentro de `app_metadata`.
 *
 * Tiene que coincidir letra por letra con la que lee `public.es_staff()` en
 * 0006_admin_staff_policy.sql. Si una de las dos cambia y la otra no, la
 * interfaz y la base dejan de estar de acuerdo sin que nada avise.
 */
export const APP_META_ES_STAFF = 'es_staff'

/**
 * `user_metadata` es Json libre: lo escribe el cliente y nadie valida su forma.
 * Cualquier cosa que no sea un texto con contenido se trata como ausente, en
 * vez de dejar que un numero o un objeto llegue a la interfaz tipado como
 * string.
 */
function textoOpcional(valor: unknown): string | null {
  if (typeof valor !== 'string') return null
  const limpio = valor.trim()
  return limpio === '' ? null : limpio
}

/**
 * `app_metadata` tambien es Json libre. Se acepta el booleano `true` y el
 * texto "true", porque segun como se escriba la marca (panel de Supabase,
 * API de administracion, SQL) puede llegar de las dos formas. Cualquier otra
 * cosa es "no es personal": ante la duda, se niega.
 */
function esMarcaVerdadera(valor: unknown): boolean {
  return valor === true || valor === 'true'
}

/** Usuario de Supabase -> entidad de dominio. */
export function toUsuarioAuth(user: User): UsuarioAuth {
  const meta = user.user_metadata as Record<string, unknown> | null
  const metaApp = user.app_metadata as Record<string, unknown> | null

  return {
    id: user.id,
    // `email` es opcional en Supabase porque admite cuentas por telefono o
    // solo por proveedor externo. Aqui todas las cuentas se crean con correo,
    // asi que el unico caso de cadena vacia seria un usuario creado por otra
    // via; se prefiere eso a un `undefined` suelto en la interfaz.
    email: user.email ?? '',
    nombre: textoOpcional(meta?.[META_NOMBRE]),
    telefono: textoOpcional(meta?.[META_TELEFONO]),
    esStaff: esMarcaVerdadera(metaApp?.[APP_META_ES_STAFF]),
  }
}
