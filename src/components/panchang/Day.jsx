import React, { useEffect, useMemo, useRef, useState } from 'react'
import { searchPlaces } from '../../services/kundliApi'
import { t } from './labels'
import { durationLabel, fmtDate, gp, hhmm, hoursLabel, isCurrent, minutesBetween, rangeLabel, shiftYmd, splitClock, todayYmd } from './format'
import { shortName, toPlace } from './place'
import SunArc from '../tools/SunArc'
import DayTimeline from '../tools/DayTimeline'
import { Panel, Tile } from '../tools/jt'
import { IconCalendar, IconChevronLeft, IconChevronRight, IconClock, IconMoon, IconPin, IconSearch, IconSun, IconWarn, Mandala } from '../ui/Icons'

/* ───────────────────────── helpers ───────────────────────── */
const ms = (iso) => (iso ? new Date(iso).getTime() : NaN)
/** Compact panchang clock ("28:07") without the next-day annotation. */
const sc = (c) => splitClock(c)?.text || '—'
/** Fraction 0..1 of a window that has elapsed at `now`, or null when `now` is outside. */
const progressOf = (w, now) => {
  if (!w?.start || !w?.end || !now) return null
  const a = ms(w.start), b = ms(w.end), n = ms(now)
  if (!(n >= a && n < b)) return null
  return (n - a) / (b - a)
}
/** The list item running at `now`, else the first one. */
const pickCurrent = (list, now) => {
  if (!Array.isArray(list) || list.length === 0) return null
  return list.find((x) => isCurrent(x, now)) || list[0]
}
/** Whether `now` falls inside the panchang day (sunrise → next sunrise). */
const nowInDay = (p, now) => Boolean(now && p?.sunrise && p?.next_sunrise && now >= p.sunrise && now < p.next_sunrise)

