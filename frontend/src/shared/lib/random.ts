/**
 * Pseudoaleatoriedad determinista (FNV-1a). La misma semilla devuelve siempre
 * el mismo valor, así la demo no cambia entre recargas ni entre equipos.
 *
 * Vive en su propio módulo porque lo usan tanto los datos semilla como el
 * cálculo de disponibilidad, y `availability` ya importa de `seed`.
 */
function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** Valor en el rango [0, 1) derivado de la semilla. */
export function seededRandom(seed: string): number {
  return (hashString(seed) % 10000) / 10000
}
