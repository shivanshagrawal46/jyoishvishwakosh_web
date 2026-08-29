import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import logoImg from '../assets/icons/logo_new.png'

const EASE = [0.22, 1, 0.36, 1]

const WORDMARK = 'Jyotish Vishwakosh'
const FOUNDER = 'Dr. Bhupendra Pandey'

/* Choreography, in seconds from the moment the webfont is ready. */
const GATHER = .8      // dots travelling inward
const BLOOM_AT = .82
const LOGO_AT = .95
const TEXT_AT = 1.15
const TEXT_STEP = .022
// After the last letter of the wordmark has landed, not alongside it.
const FOUNDER_AT = TEXT_AT + WORDMARK.replace(' ', '').length * TEXT_STEP + .2
const HOLD_MS = 2700

/**
 * Each dot flies in from a scattered point far outside the frame and lands on a
 * slot in an ellipse the size of the logo's footprint. Converging on a single
 * point just piles them into a smudge; landing on a formation reads as the mark
 * being assembled, and the logo then materialises inside it.
 *
 * Angles carry a per-index skew so they arrive from genuinely different
 * bearings, and everything derives from the index rather than Math.random so the
 * field is identical on every render.
 */
const DOTS = Array.from({ length: 18 }, (_, i) => {
  const slot = (i / 18) * Math.PI * 2
  const skew = (i % 4) * .19
  const radius = 260 + ((i * 53) % 220)
  return {
    id: i,
    size: i % 3 === 0 ? 5 : 3.5,
    fromX: Math.cos(slot + skew) * radius,
    fromY: Math.sin(slot + skew) * radius * .7,
    // A flat lens hugging the logo's footprint, deliberately not a circle.
    toX: Math.cos(slot) * 106,
    toY: Math.sin(slot) * 21,
    delay: (i % 6) * .04,
  }
})

const Splash = () => {
  const still = useReducedMotion()
  // A splash is pure decoration; anyone asking for less motion just gets the site.
  const [open, setOpen] = useState(() => !still)
  const [ready, setReady] = useState(false)

  /* The wordmark is set in a webfont. Starting before it loads means the
     letters animate in a fallback face and then snap — so wait, but not long. */
  useEffect(() => {
    if (!open) return
    let settled = false
    const go = () => { if (!settled) { settled = true; setReady(true) } }
    document.fonts?.ready?.then(go)
    const cap = setTimeout(go, 900)
    return () => clearTimeout(cap)
  }, [open])

  useEffect(() => {
    if (!open || !ready) return
    const t = setTimeout(() => setOpen(false), HOLD_MS)
    return () => clearTimeout(t)
  }, [open, ready])

  // Let people leave early.
  useEffect(() => {
    if (!open) return
    const skip = () => setOpen(false)
    window.addEventListener('keydown', skip)
    window.addEventListener('wheel', skip, { passive: true })
    window.addEventListener('touchstart', skip, { passive: true })
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', skip)
      window.removeEventListener('wheel', skip)
      window.removeEventListener('touchstart', skip)
      document.body.style.overflow = ''
    }
  }, [open])

  let charIndex = 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="splash"
          aria-hidden="true"
          onClick={() => setOpen(false)}
          initial={{ clipPath: 'inset(0% 0 0 0)' }}
          exit={{ clipPath: 'inset(100% 0 0 0)' }}
          transition={{ duration: .6, ease: EASE }}
        >
          {ready && (
            <motion.div
              className="splash__stage"
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: .4, ease: EASE }}
            >
              {/* The dots travel in, then the whole layer clears as the mark lands. */}
              <motion.div
                className="splash__dots"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: .38, delay: GATHER + .18 }}
              >
                {DOTS.map((dot) => (
                  <motion.span
                    key={dot.id}
                    className="splash__dot"
                    style={{
                      width: dot.size,
                      height: dot.size,
                      marginLeft: -dot.size / 2,
                      marginTop: -dot.size / 2,
                    }}
                    initial={{ x: dot.fromX, y: dot.fromY, opacity: 0, scale: .4 }}
                    animate={{ x: dot.toX, y: dot.toY, opacity: 1, scale: 1 }}
                    transition={{ duration: GATHER, ease: EASE, delay: dot.delay }}
                  />
                ))}
              </motion.div>

              {/* Light flares where they meet, and the mark emerges from it. */}
              <motion.span
                className="splash__bloom"
                initial={{ opacity: 0, scale: .2 }}
                animate={{ opacity: [0, .9, 0], scale: [.2, 1.5, 2.3] }}
                transition={{ duration: .95, delay: BLOOM_AT, ease: 'easeOut', times: [0, .34, 1] }}
              />

              <motion.img
                className="splash__logo"
                src={logoImg}
                alt=""
                initial={{ opacity: 0, scale: .86 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: .62, delay: LOGO_AT, ease: EASE }}
              />

              <p className="splash__wordmark">
                {WORDMARK.split(' ').map((word) => (
                  <span className="splash__word" key={word}>
                    {Array.from(word).map((ch) => {
                      const i = charIndex++
                      return (
                        <motion.span
                          key={i}
                          className="splash__ch"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: .45,
                            ease: EASE,
                            delay: TEXT_AT + i * TEXT_STEP,
                          }}
                        >
                          {ch}
                        </motion.span>
                      )
                    })}
                  </span>
                ))}
              </p>

              {/* The name behind the work, arriving last so it reads as a
                  signature rather than a second title. */}
              <motion.p
                className="splash__founder"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .55, delay: FOUNDER_AT, ease: EASE }}
              >
                {FOUNDER}
              </motion.p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Splash
