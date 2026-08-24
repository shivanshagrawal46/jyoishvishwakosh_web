import React from 'react'
import { Link } from 'react-router-dom'
import { IconArrowRight, IconInbox, IconWarn, Ornament } from './Icons'

/* ═══════════════════════════════════════════════════════════════════════════
   Shared UI primitives, generalized from the Granthalaya (book) system.
   Every landing/page section is expected to build from these.
═══════════════════════════════════════════════════════════════════════════ */

/** Small tracked label with gold rules on either side. */
export const Eyebrow = ({ children, lang }) => (
  <span className="u-eyebrow" lang={lang === 'hindi' ? 'hi' : undefined}>{children}</span>
)

/** The one section-header pattern used by every section on every page. */
export const SectionHeader = ({
  eyebrow,
  title,
  subtitle,
  linkTo,
  linkHref,
  linkLabel,
  align = 'start',
  language,
  as: Tag = 'h2',
  id,
}) => {
  const link = linkLabel && (linkTo || linkHref)
  return (
    <div className={`u-sechead${align === 'center' ? ' u-sechead--center' : ''}`}>
      <div className="u-sechead__text">
        {eyebrow && <Eyebrow lang={language}>{eyebrow}</Eyebrow>}
        <Tag className="u-sechead__title" id={id}>{title}</Tag>
        {subtitle && <p className="u-sechead__sub">{subtitle}</p>}
      </div>
      {link && (
        linkTo ? (
          <Link className="u-sechead__link" to={linkTo}>{linkLabel}<IconArrowRight s={15} /></Link>
        ) : (
          <a className="u-sechead__link" href={linkHref}>{linkLabel}<IconArrowRight s={15} /></a>
        )
      )}
    </div>
  )
}

/** Gold rule with a centred ornament — a quiet break between major sections. */
export const Flourish = ({ className = '' }) => (
  <div className={`u-flourish ${className}`} aria-hidden="true"><Ornament s={15} /></div>
)

/**
 * The app's only button. Renders as <button>, <a> or react-router <Link>
 * depending on which destination prop is supplied.
 */
export const Button = ({
  variant = 'primary',
  size,
  block = false,
  to,
  href,
  className = '',
  children,
  ...rest
}) => {
  const cls = [
    'u-btn',
    `u-btn--${variant}`,
    size ? `u-btn--${size}` : '',
    block ? 'u-btn--block' : '',
    className,
  ].filter(Boolean).join(' ')

  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>
  if (href) return <a href={href} className={cls} {...rest}>{children}</a>
  return <button type="button" className={cls} {...rest}>{children}</button>
}

/** Pill for compact secondary navigation (tools, "all services"). */
export const Chip = ({ to, href, icon, children, disabled, className = '', ...rest }) => {
  const cls = `u-chip ${className}`.trim()
  const inner = <>{icon}{children}</>
  if (disabled) return <span className={cls} aria-disabled="true" {...rest}>{inner}</span>
  if (to) return <Link to={to} className={cls} {...rest}>{inner}</Link>
  if (href) return <a href={href} className={cls} {...rest}>{inner}</a>
  return <button type="button" className={cls} {...rest}>{inner}</button>
}

/** Uniform container that normalizes the mixed PNG/JPEG/SVG icon zoo. */
export const IconTile = ({ src, alt = '', children, size, className = '' }) => (
  <span className={`u-tile${size === 'sm' ? ' u-tile--sm' : ''} ${className}`.trim()}>
    {src ? <img src={src} alt={alt} loading="lazy" decoding="async" /> : children}
  </span>
)

/* ── Skeletons ─────────────────────────────────────────────────────── */

export const Skeleton = ({ w, h, r, className = '', style }) => (
  <span
    className={`u-skel ${className}`.trim()}
    style={{ width: w, height: h, borderRadius: r, display: 'block', ...style }}
    aria-hidden="true"
  />
)

/** A few text lines with natural ragged widths. */
export const SkeletonText = ({ lines = 3 }) => (
  <span aria-hidden="true" style={{ display: 'block' }}>
    {Array.from({ length: lines }, (_, i) => (
      <span
        key={i}
        className={`u-skel u-skel--text u-skel--line${i === lines - 1 ? '-3' : i % 2 ? '-2' : ''}`}
        style={{ display: 'block' }}
      />
    ))}
  </span>
)

/* ── States ────────────────────────────────────────────────────────── */

export const EmptyState = ({ title, body, action }) => (
  <div className="u-state">
    <span className="u-state__glyph"><IconInbox s={40} /></span>
    {title && <p className="u-state__title">{title}</p>}
    {body && <p className="u-state__body">{body}</p>}
    {action}
  </div>
)

export const ErrorState = ({ title, body, action }) => (
  <div className="u-state" role="alert">
    <span className="u-state__glyph" style={{ color: 'var(--danger)' }}><IconWarn s={38} /></span>
    {title && <p className="u-state__title">{title}</p>}
    {body && <p className="u-state__body">{body}</p>}
    {action}
  </div>
)

export { default as ToastProvider, useToast } from './Toast'
