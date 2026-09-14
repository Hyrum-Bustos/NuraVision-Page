import { useEffect, useState } from 'react'
import { obtenerProfesionales } from '../application'
import type { Profesional } from '../domain/profesional.types'
import { profesionalRepository } from '../infrastructure/supabase-profesional.repository'

interface EstadoProfesionales {
  profesionales: Profesional[]
  cargando: boolean
  error: string | null
}

/**
 * Carga los profesionales activos desde la base de datos.
 *
 * El repositorio concreto se elige aqui, en el borde de la UI: el caso de uso
 * sigue recibiendolo por parametro y no conoce Supabase.
 */
export function useProfesionales(): EstadoProfesionales {
  const [profesionales, setProfesionales] = useState<Profesional[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // El efecto corre una sola vez (deps vacias), asi que el estado inicial
    // ya expresa "cargando, sin error".
    let cancelado = false

    obtenerProfesionales(profesionalRepository)
      .then((resultado) => {
        if (cancelado) return
        setProfesionales(resultado)
      })
      .catch((e: unknown) => {
        if (cancelado) return
        setError(e instanceof Error ? e.message : 'No se pudieron cargar los profesionales.')
      })
      .finally(() => {
        if (cancelado) return
        setCargando(false)
      })

    return () => {
      cancelado = true
    }
  }, [])

  return { profesionales, cargando, error }
}
