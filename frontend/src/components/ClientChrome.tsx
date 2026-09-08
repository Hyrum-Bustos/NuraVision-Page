import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useAppState } from '../state/AppState'
import { Avatar, LinkButton } from './ui'

function Brand() {
  return (
    <NavLink to="/" className="flex items-baseline gap-2">
      <span className="font-serif-display text-2xl text-ink">Estudio Nura</span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
        Nuravision
      </span>
    </NavLink>
  )
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm transition-colors ${isActive ? 'font-medium text-ink' : 'text-muted hover:text-ink'}`

export function ClientHeader() {
  const { currentUser, logout } = useAppState()
  const navigate = useNavigate()
  const authed = currentUser?.role === 'cliente'

  return (
    <header className="sticky top-0 z-30 border-b border-line-soft bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-10">
          <Brand />
          <nav className="hidden items-center gap-7 md:flex">
            <NavLink to="/" className={navLinkClass} end>
              Inicio
            </NavLink>
            <NavLink to="/servicios" className={navLinkClass}>
              Servicios
            </NavLink>
            <NavLink to="/profesionales" className={navLinkClass}>
              Profesionales
            </NavLink>
            {authed ? (
              <>
                <NavLink to="/reservar" className={navLinkClass}>
                  Reservar
                </NavLink>
                <NavLink to="/mis-reservas" className={navLinkClass}>
                  Mis reservas
                </NavLink>
              </>
            ) : (
              <NavLink to="/analisis-ia" className={navLinkClass}>
                Análisis IA
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {authed ? (
            <>
              <NavLink
                to="/analisis-ia"
                className="hidden items-center gap-1.5 rounded-full border border-line px-4 py-1.5 text-sm text-ink hover:bg-white sm:flex"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-olive-600" />
                Análisis IA
              </NavLink>
              <button
                onClick={() => navigate('/perfil')}
                className="flex items-center gap-2"
                title="Mi perfil"
              >
                <Avatar initials={currentUser.initials} />
                <span className="hidden text-sm text-ink sm:inline">{currentUser.firstName}</span>
              </button>
              <button
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="hidden text-sm text-muted hover:text-ink sm:inline"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="hidden text-sm text-ink hover:text-muted sm:inline">
                Iniciar sesión
              </NavLink>
              <LinkButton to="/reservar">Reservar ahora</LinkButton>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export function ClientFooter() {
  return (
    <footer className="border-t border-line-soft bg-ivory">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-serif-display text-xl text-ink">Estudio Nura</span>
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted">
          <span>Av. Libertad 1250, Viña del Mar</span>
          <span>+56 9 1234 5678</span>
          <span>Mar a Sáb · 10:00-19:00</span>
        </div>
      </div>
    </footer>
  )
}

export function ClientLayout() {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <ClientHeader />
      {/* La clave por ruta reinicia la animación de entrada en cada página. */}
      <main key={pathname} className="animate-fade-up flex-1">
        <Outlet />
      </main>
      <ClientFooter />
    </div>
  )
}

export function AIBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-olive-700">
      <Sparkles className="h-3.5 w-3.5" />
      Nuravision IA
    </span>
  )
}
