import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Lleva el scroll al inicio de la pantalla.
 *
 * Usa `behavior: 'instant'` a propósito: el CSS global define
 * `scroll-behavior: smooth` (para los enlaces internos), y con `auto` el reset
 * se vería como un desplazamiento animado de medio segundo.
 *
 * Se repite en el frame siguiente y unos milisegundos después porque las
 * fuentes e imágenes que cargan tras el primer pintado cambian el alto del
 * documento y el navegador puede reposicionar el scroll.
 */
function scrollToTopNow() {
  const jump = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

  jump()
  const raf = requestAnimationFrame(jump)
  const timeout = window.setTimeout(jump, 80)

  return () => {
    cancelAnimationFrame(raf)
    window.clearTimeout(timeout)
  }
}

/** Devuelve el scroll al inicio cada vez que cambia la ruta. */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Evita que el navegador restaure la posición previa al navegar.
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useLayoutEffect(() => scrollToTopNow(), [pathname])

  return null
}

/** Devuelve el scroll al inicio cuando cambia un paso interno (asistente, tabs, etc.). */
export function useScrollToTopOnChange(dependency: unknown) {
  useLayoutEffect(() => scrollToTopNow(), [dependency])
}
