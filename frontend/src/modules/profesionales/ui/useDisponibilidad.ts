import { useEffect, useMemo, useState } from 'react'
import type { WeeklyAvailability } from '@/shared/types'
import { obtenerDisponibilidad } from '../application'
import type { Disponibilidad } from '../domain/disponibilidad.types'
import { toWeeklyAvailability } from '../infrastructure/disponibilidad.mapper'
import { profesionalRepository } from '../infrastructure/supabase-profesional.repository'

interface EstadoDisponibilidad {
  bloques: Disponibilidad[]
  /** Horario semanal ya armado, listo para el calculo de horas. */
  horario: WeeklyAvailability
  /** `true` cuando el profesional no tiene ningun bloque cargado. */
  sinHorario: boolean
  cargando: boolean
  error: string | null
}

/** Horario de un profesional, leido de la tabla `disponibilidad`. */
export function useDisponibilidad(profesionalId: string | undefined): EstadoDisponibilidad {
  const [bloques, setBloques] = useState<Disponibilidad[]>([])
  const [cargando, setCargando] = useState(Boolean(profesionalId))
  const [error, setError] = useState<string | null>(null)
  const [idPrevio, setIdPrevio] = useState(profesionalId)

  if (profesionalId !== idPrevio) {
    setIdPrevio(profesionalId)
    setBloques([])
    setCargando(Boolean(profesionalId))
    setError(null)
  }

  useEffect(() => {
    if (!profesionalId) return

    let cancelado = false

    obtenerDisponibilidad(profesionalRepository, profesionalId)
      .then((resultado) => {
        if (cancelado) return
        setBloques(resultado)
      })
      .catch((e: unknown) => {
        if (cancelado) return
        setError(e instanceof Error ? e.message : 'No se pudo cargar la disponibilidad.')
      })
      .finally(() => {
        if (cancelado) return
        setCargando(false)
      })

    return () => {
      cancelado = true
    }
  }, [profesionalId])

  const horario = useMemo(() => toWeeklyAvailability(bloques), [bloques])

  return {
    bloques,
    horario,
    sinHorario: !cargando && !error && bloques.length === 0,
    cargando,
    error,
  }
}
