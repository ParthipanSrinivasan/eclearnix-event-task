import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { eventsApi, registrationsApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EventAdminActions } from '../components/EventAdminActions'
import { Badge, Button, ButtonLink, ErrorState, PageLoader, SeatsBar } from '../components/ui'
import { useFetch } from '../hooks/useFetch'
import { formatDateTime, isPast } from '../utils/format'
import { ADMIN_HOME, adminPaths } from '../utils/routes'

export default function EventDetails() {
  const { id } = useParams()
  const { data, error, loading, reload } = useFetch(() => eventsApi.get(id), [id])

  if (loading && !data) return <PageLoader />
  if (error) {
    return error.status === 404 ? (
      <ErrorState message="This event doesn't exist or is no longer available." />
    ) : (
      <ErrorState message={error.message} onRetry={reload} />
    )
  }

  const { event, myRegistration } = data
  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
        ← All events
      </Link>

      <article className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-6 py-8 text-white sm:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">{event.category}</span>
            {event.status === 'DISABLED' && (
              <span className="rounded-full bg-slate-900/40 px-2.5 py-0.5 text-xs font-semibold">Disabled · hidden from users</span>
            )}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">{event.name}</h1>
          <p className="mt-2 text-indigo-100">
            {formatDateTime(event.dateTime)} · {event.location}
          </p>
        </div>

        <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_16rem]">
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">About this event</h2>
            <p className="whitespace-pre-line text-slate-700">{event.description}</p>
          </div>

          <aside className="space-y-4 rounded-xl bg-slate-50 p-4">
            <SeatsBar registered={event.registeredCount} max={event.maxParticipants} />
            <RegistrationPanel event={event} registration={myRegistration} onChange={reload} />
          </aside>
        </div>
      </article>
    </div>
  )
}

function RegistrationPanel({ event, registration, onChange }) {
  const { user, isAdmin } = useAuth()
  const toast = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const isRegistered = registration?.status === 'REGISTERED'
  const ended = isPast(event.dateTime)

  async function run(action, successMessage) {
    setBusy(true)
    try {
      await action()
      toast.success(successMessage)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
      setConfirmCancel(false)
      onChange()
    }
  }

  if (!user) {
    return (
      <ButtonLink to="/login" state={{ from: location.pathname }} className="w-full">
        Log in to register
      </ButtonLink>
    )
  }

  if (isAdmin) {
    return (
      <div className="space-y-2">
        <ButtonLink to={adminPaths.registrations(event.id)} className="w-full">
          View registrations
        </ButtonLink>
        <EventAdminActions
          event={event}
          variant="secondary"
          showRegistrations={false}
          onChanged={onChange}
          onDeleted={() => navigate(ADMIN_HOME)}
          stacked
        />
      </div>
    )
  }

  if (isRegistered) {
    return (
      <div className="space-y-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <span aria-hidden="true">✓</span> You're registered
        </p>
        {!ended && (
          <Button variant="secondary" className="w-full" onClick={() => setConfirmCancel(true)}>
            Cancel registration
          </Button>
        )}
        <ConfirmDialog
          open={confirmCancel}
          title="Cancel your registration?"
          message={`Your seat at "${event.name}" will be released for someone else.`}
          confirmLabel="Cancel registration"
          danger
          loading={busy}
          onCancel={() => setConfirmCancel(false)}
          onConfirm={() => run(() => registrationsApi.cancel(registration.id), 'Registration cancelled')}
        />
      </div>
    )
  }

  if (ended) return <Badge status="ENDED">This event has ended</Badge>
  if (event.isFull) return <Badge status="FULL">This event is full</Badge>

  return (
    <Button className="w-full" loading={busy} onClick={() => run(() => eventsApi.register(event.id), "You're registered!")}>
      {registration?.status === 'CANCELLED' ? 'Register again' : 'Register'}
    </Button>
  )
}
