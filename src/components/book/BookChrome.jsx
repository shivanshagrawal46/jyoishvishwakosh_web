import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IconSearch, IconX, IconChevronDown, IconGrid, IconRows, IconSort } from './Icons'

/** Breadcrumb trail. `items` is [{ label, to }]; the last entry renders as current. */
export const Crumbs = ({ items }) => (
  <nav className="bk-crumbs" aria-label="Breadcrumb">
    {items.map((item, i) => {
      const last = i === items.length - 1
      return (
        <React.Fragment key={`${item.label}-${i}`}>
          {i > 0 && <span className="bk-crumb-sep" aria-hidden="true">›</span>}
          {last || !item.to ? (
            <span className="bk-crumb" aria-current="page" title={item.label}>{item.label}</span>
          ) : (
            <Link className="bk-crumb" to={item.to} title={item.label}>{item.label}</Link>
          )}
        </React.Fragment>
      )
    })}
  </nav>
)

/**
 * Horizontally scrolling category selector. The active pill's background is a
 * shared layout element, so switching categories slides the highlight instead of
 * cutting to it.
 */
export const CategoryRail = ({ categories, activeId, allLabel, onSelect, counts }) => {
  const railRef = useRef(null)
  const activeRef = useRef(null)

  // Keep the selected category in view when arriving by URL or going back.
  useEffect(() => {
    const rail = railRef.current
    const chip = activeRef.current
    if (!rail || !chip) return
    const target = chip.offsetLeft - rail.clientWidth / 2 + chip.clientWidth / 2
    rail.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })
  }, [activeId])

  const chip = (key, label, isActive, count) => (
    <button
      key={key}
      ref={isActive ? activeRef : null}
      type="button"
      className={`bk-chip${isActive ? ' is-active' : ''}`}
      onClick={() => onSelect(key === '__all' ? null : key)}
      aria-pressed={isActive}
    >
      {isActive && (
        <motion.span
          className="bk-chip-bg"
          layoutId="bk-chip-bg"
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        />
      )}
      <span>{label}</span>
      {count > 0 && <span className="bk-chip-count">{count}</span>}
    </button>
  )

  return (
    <div className="bk-rail-wrap">
      <div className="bk-rail" ref={railRef} role="tablist" aria-label={allLabel}>
        {chip('__all', allLabel, !activeId)}
        {categories.map((cat) =>
          chip(cat.id, cat.name, String(activeId) === String(cat.id), counts?.[cat.id])
        )}
      </div>
    </div>
  )
}

/** Search field + sort select + optional grid/list switch. */
export const Toolbar = ({
  query,
  onQuery,
  placeholder,
  clearLabel,
  sort,
  onSort,
  sortOptions,
  view,
  onView,
  gridLabel,
  listLabel,
  extra,
}) => (
  <div className="bk-toolbar">
    <div className="bk-search">
      <IconSearch s={18} />
      <input
        type="search"
        value={query}
        placeholder={placeholder}
        onChange={(e) => onQuery(e.target.value)}
        aria-label={placeholder}
      />
      {query && (
        <button type="button" className="bk-search-clear" onClick={() => onQuery('')} aria-label={clearLabel}>
          <IconX s={13} />
        </button>
      )}
    </div>

    {sortOptions && (
      <div className="bk-select">
        <IconSort s={15} style={{ position: 'absolute', left: 12, pointerEvents: 'none' }} />
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          aria-label={sortOptions.label}
          style={{ paddingInlineStart: 34 }}
        >
          {sortOptions.items.map((opt) => (
            <option value={opt.value} key={opt.value}>{opt.label}</option>
          ))}
        </select>
        <IconChevronDown s={15} />
      </div>
    )}

    {onView && (
      <div className="bk-seg" role="group">
        <button
          type="button"
          className={view === 'grid' ? 'is-on' : ''}
          onClick={() => onView('grid')}
          aria-label={gridLabel}
          aria-pressed={view === 'grid'}
        >
          {view === 'grid' && <motion.span className="bk-seg-bg" layoutId="bk-seg-bg" transition={{ type: 'spring', stiffness: 460, damping: 36 }} />}
          <IconGrid s={16} />
        </button>
        <button
          type="button"
          className={view === 'list' ? 'is-on' : ''}
          onClick={() => onView('list')}
          aria-label={listLabel}
          aria-pressed={view === 'list'}
        >
          {view === 'list' && <motion.span className="bk-seg-bg" layoutId="bk-seg-bg" transition={{ type: 'spring', stiffness: 460, damping: 36 }} />}
          <IconRows s={16} />
        </button>
      </div>
    )}

    {extra}
  </div>
)

/** Gold rule with a small ornament, used between major sections. */
export const Flourish = () => (
  <div className="bk-flourish" aria-hidden="true">
    <span />
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 3.5c1.6 3.4 4 5.2 7.6 6.2-3.6 1-6 2.8-7.6 6.2-1.6-3.4-4-5.2-7.6-6.2 3.6-1 6-2.8 7.6-6.2Z" />
      <circle cx="12" cy="19.8" r="1.3" />
    </svg>
    <span />
  </div>
)
