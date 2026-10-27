import React from 'react'

/** Tone for a 0–1 ratio: good ≥ .75, warn ≥ .5, else bad. */
export const toneFor = (ratio) => (ratio >= 0.75 ? 'good' : ratio >= 0.5 ? 'warn' : 'bad')

/**
 * Circular meter. `value`/`max` drive the arc; `label` is the big number text
 * (defaults to the value), `sub` the small caption under it.
 */
export default function ScoreRing({ value = 0, max = 100, size = 120, stroke = 10, label, sub, tone, className = '' }) {
  const v = Number.isFinite(Number(value)) ? Number(value) : 0
  const m = Number(max) > 0 ? Number(max) : 100
  const ratio = Math.max(0, Math.min(1, v / m))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const tn = tone || toneFor(ratio)
  return (
    <div className={`kt-ring kt-ring--${tn} ${className}`.trim()} style={{ width: size, height: size }} role="img" aria-label={`${label ?? v} / ${m}`}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
        <circle className="kt-ring__track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" />
        <circle className="kt-ring__arc" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - ratio)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="kt-ring__text">
        <b>{label ?? v}</b>
        {sub && <small>{sub}</small>}
      </div>
    </div>
  )
}
