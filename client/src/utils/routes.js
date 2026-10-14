/** Page paths in one place, so a route rename is a one-line change. */
export const ADMIN_HOME = '/dashboard-admin'
export const USER_HOME = '/dashboard-users'

/** Where each role lands after logging in. */
export const homeFor = (user) => (user?.role === 'ADMIN' ? ADMIN_HOME : USER_HOME)

export const adminPaths = {
  newEvent: `${ADMIN_HOME}/events/new`,
  editEvent: (id) => `${ADMIN_HOME}/events/${id}/edit`,
  registrations: (id) => `${ADMIN_HOME}/events/${id}/registrations`,
}
