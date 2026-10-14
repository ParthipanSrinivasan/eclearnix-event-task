import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { eventsApi } from '../api'
import { EventCard } from '../components/EventCard'
import { EmptyState, ErrorState, PageLoader, Pagination } from '../components/ui'
import { inputClass } from '../utils/styles'
import { useDebounced, useFetch } from '../hooks/useFetch'

const FILTER_KEYS = ['search', 'category', 'from', 'to']

export default function Events() {
  // Filters live in the URL, so they survive a refresh and can be shared.
  const [params, setParams] = useSearchParams()
  const filters = Object.fromEntries(FILTER_KEYS.map((key) => [key, params.get(key) ?? '']))
  const page = Number(params.get('page') ?? 1)

  const [searchInput, setSearchInput] = useState(filters.search)
  const search = useDebounced(searchInput)

  const setParam = (key, value) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      if (key !== 'page') next.delete('page')
      return next
    })
  }

  useEffect(() => {
    if (search !== filters.search) setParam('search', search.trim())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const categories = useFetch(() => eventsApi.categories(), [])
  const events = useFetch(
    () => eventsApi.list({ ...filters, page }),
    [filters.search, filters.category, filters.from, filters.to, page],
  )

  const hasFilters = FILTER_KEYS.some((key) => filters[key])
  const clearFilters = () => {
    setSearchInput('')
    setParams({})
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Upcoming events</h1>
        <p className="mt-1 text-slate-500">Find something you'll love and save your spot.</p>
      </div>

      <div className="mb-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, description or location"
          aria-label="Search events"
          className={inputClass(false)}
        />
        <select
          value={filters.category}
          onChange={(e) => setParam('category', e.target.value)}
          aria-label="Category"
          className={inputClass(false)}
        >
          <option value="">All categories</option>
          {categories.data?.categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input type="date" value={filters.from} onChange={(e) => setParam('from', e.target.value)} aria-label="From date" className={inputClass(false)} />
        <input type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => setParam('to', e.target.value)} aria-label="To date" className={inputClass(false)} />
        <button
          type="button"
          onClick={clearFilters}
          disabled={!hasFilters}
          className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:invisible"
        >
          Clear
        </button>
      </div>

      {events.loading && !events.data ? (
        <PageLoader />
      ) : events.error ? (
        <ErrorState message={events.error.message} onRetry={events.reload} />
      ) : events.data.items.length === 0 ? (
        hasFilters ? (
          <EmptyState title="No events match your filters" description="Try a different search or clear the filters." />
        ) : (
          <EmptyState title="No upcoming events yet" description="New events will show up here as soon as they're published." />
        )
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-500">
            {events.data.total} {events.data.total === 1 ? 'event' : 'events'} found
          </p>
          <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${events.loading ? 'opacity-60' : ''}`}>
            {events.data.items.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <Pagination page={events.data.page} totalPages={events.data.totalPages} onChange={(p) => setParam('page', String(p))} />
        </>
      )}
    </div>
  )
}
