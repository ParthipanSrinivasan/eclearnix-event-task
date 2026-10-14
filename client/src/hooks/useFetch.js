import { useCallback, useEffect, useState } from 'react'

/**
 * Runs `request` when `deps` change and tracks loading / error / data.
 * Responses from outdated requests are ignored, so fast filter changes
 * never show stale results.
 */
export function useFetch(request, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let current = true
    setState((s) => ({ ...s, loading: true, error: null }))
    request()
      .then((data) => current && setState({ data, error: null, loading: false }))
      .catch((error) => current && setState((s) => ({ ...s, error, loading: false })))
    return () => {
      current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey])

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])
  return { ...state, reload }
}

/** Returns `value` after it has stopped changing for `delay` ms. */
export function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
