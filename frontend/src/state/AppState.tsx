import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Booking, BookingDraft, BookingStatus, CurrentUser, Role } from '../types'
import { allBookings } from '../data/bookings'

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

interface AppStateValue {
  currentUser: CurrentUser | null
  login: (role: Role) => void
  logout: () => void
  bookings: Booking[]
  addBooking: (booking: Booking) => void
  updateBookingStatus: (id: string, status: BookingStatus) => void
  rescheduleBooking: (id: string, dateISO: string, time: string) => void
  bookingDraft: BookingDraft
  setBookingDraft: (updater: (draft: BookingDraft) => BookingDraft) => void
  resetBookingDraft: () => void
}

const AppStateContext = createContext<AppStateValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [bookings, setBookings] = useState<Booking[]>(allBookings)
  const [bookingDraft, setBookingDraftState] = useState<BookingDraft>({})

  const login = useCallback((role: Role) => {
    setCurrentUser(DEMO_USERS[role])
  }, [])

  const logout = useCallback(() => {
    setCurrentUser(null)
  }, [])

  const addBooking = useCallback((booking: Booking) => {
    setBookings((prev) => [booking, ...prev])
  }, [])

  const updateBookingStatus = useCallback((id: string, status: BookingStatus) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
  }, [])

  const rescheduleBooking = useCallback((id: string, dateISO: string, time: string) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, dateISO, time } : b)))
  }, [])

  const setBookingDraft = useCallback((updater: (draft: BookingDraft) => BookingDraft) => {
    setBookingDraftState((prev) => updater(prev))
  }, [])

  const resetBookingDraft = useCallback(() => {
    setBookingDraftState({})
  }, [])

  const value = useMemo<AppStateValue>(
    () => ({
      currentUser,
      login,
      logout,
      bookings,
      addBooking,
      updateBookingStatus,
      rescheduleBooking,
      bookingDraft,
      setBookingDraft,
      resetBookingDraft,
    }),
    [currentUser, login, logout, bookings, addBooking, updateBookingStatus, rescheduleBooking, bookingDraft, setBookingDraft, resetBookingDraft],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
