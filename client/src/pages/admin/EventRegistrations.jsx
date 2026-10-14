import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { adminApi } from '../../api'
import { EventAdminActions } from '../../components/EventAdminActions'
import { Badge, EmptyState, ErrorState, PageLoader, SeatsBar } from '../../components/ui'
import { inputClass } from '../../utils/styles'
import { useFetch } from '../../hooks/useFetch'
import { formatDateTime } from '../../utils/format'
import { ADMIN_HOME } from '../../utils/routes'

export default function EventRegistrations() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('REGISTERED')
  const { data, error, loading, reload } = useFetch(() => adminApi.registrations(id, { status }), [id, status])

  if (loading && !data) return <PageLoader />
  if (error) return <ErrorState message={error.message} onRetry={reload} />

  const { event, registrations } = data
  return (
    <div>
      <Link to={ADMIN_HOME} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
        ← Back to dashboard
      </Link>

      <div className="mt-3 mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{event.name}</h1>
            <Badge status={event.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {formatDateTime(event.dateTime)} · {event.location}
          </p>
          <EventAdminActions
            event={event}
            variant="secondary"
            showRegistrations={false}
            onChanged={reload}
            onDeleted={() => navigate(ADMIN_HOME)}
            className="mt-4"
          />
        </div>
        <div className="md:w-64">
          <SeatsBar registered={event.registeredCount} max={event.maxParticipants} />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Registrations ({registrations.length})</h2>
        <div className="w-40 shrink-0">
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className={inputClass(false)}>
            <option value="REGISTERED">Registered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="">All</option>
          </select>
        </div>
      </div>

      {registrations.length === 0 ? (
        <EmptyState
          title={status === 'CANCELLED' ? 'No cancellations' : 'No registrations yet'}
          description={status === 'CANCELLED' ? undefined : 'Registrations will appear here as users sign up.'}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Registered</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registrations.map((r, i) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{r.user?.name ?? 'Deleted user'}</td>
                  <td className="px-4 py-3 text-slate-600">{r.user?.email ?? '–'}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDateTime(r.registeredAt)}</td>
                  <td className="px-4 py-3">
                    <Badge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
