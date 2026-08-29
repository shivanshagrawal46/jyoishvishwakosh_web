import { useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'

const DEVICE_KEY = 'jv_quiz_device_id'

/**
 * The practice API has no auth of its own — it just needs a stable `user_id`.
 * A signed-in account is preferred so progress follows the person between
 * devices; otherwise the browser keeps its own id so a guest still builds a
 * streak. `email` is only needed to unlock a set they have paid for.
 */
const deviceId = () => {
  try {
    let id = localStorage.getItem(DEVICE_KEY)
    if (!id) {
      id = `web-${(crypto.randomUUID?.() || Math.random().toString(36).slice(2))}`
      localStorage.setItem(DEVICE_KEY, id)
    }
    return id
  } catch {
    // Private mode with storage blocked: progress lasts the session only.
    return 'web-guest'
  }
}

export default function useQuizIdentity() {
  const { user } = useAuth()

  return useMemo(() => ({
    userId: user?._id || deviceId(),
    email: user?.email || undefined,
    signedIn: Boolean(user),
  }), [user])
}
