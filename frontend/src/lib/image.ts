const MAX_FILE_BYTES = 10 * 1024 * 1024
/** Bajo este peso la imagen se guarda tal cual: conserva calidad y transparencia. */
const KEEP_ORIGINAL_BYTES = 150 * 1024

export class ImageError extends Error {}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new ImageError('No pudimos leer el archivo.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new ImageError('El archivo no parece ser una imagen válida.'))
    img.src = src
  })
}

/**
 * Convierte una imagen a data URL para guardarla en el navegador.
 * Las fotos grandes se redimensionan y recomprimen: el almacenamiento local
 * es de unos pocos MB y una sola foto de cámara ya lo llenaría.
 */
export async function fileToStorableDataUrl(
  file: File,
  { maxDimension = 1400, quality = 0.82 } = {},
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new ImageError('El archivo debe ser una imagen (JPG, PNG o WebP).')
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new ImageError('La imagen supera los 10 MB.')
  }

  const original = await readAsDataUrl(file)
  if (file.size <= KEEP_ORIGINAL_BYTES) return original

  const image = await loadImage(original)
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height))
  const width = Math.round(image.width * scale)
  const height = Math.round(image.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) return original

  // Fondo blanco: los PNG con transparencia quedarían negros al pasar a JPEG.
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.drawImage(image, 0, 0, width, height)

  return canvas.toDataURL('image/jpeg', quality)
}

export function approximateDataUrlSize(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] ?? ''
  return Math.round((base64.length * 3) / 4)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
