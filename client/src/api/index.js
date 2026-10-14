import { api } from './client'

export const authApi = {
  login: (body) => api('/auth/login', { method: 'POST', body }),
  register: (body) => api('/auth/register', { method: 'POST', body }),
  me: () => api('/auth/me'),
}

export const eventsApi = {
  list: (params) => api('/events', { params }),
  categories: () => api('/events/categories'),
  get: (id) => api(`/events/${id}`),
  register: (id) => api(`/events/${id}/register`, { method: 'POST' }),
}

export const registrationsApi = {
  mine: () => api('/registrations/me'),
  cancel: (id) => api(`/registrations/${id}/cancel`, { method: 'PATCH' }),
}

export const adminApi = {
  stats: () => api('/admin/stats'),
  listEvents: (params) => api('/admin/events', { params }),
  getEvent: (id) => api(`/admin/events/${id}`),
  createEvent: (body) => api('/admin/events', { method: 'POST', body }),
  updateEvent: (id, body) => api(`/admin/events/${id}`, { method: 'PUT', body }),
  setStatus: (id, status) => api(`/admin/events/${id}/status`, { method: 'PATCH', body: { status } }),
  deleteEvent: (id) => api(`/admin/events/${id}`, { method: 'DELETE' }),
  registrations: (id, params) => api(`/admin/events/${id}/registrations`, { params }),
}
