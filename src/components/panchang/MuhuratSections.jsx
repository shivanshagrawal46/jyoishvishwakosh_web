import React from 'react'
import { Link } from 'react-router-dom'
import { t } from './labels'
import { Badge, Empty, Eyebrow, Sec, Shubh, WinTile } from './Shared'
import { durationLabel, fmtDate, hhmm, isCurrent, minutesBetween, rangeLabel, spanLabel, whenLabel } from './format'

/* ───────────────────────── Header strip ───────────────────────── */
export function MuhuratHero({ m, hi, place }) {
  const t1 = m.tithi?.[0], n1 = m.nakshatra?.[0], y1 = m.yoga?.[0]
  const stat = (label, value, small) => (
    <div className="kd-stat" key={label}><b>{label}</b><span>{value}</span>{small && <small>{small}</small>}</div>
  )
  return (
    <section className="kd-hero pv-hero">
      <div className="kd-hero__eyebrow">{t('muhuratTitle', hi)} · {place?.display_name}</div>
      <h1 className="kd-hero__name">{fmtDate(m.date, hi)}</h1>
      <p className="kd-hero__line">
        <b>{m.weekday}</b> · {t('lunarMonth', hi)}: <b>{m.lunar_month}</b>
        {m.adhik && <> <Badge tone="warn">{t('adhik', hi)}</Badge></>}
      </p>
      <p className="kd-hero__meta">
        {t1 && <>{t1.paksha} {t('paksha', hi)}, {t1.name}</>}{n1 && <>, {n1.name} {t('nakshatra', hi)}</>}{y1 && <>, {y1.name} {t('yoga', hi)}</>}
      </p>
      <div className="kd-hero__actions">
        <Link to="/muhurat-finder" className="calc-form-submit pv-cta">{t('findDays', hi)} →</Link>
        <Link to="/panchang" className="kd-btn-ghost">{t('fullPanchang', hi)}</Link>
      </div>
      <div className="kd-stats pv-stats">
        {stat(t('sunrise', hi), hhmm(m.sunrise))}
        {stat(t('sunset', hi), hhmm(m.sunset))}
        {m.abhijit_muhurta && stat(t('abhijit', hi), m.abhijit_muhurta.valid === false ? '—' : rangeLabel(m.abhijit_muhurta, hi, m.date), m.abhijit_muhurta.valid === false ? t('abhijitVoid', hi) : null)}
        {m.rahu_kaal && stat(t('rahuKaal', hi), rangeLabel(m.rahu_kaal, hi, m.date))}
      </div>
    </section>
  )
}

/* ───────────────────────── Window tiles (muhurat v0.4 shape) ───────────────────────── */
const flagsOf = (w) => (Array.isArray(w?.flags) ? w.flags : [])
/** Cleanest first: fewest cautions, then longest. */
const sortWindows = (list) => [...list].sort((a, b) => (flagsOf(a).length - flagsOf(b).length) || ((b.minutes || 0) - (a.minutes || 0)))

/** Auspicious window: time span, lagna, bana, cautions list. */
function GoodWin({ w, base, hi, now, label }) {
  const flags = flagsOf(w)
  return (
    <div className={`pv-win pv-win--good${isCurrent(w, now) ? ' is-now' : ''}`}>
      <div className="pv-win__head">
        <b>{label}</b>
        {flags.length === 0 ? <Badge tone="yes">{t('clean', hi)}</Badge> : <Badge tone="warn">{flags.length} {t('cautions', hi)}</Badge>}
        {isCurrent(w, now) && <Badge tone="warn">{t('now', hi)}</Badge>}
      </div>
      <span className="pv-win__range">{spanLabel(w, base, hi)}</span>
      <div className="pv-win__meta">
        <span>{t('duration', hi)}: {durationLabel(w.minutes ?? minutesBetween(w.start, w.end), hi)}</span>
        {w.lagna && <span><i>{t('lagna', hi)}</i>{w.lagna}</span>}
        {w.bana && <span><i>{t('bana', hi)}</i>{w.bana}</span>}
      </div>
      {flags.length > 0 && <ul className="pv-win__flags">{flags.map((f, i) => <li key={i}>{f}</li>)}</ul>}
    </div>
  )
}

