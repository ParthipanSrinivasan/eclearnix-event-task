import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { adminApi, eventsApi } from '../../api'
import { useToast } from '../../context/ToastContext'
import { Button, ErrorState, Field, PageLoader } from '../../components/ui'
import { inputClass } from '../../utils/styles'
import { useFetch } from '../../hooks/useFetch'
import { toDateTimeLocal } from '../../utils/format'
import { ADMIN_HOME } from '../../utils/routes'

const EMPTY = { name: '', description: '', category: '', location: '', dateTime: '', maxParticipants: '' }

/** Create (no :id) or edit (with :id) an event. */
export default function EventForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const existing = useFetch(() => (isEdit ? adminApi.getEvent(id) : Promise.resolve(null)), [id])

  if (isEdit && existing.loading) return <PageLoader />
  if (isEdit && existing.error) return <ErrorState message={existing.error.message} onRetry={existing.reload} />

  return <EventFormFields key={id ?? 'new'} event={existing.data?.event} />
}

function EventFormFields({ event }) {
  const isEdit = Boolean(event)
  const navigate = useNavigate()
  const toast = useToast()
  const categories = useFetch(() => eventsApi.categories(), [])
  const [form, setForm] = useState(() =>
    event
      ? {
          name: event.name,
          description: event.description,
          category: event.category,
          location: event.location,
          dateTime: toDateTimeLocal(event.dateTime),
          maxParticipants: String(event.maxParticipants),
        }
      : EMPTY,
  )
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(null) // which button is busy

  useEffect(() => {
    document.title = `${isEdit ? 'Edit' : 'Create'} event · EventHub`
    return () => {
      document.title = 'EventHub'
    }
  }, [isEdit])

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((errs) => ({ ...errs, [field]: undefined }))
  }

  async function submit(status) {
    setSubmitting(status ?? 'save')
    setErrors({})
    const payload = {
      ...form,
      dateTime: form.dateTime ? new Date(form.dateTime).toISOString() : '',
      maxParticipants: form.maxParticipants === '' ? undefined : Number(form.maxParticipants),
    }
    // Editing an event that has already happened shouldn't force a new date.
    if (isEdit && payload.dateTime && new Date(payload.dateTime).getTime() === new Date(event.dateTime).getTime()) {
      delete payload.dateTime
    }

    try {
      if (isEdit) {
        await adminApi.updateEvent(event.id, payload)
        toast.success('Event updated')
      } else {
        await adminApi.createEvent({ ...payload, status })
        toast.success(status === 'ACTIVE' ? 'Event published' : 'Event saved as disabled')
      }
      navigate(ADMIN_HOME)
    } catch (err) {
      setErrors({ ...err.fieldErrors, form: err.message })
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to={ADMIN_HOME} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
        ← Back to dashboard
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{isEdit ? 'Edit event' : 'Create event'}</h1>
      <p className="mt-1 text-slate-500">
        {isEdit ? 'Changes are visible to users straight away.' : 'Published events are visible to users straight away.'}
      </p>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          submit(isEdit ? undefined : 'ACTIVE')
        }}
        className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        {errors.form && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{errors.form}</p>}

        <Field label="Event name" htmlFor="name" error={errors.name}>
          <input id="name" value={form.name} onChange={update('name')} maxLength={120} className={inputClass(errors.name)} autoFocus />
        </Field>

        <Field label="Description" htmlFor="description" error={errors.description}>
          <textarea id="description" rows={5} value={form.description} onChange={update('description')} maxLength={2000} className={inputClass(errors.description)} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category" htmlFor="category" error={errors.category} hint="e.g. Tech, Music, Workshop">
            <input id="category" list="category-options" value={form.category} onChange={update('category')} maxLength={50} className={inputClass(errors.category)} />
            <datalist id="category-options">
              {categories.data?.categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Location" htmlFor="location" error={errors.location}>
            <input id="location" value={form.location} onChange={update('location')} maxLength={200} className={inputClass(errors.location)} />
          </Field>
          <Field label="Date & time" htmlFor="dateTime" error={errors.dateTime}>
            <input id="dateTime" type="datetime-local" value={form.dateTime} onChange={update('dateTime')} className={inputClass(errors.dateTime)} />
          </Field>
          <Field
            label="Maximum participants"
            htmlFor="maxParticipants"
            error={errors.maxParticipants}
            hint={isEdit && event.registeredCount > 0 ? `${event.registeredCount} already registered` : undefined}
          >
            <input id="maxParticipants" type="number" min={Math.max(event?.registeredCount ?? 1, 1)} value={form.maxParticipants} onChange={update('maxParticipants')} className={inputClass(errors.maxParticipants)} />
          </Field>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          {isEdit ? (
            <Button type="submit" loading={submitting === 'save'}>
              Save changes
            </Button>
          ) : (
            <>
              <Button variant="secondary" loading={submitting === 'DISABLED'} disabled={Boolean(submitting)} onClick={() => submit('DISABLED')}>
                Save as disabled
              </Button>
              <Button type="submit" loading={submitting === 'ACTIVE'} disabled={Boolean(submitting)}>
                Publish event
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  )
}
