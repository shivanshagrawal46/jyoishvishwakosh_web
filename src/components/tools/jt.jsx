import React, { useEffect, useRef } from 'react'
import { Mandala } from '../ui/Icons'
import { IconCheck } from '../ui/Icons'

/**
 * Jyotish tools v3 building blocks (`jt-` classes, styles/jyotish-tools.css).
 * Small, presentational, token-driven. Pages compose these.
 */

/** Pitch on the left, the form (children) on the right. Stacks on phones. */
export function SplitHero({ eyebrow, title, subtitle, points = [], trust = [], wide = false, children }) {
  return (
    <section className={`jt-hero${wide ? ' jt-hero--wide' : ''}`}>
      <Mandala className="jt-hero__mandala" aria-hidden="true" />
      <div className="jt-hero__text jt-fade">
        {eyebrow && <div className="jt-eyebrow">{eyebrow}</div>}
        <h1 className="jt-title">{title}</h1>
        {subtitle && <p className="jt-sub">{subtitle}</p>}
      </div>
      <div className="jt-hero__panel jt-fade">{children}</div>
      <div className="jt-hero__more jt-fade">
        {points.length > 0 && (
          <ul className="jt-points">
            {points.map(([Icon, label, desc]) => (
              <li key={label}>
                <span className="jt-points__ico"><Icon s={20} /></span>
                <div><b>{label}</b>{desc && <small>{desc}</small>}</div>
              </li>
            ))}
          </ul>
        )}
        {trust.length > 0 && (
          <div className="jt-trust">
            {trust.map((x) => <span key={x}><IconCheck s={14} />{x}</span>)}
          </div>
        )}
      </div>
    </section>
  )
}

/** Elevated form card with an optional numbered heading. */
export function FormCard({ step, title, sub, right, children, className = '' }) {
  return (
    <div className={`jt-card ${className}`.trim()}>
      {(title || right) && (
        <div className="jt-card__head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {step != null && <span className="jt-card__step">{step}</span>}
            <div>{title && <h2>{title}</h2>}{sub && <p>{sub}</p>}</div>
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  )
}

/** Sticky segmented tabs. `tabs` = [{ id, label, count? }]. Keyboard: ←/→. */
export function SegTabs({ tabs, active, onChange, label, className = '' }) {
  const ref = useRef(null)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    const box = ref.current, el = box?.querySelector('[aria-selected="true"]')
    if (!box || !el) return
    // Scroll only the tab strip horizontally — never the page.
    box.scrollTo({ left: el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2, behavior: 'smooth' })
  }, [active])
  const onKey = (e) => {
    const i = tabs.findIndex((x) => x.id === active)
    if (e.key === 'ArrowRight') onChange(tabs[(i + 1) % tabs.length].id)
    if (e.key === 'ArrowLeft') onChange(tabs[(i - 1 + tabs.length) % tabs.length].id)
  }
  return (
    <div className={`jt-tabs jt-sticky ${className}`.trim()} role="tablist" aria-label={label} ref={ref} onKeyDown={onKey}>
      {tabs.map((x) => (
        <button key={x.id} type="button" role="tab" id={`tab-${x.id}`} aria-selected={active === x.id} aria-controls={`panel-${x.id}`}
          tabIndex={active === x.id ? 0 : -1} className="jt-tab" onClick={() => onChange(x.id)}>
          {x.label}{x.count != null && <small>{x.count}</small>}
        </button>
      ))}
    </div>
  )
}

/** Filter chip row. `items` = [{ id, label, on, tone? }]. */
export function Chips({ items, onToggle, scroll = false, className = '' }) {
  return (
    <div className={`jt-chips${scroll ? ' jt-chips--scroll' : ''} ${className}`.trim()}>
      {items.map((x) => (
        <button key={x.id} type="button" className="jt-chip" aria-pressed={!!x.on} onClick={() => onToggle(x.id)}>
          {x.dot && <i className="jt-chip__dot" style={x.dot !== true ? { background: x.dot } : undefined} />}
          {x.label}{x.count != null && <small>{x.count}</small>}
        </button>
      ))}
    </div>
  )
}

