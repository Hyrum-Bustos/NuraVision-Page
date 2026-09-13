import { useEffect, useMemo, useState } from 'react'
import { obtenerProfesionalesPorIds } from '../application'
import type { Profesional } from '../domain/profesional.types'
import { profesionalRepository } from '../infrastructure/supabase-profesional.repository'

interface EstadoProfesionalesPorIds {
  /** Indexados por id, listos para resolver nombres en un listado. */
  porId: Map<string, Profesional>
  cargando: boolean
  error: string | null
}

/**
 * Resuelve varios profesionales por id en una sola consulta.
 *
 * El array `ids` cambia de identidad en cada render, asi que la dependencia
 * del efecto es una clave estable derivada de su contenido; de lo contrario
 * la consulta se repetiria indefinidamente.
 */
export function useProfesionalesPorIds(ids: string[]): EstadoProfesionalesPorIds {
  const clave = useMemo(() => [...new Set(ids)].sort().join(','), [ids])

  // El resultado se guarda junto a la clave que lo produjo. Asi "cargando" y
  // "error" se derivan durante el render comparando claves, y el efecto no
  // necesita escribir estado de forma sincrona al cambiar la lista de ids.
  const [resuelto, setResuelto] = useState<{
    clave: string
    profesionales: Profesional[]
    error: string | null
  }>({ clave: '', profesionales: [], error: null })

  useEffect(() => {
    if (clave === '') return

    let cancelado = false

    obtenerProfesionalesPorIds(profesionalRepository, clave.split(','))
      .then((profesionales) => {
        if (cancelado) return
        setResuelto({ clave, profesionales, error: null })
      })
      .catch((e: unknown) => {
        if (cancelado) return
        setResuelto({
          clave,
          profesionales: [],
          error: e instanceof Error ? e.message : 'No se pudieron cargar los profesionales.',
        })
      })

    return () => {
      cancelado = true
    }
  }, [clave])

  const alDia = resuelto.clave === clave

  // Se memoiza sobre `resuelto.profesionales`, que es la referencia estable
  // que guarda el estado; derivar antes un array nuevo anularia el memo.
  const porId = useMemo(() => {
    const mapa = new Map<string, Profesional>()
    if (alDia) for (const profesional of resuelto.profesionales) mapa.set(profesional.id, profesional)
    return mapa
  }, [alDia, resuelto.profesionales])

  return {
    porId,
    cargando: clave !== '' && !alDia,
    error: alDia ? resuelto.error : null,
  }
}