/* ───────────────────────── Place button + popover ───────────────────────── */
export function PlaceButton({ hi, place, onPick }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const boxRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) { setResults([]); setBusy(false); setFailed(false); return undefined }
    const ctrl = new AbortController()
    setBusy(true); setFailed(false)
    const id = setTimeout(() => {
      searchPlaces(term, { limit: 8, signal: ctrl.signal })
        .then((rows) => setResults(rows || []))
        .catch((e) => { if (e.name !== 'AbortError') { setResults([]); setFailed(true) } })
        .finally(() => { if (!ctrl.signal.aborted) setBusy(false) })
    }, 260)
    return () => { clearTimeout(id); ctrl.abort() }
  }, [q])

  useEffect(() => {
    if (!open) return undefined
    const onDoc = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', onDoc)
    document.addEventListener('keydown', onKey)
    setTimeout(() => inputRef.current?.focus(), 30)
    return () => { document.removeEventListener('pointerdown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open])

  const choose = (r) => { onPick(toPlace(r)); setQ(''); setResults([]); setOpen(false) }

  return (
      <div ref={boxRef} className="jt-daybar__placebox">
        <button type="button" className="jt-daybar__place" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="dialog" title={place?.display_name}>
          <IconPin s={16} /><span>{shortName(place)}</span>
        </button>
        {open && (
          <div className="jt-pop" role="dialog" aria-label={t('changePlace', hi)}>
            <div className="kd-fld">
              <label className="kd-fld__label" htmlFor="jt-place-q">{t('changePlace', hi)}</label>
              <div style={{ position: 'relative' }}>
                <input id="jt-place-q" ref={inputRef} className="jt-input" type="text" value={q} autoComplete="off" placeholder={t('searchCity', hi)} onChange={(e) => setQ(e.target.value)} style={{ width: '100%', paddingLeft: 40 }} />
                <IconSearch s={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)' }} />
              </div>
            </div>
            {q.trim().length >= 2 && (
              <ul className="kd-drop" role="listbox">
                {busy && results.length === 0 && <li className="kd-hint" style={{ cursor: 'default' }}>{t('searching', hi)}</li>}
                {!busy && failed && <li className="kd-hint" style={{ cursor: 'default' }}>{t('searchFailed', hi)}</li>}
                {!busy && !failed && results.length === 0 && <li className="kd-hint" style={{ cursor: 'default' }}>{t('noResults', hi)}</li>}
                {results.map((r) => (
                  <li key={`${r.display_name}-${r.latitude}-${r.longitude}`} role="option" aria-selected={false} onClick={() => choose(r)}>
                    <span>{r.display_name}</span>
                    <small>{r.timezone || `${Number(r.latitude).toFixed(2)}, ${Number(r.longitude).toFixed(2)}`}</small>
                  </li>
                ))}
              </ul>
            )}
            <p className="kd-hint" style={{ margin: '10px 0 0' }}>{place?.display_name}{place?.timezone ? ` · ${place.timezone}` : ''}</p>
          </div>
        )}
      </div>
  )
}

/* ───────────────────────── Sticky day bar ───────────────────────── */
export function DayBar({ hi, date, setDate, place, setPlace }) {
  const isToday = date === todayYmd()
  return (
    <div className="jt-daybar jt-sticky">
      <button type="button" className="jt-daybar__btn" onClick={() => setDate(shiftYmd(date, -1))} aria-label={t('prevDay', hi)}><IconChevronLeft s={20} /></button>
      <label className="jt-daybar__date">
        <IconCalendar s={16} />
        <span>{fmtDate(date, hi, { weekday: 'short', month: 'short', year: undefined })}</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label={t('selectDate', hi)} />
      </label>
      <button type="button" className="jt-daybar__btn" onClick={() => setDate(shiftYmd(date, 1))} aria-label={t('nextDay', hi)}><IconChevronRight s={20} /></button>
      {!isToday && <button type="button" className="jt-btn jt-btn--ghost jt-btn--sm jt-daybar__today" onClick={() => setDate(todayYmd())}>{t('today', hi)}</button>}
      <PlaceButton hi={hi} place={place} onPick={setPlace} />
    </div>
  )
}

/* ───────────────────────── Sticky month bar (vrat & parv) ───────────────────────── */
export function MonthBar({ hi, year, month, onChange, place, setPlace, allLabel, monthName, min = 1700, max = 2200 }) {
  const today = todayYmd()
  const ty = Number(today.slice(0, 4)), tm = Number(today.slice(5, 7))
  const isNow = year === ty && month === tm
  const step = (d) => {
    if (month === 0) { onChange(Math.min(max, Math.max(min, year + d)), 0); return }
    let m = month + d, y = year
    if (m < 1) { m = 12; y -= 1 } else if (m > 12) { m = 1; y += 1 }
    if (y < min || y > max) return
    onChange(y, m)
  }
  const label = month === 0 ? `${allLabel} ${year}` : `${monthName(month)} ${year}`
  return (
    <div className="jt-daybar jt-sticky">
      <button type="button" className="jt-daybar__btn" onClick={() => step(-1)} aria-label={t('prevDay', hi)}><IconChevronLeft s={20} /></button>
      <label className="jt-daybar__date">
        <IconCalendar s={16} />
        <span>{label}</span>
        <select value={`${year}-${month}`} onChange={(e) => { const [y, m] = e.target.value.split('-').map(Number); onChange(y, m) }} aria-label={t('selectDate', hi)}>
          {[year - 1, year, year + 1].filter((y) => y >= min && y <= max).map((y) => (
            <optgroup key={y} label={String(y)}>
              <option value={`${y}-0`}>{allLabel} {y}</option>
              {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={`${y}-${i + 1}`}>{monthName(i + 1)} {y}</option>)}
            </optgroup>
          ))}
        </select>
      </label>
      <button type="button" className="jt-daybar__btn" onClick={() => step(1)} aria-label={t('nextDay', hi)}><IconChevronRight s={20} /></button>
      {!isNow && <button type="button" className="jt-btn jt-btn--ghost jt-btn--sm jt-daybar__today" onClick={() => onChange(ty, tm)}>{t('today', hi)}</button>}
      <PlaceButton hi={hi} place={place} onPick={setPlace} />
    </div>
  )
}

/* ───────────────────────── 7-day strip ───────────────────────── */
export function WeekStrip({ hi, date, setDate }) {
  const today = todayYmd()
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => shiftYmd(date, i - 3)), [date])
  return (
    <div className="jt-week" role="group" aria-label={t('selectDate', hi)}>
      {days.map((d) => {
        const dt = new Date(`${d}T00:00:00`)
        const cls = ['jt-week__day', d === date ? 'is-selected' : '', d === today ? 'is-today' : ''].filter(Boolean).join(' ')
        return (
          <button key={d} type="button" className={cls} onClick={() => setDate(d)} aria-pressed={d === date} aria-label={fmtDate(d, hi, { weekday: 'long' })}>
            <small>{dt.toLocaleDateString(hi ? 'hi-IN' : 'en-IN', { weekday: 'short' })}</small>
            <b>{dt.getDate()}</b>
          </button>
        )
      })}
    </div>
  )
}

