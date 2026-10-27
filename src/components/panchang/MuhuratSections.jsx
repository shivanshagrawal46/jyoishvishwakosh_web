import React from 'react'
import { Link } from 'react-router-dom'
import { t } from './labels'
import { Badge, Chips, Empty, Eyebrow, Sec, Shubh, WinTile } from './Shared'
import { durationLabel, fmtDate, hhmm, isCurrent, minutesBetween, rangeLabel, scoreTone } from './format'

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

/* ───────────────────────── Auspicious / avoid windows ───────────────────────── */
export function WindowsSection({ m, hi, now }) {
  const base = m.date
  const good = m.auspicious_windows || [], bad = m.avoid_windows || []
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
            {good.map((w, i) => (
              <WinTile key={i} label={`${t('auspiciousWindows', hi)} ${i + 1}`} w={w} hi={hi} base={base} tone="good" current={isCurrent(w, now)}
                sub={`${t('duration', hi)}: ${durationLabel(w.minutes ?? minutesBetween(w.start, w.end), hi)}`} />
            ))}
            {good.length === 0 && <Empty>{t('noAuspicious', hi)}</Empty>}
          </div>
        </div>
        <div>
          <Eyebrow>{t('avoidWindows', hi)} · {bad.length}</Eyebrow>
          <div className="pv-wins">
            {m.rahu_kaal && <WinTile label={t('rahuKaal', hi)} w={m.rahu_kaal} hi={hi} base={base} tone="bad" current={isCurrent(m.rahu_kaal, now)} />}
            {bad.map((w, i) => (
              <WinTile key={i} label={`${t('avoidWindows', hi)} ${i + 1}`} w={w} hi={hi} base={base} tone="bad" current={isCurrent(w, now)}
                sub={`${t('duration', hi)}: ${durationLabel(minutesBetween(w.start, w.end), hi)}`} />
            ))}
            {bad.length === 0 && <Empty>{t('noAvoid', hi)}</Empty>}
          </div>
        </div>
      </div>
    </Sec>
  )
}

/* ───────────────────────── Restrictions ───────────────────────── */
export function RestrictionsSection({ m, hi }) {
  const list = m.restrictions_today || []
  return (
    <Sec id="sec-restrictions" title={t('restrictions', hi)} count={list.length}>
      {list.length === 0 ? <span className="kd-chip kd-chip--good">{t('noRestrictions', hi)}</span> : <Chips items={list} tone="warn" />}
    </Sec>
  )
}

/* ───────────────────────── Activity suitability ───────────────────────── */
export function ActivitySection({ m, hi }) {
  const rows = [...(m.activity_suitability || [])].sort((a, b) => b.score - a.score)
  const tick = (ok, label) => (
    <span className={`pv-tick${ok ? ' is-ok' : ''}`} title={label}><i aria-hidden="true">{ok ? '✓' : '✕'}</i>{label}</span>
  )
  const grade = (s) => (s >= 75 ? t('good', hi) : s >= 50 ? t('fair', hi) : t('poor', hi))
  return (
    <Sec id="sec-activity" title={t('activities', hi)} sub={t('activitiesSub', hi)} count={rows.length}>
      <div className="pv-acts">
        {rows.map((a) => {
          const tone = scoreTone(a.score)
          return (
            <div key={a.activity} className={`pv-act pv-act--${tone}`}>
              <div className="pv-act__top">
                <b className="pv-act__label">{a.label}</b>
                <span className={`kd-badge kd-badge--${tone === 'good' ? 'yes' : tone === 'warn' ? 'warn' : 'bad'}`}>{a.score} · {grade(a.score)}</span>
              </div>
              <div className="pv-act__bar" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={a.score} aria-label={`${a.label}: ${a.score}`}>
                <span style={{ width: `${Math.max(2, Math.min(100, a.score))}%` }} />
              </div>
              <div className="pv-act__ticks">
                {tick(a.nakshatra_ok, t('nakOk', hi))}
                {tick(a.tithi_ok, t('tithiOk', hi))}
                {tick(a.weekday_ok, t('weekdayOk', hi))}
              </div>
              {a.blocked_by?.length > 0 && <p className="pv-act__blocked">{t('blockedBy', hi)}: {a.blocked_by.join('; ')}</p>}
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
  const list = (titleKey, items, meta, badge) => (
    <div>
      <Eyebrow>{t(titleKey, hi)}</Eyebrow>
      <div className="pv-anga-list">
        {(items || []).map((it, i) => (
          <div key={i} className="pv-anga">
            <div className="pv-anga__head"><span className="pv-anga__n">{it.number_in_paksha ?? it.number}</span><b className="pv-anga__name">{it.name}</b>{badge && badge(it)}</div>
            {meta && <div className="pv-anga__meta">{meta(it).filter(Boolean).map((x, j) => <span key={j}>{x}</span>)}</div>}
            <div className="pv-anga__time"><span>{rangeLabel(it, hi, base)}</span></div>
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
