import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  AppData,
  Booking,
  BookingDraft,
  BookingStatus,
  CurrentUser,
  NextSlotsOptions,
  Professional,
  Role,
  Service,
  SiteContent,
} from '../types'
import { createSeedData } from '../data/seed'
import { clearStoredData, loadStoredData, saveStoredData } from '../lib/storage'
import { getNextAvailableSlots, type NextSlot } from '../lib/availability'

const DEMO_USERS: Record<Role, CurrentUser> = {
  cliente: {
    role: 'cliente',
    name: 'Camila Torres',
    firstName: 'Camila',
    lastName: 'Torres',
    email: 'camila.torres@correo.cl',
    phone: '+56 9 8765 4321',
    initials: 'CT',
    clientSince: 'marzo 2025',
  },
  profesional: {
    role: 'profesional',
    name: 'Camila Reyes',
    firstName: 'Camila',
    lastName: 'Reyes',
    email: 'camila.reyes@estudionura.cl',
    phone: '+56 9 1122 3344',
    initials: 'CR',
    professionalId: 'camila-reyes',
  },
  administrador: {
    role: 'administrador',
    name: 'Paulina Nura',
    firstName: 'Paulina',
    lastName: 'Nura',
    email: 'paulina@estudionura.cl',
    phone: '+56 9 5566 7788',
    initials: 'PN',
  },
}

export function createId(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `${prefix}-${random}`
}

interface AppStateValue {
  // Sesión
  currentUser: CurrentUser | null
  login: (role: Role) => void
  logout: () => void

  // Catálogo
  services: Service[]
  getService: (id: string) => Service | undefined
  addService: (service: Omit<Service, 'id'>) => Service
  updateService: (id: string, patch: Partial<Omit<Service, 'id'>>) => void
  deleteService: (id: string) => void

  // Equipo
  professionals: Professional[]
  getProfessional: (id: string) => Professional | undefined
  professionalsForService: (serviceId: string) => Professional[]
  addProfessional: (professional: Omit<Professional, 'id'>) => Professional
  updateProfessional: (id: string, patch: Partial<Omit<Professional, 'id'>>) => void
  deleteProfessional: (id: string) => void

  // Contenido editable del sitio
  siteContent: SiteContent
  updateSiteContent: (patch: Partial<SiteContent>) => void

  // Reservas
  bookings: Booking[]
  addBooking: (booking: Booking) => void
  updateBookingStatus: (id: string, status: BookingStatus) => void
  rescheduleBooking: (id: string, dateISO: string, time: string) => void
  nextSlotsFor: (professional: Professional, options?: NextSlotsOptions) => NextSlot[]

  // Borrador del asistente de reserva
  bookingDraft: BookingDraft
  setBookingDraft: (updater: (draft: BookingDraft) => BookingDraft) => void
  resetBookingDraft: () => void

  // Prototipo
  storageWarning: string | null
  resetDemoData: () => void
}

