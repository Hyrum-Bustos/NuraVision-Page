import { useCallback, useState } from 'react'
import { crearReserva } from '../application'
import type { NuevaReserva } from '../domain/reserva.types'
import { reservaRepository } from '../infrastructure/supabase-reserva.repository'

interface EstadoCrearReserva {
  /** Resuelve a `true` si la reserva quedo guardada. */
  crear: (nueva: NuevaReserva) => Promise<boolean>
  guardando: boolean
  error: string | null
}

/**
 * Guarda una reserva en la base de datos.
 *
 * Devuelve un booleano en vez de propagar la excepcion para que quien llama
 * decida que hacer sin envolver todo en try/catch; el detalle del fallo queda
 * en `error`.
 */
export function useCrearReserva(): EstadoCrearReserva {
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const crear = useCallback(async (nueva: NuevaReserva): Promise<boolean> => {
    setGuardando(true)
    setError(null)
    try {
      await crearReserva(reservaRepository, nueva)
      return true
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la reserva.')
      return false
    } finally {
      setGuardando(false)
    }
  }, [])

  return { crear, guardando, error }
}
