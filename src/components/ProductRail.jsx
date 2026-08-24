import React, { useRef } from 'react'
import RailArrows, { nudgeRail } from './ui/RailArrows'

/**
 * Horizontal snap rail with edge-aware arrows. Replaces the old auto-scrolling
 * carousels: nothing moves unless the user asks it to, and cards are never
 * clipped at rest because the track is padded to the page grid.
 */
const ProductRail = ({ children, label }) => {
  const ref = useRef(null)

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); nudgeRail(ref.current, 1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeRail(ref.current, -1) }
  }

  return (
    <div className="u-railwrap">
      <div
        className="u-rail no-bar"
        ref={ref}
        tabIndex={0}
        role="group"
        aria-label={label}
        onKeyDown={onKeyDown}
      >
        {children}
      </div>

      <RailArrows targetRef={ref} watch={children} />
    </div>
  )
}

export default ProductRail
