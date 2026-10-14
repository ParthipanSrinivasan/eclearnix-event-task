import { Link } from 'react-router-dom'
import { formatDateTime } from '../utils/format'
import { Badge, SeatsBar } from './ui'

export function EventCard({ event }) {
  return (
    <Link
      to={`/events/${event.id}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">{event.category}</span>
        {event.isFull && <Badge status="FULL">Full</Badge>}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-700">{event.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{event.description}</p>
      <dl className="mt-4 space-y-1.5 text-sm text-slate-600">
        <div className="flex gap-2">
          <dt aria-label="Date">📅</dt>
          <dd>{formatDateTime(event.dateTime)}</dd>
        </div>
        <div className="flex gap-2">
          <dt aria-label="Location">📍</dt>
          <dd className="truncate">{event.location}</dd>
        </div>
      </dl>
      <div className="mt-auto pt-4">
        <SeatsBar registered={event.registeredCount} max={event.maxParticipants} />
      </div>
    </Link>
  )
}
