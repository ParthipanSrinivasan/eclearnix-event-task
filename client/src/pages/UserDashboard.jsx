import { useState } from 'react'
import { Link } from 'react-router-dom'
import { registrationsApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Badge, Button, ButtonLink, EmptyState, ErrorState, PageLoader } from '../components/ui'
import { useFetch } from '../hooks/useFetch'
import { formatDate, formatDateTime, isPast } from '../utils/format'

const TABS = [
  { id: 'upcoming', label: 'Upcoming', match: (r) => r.status === 'REGISTERED' && !isPast(r.event.dateTime) },
  { id: 'past', label: 'Past', match: (r) => r.status === 'REGISTERED' && isPast(r.event.dateTime) },
  { id: 'cancelled', label: 'Cancelled', match: (r) => r.status === 'CANCELLED' },
]

/** A user's home after logging in (/dashboard-users): their registrations. */
export default function UserDashboard() {
  const { user } = useAuth()
  const toast = useToast()
  const { data, error, loading, reload } = useFetch(() => registrationsApi.mine(), [])
  const [tab, setTab] = useState('upcoming')
  const [toCancel, setToCancel] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  async function cancel() {
    setCancelling(true)
    try {
      await registrationsApi.cancel(toCancel.id)
      toast.success('Registration cancelled')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setCancelling(false)
      setToCancel(null)
      reload()
    }
  }

  if (loading && !data) return <PageLoader />
  if (error) return <ErrorState message={error.message} onRetry={reload} />

  const active = TABS.find((t) => t.id === tab)
  const list = data.registrations.filter(active.match)

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My dashboard</h1>
          <p className="mt-1 text-slate-500">Hi {user.name}, here are the events you've registered for.</p>
        </div>
        <ButtonLink to="/">Browse events</ButtonLink>
      </div>

      <div className="mt-6 mb-6 flex gap-1 rounded-xl bg-slate-100 p-1 sm:inline-flex" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label} ({data.registrations.filter(t.match).length})
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          title={tab === 'upcoming' ? "You haven't registered for any upcoming events" : `No ${active.label.toLowerCase()} registrations`}
          description={tab === 'upcoming' ? 'Browse events and register to save your spot.' : undefined}
          action={tab === 'upcoming' && <ButtonLink to="/">Browse events</ButtonLink>}
        />
      ) : (
        <ul className="space-y-3">
          {list.map((r) => (
            <li key={r.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/events/${r.event.id}`} className="text-lg font-semibold text-slate-900 hover:text-indigo-700">
                    {r.event.name}
                  </Link>
                  <Badge status={r.status} />
                  {r.event.status === 'DISABLED' && <Badge status="DISABLED">Event disabled</Badge>}
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {formatDateTime(r.event.dateTime)} · {r.event.location}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {r.status === 'CANCELLED' ? `Cancelled on ${formatDate(r.cancelledAt)}` : `Registered on ${formatDate(r.registeredAt)}`}
                </p>
              </div>
              {tab === 'upcoming' && (
                <Button variant="secondary" onClick={() => setToCancel(r)}>
                  Cancel
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(toCancel)}
        title="Cancel your registration?"
        message={toCancel ? `Your seat at "${toCancel.event.name}" will be released for someone else.` : ''}
        confirmLabel="Cancel registration"
        danger
        loading={cancelling}
        onCancel={() => setToCancel(null)}
        onConfirm={cancel}
      />
    </div>
  )
}
