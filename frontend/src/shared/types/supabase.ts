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

/** Enum `estado_reserva` de Postgres. */
export type EstadoReserva = 'pendiente' | 'confirmada' | 'completada' | 'cancelada'

export interface Database {
  public: {
    Tables: {
      servicios: {
        Row: {
          /** bigint */
          id: number
          /** text */
          nombre: string
          /** text, nullable: confirmado contra datos reales (hay filas con null) */
          categoria: string | null
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
          categoria?: string | null
          descripcion?: string | null
          duracion_minutos: number
          precio_base: number
          activo?: boolean
        }
        Update: {
          id?: number
          nombre?: string
          categoria?: string | null
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
      /** Tabla puente: que profesional realiza que servicio. */
      profesional_servicios: {
        Row: {
          /** bigint, FK -> profesionales.id */
          profesional_id: number
          /** bigint, FK -> servicios.id */
          servicio_id: number
        }
        Insert: {
          profesional_id: number
          servicio_id: number
        }
        Update: {
          profesional_id?: number
          servicio_id?: number
        }
        Relationships: []
      }
      /** Horario semanal de cada profesional. */
      disponibilidad: {
        Row: {
          /** bigint */
          id: number
          /** bigint, FK -> profesionales.id */
          profesional_id: number
          /** integer. Ver DIA_SEMANA_BASE en disponibilidad.mapper.ts. */
          dia_semana: number
          /** time, llega como "HH:MM:SS" */
          hora_inicio: string
          /** time, llega como "HH:MM:SS" */
          hora_fin: string
        }
        Insert: {
          id?: number
          profesional_id: number
          dia_semana: number
          hora_inicio: string
          hora_fin: string
        }
        Update: {
          id?: number
          profesional_id?: number
          dia_semana?: number
          hora_inicio?: string
          hora_fin?: string
        }
        Relationships: []
      }
      /**
       * Reservas. Tal como queda tras 0003_reservas.sql.
       *
       * Desde el navegador es de SOLO ESCRITURA: las politicas no otorgan
       * SELECT al rol anonimo, asi que `Row` existe para tipar la tabla pero
       * no hay consulta que lo devuelva todavia.
       */
      reservas: {
        Row: {
          /** bigint */
          id: number
          /** bigint, FK -> servicios.id */
          servicio_id: number
          /** bigint, FK -> profesionales.id */
          profesional_id: number
          /** uuid, FK -> perfiles.id. NULL en reservas sin cuenta. */
          cliente_id: string | null
          /** date, "YYYY-MM-DD" */
          fecha: string
          /** time, "HH:MM:SS" */
          hora_inicio: string
          /** time, "HH:MM:SS" */
          hora_fin: string | null
          cliente_nombre: string | null
          cliente_email: string | null
          cliente_telefono: string | null
          /** Codigo visible para quien reserva sin cuenta. */
          codigo: string | null
          estado: EstadoReserva
        }
        Insert: {
          id?: number
          servicio_id: number
          profesional_id: number
          cliente_id?: string | null
          fecha: string
          hora_inicio: string
          hora_fin?: string | null
          cliente_nombre?: string | null
          cliente_email?: string | null
          cliente_telefono?: string | null
          codigo?: string | null
          /** La politica de RLS solo acepta 'pendiente' desde el navegador. */
          estado?: EstadoReserva
        }
        Update: {
          id?: number
          servicio_id?: number
          profesional_id?: number
          cliente_id?: string | null
          fecha?: string
          hora_inicio?: string
          hora_fin?: string | null
          cliente_nombre?: string | null
          cliente_email?: string | null
          cliente_telefono?: string | null
          codigo?: string | null
          estado?: EstadoReserva
        }
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: {
      estado_reserva: EstadoReserva
    }
    CompositeTypes: Record<never, never>
  }
}

/** Atajo: `Tables<'servicios'>` en vez del camino completo. */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