/** Avoid window: time span + reason. */
function BadWin({ w, base, hi, now, label }) {
  return (
    <div className={`pv-win pv-win--bad${isCurrent(w, now) ? ' is-now' : ''}`}>
      <div className="pv-win__head"><b>{w.reason || label}</b>{isCurrent(w, now) && <Badge tone="warn">{t('now', hi)}</Badge>}</div>
      <span className="pv-win__range">{spanLabel(w, base, hi)}</span>
      <small className="pv-win__sub">{t('duration', hi)}: {durationLabel(w.minutes ?? minutesBetween(w.start, w.end), hi)}{w.lagna ? ` · ${t('lagna', hi)}: ${w.lagna}` : ''}</small>
    </div>
  )
}

/* ───────────────────────── Auspicious / avoid windows ───────────────────────── */
export function WindowsSection({ m, hi, now }) {
  const base = m.date
  const good = sortWindows(m.auspicious_windows || [])
  const bad = [...(m.avoid_windows || [])].sort((a, b) => String(a.start).localeCompare(String(b.start)))
  return (
    <Sec id="sec-windows" title={`${t('auspiciousWindows', hi)} / ${t('avoidWindows', hi)}`}>
      <div className="kd-two">
        <div>
          <Eyebrow>{t('auspiciousWindows', hi)} · {good.length}</Eyebrow>
          <div className="pv-wins">
            {m.abhijit_muhurta && (m.abhijit_muhurta.valid === false
              ? <div className="pv-win pv-win--mid"><div className="pv-win__head"><b>{t('abhijit', hi)}</b></div><small className="pv-win__sub">{t('abhijitVoid', hi)}</small></div>
              : <WinTile label={t('abhijit', hi)} w={m.abhijit_muhurta} hi={hi} base={base} tone="good" current={isCurrent(m.abhijit_muhurta, now)}
                  sub={durationLabel(minutesBetween(m.abhijit_muhurta.start, m.abhijit_muhurta.end), hi)} />)}
            {good.map((w, i) => <GoodWin key={`${w.start}-${i}`} w={w} base={base} hi={hi} now={now} label={`${t('auspiciousWindows', hi)} ${i + 1}`} />)}
            {good.length === 0 && <Empty>{t('noAuspicious', hi)}</Empty>}
          </div>
        </div>
        <div>
          <Eyebrow>{t('avoidWindows', hi)} · {bad.length}</Eyebrow>
          <div className="pv-wins">
            {bad.map((w, i) => <BadWin key={`${w.start}-${i}`} w={w} base={base} hi={hi} now={now} label={`${t('avoidWindows', hi)} ${i + 1}`} />)}
            {bad.length === 0 && <Empty>{t('noAvoid', hi)}</Empty>}
          </div>
        </div>
      </div>
    </Sec>
  )
}

/* ───────────────────────── Restrictions ───────────────────────── */
export function RestrictionsSection({ m, hi }) {
  // Union of every rule failure for the day across activities — can be long, so a list, not chips.
  const list = m.restrictions_today || []
  return (
    <Sec id="sec-restrictions" title={t('restrictions', hi)} count={list.length} open={list.length <= 8}>
      {list.length === 0 ? <span className="kd-chip kd-chip--good">{t('noRestrictions', hi)}</span> : <ul className="pv-restr">{list.map((r, i) => <li key={i}>{r}</li>)}</ul>}
    </Sec>
  )
}

