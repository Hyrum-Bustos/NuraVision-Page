import type { Service } from '../types'

export const services: Service[] = [
  {
    id: 'manicure-ritual-nura',
    category: 'unas',
    categoryLabel: 'Uñas',
    name: 'Manicure Ritual Nura',
    shortDescription: 'Limado, cutículas, hidratación profunda y esmaltado a elección.',
    longDescription:
      'Un ritual completo de 60 minutos que parte con un baño tibio de sales, sigue con limado y trabajo de cutículas, y termina con una hidratación profunda y el esmaltado que elijas. Pensado para manos que necesitan volver a sentirse cuidadas.',
    durationMin: 60,
    price: 18000,
    includes: [
      'Baño de sales y exfoliación suave',
      'Limado y forma personalizada',
      'Trabajo de cutículas',
      'Masaje de manos con aceite',
      'Esmaltado tradicional o semipermanente',
    ],
    professionalIds: ['camila-reyes'],
  },
  {
    id: 'pedicure-spa',
    category: 'unas',
    categoryLabel: 'Uñas',
    name: 'Pedicure Spa',
    shortDescription: 'Pedicure completo con exfoliación, masaje y esmaltado.',
    longDescription:
      'Pedicure completo de 75 minutos con remojo, exfoliación, limado, masaje descontracturante y esmaltado. Ideal para renovar tus pies de raíz.',
    durationMin: 75,
    price: 22000,
    includes: [
      'Remojo y exfoliación',
      'Limado y forma personalizada',
      'Masaje de pies y piernas',
      'Esmaltado tradicional o semipermanente',
    ],
    professionalIds: ['camila-reyes'],
  },
  {
    id: 'unas-esculpidas',
    category: 'unas',
    categoryLabel: 'Uñas',
    name: 'Uñas esculpidas',
    shortDescription: 'Construcción en acrílico o gel con diseño personalizado.',
    longDescription:
      'Construcción de uñas esculpidas en acrílico o gel, con extensión, forma a elección y diseño personalizado de línea fina. 120 minutos de trabajo detallado.',
    durationMin: 120,
    price: 35000,
    includes: [
      'Preparación y protección de la lámina natural',
      'Extensión en acrílico o gel',
      'Forma a elección',
      'Diseño personalizado',
    ],
    professionalIds: ['camila-reyes'],
  },
  {
    id: 'tratamiento-capilar-reconstructivo',
    category: 'cabello',
    categoryLabel: 'Cabello',
    name: 'Tratamiento capilar reconstructivo',
    shortDescription: 'Reconstrucción de fibra para cabello procesado o quebradizo.',
    longDescription:
      'Tratamiento de reconstrucción profunda de 90 minutos para cabello procesado, dañado o quebradizo. Repone la fibra capilar y devuelve elasticidad y brillo.',
    durationMin: 90,
    price: 28000,
    includes: [
      'Diagnóstico capilar previo',
      'Reconstrucción de fibra',
      'Hidratación profunda',
      'Sellado y finalizado',
    ],
    professionalIds: ['valentina-soto'],
  },
  {
    id: 'corte-y-peinado',
    category: 'cabello',
    categoryLabel: 'Cabello',
    name: 'Corte y peinado',
    shortDescription: 'Corte según tu tipo de cabello y peinado de salida.',
    longDescription:
      'Corte técnico según tu tipo de cabello y estructura facial, más peinado de salida. 45 minutos pensados para un resultado que se pueda repetir en casa.',
    durationMin: 45,
    price: 15000,
    includes: ['Diagnóstico y asesoría', 'Corte técnico', 'Lavado', 'Peinado de salida'],
    professionalIds: ['valentina-soto', 'andres-fuentes'],
  },
  {
    id: 'coloracion',
    category: 'cabello',
    categoryLabel: 'Cabello',
    name: 'Coloración',
    shortDescription: 'Color global, retoque de raíz o técnicas de iluminación.',
    longDescription:
      'Servicio de color de 150 minutos: color global, retoque de raíz o técnicas de iluminación y corrección de color, según lo que tu cabello necesite.',
    durationMin: 150,
    price: 52000,
    includes: [
      'Diagnóstico de fibra y cuero cabelludo',
      'Aplicación de color a medida',
      'Tratamiento post-color',
      'Peinado de salida',
    ],
    professionalIds: ['valentina-soto'],
  },
  {
    id: 'limpieza-facial-profunda',
    category: 'piel',
    categoryLabel: 'Piel',
    name: 'Limpieza facial profunda',
    shortDescription: 'Higiene, extracción y mascarilla según tu tipo de piel.',
    longDescription:
      'Limpieza facial profunda de 60 minutos: higiene, exfoliación, extracción y mascarilla formulada según tu tipo de piel y su evaluación del día.',
    durationMin: 60,
    price: 25000,
    includes: [
      'Doble limpieza',
      'Exfoliación e higiene profunda',
      'Extracción',
      'Mascarilla según tipo de piel',
    ],
    professionalIds: ['josefa-miranda'],
  },
  {
    id: 'diagnostico-capilar',
    category: 'diagnostico',
    categoryLabel: 'Diagnóstico',
    name: 'Diagnóstico capilar y de cuero cabelludo',
    shortDescription: 'Evaluación con lupa digital y plan de cuidado sugerido.',
    longDescription:
      'Evaluación de 30 minutos del cuero cabelludo y la fibra capilar con lupa digital, con un plan de cuidado sugerido a partir de lo observado.',
    durationMin: 30,
    price: 12000,
    includes: ['Evaluación con lupa digital', 'Registro fotográfico', 'Plan de cuidado sugerido'],
    professionalIds: ['josefa-miranda'],
  },
]

export function getServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id)
}

export const categoryFilters: { value: 'todos' | Service['category']; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'unas', label: 'Uñas' },
  { value: 'cabello', label: 'Cabello' },
  { value: 'piel', label: 'Piel' },
  { value: 'diagnostico', label: 'Diagnóstico' },
]
