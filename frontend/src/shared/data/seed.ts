import type {
  AppData,
  Booking,
  DayAvailability,
  Professional,
  Service,
  SiteContent,
  WeeklyAvailability,
} from '@/shared/types'

/**
 * "Hoy" del prototipo. Los datos de ejemplo giran en torno a esta fecha
 * (martes 1 de septiembre de 2026) para que agenda, paneles y calendario
 * cuenten la misma historia.
 */
export const TODAY_ISO = '2026-09-01'

function day(
  enabled: boolean,
  start = '10:00',
  end = '19:00',
  breaks: DayAvailability['breaks'] = [],
): DayAvailability {
  return { enabled, start, end, breaks }
}

function lunch(start = '13:00', end = '14:00'): DayAvailability['breaks'] {
  return [{ id: 'colacion', start, end, label: 'Colación' }]
}

/** Horario base para un profesional nuevo: el mismo del estudio. */
export function createDefaultAvailability(): WeeklyAvailability {
  return studioWeek()
}

/** Mar a Sáb, con colación al mediodía: el horario del estudio. */
function studioWeek(overrides: Partial<WeeklyAvailability> = {}): WeeklyAvailability {
  return {
    0: day(false),
    1: day(false),
    2: day(true, '10:00', '19:00', lunch()),
    3: day(true, '10:00', '19:00', lunch()),
    4: day(true, '10:00', '19:00', lunch()),
    5: day(true, '10:00', '19:00', lunch()),
    6: day(true, '10:00', '15:00'),
    ...overrides,
  }
}

export const seedServices: Service[] = [
  {
    id: 'manicure-ritual-nura',
    category: 'unas',
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
  },
  {
    id: 'pedicure-spa',
    category: 'unas',
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
  },
  {
    id: 'unas-esculpidas',
    category: 'unas',
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
  },
  {
    id: 'tratamiento-capilar-reconstructivo',
    category: 'cabello',
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
  },
  {
    id: 'corte-y-peinado',
    category: 'cabello',
    name: 'Corte y peinado',
    shortDescription: 'Corte según tu tipo de cabello y peinado de salida.',
    longDescription:
      'Corte técnico según tu tipo de cabello y estructura facial, más peinado de salida. 45 minutos pensados para un resultado que se pueda repetir en casa.',
    durationMin: 45,
    price: 15000,
    includes: ['Diagnóstico y asesoría', 'Corte técnico', 'Lavado', 'Peinado de salida'],
  },
  {
    id: 'coloracion',
    category: 'cabello',
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
  },
  {
    id: 'limpieza-facial-profunda',
    category: 'piel',
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
  },
  {
    id: 'diagnostico-capilar',
    category: 'diagnostico',
    name: 'Diagnóstico capilar y de cuero cabelludo',
    shortDescription: 'Evaluación con lupa digital y plan de cuidado sugerido.',
    longDescription:
      'Evaluación de 30 minutos del cuero cabelludo y la fibra capilar con lupa digital, con un plan de cuidado sugerido a partir de lo observado.',
    durationMin: 30,
    price: 12000,
    includes: ['Evaluación con lupa digital', 'Registro fotográfico', 'Plan de cuidado sugerido'],
  },
]

export const seedProfessionals: Professional[] = [
  {
    id: 'camila-reyes',
    name: 'Camila Reyes',
    role: 'Nail artist',
    experienceYears: 8,
    specialistBadge: 'Especialista',
    bio: 'Especialista en uñas esculpidas y nail art de línea fina. Trabaja con protocolos de bioseguridad estrictos y prioriza la salud de la lámina natural por sobre el largo.',
    serviceIds: ['manicure-ritual-nura', 'pedicure-spa', 'unas-esculpidas'],
    availability: studioWeek(),
  },
  {
    id: 'valentina-soto',
    name: 'Valentina Soto',
    role: 'Estilista y colorista',
    experienceYears: 12,
    bio: 'Colorista formada en técnicas de iluminación y corrección de color. Prefiere procesos graduales que cuiden la fibra antes que resultados de una sola sesión.',
    serviceIds: ['tratamiento-capilar-reconstructivo', 'corte-y-peinado', 'coloracion'],
    availability: studioWeek(),
  },
  {
    id: 'josefa-miranda',
    name: 'Josefa Miranda',
    role: 'Cosmetóloga',
    experienceYears: 6,
    bio: 'Cosmetóloga con foco en piel sensible y reactiva. Ajusta cada protocolo según la evaluación del día y no según un paquete cerrado.',
    serviceIds: ['limpieza-facial-profunda', 'diagnostico-capilar'],
    // No atiende los martes.
    availability: studioWeek({ 2: day(false) }),
  },
  {
    id: 'andres-fuentes',
    name: 'Andrés Fuentes',
    role: 'Barbero y estilista',
    experienceYears: 9,
    bio: 'Corte clásico y contemporáneo. Le interesa que el peinado se pueda repetir en casa sin herramientas complicadas.',
    serviceIds: ['corte-y-peinado'],
    // Jornada más larga y también atiende lunes.
    availability: studioWeek({
      1: day(true, '11:00', '20:00', lunch('14:00', '15:00')),
      6: day(true, '10:00', '16:00'),
    }),
  },
]

