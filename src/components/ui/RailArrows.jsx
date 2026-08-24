import React, { useCallback, useEffect, useState } from 'react'
import { IconChevronLeft, IconChevronRight } from './Icons'

/** Scrolls a rail by most of a screenful. Exported so keyboard handlers share it. */
export const nudgeRail = (el, dir) => {
  if (!el) return
  el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 220), behavior: 'smooth' })
}

/**
 * Edge-aware arrows for any horizontally scrolling container. Both buttons
 * hide themselves when there is nothing to scroll, so the same markup serves
 * a mobile snap rail and the desktop grid it turns into.
 */
const RailArrows = ({ targetRef, watch }) => {
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(true)

  const sync = useCallback(() => {
    const el = targetRef.current
    if (!el) return
    const overflows = el.scrollWidth - el.clientWidth > 2
    setAtStart(!overflows || el.scrollLeft <= 2)
    setAtEnd(!overflows || el.scrollLeft + el.clientWidth >= el.scrollWidth - 2)
  }, [targetRef])

  useEffect(() => {
    const el = targetRef.current
    if (!el) return
    sync()
    el.addEventListener('scroll', sync, { passive: true })
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', sync)
      ro.disconnect()
    }
  }, [sync, targetRef, watch])

  return (
    <>
      <button
        type="button"
        className="u-railbtn u-railbtn--prev"
        onClick={() => nudgeRail(targetRef.current, -1)}
        disabled={atStart}
        aria-label="Scroll left"
      >
        <IconChevronLeft s={18} />
      </button>
      <button
        type="button"
        className="u-railbtn u-railbtn--next"
        onClick={() => nudgeRail(targetRef.current, 1)}
        disabled={atEnd}
        aria-label="Scroll right"
      >
        <IconChevronRight s={18} />
      </button>
    </>
  )
}

export default RailArrows
