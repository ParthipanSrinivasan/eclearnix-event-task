import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { homeFor } from '../utils/routes'
import { PageLoader } from './ui'

/**
 * Guards a group of routes in the UI. The API enforces the same rules;
 * this only keeps people from landing on screens they can't use.
 * Someone with the wrong role is sent to their own dashboard.
 */
export function ProtectedRoute({ role }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  if (role && user.role !== role) return <Navigate to={homeFor(user)} replace />
  return <Outlet />
}
