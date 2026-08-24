import { useCallback, useEffect, useState } from 'react'

const KEY = 'jv-theme'

function initialTheme() {
  if (typeof document === 'undefined') return 'light'
  // index.html already resolved and applied the theme before first paint.
  return document.documentElement.getAttribute('data-theme') || 'light'
}

/**
 * Ratri (night) mode. Reads the persisted choice, falls back to the OS
 * preference, and keeps `data-theme` plus the browser chrome colour in sync.
 */
export default function useTheme() {
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem(KEY, theme) } catch {}

    const meta = document.querySelector('meta[name="theme-color"]:not([media])')
      || Object.assign(document.head.appendChild(document.createElement('meta')), { name: 'theme-color' })
    meta.setAttribute('content', theme === 'dark' ? '#14111F' : '#F7F1E4')
  }, [theme])

  // Follow the OS until the user makes an explicit choice.
  useEffect(() => {
    let stored = null
    try { stored = localStorage.getItem(KEY) } catch {}
    if (stored) return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e) => setTheme(e.matches ? 'dark' : 'light')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  return { theme, setTheme, toggle, isDark: theme === 'dark' }
}
