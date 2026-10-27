import { useEffect, useState } from 'react'

/**
 * useState mirrored into localStorage. Objects are shallow-merged over the
 * initial value so new fields added later still get their defaults.
 */
export default function useStoredState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return initial
      const saved = JSON.parse(raw)
      if (initial && typeof initial === 'object' && !Array.isArray(initial) && saved && typeof saved === 'object') return { ...initial, ...saved }
      return saved ?? initial
    } catch { return initial }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)) } catch {} }, [key, value])
  return [value, setValue]
}
