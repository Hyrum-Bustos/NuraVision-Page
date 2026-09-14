import type { ServiceCategory, ServiceCategoryId } from '@/shared/types'

/**
 * Catalogo de categorias de servicio. Vive en el dominio del modulo porque
 * define el vocabulario del negocio, no datos de ejemplo: sobrevive al
 * reemplazo de los seeds por la base de datos real.
 */
export const serviceCategories: ServiceCategory[] = [
  { id: 'unas', label: 'Uñas' },
  { id: 'cabello', label: 'Cabello' },
  { id: 'piel', label: 'Piel' },
  { id: 'diagnostico', label: 'Diagnóstico' },
]

export function categoryLabel(id: ServiceCategoryId): string {
  return serviceCategories.find((c) => c.id === id)?.label ?? id
}
