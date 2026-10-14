import { Link } from 'react-router-dom'

const BUTTON_VARIANTS = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-300',
  ghost: 'text-slate-600 hover:bg-slate-100 disabled:text-slate-300',
  'danger-ghost': 'text-rose-600 hover:bg-rose-50 disabled:text-rose-300',
  'danger-outline': 'border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 disabled:text-rose-300',
}

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed'

export function Button({ variant = 'primary', loading = false, className = '', children, disabled, ...props }) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${className}`}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  )
}

export function ButtonLink({ variant = 'primary', className = '', ...props }) {
  return <Link className={`${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${className}`} {...props} />
}

export function Spinner({ className = 'size-6' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export function PageLoader() {
  return (
    <div className="flex justify-center py-20 text-indigo-600" role="status" aria-label="Loading">
      <Spinner className="size-8" />
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
      <p className="font-medium text-rose-700">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-14 text-center">
      <p className="text-lg font-semibold text-slate-800">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

const BADGE_STYLES = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  DISABLED: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  REGISTERED: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  CANCELLED: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  FULL: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  ENDED: 'bg-slate-100 text-slate-600 ring-slate-500/20',
}

export function Badge({ status, children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${BADGE_STYLES[status]}`}
    >
      {children ?? status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}

export function Field({ label, error, hint, children, htmlFor }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  )
}

export function SeatsBar({ registered, max }) {
  const seatsLeft = Math.max(max - registered, 0)
  const percent = max ? Math.min((registered / max) * 100, 100) : 0
  const color = percent >= 100 ? 'bg-rose-500' : percent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-500">
        <span>
          {registered} / {max} registered
        </span>
        <span className="font-medium">
          {seatsLeft} {seatsLeft === 1 ? 'seat' : 'seats'} left
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </Button>
      <span className="text-sm text-slate-600">
        Page {page} of {totalPages}
      </span>
      <Button variant="secondary" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </Button>
    </nav>
  )
}
