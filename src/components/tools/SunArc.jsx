import React from 'react'

/**
 * Sun path for one day: a dashed full arc with the daylight portion drawn solid,
 * the sun placed where it is *now* (when `now` falls in the day) and the moon
 * resting below the horizon. Pure SVG, scales with its container.
 *
 * All inputs are local ISO strings from the panchang payload.
 */
const W = 320, H = 150, CX = 160, CY = 122, R = 112

const toMin = (iso) => (iso ? Number(iso.slice(11, 13)) * 60 + Number(iso.slice(14, 16)) : null)
const pt = (frac) => {
  const a = Math.PI * (1 - frac) // frac 0 → left horizon, 1 → right horizon
  return { x: CX + R * Math.cos(a), y: CY - R * Math.sin(a) }
}
const arcPath = (f0, f1) => {
  const a = pt(f0), b = pt(f1)
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} A ${R} ${R} 0 0 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
}

export default function SunArc({ sunrise, sunset, now, labels }) {
  const rise = toMin(sunrise), set = toMin(sunset)
  const sameDay = now && sunrise && now.slice(0, 10) === sunrise.slice(0, 10)
  const nowMin = sameDay ? toMin(now) : null
  const hasDay = rise != null && set != null && set > rise
  // Sun position: fraction of the daylight span; before sunrise / after sunset it sits on the horizon.
  let frac = null
  if (hasDay && nowMin != null) frac = Math.max(0, Math.min(1, (nowMin - rise) / (set - rise)))
  const sun = frac != null ? pt(frac) : null
  const isNight = hasDay && nowMin != null && (nowMin < rise || nowMin > set)
  const glowR = 14

  return (
    <svg className="jt-sunarc" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={labels?.aria}>
      <defs>
        <linearGradient id="jt-ground" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--saffron-50)" stopOpacity=".9" />
          <stop offset="1" stopColor="var(--saffron-50)" stopOpacity="0" />
        </linearGradient>
        <clipPath id="jt-above"><rect x="0" y="0" width={W} height={CY} /></clipPath>
      </defs>
      {/* glow under the arc */}
      <path d={`${arcPath(0, 1)} L ${pt(0).x} ${CY} Z`} className="jt-sunarc__ground" clipPath="url(#jt-above)" />
      <path d={arcPath(0, 1)} className="jt-sunarc__track" />
      {hasDay && frac != null && frac > 0 && <path d={arcPath(0, frac)} className="jt-sunarc__day" />}
      {hasDay && frac == null && <path d={arcPath(0, 1)} className="jt-sunarc__day" style={{ opacity: .5 }} />}
      <line x1="10" x2={W - 10} y1={CY} y2={CY} className="jt-sunarc__horizon" />
      {sun && !isNight && (<>
        <circle cx={sun.x} cy={sun.y} r={glowR} className="jt-sunarc__glow" />
        <circle cx={sun.x} cy={sun.y} r="7" className="jt-sunarc__sun" />
      </>)}
      {sun && isNight && <circle cx={CX} cy={CY + 14} r="6" className="jt-sunarc__moon" />}
      {/* labels */}
      <text x={pt(0).x - 2} y={CY + 18} className="jt-sunarc__label" textAnchor="start">{labels?.sunrise}</text>
      <text x={pt(0).x - 2} y={CY + 34} className="jt-sunarc__time" textAnchor="start">{sunrise ? sunrise.slice(11, 16) : '—'}</text>
      <text x={pt(1).x + 2} y={CY + 18} className="jt-sunarc__label" textAnchor="end">{labels?.sunset}</text>
      <text x={pt(1).x + 2} y={CY + 34} className="jt-sunarc__time" textAnchor="end">{sunset ? sunset.slice(11, 16) : '—'}</text>
      {labels?.center && <text x={CX} y={CY + 34} className="jt-sunarc__label" textAnchor="middle">{labels.center}</text>}
    </svg>
  )
}
