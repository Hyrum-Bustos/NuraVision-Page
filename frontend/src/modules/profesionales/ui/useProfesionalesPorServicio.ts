import { useEffect, useState } from 'react'
import { obtenerProfesionalesPorServicio } from '../application'
import type { Profesional } from '../domain/profesional.types'
import { profesionalRepository } from '../infrastructure/supabase-profesional.repository'

interface EstadoProfesionales {
  profesionales: Profesional[]
  cargando: boolean
  error: string | null
}

/** Profesionales que realizan un servicio concreto. */
export function useProfesionalesPorServicio(servicioId: string | undefined): EstadoProfesionales {
  const [profesionales, setProfesionales] = useState<Profesional[]>([])
  const [cargando, setCargando] = useState(Boolean(servicioId))
  const [error, setError] = useState<string | null>(null)
  const [idPrevio, setIdPrevio] = useState(servicioId)

  // Al cambiar de servicio hay que volver a "cargando". Se ajusta durante el
  // render para no pintar un frame con los profesionales del servicio anterior.
  if (servicioId !== idPrevio) {
    setIdPrevio(servicioId)
    setProfesionales([])
    setCargando(Boolean(servicioId))
    setError(null)
  }

  useEffect(() => {
    if (!servicioId) return

    let cancelado = false

    obtenerProfesionalesPorServicio(profesionalRepository, servicioId)
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
  }, [servicioId])

  return { profesionales, cargando, error }
}
