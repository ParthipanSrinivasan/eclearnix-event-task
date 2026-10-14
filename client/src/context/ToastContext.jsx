import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)
let nextId = 0

const STYLES = {
  success: 'bg-emerald-600',
  error: 'bg-rose-600',
  info: 'bg-slate-800',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), [])

  const show = useCallback(
    (message, type = 'info') => {
      const id = ++nextId
      setToasts((list) => [...list.slice(-2), { id, message, type }])
      setTimeout(() => dismiss(id), 4000)
    },
    [dismiss],
  )

  const toast = useMemo(
    () => ({
      success: (message) => show(message, 'success'),
      error: (message) => show(message, 'error'),
      info: (message) => show(message, 'info'),
    }),
    [show],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div aria-live="polite" className="fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`flex w-full max-w-sm items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${STYLES[t.type]}`}
          >
            <span>{t.message}</span>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-white/70 hover:text-white">
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')
  return context
}
