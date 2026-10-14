import { useState } from 'react'
import { adminApi } from '../api'
import { useToast } from '../context/ToastContext'
import { ConfirmDialog } from './ConfirmDialog'
import { Button, ButtonLink } from './ui'
import { adminPaths } from '../utils/routes'

/**
 * Admin actions for one event: Registrations, Edit, Disable / Enable, Delete.
 * Disable and Delete ask for confirmation first.
 *
 * - `onChanged()` runs after a status change (and after a delete, unless `onDeleted` is given).
 * - `onDeleted()` runs after a delete, e.g. to leave a page that no longer exists.
 * - `variant`: "ghost" for compact rows, "secondary" for page headers.
 * - `stacked`: equal-width buttons filling a narrow panel.
 */
export function EventAdminActions({ event, onChanged, onDeleted, showRegistrations = true, variant = 'ghost', stacked = false, className = '' }) {
  const toast = useToast()
  const [pending, setPending] = useState(null) // 'toggle' | 'delete'
  const [working, setWorking] = useState(false)

  async function confirm() {
    setWorking(true)
    try {
      if (pending === 'delete') {
        await adminApi.deleteEvent(event.id)
        toast.success(`Deleted "${event.name}"`)
        setPending(null)
        ;(onDeleted ?? onChanged)?.()
        return
      }
      const { message } = await adminApi.setStatus(event.id, event.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE')
      toast.success(message)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setWorking(false)
    }
    setPending(null)
    onChanged?.()
  }

  const compact = variant === 'ghost' || stacked ? 'px-2.5' : ''
  const layout = stacked ? 'grid grid-cols-3 gap-2' : 'flex flex-wrap gap-1'
  return (
    <div className={`${layout} ${className}`}>
      {showRegistrations && (
        <ButtonLink to={adminPaths.registrations(event.id)} variant={variant} className={compact}>
          Registrations
        </ButtonLink>
      )}
      <ButtonLink to={adminPaths.editEvent(event.id)} variant={variant} className={compact}>
        Edit
      </ButtonLink>
      <Button variant={variant} className={compact} onClick={() => setPending('toggle')}>
        {event.status === 'ACTIVE' ? 'Disable' : 'Enable'}
      </Button>
      <Button
        variant={variant === 'ghost' ? 'danger-ghost' : 'danger-outline'}
        className={compact}
        onClick={() => setPending('delete')}
      >
        Delete
      </Button>

      <ConfirmDialog
        open={Boolean(pending)}
        loading={working}
        onCancel={() => setPending(null)}
        onConfirm={confirm}
        {...dialogCopy(pending, event)}
      />
    </div>
  )
}

function dialogCopy(pending, event) {
  if (pending === 'delete') {
    return {
      title: 'Delete this event?',
      message: `"${event.name}" and its ${event.registeredCount} active registration(s) will be permanently removed. This can't be undone.`,
      confirmLabel: 'Delete event',
      danger: true,
    }
  }
  return event.status === 'ACTIVE'
    ? {
        title: 'Disable this event?',
        message: `"${event.name}" will be hidden from users and stop accepting registrations. Existing registrations are kept.`,
        confirmLabel: 'Disable',
        danger: true,
      }
    : {
        title: 'Enable this event?',
        message: `"${event.name}" will be visible to users and open for registration again.`,
        confirmLabel: 'Enable',
      }
}
