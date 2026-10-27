import React, { useEffect, useRef, useState } from 'react'
import { searchPlaces } from '../../services/kundliApi'
import { t } from './toolLabels'

/**
 * City autocomplete backed by /api/v1/places. Reusable port of the field on
 * the Kundli form page: `value` is the typed text, `meta` the picked place
 * ({ display_name, latitude, longitude, timezone }) or null while typing.
 */
export default function PlaceField({
  id = 'place', label, value = '', meta = null, onChange, onPick, hi,
  placeholder, hint, className = '', span = true,
}) {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(-1)
  const ctrl = useRef(null)

  useEffect(() => {
    if (meta || value.trim().length < 2) { setItems([]); setOpen(false); return }
    const timer = setTimeout(async () => {
      ctrl.current?.abort()
      ctrl.current = new AbortController()
      try {
        const results = await searchPlaces(value.trim(), { limit: 8, signal: ctrl.current.signal })
        setItems(results); setIdx(-1); setOpen(results.length > 0)
      } catch (e) {
        if (e.name !== 'AbortError') { setItems([]); setOpen(false) }
      }
    }, 220)
    return () => clearTimeout(timer)
  }, [value, meta])

  useEffect(() => () => ctrl.current?.abort(), [])

  const pick = (p) => { onPick?.(p); setOpen(false) }
  const onKey = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, items.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && idx >= 0) { e.preventDefault(); pick(items[idx]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  const listId = `${id}-list`
  const lat = Number(meta?.latitude), lon = Number(meta?.longitude)
  const hasCoords = meta && Number.isFinite(lat) && Number.isFinite(lon)

  return (
    <div className={`kd-fld${span ? ' kd-span' : ''} ${className}`.trim()}>
      <label className="kd-fld__label" htmlFor={id}>{label ?? t('place', hi)}</label>
      <input
        id={id} type="text" autoComplete="off" value={value} placeholder={placeholder ?? t('placePh', hi)}
        onChange={(e) => onChange?.(e.target.value)} onKeyDown={onKey}
        onFocus={() => items.length && !meta && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list"
      />
      {open && (
        <ul className="kd-drop" id={listId} role="listbox">
          {items.map((p, i) => (
            <li key={p.id || `${p.display_name}-${i}`} role="option" aria-selected={i === idx} onMouseDown={(e) => { e.preventDefault(); pick(p) }}>
              <span>{p.display_name}{p.match === 'fuzzy' ? ` · ${t('didYouMean', hi)}?` : ''}</span>
              <small>{p.timezone || ''}</small>
            </li>
          ))}
        </ul>
      )}
      {hasCoords
        ? <span className="kd-pill">📍 {lat.toFixed(4)}, {lon.toFixed(4)}{meta.timezone ? ` · ${meta.timezone}` : ''}</span>
        : <span className="kd-hint">{hint ?? t('placeHint', hi)}</span>}
    </div>
  )
}
