import { Navigate, Outlet } from 'react-router-dom'
import { useAppState } from '@/shared/state/AppState'
import type { Role } from '@/shared/types'

export function RequireRole({ role }: { role: Role }) {
  const { currentUser } = useAppState()

  if (!currentUser || currentUser.role !== role) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
