import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CALC_TOOLS, FOOTER_GROUPS, SERVICES } from '../data/site'
import { IconArrowRight, IconSearch, IconX } from './ui/Icons'

const EASE = [0.22, 1, 0.36, 1]

/** Flatten every destination in the app into one searchable index. */
function buildIndex(hi) {
  const seen = new Set()
  const items = []

  const add = (entry) => {
    if (!entry.path || seen.has(entry.path)) return
    seen.add(entry.path)
    items.push(entry)
  }

  SERVICES.forEach((s) => add({
    id: s.id,
    label: hi ? s.nameHi : s.name,
    sub: hi ? s.descHi : s.desc,
    alt: `${s.name} ${s.nameHi}`,
    path: s.path,
    icon: s.icon,
    group: hi ? 'सेवाएं' : 'Services',
  }))

  CALC_TOOLS.forEach((t) => add({
    id: `calc-${t.id}`,
    label: hi ? t.nameHi : t.name,
    alt: `${t.name} ${t.nameHi}`,
    path: t.path,
    group: hi ? 'गणना उपकरण' : 'Calculators',
  }))

  FOOTER_GROUPS.flatMap((g) => g.links).forEach((l) => add({
    id: `page-${l.path}`,
    label: hi ? l.nameHi : l.name,
    alt: `${l.name} ${l.nameHi}`,
    path: l.path,
    group: hi ? 'पृष्ठ' : 'Pages',
  }))

  return items
}

function score(item, q) {
  const hay = `${item.label} ${item.alt || ''} ${item.sub || ''}`.toLowerCase()
  const label = item.label.toLowerCase()
  if (label.startsWith(q)) return 0
  if (label.includes(q)) return 1
  if (hay.includes(q)) return 2
  return -1
}

const CommandSearch = ({ open, onClose, language }) => {
  const hi = language === 'hindi'
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const navigate = useNavigate()

  const index = useMemo(() => buildIndex(hi), [hi])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return index.filter((i) => i.group !== (hi ? 'पृष्ठ' : 'Pages')).slice(0, 8)
    return index
      .map((item) => ({ item, s: score(item, q) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => a.s - b.s)
      .slice(0, 12)
      .map((r) => r.item)
  }, [query, index, hi])

  const grouped = useMemo(() => {
    const map = new Map()
    results.forEach((r) => {
      if (!map.has(r.group)) map.set(r.group, [])
      map.get(r.group).push(r)
    })
    return [...map.entries()]
  }, [results])

  useEffect(() => { setActive(0) }, [query, open])

  useEffect(() => {
    if (!open) return
    setQuery('')
    const t = setTimeout(() => inputRef.current?.focus(), 40)
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(t)
      document.body.style.overflow = ''
    }
  }, [open])

  const go = (item) => {
    onClose()
    if (item.path.startsWith('/#')) {
      const id = item.path.slice(2)
      navigate('/')
      requestAnimationFrame(() =>
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      )
    } else {
      navigate(item.path)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => {
        const next = e.key === 'ArrowDown' ? i + 1 : i - 1
        return (next + results.length) % Math.max(results.length, 1)
      })
      return
    }
    if (e.key === 'Enter' && results[active]) {
      e.preventDefault()
      go(results[active])
    }
  }

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-idx="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [active])

  let flat = -1

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="cmdk"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: .16 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="cmdk__panel"
            role="dialog"
            aria-modal="true"
            aria-label={hi ? 'खोजें' : 'Search'}
            initial={{ opacity: 0, y: -10, scale: .985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: .985 }}
            transition={{ duration: .22, ease: EASE }}
            onKeyDown={onKeyDown}
          >
            <div className="cmdk__field">
              <IconSearch s={18} />
              <input
                ref={inputRef}
                className="cmdk__input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={hi ? 'पंचांग, राशिफल, ग्रंथ…' : 'Panchang, horoscope, books…'}
                aria-label={hi ? 'खोजें' : 'Search'}
                autoComplete="off"
                spellCheck="false"
              />
              <button type="button" className="icon-btn" onClick={onClose}
                aria-label={hi ? 'बंद करें' : 'Close'}>
                <IconX s={17} />
              </button>
            </div>

            <div className="cmdk__results" ref={listRef}>
              {results.length === 0 ? (
                <p className="cmdk__empty">
                  {hi ? 'कुछ नहीं मिला' : 'No matches'}
                </p>
              ) : grouped.map(([group, items]) => (
                <div key={group} className="cmdk__group">
                  <p className="cmdk__grouplabel">{group}</p>
                  {items.map((item) => {
                    flat += 1
                    const idx = flat
                    return (
                      <button
                        key={item.id}
                        type="button"
                        data-idx={idx}
                        className={`cmdk__item${idx === active ? ' is-active' : ''}`}
                        onMouseMove={() => setActive(idx)}
                        onClick={() => go(item)}
                      >
                        <span className="u-tile u-tile--sm cmdk__icon">
                          {item.icon
                            ? <img src={item.icon} alt="" loading="lazy" decoding="async" />
                            : <IconSearch s={16} />}
                        </span>
                        <span className="cmdk__text">
                          <span className="cmdk__label">{item.label}</span>
                          {item.sub && <span className="cmdk__sub">{item.sub}</span>}
                        </span>
                        <IconArrowRight s={15} className="cmdk__go" />
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="cmdk__foot">
              <span><kbd>↑</kbd><kbd>↓</kbd> {hi ? 'चुनें' : 'navigate'}</span>
              <span><kbd>↵</kbd> {hi ? 'खोलें' : 'open'}</span>
              <span><kbd>esc</kbd> {hi ? 'बंद' : 'close'}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default CommandSearch
