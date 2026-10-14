const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const dateFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

export const formatDateTime = (value) => dateTimeFormat.format(new Date(value))
export const formatDate = (value) => dateFormat.format(new Date(value))

/** Value for an <input type="datetime-local">, in the user's local time. */
export function toDateTimeLocal(value) {
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export const isPast = (value) => new Date(value).getTime() <= Date.now()
