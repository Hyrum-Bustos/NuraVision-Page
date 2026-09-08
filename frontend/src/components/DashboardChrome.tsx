import type { ReactNode } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, type LucideIcon } from 'lucide-react'
import { useAppState } from '../state/AppState'

export interface NavItem {
  to: string
  label: string
  icon?: LucideIcon
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
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 font-medium text-white'
                      : 'text-white/55 hover:bg-white/5 hover:text-white/90'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-olive-400 transition-all duration-200 ${
                        isActive ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    {Icon && (
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? 'text-olive-400' : 'text-white/40 group-hover:text-white/70'
                        }`}
                      />
                    )}
                    {item.label}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {currentUser && (
          <div className="mt-8 border-t border-white/10 pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white">
                {currentUser.initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{currentUser.name}</p>
                <p className="truncate text-xs text-white/45">{userSubtitle}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout()
                navigate('/')
              }}
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-white/45 transition-colors hover:text-white/80"
            >
              <LogOut className="h-3.5 w-3.5" />
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
