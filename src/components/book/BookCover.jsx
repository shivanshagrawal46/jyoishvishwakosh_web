import React, { useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { getBookImageUrl } from './bookUtils'
import { IconOrnament } from './Icons'

/**
 * A book rendered as a physical volume: printed cover, spine shading, a visible
 * page block on the fore edge, and a light sweep on hover. When the cover art is
 * missing or fails to load it falls back to a typeset cloth binding rather than a
 * broken-image placeholder.
 */
const BookCover = ({ image, name, className = '', tilt = false, priority = false }) => {
  const [failed, setFailed] = useState(false)
  const src = getBookImageUrl(image)
  const showArt = Boolean(src) && !failed

  // Pointer-driven tilt, only used for the hero cover on the title page.
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [16, -16]), { stiffness: 170, damping: 18 })
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [-11, 11]), { stiffness: 170, damping: 18 })

  const handleMove = (event) => {
    if (!tilt) return
    const box = event.currentTarget.getBoundingClientRect()
    px.set((event.clientX - box.left) / box.width - 0.5)
    py.set((event.clientY - box.top) / box.height - 0.5)
  }

  const handleLeave = () => {
    px.set(0)
    py.set(0)
  }

  return (
    <div className={`bk-vol ${className}`} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <motion.div className="bk-vol-inner" style={tilt ? { rotateY, rotateX } : undefined}>
        <div className="bk-vol-pages" aria-hidden="true" />
        <div className="bk-vol-face">
          {showArt ? (
            <img
              src={src}
              alt=""
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              onError={() => setFailed(true)}
            />
          ) : (
            <div className="bk-vol-fallback">
              <IconOrnament s={40} className="bk-vol-fallback-orn" />
              <span className="bk-vol-fallback-name">{name}</span>
            </div>
          )}
          <span className="bk-vol-shine" aria-hidden="true" />
        </div>
      </motion.div>
    </div>
  )
}

export default BookCover
