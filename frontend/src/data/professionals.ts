import type { Professional } from '../types'

export const professionals: Professional[] = [
  {
    id: 'camila-reyes',
    name: 'Camila Reyes',
    role: 'Nail artist',
    experienceYears: 8,
    specialistBadge: 'Especialista',
    bio: 'Especialista en uñas esculpidas y nail art de línea fina. Trabaja con protocolos de bioseguridad estrictos y prioriza la salud de la lámina natural por sobre el largo.',
    serviceIds: ['manicure-ritual-nura', 'pedicure-spa', 'unas-esculpidas'],
    nextSlots: ['Hoy 16:30', 'Mañana 11:00', 'Jue 15:00'],
  },
  {
    id: 'valentina-soto',
    name: 'Valentina Soto',
    role: 'Estilista y colorista',
    experienceYears: 12,
    bio: 'Colorista formada en técnicas de iluminación y corrección de color. Prefiere procesos graduales que cuiden la fibra antes que resultados de una sola sesión.',
    serviceIds: ['tratamiento-capilar-reconstructivo', 'corte-y-peinado', 'coloracion'],
    nextSlots: ['Mañana 10:00', 'Mañana 17:30', 'Vie 12:00'],
  },
  {
    id: 'josefa-miranda',
    name: 'Josefa Miranda',
    role: 'Cosmetóloga',
    experienceYears: 6,
    bio: 'Cosmetóloga con foco en piel sensible y reactiva. Ajusta cada protocolo según la evaluación del día y no según un paquete cerrado.',
    serviceIds: ['limpieza-facial-profunda', 'diagnostico-capilar'],
    nextSlots: ['Hoy 18:00', 'Jue 10:30', 'Sáb 11:00'],
  },
  {
    id: 'andres-fuentes',
    name: 'Andrés Fuentes',
    role: 'Barbero y estilista',
    experienceYears: 9,
    bio: 'Corte clásico y contemporáneo. Le interesa que el peinado se pueda repetir en casa sin herramientas complicadas.',
    serviceIds: ['corte-y-peinado'],
    nextSlots: ['Mañana 09:30', 'Jue 13:00', 'Vie 16:00'],
  },
]

export function getProfessionalById(id: string): Professional | undefined {
  return professionals.find((p) => p.id === id)
}

export function getProfessionalsForService(serviceId: string): Professional[] {
  return professionals.filter((p) => p.serviceIds.includes(serviceId))
}
