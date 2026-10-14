const TOKEN_KEY = 'eventhub_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
  constructor(status, message, fieldErrors = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

/** Small fetch wrapper: adds the auth header, JSON handling and readable errors. */
export async function api(path, { method = 'GET', body, params } = {}) {
  const url = new URL(`/api${path}`, window.location.origin)
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value)
  }

  const token = tokenStore.get()
  let res
  try {
    res = await fetch(url, {
      method,
      headers: {
        ...(body && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.")
  }

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    // An expired or invalid session logs the user out everywhere in the app.
    if (res.status === 401 && token) window.dispatchEvent(new Event('auth:expired'))
    throw new ApiError(res.status, data?.message ?? 'Something went wrong', data?.errors)
  }
  return data
}
