import { useEffect, useState } from 'react'
import type { Servicio } from '../domain/servicio.types'
import { servicioRepository } from '../infrastructure/supabase-servicio.repository'

export function useServiciosPorProfesional(id: string | undefined) {
  const [resultado, setResultado] = useState<{
    id: string | undefined
    servicios: Servicio[]
    error: string | null
  }>({ id: undefined, servicios: [], error: null })

  useEffect(() => {
    if (!id) return
    let cancelado = false
    servicioRepository.listarPorProfesional(id)
      .then((servicios) => {
        if (!cancelado) setResultado({ id, servicios, error: null })
      })
      .catch((e: unknown) => {
        if (!cancelado) setResultado({ id, servicios: [], error: e instanceof Error ? e.message : 'No se pudieron cargar los servicios.' })
      })
    return () => { cancelado = true }
  }, [id])

  const alDia = resultado.id === id
  return {
    servicios: alDia ? resultado.servicios : [],
    cargando: Boolean(id) && !alDia,
    error: alDia ? resultado.error : null,
  }
}