export const seedBookings: Booking[] = [
  {
    id: 'b-1001',
    code: 'NV-0109-1001',
    serviceId: 'manicure-ritual-nura',
    professionalId: 'camila-reyes',
    clientName: 'Camila Torres',
    dateISO: '2026-09-01',
    time: '10:00',
    durationMin: 60,
    price: 18000,
    status: 'completada',
  },
  {
    id: 'b-1002',
    code: 'NV-0109-1002',
    serviceId: 'unas-esculpidas',
    professionalId: 'camila-reyes',
    clientName: 'Fernanda Alarcón',
    dateISO: '2026-09-01',
    time: '11:00',
    durationMin: 120,
    price: 35000,
    status: 'en_curso',
  },
  {
    id: 'b-1003',
    code: 'NV-0109-1003',
    serviceId: 'pedicure-spa',
    professionalId: 'camila-reyes',
    clientName: 'Josefina Rojas',
    dateISO: '2026-09-01',
    time: '14:00',
    durationMin: 75,
    price: 22000,
    status: 'confirmada',
  },
  {
    id: 'b-1004',
    code: 'NV-0109-1004',
    serviceId: 'manicure-ritual-nura',
    professionalId: 'camila-reyes',
    clientName: 'Antonia Vera',
    dateISO: '2026-09-01',
    time: '15:30',
    durationMin: 60,
    price: 18000,
    status: 'confirmada',
  },
  {
    id: 'b-1005',
    code: 'NV-0109-1005',
    serviceId: 'unas-esculpidas',
    professionalId: 'camila-reyes',
    clientName: 'Sofía Bravo',
    dateISO: '2026-09-01',
    time: '17:00',
    durationMin: 120,
    price: 35000,
    status: 'confirmada',
  },
  {
    id: 'b-1006',
    code: 'NV-1809-1006',
    serviceId: 'corte-y-peinado',
    professionalId: 'andres-fuentes',
    clientName: 'Camila Torres',
    dateISO: '2026-09-18',
    time: '11:00',
    durationMin: 45,
    price: 15000,
    status: 'confirmada',
  },
  {
    id: 'b-1007',
    code: 'NV-2008-1007',
    serviceId: 'limpieza-facial-profunda',
    professionalId: 'josefa-miranda',
    clientName: 'Camila Torres',
    dateISO: '2026-08-20',
    time: '10:00',
    durationMin: 60,
    price: 25000,
    status: 'cancelada',
  },
  {
    id: 'b-1008',
    code: 'NV-2808-1008',
    serviceId: 'coloracion',
    professionalId: 'valentina-soto',
    clientName: 'Antonia Vera',
    dateISO: '2026-08-28',
    time: '10:00',
    durationMin: 150,
    price: 52000,
    status: 'cancelada',
  },
  {
    id: 'b-1009',
    code: 'NV-2509-1009',
    serviceId: 'corte-y-peinado',
    professionalId: 'andres-fuentes',
    clientName: 'Matías Cortés',
    dateISO: '2026-09-25',
    time: '12:00',
    durationMin: 45,
    price: 15000,
    status: 'confirmada',
  },
]

export const seedSiteContent: SiteContent = {
  heroCaption: 'Fotografía · Salón / interior',
  aiTeaserCaption: 'Detalle · Manos y uñas',
  aiFocusOptions: [
    {
      id: 'manos',
      label: 'Manos y uñas',
      analysisLabel: 'manos y uñas',
      recommendedServiceIds: ['manicure-ritual-nura', 'unas-esculpidas', 'pedicure-spa'],
      tips: [
        {
          id: 'manos-luz',
          title: 'Luz natural',
          description: 'Cerca de una ventana, sin flash directo.',
        },
        {
          id: 'manos-fondo',
          title: 'Fondo neutro',
          description: 'Una superficie lisa y clara funciona mejor.',
        },
        {
          id: 'manos-encuadre',
          title: 'Encuadre completo',
          description: 'Que se vean las cuatro uñas y el borde libre.',
        },
        {
          id: 'manos-esmalte',
          title: 'Sin esmalte',
          description: 'Si es posible, retíralo antes de fotografiar.',
        },
      ],
    },
    {
      id: 'piel',
      label: 'Tono de piel',
      analysisLabel: 'tono de piel',
      recommendedServiceIds: ['limpieza-facial-profunda'],
      tips: [
        {
          id: 'piel-luz',
          title: 'Luz natural',
          description: 'De día y de frente, sin filtros ni flash.',
        },
        {
          id: 'piel-maquillaje',
          title: 'Sin maquillaje',
          description: 'La piel limpia entrega una lectura más fiel.',
        },
        {
          id: 'piel-encuadre',
          title: 'Rostro completo',
          description: 'Toma frontal, con el rostro dentro del cuadro.',
        },
        {
          id: 'piel-fondo',
          title: 'Fondo neutro',
          description: 'Una pared clara evita reflejos de color.',
        },
      ],
    },
    {
      id: 'cuero',
      label: 'Cuero cabelludo',
      analysisLabel: 'cuero cabelludo',
      recommendedServiceIds: ['diagnostico-capilar', 'tratamiento-capilar-reconstructivo'],
      tips: [
        {
          id: 'cuero-luz',
          title: 'Luz natural',
          description: 'Junto a una ventana, sin sombras sobre la cabeza.',
        },
        {
          id: 'cuero-raiz',
          title: 'Raíz visible',
          description: 'Separa el cabello para que se vea el cuero cabelludo.',
        },
        {
          id: 'cuero-seco',
          title: 'Cabello seco',
          description: 'Sin productos ni humedad al momento de la foto.',
        },
        {
          id: 'cuero-tomas',
          title: 'Varias tomas',
          description: 'Una de la raíz y otra de los largos ayuda mucho.',
        },
      ],
    },
  ],
}

export function createSeedData(): AppData {
  // Copia profunda: el estado es mutable y no debe tocar las constantes semilla.
  return structuredClone({
    services: seedServices,
    professionals: seedProfessionals,
    bookings: seedBookings,
    siteContent: seedSiteContent,
  })
}
