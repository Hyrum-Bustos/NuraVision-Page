import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppStateProvider } from './state/AppState'
import { ClientLayout } from './components/ClientChrome'
import { DashboardShell } from './components/DashboardChrome'
import { RequireRole } from './components/RequireRole'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import Professionals from './pages/Professionals'
import ProfessionalDetail from './pages/ProfessionalDetail'
import BookingFlow from './pages/BookingFlow'
import MyBookings from './pages/MyBookings'
import BookingDetail from './pages/BookingDetail'
import AIAnalysis from './pages/AIAnalysis'
import Profile from './pages/Profile'

import ProDashboard from './pages/professional/ProDashboard'
import ProAgenda from './pages/professional/ProAgenda'
import ProAvailability from './pages/professional/ProAvailability'
import ProHistory from './pages/professional/ProHistory'
import ProServices from './pages/professional/ProServices'
import ProProfile from './pages/professional/ProProfile'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminBookings from './pages/admin/AdminBookings'
import AdminClients from './pages/admin/AdminClients'
import AdminProfessionals from './pages/admin/AdminProfessionals'
import AdminServices from './pages/admin/AdminServices'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminSettings from './pages/admin/AdminSettings'

const PROFESSIONAL_NAV = [
  { to: '/profesional', label: 'Inicio', end: true },
  { to: '/profesional/agenda', label: 'Mi agenda' },
  { to: '/profesional/reservas', label: 'Reservas' },
  { to: '/profesional/disponibilidad', label: 'Disponibilidad' },
  { to: '/profesional/servicios', label: 'Servicios' },
  { to: '/profesional/perfil', label: 'Perfil' },
]

const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/reservas', label: 'Reservas' },
  { to: '/admin/clientes', label: 'Clientes' },
  { to: '/admin/profesionales', label: 'Profesionales' },
  { to: '/admin/servicios', label: 'Servicios' },
  { to: '/admin/analitica', label: 'Analítica' },
  { to: '/admin/configuracion', label: 'Configuración' },
]

export default function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Register />} />

          <Route element={<ClientLayout />}>
            <Route index element={<Landing />} />
            <Route path="servicios" element={<Services />} />
            <Route path="servicios/:id" element={<ServiceDetail />} />
            <Route path="profesionales" element={<Professionals />} />
            <Route path="profesionales/:id" element={<ProfessionalDetail />} />
            <Route path="reservar" element={<BookingFlow />} />
            <Route path="mis-reservas" element={<MyBookings />} />
            <Route path="mis-reservas/:id" element={<BookingDetail />} />
            <Route path="analisis-ia" element={<AIAnalysis />} />
            <Route path="perfil" element={<Profile />} />
          </Route>

          <Route element={<RequireRole role="profesional" />}>
            <Route
              element={
                <DashboardShell
                  sectionLabel="Panel profesional"
                  userSubtitle="Nail artist"
                  navItems={PROFESSIONAL_NAV}
                />
              }
            >
              <Route path="profesional" element={<ProDashboard />} />
              <Route path="profesional/agenda" element={<ProAgenda />} />
              <Route path="profesional/disponibilidad" element={<ProAvailability />} />
              <Route path="profesional/reservas" element={<ProHistory />} />
              <Route path="profesional/servicios" element={<ProServices />} />
              <Route path="profesional/perfil" element={<ProProfile />} />
            </Route>
          </Route>

          <Route element={<RequireRole role="administrador" />}>
            <Route
              element={
                <DashboardShell
                  sectionLabel="Administración"
                  userSubtitle="Administradora"
                  navItems={ADMIN_NAV}
                />
              }
            >
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/reservas" element={<AdminBookings />} />
              <Route path="admin/clientes" element={<AdminClients />} />
              <Route path="admin/profesionales" element={<AdminProfessionals />} />
              <Route path="admin/servicios" element={<AdminServices />} />
              <Route path="admin/analitica" element={<AdminAnalytics />} />
              <Route path="admin/configuracion" element={<AdminSettings />} />
            </Route>
          </Route>

          <Route path="*" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    </AppStateProvider>
  )
}