/** Stat tile. `progress` 0..1 paints the bottom bar. */
export function Tile({ k, v, s, n, progress, tone = '', onClick, className = '' }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className={`jt-tile${tone ? ` jt-tile--${tone}` : ''} ${className}`.trim()} onClick={onClick} type={onClick ? 'button' : undefined}>
      <div className="jt-tile__k"><span>{k}</span>{n != null && <span className="jt-tile__n">{n}</span>}</div>
      <div className="jt-tile__v">{v ?? '—'}</div>
      {s && <div className="jt-tile__s">{s}</div>}
      {progress != null && <div className="jt-tile__bar" aria-hidden="true"><span style={{ width: `${Math.round(Math.max(0, Math.min(1, progress)) * 100)}%` }} /></div>}
    </Tag>
  )
}

export function Panel({ title, sub, right, children, className = '', id }) {
  return (
    <section className={`jt-panel ${className}`.trim()} id={id}>
      {(title || right) && (
        <div className="jt-panel__head">
          <div><h3>{title}</h3>{sub && <small>{sub}</small>}</div>
          {right}
        </div>
      )}
      <div className="jt-panel__body">{children}</div>
    </section>
  )
}

const WEEK_EN = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const WEEK_HI = ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श']

/**
 * Month grid. `marks` = { 'YYYY-MM-DD': { dots: ['good','gold',...], heat: 'h-1'|'h-2'|'h-3'|'h-w'|'h-b', label } }.
 * Days that carry a mark are clickable.
 */
export function MonthGrid({ year, month, marks = {}, selected, today, hi, onPick, title, right }) {
  const first = new Date(year, month - 1, 1)
  const pad = first.getDay()
  const days = new Date(year, month, 0).getDate()
  const cells = []
  for (let i = 0; i < pad; i += 1) cells.push(null)
  for (let d = 1; d <= days; d += 1) cells.push(d)
  const iso = (d) => `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  return (
    <div className="jt-cal">
      {(title || right) && <div className="jt-cal__month"><span>{title}</span>{right}</div>}
      <div className="jt-cal__head" aria-hidden="true">{(hi ? WEEK_HI : WEEK_EN).map((w, i) => <span key={i}>{w}</span>)}</div>
      <div className="jt-cal__grid" role="grid">
        {cells.map((d, i) => {
          if (!d) return <span key={`p${i}`} className="jt-cal__cell is-pad" />
          const key = iso(d), m = marks[key]
          const cls = ['jt-cal__cell', m ? 'is-mark' : '', m?.heat || '', key === today ? 'is-today' : '', key === selected ? 'is-selected' : ''].filter(Boolean).join(' ')
          const Tag = m ? 'button' : 'span'
          return (
            <Tag key={key} className={cls} type={m ? 'button' : undefined} onClick={m ? () => onPick?.(key, m) : undefined} title={m?.label} aria-label={m?.label ? `${key} · ${m.label}` : key}>
              {d}
              {m?.dots?.length ? <span className="jt-cal__dots">{m.dots.slice(0, 3).map((t, j) => <i key={j} className={`t-${t}`} />)}</span> : m?.small ? <small>{m.small}</small> : null}
            </Tag>
          )
        })}
      </div>
    </div>
  )
}

export function Skeleton({ hero = false, tiles = 0, rows = 3, height = 120, text }) {
  return (
    <div className="jt-skel" role="status" aria-live="polite">
      {hero && <div className="jt-skel__block" style={{ height: 260 }} />}
      {tiles > 0 && <div className="jt-skel__row">{Array.from({ length: tiles }, (_, i) => <div key={i} className="jt-skel__block" style={{ height: 92 }} />)}</div>}
      {Array.from({ length: rows }, (_, i) => <div key={i} className="jt-skel__block" style={{ height }} />)}
      {text && <p>{text}</p>}
    </div>
  )
}

/** Initial-letter avatar for the matching pair. */
export const Avatar = ({ name, side }) => {
  const ch = (name || '').trim().charAt(0).toUpperCase() || (side === 'boy' ? '♂' : '♀')
  return <span className={`jt-avatar jt-avatar--${side}`} aria-hidden="true">{ch}</span>
}
