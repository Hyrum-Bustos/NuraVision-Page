export type ServiceCategory = 'unas' | 'cabello' | 'piel' | 'diagnostico'

export interface Service {
  id: string
  category: ServiceCategory
  categoryLabel: string
  name: string
  shortDescription: string
  longDescription: string
  durationMin: number
  price: number
  includes: string[]
  professionalIds: string[]
}

export interface Professional {
  id: string
  name: string
  role: string
  experienceYears: number
  bio: string
  specialistBadge?: string
  serviceIds: string[]
  nextSlots: string[]
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

export type SlotStatus = 'disponible' | 'reservado' | 'bloqueado' | 'fuera_horario'

export interface DayStatus {
  dateISO: string
  day: number
  status: 'con_cupos' | 'sin_cupos' | 'cerrado'
}
