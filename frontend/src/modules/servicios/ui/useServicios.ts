import { useEffect, useState } from 'react'
import { obtenerServicios } from '../application'
import type { Servicio } from '../domain/servicio.types'
import { servicioRepository } from '../infrastructure/supabase-servicio.repository'

interface EstadoServicios {
  servicios: Servicio[]
  cargando: boolean
  error: string | null
}

/**
 * Carga el catalogo desde la base de datos.
 *
 * El repositorio concreto se elige aqui, en el borde de la UI: el caso de uso
 * sigue recibiendolo por parametro y no conoce Supabase.
 */
export function useServicios(): EstadoServicios {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // StrictMode monta dos veces en desarrollo: si la peticion de la primera
    // pasada llega tarde, no debe escribir sobre el estado de la segunda.
    // El efecto corre una sola vez (deps vacias), asi que el estado inicial
    // ya expresa "cargando, sin error": resetearlo aqui seria redundante.
    let cancelado = false

    obtenerServicios(servicioRepository)
      .then((resultado) => {
        if (cancelado) return
        setServicios(resultado)
      })
      .catch((e: unknown) => {
        if (cancelado) return
        setError(e instanceof Error ? e.message : 'No se pudieron cargar los servicios.')
      })
      .finally(() => {
        if (cancelado) return
        setCargando(false)
      })

    return () => {
      cancelado = true
    }
  }, [])

  return { servicios, cargando, error }
}
