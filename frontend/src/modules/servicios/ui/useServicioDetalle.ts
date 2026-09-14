import { useEffect, useState } from 'react'
import { obtenerServicioPorId } from '../application'
import type { Servicio } from '../domain/servicio.types'
import { servicioRepository } from '../infrastructure/supabase-servicio.repository'

/**
 * Union discriminada en vez de tres booleanos sueltos: hace imposible
 * representar estados contradictorios (cargando y con error a la vez) y
 * obliga a la vista a resolver los cuatro casos.
 */
export type EstadoServicioDetalle =
  | { estado: 'cargando' }
  | { estado: 'error'; mensaje: string }
  | { estado: 'no-encontrado' }
  | { estado: 'listo'; servicio: Servicio }

function estadoInicial(id: string | undefined): EstadoServicioDetalle {
  return id ? { estado: 'cargando' } : { estado: 'no-encontrado' }
}

/** Lee un servicio por id desde la base de datos. */
export function useServicioDetalle(id: string | undefined): EstadoServicioDetalle {
  const [estado, setEstado] = useState<EstadoServicioDetalle>(() => estadoInicial(id))
  const [idPrevio, setIdPrevio] = useState(id)

  // Al navegar de /servicios/1 a /servicios/2 hay que volver a "cargando".
  // Se ajusta durante el render (patron recomendado por React) en vez de en un
  // efecto, que provocaria un render extra con los datos del servicio anterior.
  if (id !== idPrevio) {
    setIdPrevio(id)
    setEstado(estadoInicial(id))
  }

  useEffect(() => {
    if (!id) return

    // StrictMode monta dos veces en desarrollo; tambien evita que una
    // respuesta tardia del id anterior pise a la del actual.
    let cancelado = false

    obtenerServicioPorId(servicioRepository, id)
      .then((servicio) => {
        if (cancelado) return
        setEstado(servicio ? { estado: 'listo', servicio } : { estado: 'no-encontrado' })
      })
      .catch((e: unknown) => {
        if (cancelado) return
        setEstado({
          estado: 'error',
          mensaje: e instanceof Error ? e.message : 'No se pudo cargar el servicio.',
        })
      })

    return () => {
      cancelado = true
    }
  }, [id])

  return estado
}
