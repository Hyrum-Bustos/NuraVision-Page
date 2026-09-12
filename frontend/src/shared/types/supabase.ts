/**
 * Tipos de la base de datos.
 *
 * ATENCION: este archivo esta escrito a mano a partir del esquema real
 * inspeccionado via PostgREST (nombres y tipos de columna confirmados contra
 * el proyecto). Lo correcto a futuro es generarlo:
 *
 *   npx supabase gen types typescript --project-id <id> > src/shared/types/supabase.ts
 *
 * La NULABILIDAD no se puede inspeccionar sin la clave secreta, asi que las
 * marcas de "| null" de abajo son una suposicion conservadora. Confirmalas
 * contra el esquema antes de confiar en ellas.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      servicios: {
        Row: {
          /** bigint */
          id: number
          /** text */
          nombre: string
          /** text */
          categoria: string
          /** text */
          descripcion: string | null
          /** integer */
          duracion_minutos: number
          /** numeric */
          precio_base: number
          /** boolean */
          activo: boolean
        }
        Insert: {
          id?: number
          nombre: string
          categoria: string
          descripcion?: string | null
          duracion_minutos: number
          precio_base: number
          activo?: boolean
        }
        Update: {
          id?: number
          nombre?: string
          categoria?: string
          descripcion?: string | null
          duracion_minutos?: number
          precio_base?: number
          activo?: boolean
        }
        Relationships: []
      }
      profesionales: {
        Row: {
          /** bigint */
          id: number
          /** text */
          nombre: string
          /** text */
          especialidad: string
          /** text, nullable */
          avatar_url: string | null
          /** boolean */
          activo: boolean
        }
        Insert: {
          id?: number
          nombre: string
          especialidad: string
          avatar_url?: string | null
          activo?: boolean
        }
        Update: {
          id?: number
          nombre?: string
          especialidad?: string
          avatar_url?: string | null
          activo?: boolean
        }
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}

/** Atajo: `Tables<'servicios'>` en vez del camino completo. */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
