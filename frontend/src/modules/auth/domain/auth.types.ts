/**
 * Usuario autenticado, visto desde la aplicacion.
 *
 * Es deliberadamente mas pobre que el `User` de Supabase: aqui solo entra lo
 * que la interfaz necesita. Todo lo demas (tokens, proveedores, metadatos del
 * proveedor) se queda en la capa de infraestructura, que es la unica que debe
 * conocer la forma que tiene Supabase.
 *
 * El `id` es el uuid que devuelve `auth.uid()` en la base, y es exactamente lo
 * que se guarda en `reservas.cliente_id`: por eso la politica de RLS de
 * 0004_auth_reservas_policy.sql puede cruzar ambos lados.
 */
export interface UsuarioAuth {
  /** uuid de `auth.users`. Es el valor de `auth.uid()` en las politicas. */
  id: string
  email: string
  /** Nombre que la persona dio al registrarse, si lo dio. */
  nombre: string | null
  telefono: string | null
}

/** Lo minimo para entrar. */
export interface Credenciales {
  email: string
  password: string
}

/**
 * Datos de registro.
 *
 * El nombre y el telefono no son campos de `auth.users`, sino metadatos del
 * usuario. Se guardan ahi porque `perfiles` todavia no esta versionada (ver
 * 0003_reservas.sql) y era eso o perderlos.
 */
export interface DatosRegistro extends Credenciales {
  nombre: string
  telefono: string
}

/**
 * Resultado de un registro.
 *
 * Si el proyecto exige confirmar el correo, Supabase crea el usuario pero NO
 * abre sesion. Distinguir los dos casos evita el peor error de esta pantalla:
 * dar la bienvenida y redirigir a alguien que en realidad no entro.
 */
export interface ResultadoRegistro {
  usuario: UsuarioAuth | null
  /** `true` si quedo con sesion iniciada; `false` si falta confirmar el correo. */
  sesionIniciada: boolean
}
