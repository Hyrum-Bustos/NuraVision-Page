import type { ReactNode } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAppState } from '../state/AppState'

export interface NavItem {
  to: string
  label: string
  end?: boolean
}

export function DashboardShell({
  sectionLabel,
  userSubtitle,
  navItems,
}: {
  sectionLabel: string
  userSubtitle: string
  navItems: NavItem[]
}) {
  const { currentUser, logout } = useAppState()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen bg-ivory">
      <aside className="flex w-72 shrink-0 flex-col bg-ink px-6 py-8 text-white/70">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 font-serif-display text-sm text-white">
            N
          </div>
          <div>
            <p className="font-serif-display text-lg text-white">NuraVision</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
              {sectionLabel}
            </p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'border-olive-400 bg-white/[0.06] font-medium text-white'
                    : 'border-transparent text-white/55 hover:text-white/85'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {currentUser && (
          <div className="mt-8 border-t border-white/10 pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white">
                {currentUser.initials}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{currentUser.name}</p>
                <p className="text-xs text-white/45">{userSubtitle}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout()
                navigate('/')
              }}
              className="mt-4 text-xs text-white/45 hover:text-white/80"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </aside>

      <div key={pathname} className="animate-fade-up flex-1 overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  )
}

export function DashboardPage({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-4xl text-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
      {children}
    </div>
  )
}
