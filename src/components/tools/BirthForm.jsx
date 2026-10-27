import React from 'react'
import PlaceField from './PlaceField'
import { t } from './toolLabels'

export const EMPTY_BIRTH = { name: '', date: '', time: '', place: '', placeMeta: null }

/**
 * One native's birth details (name, date, time, place). `value` is an
 * EMPTY_BIRTH-shaped object; `onChange(patch)` merges into it.
 */
export default function BirthForm({ id, title, icon, value = EMPTY_BIRTH, onChange, hi, tone = 'boy' }) {
  const set = (patch) => onChange?.({ ...value, ...patch })
  return (
    <fieldset className={`kt-person kt-person--${tone}`}>
      <legend className="kt-person__legend">{icon}<span>{title}</span></legend>
      <div className="kd-grid">
        <div className="kd-fld kd-span">
          <label className="kd-fld__label" htmlFor={`${id}-name`}>{t('name', hi)}</label>
          <input id={`${id}-name`} type="text" value={value.name || ''} maxLength={120} placeholder={t('namePh', hi)} onChange={(e) => set({ name: e.target.value })} />
        </div>
        <div className="kd-fld">
          <label className="kd-fld__label" htmlFor={`${id}-date`}>{t('dob', hi)}</label>
          <input id={`${id}-date`} type="date" value={value.date || ''} min="1700-01-01" max="2200-12-31" required onChange={(e) => set({ date: e.target.value })} />
        </div>
        <div className="kd-fld">
          <label className="kd-fld__label" htmlFor={`${id}-time`}>{t('tob', hi)}</label>
          <input id={`${id}-time`} type="time" value={value.time || ''} required onChange={(e) => set({ time: e.target.value })} />
        </div>
        <PlaceField id={`${id}-place`} hi={hi} value={value.place || ''} meta={value.placeMeta}
          onChange={(v) => set({ place: v, placeMeta: null })}
          onPick={(p) => set({ place: p.display_name, placeMeta: p })} />
      </div>
    </fieldset>
  )
}
