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

/** Usuario de Supabase -> entidad de dominio. */
export function toUsuarioAuth(user: User): UsuarioAuth {
  const meta = user.user_metadata as Record<string, unknown> | null

  return {
    id: user.id,
    // `email` es opcional en Supabase porque admite cuentas por telefono o
    // solo por proveedor externo. Aqui todas las cuentas se crean con correo,
    // asi que el unico caso de cadena vacia seria un usuario creado por otra
    // via; se prefiere eso a un `undefined` suelto en la interfaz.
    email: user.email ?? '',
    nombre: textoOpcional(meta?.[META_NOMBRE]),
    telefono: textoOpcional(meta?.[META_TELEFONO]),
  }
}
