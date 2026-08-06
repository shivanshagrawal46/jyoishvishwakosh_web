import React from 'react'
import { motion } from 'framer-motion'
import { IconOrnament, IconWarn, IconSearch, IconArrowRight } from './Icons'

/** Cover + two text lines, matching the real card's geometry so nothing jumps. */
export const CardSkeleton = ({ count = 10, wide = false }) => (
  <div className={`bk-grid${wide ? ' bk-grid--cat' : ''}`} aria-hidden="true">
    {Array.from({ length: count }, (_, i) => (
      <div className="bk-sk-card" key={i}>
        <div className="bk-sk bk-sk--cover" />
        <div className="bk-sk-lines">
          <div className="bk-sk bk-sk--title" style={{ width: '86%' }} />
          <div className="bk-sk bk-sk--line" style={{ width: '54%' }} />
        </div>
      </div>
    ))}
  </div>
)

export const RowSkeleton = ({ count = 6 }) => (
  <div className="bk-list" aria-hidden="true">
    {Array.from({ length: count }, (_, i) => (
      <div className="bk-row" key={i} style={{ cursor: 'default' }}>
        <div className="bk-sk bk-sk--cover" style={{ width: 74 }} />
        <div className="bk-sk-lines">
          <div className="bk-sk bk-sk--title" style={{ width: `${60 + ((i * 13) % 30)}%` }} />
          <div className="bk-sk bk-sk--line" style={{ width: '38%' }} />
        </div>
      </div>
    ))}
  </div>
)

export const ReaderSkeleton = ({ count = 4 }) => (
  <div className="bk-topics" aria-hidden="true">
    {Array.from({ length: count }, (_, i) => (
      <div className="bk-piece" key={i}>
        <div className="bk-piece-head" style={{ cursor: 'default' }}>
          <div className="bk-sk" style={{ width: 40, height: 40, borderRadius: 11 }} />
          <div className="bk-sk bk-sk--title" style={{ width: `${52 + ((i * 17) % 34)}%` }} />
        </div>
        {i === 0 && (
          <div className="bk-piece-inner">
            <div className="bk-sk" style={{ height: 92, borderRadius: 9 }} />
            <div className="bk-sk-lines">
              {[96, 91, 98, 88, 72].map((w, j) => (
                <div className="bk-sk bk-sk--line" style={{ width: `${w}%` }} key={j} />
              ))}
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
)

const orbSpin = {
  animate: { rotate: 360 },
  transition: { duration: 26, repeat: Infinity, ease: 'linear' },
}

export const EmptyState = ({ title, hint, action, icon = 'book' }) => (
  <motion.div
    className="bk-state"
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
  >
    <motion.div className="bk-state-orb" {...(icon === 'book' ? orbSpin : {})}>
      {icon === 'search' ? <IconSearch s={30} /> : <IconOrnament s={38} />}
    </motion.div>
    <h3 className="bk-deva">{title}</h3>
    {hint && <p>{hint}</p>}
    {action}
  </motion.div>
)

export const ErrorState = ({ title, hint, onRetry, retryLabel }) => (
  <motion.div
    className="bk-state bk-state--error"
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
  >
    <div className="bk-state-orb"><IconWarn s={30} /></div>
    <h3 className="bk-deva">{title}</h3>
    {hint && <p>{hint}</p>}
    {onRetry && (
      <button type="button" className="bk-btn bk-btn--primary" onClick={onRetry}>
        {retryLabel}
        <IconArrowRight s={16} />
      </button>
    )}
  </motion.div>
)

export const InlineLoader = ({ label }) => (
  <div className="bk-inline-load" role="status">
    <span className="bk-spin" />
    <span>{label}</span>
  </div>
)
