import type { AppData } from '@/shared/types'

const STORAGE_KEY = 'nuravision:data:v1'

export type SaveResult = { ok: true } | { ok: false; reason: 'quota' | 'unavailable' }

/** Lee los datos guardados en el navegador; si no hay o están corruptos, devuelve el fallback. */
export function loadStoredData(fallback: AppData): AppData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback

    const parsed = JSON.parse(raw) as Partial<AppData>
    if (!parsed || typeof parsed !== 'object') return fallback

    return {
      services: Array.isArray(parsed.services) ? parsed.services : fallback.services,
      professionals: Array.isArray(parsed.professionals)
        ? parsed.professionals
        : fallback.professionals,
      bookings: Array.isArray(parsed.bookings) ? parsed.bookings : fallback.bookings,
      siteContent: parsed.siteContent
        ? { ...fallback.siteContent, ...parsed.siteContent }
        : fallback.siteContent,
    }
  } catch {
    return fallback
  }
}

export function saveStoredData(data: AppData): SaveResult {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return { ok: true }
  } catch (error) {
    const isQuota =
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    return { ok: false, reason: isQuota ? 'quota' : 'unavailable' }
  }
}

export function clearStoredData() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Sin almacenamiento disponible: no hay nada que limpiar.
  }
}
