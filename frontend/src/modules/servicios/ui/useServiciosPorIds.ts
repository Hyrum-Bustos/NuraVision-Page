import { useEffect, useMemo, useState } from 'react'
import { obtenerServiciosPorIds } from '../application'
import type { Servicio } from '../domain/servicio.types'
import { servicioRepository } from '../infrastructure/supabase-servicio.repository'

interface EstadoServiciosPorIds {
  /** Indexados por id, listos para resolver nombres en un listado. */
  porId: Map<string, Servicio>
  cargando: boolean
  error: string | null
}

/**
 * Resuelve varios servicios por id en una sola consulta.
 *
 * El array `ids` cambia de identidad en cada render, asi que la dependencia
 * del efecto es una clave estable derivada de su contenido; de lo contrario
 * la consulta se repetiria indefinidamente.
 */
export function useServiciosPorIds(ids: string[]): EstadoServiciosPorIds {
  const clave = useMemo(() => [...new Set(ids)].sort().join(','), [ids])

  // El resultado se guarda junto a la clave que lo produjo. Asi "cargando" y
  // "error" se derivan durante el render comparando claves, y el efecto no
  // necesita escribir estado de forma sincrona al cambiar la lista de ids.
  const [resuelto, setResuelto] = useState<{
    clave: string
    servicios: Servicio[]
    error: string | null
  }>({ clave: '', servicios: [], error: null })

  useEffect(() => {
    if (clave === '') return

    let cancelado = false

    obtenerServiciosPorIds(servicioRepository, clave.split(','))
      .then((servicios) => {
        if (cancelado) return
        setResuelto({ clave, servicios, error: null })
      })
      .catch((e: unknown) => {
        if (cancelado) return
        setResuelto({
          clave,
          servicios: [],
          error: e instanceof Error ? e.message : 'No se pudieron cargar los servicios.',
        })
      })

    return () => {
      cancelado = true
    }
  }, [clave])

  const alDia = resuelto.clave === clave

  // Se memoiza sobre `resuelto.servicios`, que es la referencia estable que
  // guarda el estado; derivar antes un array nuevo anularia el memo.
  const porId = useMemo(() => {
    const mapa = new Map<string, Servicio>()
    if (alDia) for (const servicio of resuelto.servicios) mapa.set(servicio.id, servicio)
    return mapa
  }, [alDia, resuelto.servicios])

  return {
    porId,
    cargando: clave !== '' && !alDia,
    error: alDia ? resuelto.error : null,
  }
}
