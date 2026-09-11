import { Navigate, Outlet } from 'react-router-dom'
import { useAppState } from '../../state/AppState'
import type { Role } from '../types'

export function RequireRole({ role }: { role: Role }) {
  const { currentUser } = useAppState()

  if (!currentUser || currentUser.role !== role) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