const AppStateContext = createContext<AppStateValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadStoredData(createSeedData()))
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [bookingDraft, setBookingDraftState] = useState<BookingDraft>({})
  const [storageWarning, setStorageWarning] = useState<string | null>(null)

  useEffect(() => {
    const result = saveStoredData(data)
    if (result.ok) {
      setStorageWarning(null)
    } else {
      setStorageWarning(
        result.reason === 'quota'
          ? 'No se pudieron guardar los cambios: el almacenamiento del navegador está lleno. Usa imágenes más livianas o restablece los datos de demostración.'
          : 'No se pudieron guardar los cambios en este navegador.',
      )
    }
  }, [data])

  const login = useCallback((role: Role) => setCurrentUser(DEMO_USERS[role]), [])
  const logout = useCallback(() => setCurrentUser(null), [])

  // --- Servicios ---
  const addService = useCallback((service: Omit<Service, 'id'>) => {
    const created: Service = { ...service, id: createId('svc') }
    setData((prev) => ({ ...prev, services: [...prev.services, created] }))
    return created
  }, [])

  const updateService = useCallback((id: string, patch: Partial<Omit<Service, 'id'>>) => {
    setData((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }))
  }, [])

  const deleteService = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
      // El servicio deja de existir también en el equipo y en las recomendaciones de la IA.
      professionals: prev.professionals.map((p) => ({
        ...p,
        serviceIds: p.serviceIds.filter((serviceId) => serviceId !== id),
      })),
      siteContent: {
        ...prev.siteContent,
        aiFocusOptions: prev.siteContent.aiFocusOptions.map((option) => ({
          ...option,
          recommendedServiceIds: option.recommendedServiceIds.filter(
            (serviceId) => serviceId !== id,
          ),
        })),
      },
    }))
  }, [])

  // --- Profesionales ---
  const addProfessional = useCallback((professional: Omit<Professional, 'id'>) => {
    const created: Professional = { ...professional, id: createId('pro') }
    setData((prev) => ({ ...prev, professionals: [...prev.professionals, created] }))
    return created
  }, [])

  const updateProfessional = useCallback(
    (id: string, patch: Partial<Omit<Professional, 'id'>>) => {
      setData((prev) => ({
        ...prev,
        professionals: prev.professionals.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }))
    },
    [],
  )

  const deleteProfessional = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      professionals: prev.professionals.filter((p) => p.id !== id),
    }))
  }, [])

  // --- Contenido del sitio ---
  const updateSiteContent = useCallback((patch: Partial<SiteContent>) => {
    setData((prev) => ({ ...prev, siteContent: { ...prev.siteContent, ...patch } }))
  }, [])

  // --- Reservas ---
  const addBooking = useCallback((booking: Booking) => {
    setData((prev) => ({ ...prev, bookings: [booking, ...prev.bookings] }))
  }, [])

  const updateBookingStatus = useCallback((id: string, status: BookingStatus) => {
    setData((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) => (b.id === id ? { ...b, status } : b)),
    }))
  }, [])

  const rescheduleBooking = useCallback((id: string, dateISO: string, time: string) => {
    setData((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) => (b.id === id ? { ...b, dateISO, time } : b)),
    }))
  }, [])

  // --- Borrador de reserva ---
  const setBookingDraft = useCallback((updater: (draft: BookingDraft) => BookingDraft) => {
    setBookingDraftState((prev) => updater(prev))
  }, [])

  const resetBookingDraft = useCallback(() => setBookingDraftState({}), [])

  const resetDemoData = useCallback(() => {
    clearStoredData()
    setData(createSeedData())
    setBookingDraftState({})
  }, [])

  const value = useMemo<AppStateValue>(() => {
    const getService = (id: string) => data.services.find((s) => s.id === id)
    const getProfessional = (id: string) => data.professionals.find((p) => p.id === id)

    return {
      currentUser,
      login,
      logout,

      services: data.services,
      getService,
      addService,
      updateService,
      deleteService,

      professionals: data.professionals,
      getProfessional,
      professionalsForService: (serviceId: string) =>
        data.professionals.filter((p) => p.serviceIds.includes(serviceId)),
      addProfessional,
      updateProfessional,
      deleteProfessional,

      siteContent: data.siteContent,
      updateSiteContent,

      bookings: data.bookings,
      addBooking,
      updateBookingStatus,
      rescheduleBooking,
      nextSlotsFor: (professional, options) =>
        getNextAvailableSlots(professional, data.bookings, options?.count ?? 3, options?.fromISO),

      bookingDraft,
      setBookingDraft,
      resetBookingDraft,

      storageWarning,
      resetDemoData,
    }
  }, [
    data,
    currentUser,
    login,
    logout,
    addService,
    updateService,
    deleteService,
    addProfessional,
    updateProfessional,
    deleteProfessional,
    updateSiteContent,
    addBooking,
    updateBookingStatus,
    rescheduleBooking,
    bookingDraft,
    setBookingDraft,
    resetBookingDraft,
    storageWarning,
    resetDemoData,
  ])

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState debe usarse dentro de AppStateProvider')
  return ctx
}
