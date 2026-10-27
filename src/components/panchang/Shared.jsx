import React from 'react'
import { t } from './labels'
import { clockLabel, gp, rangeLabel, winClocks } from './format'

/** Collapsible card. Native <details> so it works without JS state and stays accessible. */
export const Sec = ({ id, title, sub, right, count, open = true, children, className = '' }) => (
  <details className={`kd-card pv-sec ${className}`} id={id} open={open}>
    <summary className="kd-card__head pv-sec__head">
      <h2 className="kd-card__title">{title}{count != null && <small className="pv-count">{count}</small>}</h2>
      {right && <span className="pv-sec__right">{right}</span>}
      <span className="pv-sec__chev" aria-hidden="true">›</span>
      {sub && <span className="kd-card__sub">{sub}</span>}
    </summary>
    <div className="kd-card__body">{children}</div>
  </details>
)

export const KV = ({ rows }) => (
  <div className="kd-kv pv-kv">
    {rows.filter(Boolean).map(([k, v, extra], i) => (
      <div key={`${k}-${i}`}><b>{k}</b><span>{v ?? '-'}{extra && <small className="pv-kv__extra">{extra}</small>}</span></div>
    ))}
  </div>
)

export const Badge = ({ tone = 'no', children, title }) => (
  <span className={`kd-badge kd-badge--${tone}`} title={title}>{children}</span>
)

export const Eyebrow = ({ children, style }) => <div className="kd-eyebrow" style={style}>{children}</div>

/** Auspicious / inauspicious badge from a boolean. */
export const Shubh = ({ ok, hi }) => (
  <Badge tone={ok ? 'yes' : 'bad'}>{ok ? t('auspicious', hi) : t('inauspicious', hi)}</Badge>
)

/** A labelled time window tile: title, "start – end", optional ghati-pala and extra line. */
export const WinTile = ({ label, w, hi, base, tone = 'mid', sub, badge, current }) => {
  if (!w) return null
  const { s, e } = winClocks(w, base)
  const showGp = w.start_ghati_pala && w.end_ghati_pala
  return (
    <div className={`pv-win pv-win--${tone}${current ? ' is-now' : ''}`}>
      <div className="pv-win__head">
        <b>{label}</b>
        {badge}
        {current && <Badge tone="warn">{t('now', hi)}</Badge>}
      </div>
      <span className="pv-win__range">{clockLabel(s, hi)} – {clockLabel(e, hi)}</span>
      {showGp && <small className="pv-win__gp">{gp(w.start_ghati_pala, hi)} – {gp(w.end_ghati_pala, hi)}</small>}
      {sub && <small className="pv-win__sub">{sub}</small>}
    </div>
  )
}

/** Plain "start – end" text for inline use. */
export const Range = ({ w, hi, base }) => <span className="pv-range">{rangeLabel(w, hi, base)}</span>

export const Chips = ({ items, tone }) => (
  <div className="kd-chips">
    {items.map((x, i) => <span key={`${x}-${i}`} className={`kd-chip${tone ? ` kd-chip--${tone}` : ''}`}>{x}</span>)}
  </div>
)

export const Empty = ({ children }) => <p className="kd-hint pv-empty">{children}</p>

/** Loading skeleton shared by both pages. */
export const PageSkeleton = ({ hi, text }) => (
  <div className="kd-skeleton" role="status" aria-live="polite">
    <div className="kd-skeleton__hero" />
    <div className="kd-skeleton__row">{Array.from({ length: 4 }, (_, i) => <div key={i} className="kd-skeleton__tile" />)}</div>
    <div className="kd-skeleton__card" style={{ height: 240 }} />
    <div className="kd-skeleton__card" style={{ height: 240 }} />
    <p>{text || t('loadingPanchang', hi)}</p>
  </div>
)

/** Friendly error with a retry button. */
export const ErrorBox = ({ hi, message, onRetry }) => (
  <div className="kd-card pv-error" role="alert">
    <div className="kd-card__body">
      <div className="calc-error-message" style={{ justifyContent: 'center' }}>{message || t('offline', hi)}</div>
      {onRetry && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button type="button" className="calc-form-submit" onClick={onRetry}>{t('retry', hi)}</button>
        </div>
      )}
    </div>
  </div>
)