/* ───────────────────────── Glance card ───────────────────────── */
const PERIOD_KEYS = [
  ['kharmas', 'kharmas'], ['chaturmas', 'chaturmas'], ['holashtak', 'holashtak'],
  ['pitru_paksha', 'pitruPaksha'], ['adhik_maas', 'adhikMaas'], ['shravana_maas', 'shravanaMaas'],
]

export function Glance({ p, hi, now, place }) {
  const lm = p.lunar_month || {}, s = p.samvat || {}
  const tithi = pickCurrent(p.tithi, now), nak = pickCurrent(p.nakshatra, now)
  const flags = []
  PERIOD_KEYS.forEach(([k, lk]) => { if (p.periods?.[k]) flags.push([t(lk, hi), 'warn']) })
  if (lm.adhik) flags.push([t('adhik', hi), 'warn'])
  if (lm.kshaya) flags.push([t('kshaya', hi), 'warn'])
  if (p.panchak) flags.push([p.panchak.type || t('panchak', hi), 'bad'])
  if (p.bhadra?.length) flags.push([t('bhadra', hi), 'bad'])
  if (p.manvadi_tithi) flags.push([t('manvadi', hi), 'good'])
  if (p.yugadi_tithi) flags.push([`${t('yugadi', hi)}: ${p.yugadi_tithi}`, 'good'])
  if (p.sankranti) flags.push([p.sankranti.name || t('sankrantiSection', hi), 'good'])

  const inDay = nowInDay(p, now)
  const dayFrac = inDay ? (ms(now) - ms(p.sunrise)) / (ms(p.next_sunrise) - ms(p.sunrise)) : null

  return (
    <section className="jt-glance jt-fade">
      <Mandala className="jt-glance__mandala" aria-hidden="true" />
      <div className="jt-glance__text">
        <div className="jt-eyebrow">{p.vara?.name}{p.vara?.sanskrit && p.vara.sanskrit !== p.vara.name ? ` · ${p.vara.sanskrit}` : ''} · {shortName(place)}</div>
        <h2 className="jt-glance__date">
          {fmtDate(p.date, hi)}
          <small>{lm.purnimanta} {t('maas', hi)} · {p.paksha} {t('paksha', hi)} · {tithi?.name}</small>
        </h2>
        <div className="jt-glance__lunar">
          <span><i>{t('nakshatra', hi)}</i> <b>{nak?.name}</b></span>
          <span><i>{t('lord', hi)}</i> <b>{p.vara?.lord}</b></span>
          <span><i>{t('moonSign', hi)}</i> <b>{p.moon_sign}</b></span>
          <span><i>{t('ritu', hi)}</i> <b>{p.ritu}</b></span>
        </div>
        <p className="jt-glance__samvat">
          {t('vikramSamvat', hi)} <b>{s.vikram_samvat}</b> · {t('shakaSamvat', hi)} <b>{s.shaka_samvat}</b> · {s.samvatsara} · {t('amanta', hi)}: {lm.amanta}
        </p>
        {flags.length > 0 && (
          <div className="jt-glance__flags">
            {flags.map(([label, tone]) => <span key={label} className={`kd-chip kd-chip--${tone}`}>{label}</span>)}
          </div>
        )}
      </div>
      <div className="jt-glance__sky">
        <SunArc sunrise={p.sunrise} sunset={p.sunset} now={now}
          labels={{ sunrise: t('sunrise', hi), sunset: t('sunset', hi), aria: t('skyAria', hi), center: dayFrac != null ? `${Math.round(dayFrac * 100)}% ${t('dayProgress', hi)}` : hoursLabel(p.day_length_hours) }} />
        <div className="jt-sky-stats">
          <div className="jt-sky-stat"><b>{t('moonrise', hi)}</b><span>{p.moonrise ? hhmm(p.moonrise) : '—'}</span>{!p.moonrise && <small>{t('noMoonrise', hi)}</small>}</div>
          <div className="jt-sky-stat"><b>{t('moonset', hi)}</b><span>{p.moonset ? hhmm(p.moonset) : '—'}</span>{!p.moonset && <small>{t('noMoonset', hi)}</small>}</div>
          <div className="jt-sky-stat"><b>{t('dinamana', hi)}</b><span>{hoursLabel(p.day_length_hours)}</span><small>{gp(p.dinamana, hi)}</small></div>
          <div className="jt-sky-stat"><b>{t('nextSunrise', hi)}</b><span>{hhmm(p.next_sunrise)}</span><small>{fmtDate(p.next_sunrise, hi, { month: 'short', year: undefined })}</small></div>
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── Five angas as tiles ───────────────────────── */
export function AngaTiles({ p, hi, now }) {
  const inDay = nowInDay(p, now)
  const tile = (key, list, extra) => {
    const it = pickCurrent(list, now)
    if (!it) return null
    const prog = inDay ? progressOf(it, now) : null
    const running = prog != null
    const sub = running
      ? `${t('until', hi)} ${sc(it.end_clock)} · ${durationLabel(minutesBetween(now, it.end), hi)}`
      : `${sc(it.start_clock)} – ${sc(it.end_clock)}`
    const ex = extra ? extra(it) : null
    return <Tile key={key} k={t(key, hi)} v={it.name} s={ex ? `${ex} · ${sub}` : sub} n={it.number_in_paksha ?? it.number} progress={prog ?? undefined} />
  }
  return (
    <div className="jt-tiles jt-tiles--5">
      <Tile k={t('vara', hi)} v={p.vara?.name} s={`${t('lord', hi)}: ${p.vara?.lord}`} tone="accent" />
      {tile('tithi', p.tithi, (it) => `${it.paksha}`)}
      {tile('nakshatra', p.nakshatra, (it) => it.lord ? `${t('lord', hi)}: ${it.lord}` : null)}
      {tile('yoga', p.yoga, (it) => (it.auspicious ? t('auspicious', hi) : t('inauspicious', hi)))}
      {tile('karana', p.karana, (it) => (it.is_bhadra ? t('bhadraBadge', hi) : null))}
    </div>
  )
}

/* ───────────────────────── Right-now strip ───────────────────────── */
export function NowStrip({ p, hi, now }) {
  const inDay = nowInDay(p, now)
  const base = p.date
  const item = (Icon, k, v, s, tone, live) => (
    <div className={`jt-now__item jt-now__item--${tone}`} key={k + v}>
      <span className="jt-now__ico"><Icon s={20} /></span>
      <div style={{ minWidth: 0 }}>
        <div className="jt-now__k">{live && <i aria-hidden="true" />}{k}</div>
        <div className="jt-now__v">{v}</div>
        {s && <div className="jt-now__s">{s}</div>}
      </div>
    </div>
  )
  const qTone = (q) => (q === 'good' ? 'good' : q === 'bad' ? 'bad' : 'mid')

  if (!inDay) {
    const ab = p.abhijit_muhurta, br = p.brahma_muhurta, rk = p.rahu_kaal
    return (
      <div className="jt-now">
        {ab && ab.valid !== false && item(IconSun, t('abhijit', hi), rangeLabel(ab, hi, base), durationLabel(minutesBetween(ab.start, ab.end), hi), 'good')}
        {br && item(IconSun, t('brahma', hi), rangeLabel(br, hi, base), durationLabel(minutesBetween(br.start, br.end), hi), 'good')}
        {rk && item(IconWarn, t('rahuKaal', hi), rangeLabel(rk, hi, base), durationLabel(minutesBetween(rk.start, rk.end), hi), 'bad')}
      </div>
    )
  }

  const chog = [...(p.choghadiya?.day || []), ...(p.choghadiya?.night || [])].find((c) => isCurrent(c, now))
  const hora = (p.hora || []).find((h) => isCurrent(h, now))
  const bad = [[p.rahu_kaal, t('rahuKaal', hi)], [p.gulika_kaal, t('gulikaKaal', hi)], [p.yamaganda, t('yamaganda', hi)], ...(p.dur_muhurta || []).map((w, i) => [w, `${t('durMuhurta', hi)} ${i + 1}`]), ...(p.varjyam || []).map((w) => [w, t('varjyam', hi)])]
    .filter(([w]) => w?.start && w?.end)
  const good = [[p.abhijit_muhurta?.valid === false ? null : p.abhijit_muhurta, t('abhijit', hi)], [p.vijaya_muhurta, t('vijaya', hi)], [p.godhuli_muhurta, t('godhuli', hi)], [p.nishita_muhurta, t('nishita', hi)], ...(p.amrit_kaal || []).map((w) => [w, t('amritKaal', hi)])]
    .filter(([w]) => w?.start && w?.end)
  const runningBad = bad.find(([w]) => isCurrent(w, now))
  const runningGood = good.find(([w]) => isCurrent(w, now))
  const upcoming = [...good.map((x) => [...x, 'good']), ...bad.map((x) => [...x, 'bad'])].filter(([w]) => w.start > now).sort((a, b) => (a[0].start < b[0].start ? -1 : 1))[0]

  let third
  if (runningBad) third = item(IconWarn, t('rightNow', hi), runningBad[1], `${t('endsAt', hi)} ${hhmm(runningBad[0].end)} · ${durationLabel(minutesBetween(now, runningBad[0].end), hi)}`, 'bad', true)
  else if (runningGood) third = item(IconSun, t('rightNow', hi), runningGood[1], `${t('endsAt', hi)} ${hhmm(runningGood[0].end)} · ${durationLabel(minutesBetween(now, runningGood[0].end), hi)}`, 'good', true)
  else if (upcoming) third = item(upcoming[2] === 'bad' ? IconWarn : IconSun, t('upcoming', hi), upcoming[1], `${t('startsAt', hi)} ${hhmm(upcoming[0].start)} · ${durationLabel(minutesBetween(now, upcoming[0].start), hi)}`, upcoming[2])
  else third = item(IconSun, t('rightNow', hi), t('noKaalNow', hi), null, 'good', true)

  return (
    <div className="jt-now">
      {chog && item(IconClock, `${t('choghadiya', hi)} · ${t('now', hi)}`, chog.name, `${chog.planet_name || chog.planet} · ${t('until', hi)} ${hhmm(chog.end)}`, qTone(chog.quality), true)}
      {hora && item(IconMoon, `${t('hora', hi)} · ${t('now', hi)}`, hora.planet, `${t('until', hi)} ${hhmm(hora.end)} · ${hora.when === 'night' ? t('night', hi) : t('day', hi)}`, 'mid', true)}
      {third}
    </div>
  )
}

/* ───────────────────────── Day timeline panel ───────────────────────── */
export function TimelinePanel({ p, hi, now }) {
  const windows = []
  const push = (w, label, tone) => { if (w?.start && w?.end) windows.push({ start: w.start, end: w.end, label, tone }) }
  push(p.rahu_kaal, t('rahuKaal', hi), 'bad'); push(p.gulika_kaal, t('gulikaKaal', hi), 'bad'); push(p.yamaganda, t('yamaganda', hi), 'bad')
  ;(p.dur_muhurta || []).forEach((w, i) => push(w, `${t('durMuhurta', hi)} ${i + 1}`, 'bad'))
  ;(p.varjyam || []).forEach((w) => push(w, t('varjyam', hi), 'bad'))
  if (p.abhijit_muhurta?.valid !== false) push(p.abhijit_muhurta, t('abhijit', hi), 'good')
  push(p.vijaya_muhurta, t('vijaya', hi), 'good'); push(p.godhuli_muhurta, t('godhuli', hi), 'good'); push(p.nishita_muhurta, t('nishita', hi), 'good')
  ;(p.amrit_kaal || []).forEach((w) => push(w, t('amritKaal', hi), 'good'))
  return (
    <Panel title={t('timeline', hi)} sub={t('timelineSub', hi)}>
      <DayTimeline start={p.sunrise} end={p.next_sunrise} sunset={p.sunset} windows={windows} now={now} hi={hi}
        labels={{ day: t('day', hi), night: t('night', hi), good: t('auspicious', hi), bad: t('inauspicious', hi), now: t('now', hi), aria: t('timeline', hi) }} />
    </Panel>
  )
}

/* ───────────────────────── Sequence rows (choghadiya / hora / muhurta) ───────────────────────── */
export function SeqList({ items = [], hi, base, now, name, sub, tone }) {
  const total = items.reduce((m, x) => Math.max(m, minutesBetween(x.start, x.end)), 0) || 1
  return (
    <div className="jt-seq">
      {items.map((x, i) => {
        const cur = isCurrent(x, now)
        const tn = tone(x)
        const mins = minutesBetween(x.start, x.end)
        return (
          <div key={i} className={`jt-seq__row jt-seq__row--${tn}${cur ? ' is-now' : ''}`}>
            <div className="jt-seq__name"><b>{name(x)}</b>{sub && <small>{sub(x)}</small>}</div>
            <div className="jt-seq__bar" aria-hidden="true"><span style={{ width: `${Math.round((mins / total) * 100)}%` }} /></div>
            <div className="jt-seq__time">{rangeLabel(x, hi, base)}<small>{tn === 'good' ? t('auspicious', hi) : tn === 'bad' ? t('inauspicious', hi) : t('neutral', hi)}{cur ? ` · ${t('now', hi)}` : ''}</small></div>
          </div>
        )
      })}
    </div>
  )
}
