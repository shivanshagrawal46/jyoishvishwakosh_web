import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IconX } from './Icons'

const ToastContext = createContext(null)

/** Replaces every `alert()` in the app with a non-blocking, styled notice. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback((message, { tone = 'info', duration = 5000 } = {}) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((list) => [...list, { id, message, tone }])
    if (duration) timers.current.set(id, setTimeout(() => dismiss(id), duration))
    return id
  }, [dismiss])

  const api = useMemo(() => ({
    toast: push,
    error: (m, o) => push(m, { ...o, tone: 'error' }),
    success: (m, o) => push(m, { ...o, tone: 'success' }),
    dismiss,
  }), [push, dismiss])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="u-toasts" role="status" aria-live="polite">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              className={`u-toast u-toast--${t.tone}`}
              initial={{ opacity: 0, y: 12, scale: .97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: .97 }}
              transition={{ duration: .22, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="u-toast__dot" />
              <span className="u-toast__body">{t.message}</span>
              <button
                type="button"
                className="u-toast__close"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
              >
                <IconX s={15} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

/** Safe outside a provider so components can be rendered in isolation. */
export function useToast() {
  return useContext(ToastContext) ?? {
    toast: () => {},
    error: () => {},
    success: () => {},
    dismiss: () => {},
  }
}

export default ToastProvider