/* ───────────────────────── Activity suitability ───────────────────────── */
export function ActivitySection({ m, hi }) {
  const base = m.date
  // Suitable first, then by score; `suitable` is the verdict, score is only the bar.
  const rows = [...(m.activity_suitability || [])].sort((a, b) => (Number(Boolean(b.suitable)) - Number(Boolean(a.suitable))) || (b.score - a.score))
  const tick = (ok, label) => (
    <span className={`pv-tick${ok ? ' is-ok' : ''}`} title={label}><i aria-hidden="true">{ok ? '✓' : '✕'}</i>{label}</span>
  )
  const okCount = rows.filter((a) => a.suitable).length
  return (
    <Sec id="sec-activity" title={t('activities', hi)} sub={t('activitiesSub', hi)} count={`${okCount}/${rows.length}`}>
      <div className="pv-acts">
        {rows.map((a) => {
          const ok = Boolean(a.suitable)
          const tone = ok ? 'good' : 'bad'
          const wins = ok ? sortWindows(a.auspicious_windows || []) : []
          const label = hi ? a.hindi_name || a.label : a.label
          return (
            <div key={a.activity} className={`pv-act pv-act--${tone}`}>
              <div className="pv-act__top">
                <b className="pv-act__label">{label}</b>
                <span className="pv-act__badge">
                  <span className={`kd-badge kd-badge--${ok ? 'yes' : 'bad'}`}>{ok ? t('suitable', hi) : t('notSuitable', hi)}</span>
                  <span className="kd-hint">{t('score', hi)} {a.score}</span>
                </span>
              </div>
              <div className="pv-act__bar" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={a.score} aria-label={`${label}: ${a.score}`}>
                <span style={{ width: `${Math.max(2, Math.min(100, a.score))}%` }} />
              </div>
              <div className="pv-act__ticks">
                {tick(a.nakshatra_ok, t('nakOk', hi))}
                {tick(a.tithi_ok, t('tithiOk', hi))}
                {tick(a.weekday_ok, t('weekdayOk', hi))}
              </div>
              {wins.length > 0 && (
                <div className="pv-act__wins">
                  {wins.map((w, i) => (
                    <div key={i} className="pv-act__win">
                      <b>{spanLabel(w, base, hi)}</b>
                      <span>{[w.lagna && `${t('lagna', hi)}: ${w.lagna}`, flagsOf(w).length === 0 ? t('clean', hi) : `${flagsOf(w).length} ${t('cautions', hi)}`].filter(Boolean).join(' · ')}</span>
                    </div>
                  ))}
                </div>
              )}
              {!ok && a.blocked_by?.length > 0 && <p className="pv-act__blocked">{t('blockedBy', hi)}: {a.blocked_by.join('; ')}</p>}
            </div>
          )
        })}
      </div>
    </Sec>
  )
}

/* ───────────────────────── Tithi / nakshatra / yoga lists ───────────────────────── */
export function MuhuratAngaSection({ m, hi }) {
  const base = m.date
  const until = (it) => (it.whole_day ? t('fullDay', hi) : it.until || (hi ? `${whenLabel(it.end, base, hi)} तक` : `upto ${whenLabel(it.end, base, hi)}`))
  const list = (titleKey, items, meta, badge) => (
    <div>
      <Eyebrow>{t(titleKey, hi)}</Eyebrow>
      <div className="pv-anga-list">
        {(items || []).map((it, i) => (
          <div key={i} className="pv-anga">
            <div className="pv-anga__head"><span className="pv-anga__n">{it.number_in_paksha ?? it.number}</span><b className="pv-anga__name">{it.name}</b>{badge && badge(it)}</div>
            {meta && <div className="pv-anga__meta">{meta(it).filter(Boolean).map((x, j) => <span key={j}>{x}</span>)}</div>}
            <div className="pv-anga__time"><span>{until(it)}</span></div>
          </div>
        ))}
      </div>
    </div>
  )
  return (
    <Sec id="sec-anga" title={t('panchangSection', hi)}>
      <div className="pv-anga-grid pv-anga-grid--3">
        {list('tithi', m.tithi, (it) => [`${it.paksha} ${t('paksha', hi)}`, it.deity && `${t('deity', hi)}: ${it.deity}`])}
        {list('nakshatra', m.nakshatra, (it) => [it.lord && `${t('lord', hi)}: ${it.lord}`, it.deity && `${t('deity', hi)}: ${it.deity}`])}
        {list('yoga', m.yoga, null, (it) => <Shubh ok={it.auspicious} hi={hi} />)}
      </div>
    </Sec>
  )
}
