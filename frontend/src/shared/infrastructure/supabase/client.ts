import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/shared/types/supabase'

/**
 * Cliente global de Supabase.
 *
 * Vive en shared/infrastructure porque es un detalle de infraestructura
 * transversal: cualquier modulo puede apoyarse en el, pero ningun modulo
 * deberia exponerlo directamente a su capa de UI. Lo esperable es que
 * cada modulo lo envuelva en su propia carpeta infrastructure/.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. ' +
      'Copia frontend/.env.example a frontend/.env.local y completa las credenciales.',
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
