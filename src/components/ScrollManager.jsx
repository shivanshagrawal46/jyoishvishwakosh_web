import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

const positions = new Map()

/**
 * New navigations land at the top; back/forward restores where the user was.
 * Hash links scroll to their target once the route has painted.
 */
export default function ScrollManager() {
  const location = useLocation()
  const navType = useNavigationType()

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
    const key = location.key
    const save = () => positions.set(key, window.scrollY)
    window.addEventListener('scroll', save, { passive: true })
    return () => {
      save()
      window.removeEventListener('scroll', save)
    }
  }, [location.key])

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      return
    }

    if (navType === 'POP') {
      const y = positions.get(location.key)
      if (y !== undefined) {
        requestAnimationFrame(() => window.scrollTo(0, y))
        return
      }
    }

    window.scrollTo(0, 0)
  }, [location.key, location.hash, navType])

  return null
}
