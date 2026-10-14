import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import UserDashboard from './pages/UserDashboard'
import NotFound from './pages/NotFound'
import AdminDashboard from './pages/admin/AdminDashboard'
import EventForm from './pages/admin/EventForm'
import EventRegistrations from './pages/admin/EventRegistrations'
import { ADMIN_HOME, USER_HOME, homeFor } from './utils/routes'

/**
 * Logged-in users have no reason to see the login / sign-up pages. This also
 * fires right after logging in: it returns people to the page they came from,
 * or to their own dashboard (admins → /dashboard-admin, users → /dashboard-users).
 */
function GuestOnly({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  if (user) return <Navigate to={location.state?.from ?? homeFor(user)} replace />
  return children
}

/** Keeps old /admin/... links working after the move to /dashboard-admin/... */
function LegacyAdminRedirect() {
  const { '*': rest } = useParams()
  return <Navigate to={rest ? `${ADMIN_HOME}/${rest}` : ADMIN_HOME} replace />
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Events />} />
        <Route path="events/:id" element={<EventDetails />} />
        <Route path="login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="register" element={<GuestOnly><Register /></GuestOnly>} />

        <Route path={USER_HOME} element={<ProtectedRoute role="USER" />}>
          <Route index element={<UserDashboard />} />
        </Route>

        <Route path={ADMIN_HOME} element={<ProtectedRoute role="ADMIN" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="events/new" element={<EventForm />} />
          <Route path="events/:id/edit" element={<EventForm />} />
          <Route path="events/:id/registrations" element={<EventRegistrations />} />
        </Route>

        {/* Old paths */}
        <Route path="my-registrations" element={<Navigate to={USER_HOME} replace />} />
        <Route path="admin/*" element={<LegacyAdminRedirect />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
