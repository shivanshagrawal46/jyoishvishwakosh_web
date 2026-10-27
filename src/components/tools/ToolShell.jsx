import React from 'react'
import Header from '../Header'
import ServicesStrip from '../ServicesStrip'
import Footer from '../Footer'

/** Header + services strip + page hero + footer, shared by the tool pages. */
export function ToolShell({ language, onLanguage, active, wide = false, children, className = '' }) {
  return (
    <div className="app">
      <Header language={language} setLanguage={onLanguage} />
      <ServicesStrip language={language} activeService={active} />
      <main className={`calc-page-main kt-main${wide ? ' kt-main--wide' : ''} ${className}`.trim()} id="main">
        <div className="calc-page-container">{children}</div>
      </main>
      <Footer language={language} />
    </div>
  )
}

export function ToolHero({ badge, title, subtitle, hi }) {
  return (
    <div className="calc-page-hero kt-hero-head">
      {badge && <div className="calc-hero-badge">{badge}</div>}
      <h1 className={`calc-page-title ${hi ? 'hindi' : ''}`}>{title}</h1>
      {subtitle && <p className="calc-page-subtitle">{subtitle}</p>}
    </div>
  )
}

/** Report card — same markup as the Kundli report so the pages read as one family. */
export function Card({ id, title, sub, right, children, className = '' }) {
  return (
    <section className={`kd-card ${className}`.trim()} id={id}>
      <div className="kd-card__head">
        <h2 className="kd-card__title">{title}</h2>
        {right}
        {sub && <p className="kd-card__sub">{sub}</p>}
      </div>
      <div className="kd-card__body">{children}</div>
    </section>
  )
}

/** Key/value rows; `rows` = [[label, value], ...]. Empty values render '-'. */
export function KV({ rows, className = '' }) {
  return (
    <div className={`kd-kv ${className}`.trim()}>
      {rows.filter(Boolean).map(([k, v]) => (
        <div key={k}><b>{k}</b><span>{v == null || v === '' ? '-' : v}</span></div>
      ))}
    </div>
  )
}

/** Friendly error block with an optional retry. */
export function ToolError({ message, onRetry, retryLabel, children }) {
  return (
    <div className="kt-error" role="alert">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <div className="kt-error__body">
        <p>{message}</p>
        <div className="kt-error__actions">
          {onRetry && <button type="button" className="kd-btn-ghost" onClick={onRetry}>{retryLabel}</button>}
          {children}
        </div>
      </div>
    </div>
  )
}

/** Shimmer placeholders: `rows` cards of `height`. */
export function Skeleton({ rows = 4, height = 96, hero = false, text }) {
  return (
    <div className="kt-skel" role="status" aria-live="polite">
      {hero && <div className="kt-skel__block" style={{ height: 220 }} />}
      {Array.from({ length: rows }, (_, i) => <div key={i} className="kt-skel__block" style={{ height }} />)}
      {text && <p>{text}</p>}
    </div>
  )
}
