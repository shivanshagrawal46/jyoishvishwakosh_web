import React from 'react'

/**
 * A single horizontal bar for the panchang day (sunrise → next sunrise) with
 * coloured windows (rahu kaal, abhijit, …) and a "now" marker. Each window is
 * { start, end, label, tone: 'good'|'bad'|'mid' } with local ISO strings.
 */
const ms = (iso) => (iso ? new Date(iso).getTime() : NaN)

export default function DayTimeline({ start, end, sunset, windows = [], now, labels = {}, hi }) {
  const t0 = ms(start), t1 = ms(end)
  if (!Number.isFinite(t0) || !Number.isFinite(t1) || t1 <= t0) return null
  const span = t1 - t0
  const pct = (iso) => Math.max(0, Math.min(100, ((ms(iso) - t0) / span) * 100))
  const dayPct = sunset ? pct(sunset) : 50
  const nowPct = now && ms(now) >= t0 && ms(now) <= t1 ? pct(now) : null
  const noonPct = sunset ? dayPct / 2 : null
  const hhmm = (iso) => (iso ? iso.slice(11, 16) : '')
  const fmt = (w) => `${w.label} · ${hhmm(w.start)}–${hhmm(w.end)}`

  // Hour ticks every 3h from sunrise.
  const ticks = []
  for (let t = t0; t <= t1; t += 3 * 3600 * 1000) {
    const d = new Date(t)
    ticks.push({ p: ((t - t0) / span) * 100, label: `${String(d.getHours()).padStart(2, '0')}:00` })
  }

  return (
    <div className="jt-tl">
      <div className="jt-tl__bar" style={{ '--jt-day': `${dayPct}%` }} role="img" aria-label={labels.aria}>
        {noonPct != null && <i className="jt-tl__noon" style={{ left: `${noonPct}%` }} aria-hidden="true" />}
        {windows.filter((w) => w?.start && w?.end).map((w, i) => {
          const l = pct(w.start), r = pct(w.end)
          return <span key={`${w.label}-${i}`} className={`jt-tl__seg jt-tl__seg--${w.tone || 'mid'}`} style={{ left: `${l}%`, width: `${Math.max(0.6, r - l)}%` }} title={fmt(w)} />
        })}
        {nowPct != null && <i className="jt-tl__now" style={{ left: `${nowPct}%` }} title={labels.now} aria-hidden="true" />}
      </div>
      <div className="jt-tl__ticks" aria-hidden="true">
        {ticks.map((t, i) => <span key={i} style={{ left: `${t.p}%` }}>{t.label}</span>)}
      </div>
      <div className="jt-tl__legend">
        <span><i className="is-day" />{labels.day}</span>
        <span><i className="is-night" />{labels.night}</span>
        <span><i className="is-good" />{labels.good}</span>
        <span><i className="is-bad" />{labels.bad}</span>
        {nowPct != null && <span><i style={{ background: 'var(--ink)', width: 2, height: 12, borderRadius: 1 }} />{labels.now}</span>}
      </div>
    </div>
  )
}
