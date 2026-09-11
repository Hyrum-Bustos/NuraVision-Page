export type ServiceCategoryId = 'unas' | 'cabello' | 'piel' | 'diagnostico'

export interface ServiceCategory {
  id: ServiceCategoryId
  label: string
}

export interface Service {
  id: string
  category: ServiceCategoryId
  name: string
  shortDescription: string
  longDescription: string
  durationMin: number
  price: number
  includes: string[]
  imageUrl?: string
  /**
   * Un servicio inactivo se conserva para el historial y las reservas ya
   * tomadas, pero deja de ofrecerse a los clientes para nuevas reservas.
   */
  active: boolean
}

/** 0 = domingo … 6 = sábado (mismo índice que Date.getDay). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface AvailabilityBreak {
  id: string
  start: string
  end: string
  label: string
}

export interface DayAvailability {
  enabled: boolean
  start: string
  end: string
  breaks: AvailabilityBreak[]
}

export type WeeklyAvailability = Record<Weekday, DayAvailability>

export interface Professional {
  id: string
  name: string
  role: string
  experienceYears: number
  bio: string
  specialistBadge?: string
  serviceIds: string[]
  imageUrl?: string
  availability: WeeklyAvailability
}

export type BookingStatus = 'confirmada' | 'en_curso' | 'completada' | 'cancelada'

export interface Booking {
  id: string
  code: string
  serviceId: string
  professionalId: string
  clientName: string
  dateISO: string
  time: string
  durationMin: number
  price: number
  status: BookingStatus
}

export interface AiTip {
  id: string
  title: string
  description: string
  imageUrl?: string
}

export interface AiFocusOption {
  id: string
  label: string
  /** Texto que se muestra al subir la fotografía ("Analizaremos …"). */
  analysisLabel: string
  recommendedServiceIds: string[]
  tips: AiTip[]
  /** Imagen de resultado del análisis. */
  imageUrl?: string
}

export interface SiteContent {
  heroImage?: string
  heroCaption: string
  aiTeaserImage?: string
  aiTeaserCaption: string
  loginImage?: string
  aiFocusOptions: AiFocusOption[]
}

export type Role = 'cliente' | 'profesional' | 'administrador'

export interface CurrentUser {
  role: Role
  name: string
  firstName: string
  lastName: string
  email: string
  phone: string
  initials: string
  clientSince?: string
  professionalId?: string
}

export interface BookingDraft {
  serviceId?: string
  professionalId?: string
  dateISO?: string
  time?: string
}

export interface NextSlotsOptions {
  count?: number
  fromISO?: string
}

export type SlotStatus = 'disponible' | 'reservado' | 'bloqueado' | 'fuera_horario'

export interface DayStatus {
  dateISO: string
  day: number
  status: 'con_cupos' | 'sin_cupos' | 'cerrado'
}

/** Datos editables del prototipo, persistidos en el navegador. */
export interface AppData {
  services: Service[]
  professionals: Professional[]
  bookings: Booking[]
  siteContent: SiteContent
}
