import { useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../api'
import { EventAdminActions } from '../../components/EventAdminActions'
import { Badge, ButtonLink, EmptyState, ErrorState, PageLoader, Pagination } from '../../components/ui'
import { inputClass } from '../../utils/styles'
import { useDebounced, useFetch } from '../../hooks/useFetch'
import { formatDateTime, isPast } from '../../utils/format'
import { adminPaths } from '../../utils/routes'

export default function AdminDashboard() {
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounced(searchInput)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const stats = useFetch(() => adminApi.stats(), [])
  const events = useFetch(() => adminApi.listEvents({ search, status, page, limit: 10 }), [search, status, page])

  const refresh = () => {
    stats.reload()
    events.reload()
  }

  const cards = [
    { label: 'Total events', value: stats.data?.totalEvents },
    { label: 'Upcoming & active', value: stats.data?.upcomingEvents },
    { label: 'Active registrations', value: stats.data?.totalRegistrations },
    { label: 'Registered users', value: stats.data?.totalUsers },
  ]

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin dashboard</h1>
          <p className="mt-1 text-slate-500">Create and manage events.</p>
        </div>
        <ButtonLink to={adminPaths.newEvent}>+ Create event</ButtonLink>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{card.value ?? '–'}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value)
            setPage(1)
          }}
          placeholder="Search by name, category or location"
          aria-label="Search events"
          className={`${inputClass(false)} sm:max-w-sm`}
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
          aria-label="Status"
          className={`${inputClass(false)} sm:w-44`}
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DISABLED">Disabled</option>
        </select>
      </div>

      {events.loading && !events.data ? (
        <PageLoader />
      ) : events.error ? (
        <ErrorState message={events.error.message} onRetry={events.reload} />
      ) : events.data.items.length === 0 ? (
        search || status ? (
          <EmptyState title="No events match your search" />
        ) : (
          <EmptyState
            title="No events yet"
            description="Create your first event and it will appear for users straight away."
            action={<ButtonLink to={adminPaths.newEvent}>Create event</ButtonLink>}
          />
        )
      ) : (
        <>
          {/* Phones: one card per event, so every action stays visible without side-scrolling. */}
          <ul className="space-y-3 md:hidden">
            {events.data.items.map((event) => (
              <li key={event.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/events/${event.id}`} className="font-semibold text-slate-900 hover:text-indigo-700">
                    {event.name}
                  </Link>
                  <Badge status={event.status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {event.category} · {event.location}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {formatDateTime(event.dateTime)}
                  {isPast(event.dateTime) && <span className="ml-1 text-xs text-slate-400">(ended)</span>}
                  {' · '}
                  {event.registeredCount} / {event.maxParticipants} seats
                </p>
                <EventAdminActions event={event} onChanged={refresh} className="-mx-2.5 mt-3 border-t border-slate-100 pt-2" />
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Event</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Seats</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.data.items.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <Link to={`/events/${event.id}`} className="font-semibold text-slate-900 hover:text-indigo-700">
                        {event.name}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {event.category} · {event.location}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDateTime(event.dateTime)}
                      {isPast(event.dateTime) && <span className="ml-1 text-xs text-slate-400">(ended)</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {event.registeredCount} / {event.maxParticipants}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={event.status} />
                    </td>
                    <td className="px-4 py-3">
                      <EventAdminActions event={event} onChanged={refresh} className="justify-end" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={events.data.page} totalPages={events.data.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
