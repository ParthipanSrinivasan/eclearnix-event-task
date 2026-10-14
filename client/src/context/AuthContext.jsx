import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api'
import { tokenStore } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Only wait for /me when there is a saved session to restore.
  const [loading, setLoading] = useState(() => Boolean(tokenStore.get()))

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  useEffect(() => {
    if (!tokenStore.get()) return
    authApi
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    window.addEventListener('auth:expired', logout)
    return () => window.removeEventListener('auth:expired', logout)
  }, [logout])

  const value = useMemo(() => {
    const startSession = ({ token, user }) => {
      tokenStore.set(token)
      setUser(user)
      return user
    }
    return {
      user,
      loading,
      isAdmin: user?.role === 'ADMIN',
      login: async (credentials) => startSession(await authApi.login(credentials)),
      register: async (details) => startSession(await authApi.register(details)),
      logout,
    }
  }, [user, loading, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
