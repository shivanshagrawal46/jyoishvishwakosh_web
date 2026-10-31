import React, { createContext, useContext } from 'react'
import { t } from './labels'
import { fmtDate, fmtDateTime, fromToText, hoursLabel, isCurrent, spanLabel, untilText, whenLabel } from './format'
import { shortName } from './place'
import { IconMoon, IconSun, IconSunrise } from '../ui/Icons'

/**
 * Panchang "calendar sheet" — the plain Hindu-calendar layout: titled cards made of
 * label / value rows, nothing drawn, nothing animated. One column on phones, two on
 * desktop. Every time string is either the API's own label (`until`, `start_label`)
 * or built by `whenLabel` in the same shape. Styles: styles/panchang-sheet.css (`pn-`).
 */

/** Language flag for leaf components (so `Row` can label "now" without threading `hi` everywhere). */
export const HiCtx = createContext(false)

/* ───────────────────────── primitives ───────────────────────── */
export const Card = ({ id, title, sub, children, open = true, collapsible = false, wide = false, className = '' }) => {
  const cls = `pn-card${wide ? ' pn-card--wide' : ''} ${className}`.trim()
  if (!collapsible) {
    return (
      <section className={cls} id={id}>
        <header className="pn-card__head"><h2>{title}</h2>{sub && <p>{sub}</p>}</header>
        <div className="pn-card__body">{children}</div>
      </section>
    )
  }
  return (
    <details className={cls} id={id} open={open}>
      <summary className="pn-card__head pn-card__head--sum"><h2>{title}</h2>{sub && <p>{sub}</p>}<span className="pn-card__chev" aria-hidden="true" /></summary>
      <div className="pn-card__body">{children}</div>
    </details>
  )
}

/** One label / value row. `tone` paints a dot: good | bad | mid. `now` marks a running window. */
export const Row = ({ k, v, s, tone, now, children }) => {
  const hi = useContext(HiCtx)
  return (
    <div className={`pn-row${tone ? ` pn-row--${tone}` : ''}${now ? ' is-now' : ''}`}>
      <span className="pn-row__k">{tone && <i className="pn-dot" aria-hidden="true" />}{k}</span>
      <div className="pn-row__v">
        {children || (<><b>{v ?? '—'}</b>{s && <small>{s}</small>}</>)}
        {now && <em className="pn-now">{t('now', hi)}</em>}
      </div>
    </div>
  )
}

/** Row whose value is a list of named entries ("Saptami — upto 2:52 PM"). */
const ListRow = ({ k, items = [], base, hi, now, name, extra }) => (
  <div className="pn-row pn-row--list">
    <span className="pn-row__k">{k}</span>
    <div className="pn-row__v">
      {items.length === 0 && <b>—</b>}
      {items.map((it, i) => {
        const cur = isCurrent(it, now)
        const ex = extra ? extra(it) : null
        return (
          <div key={i} className={`pn-item${cur ? ' is-now' : ''}`}>
            <b>{name ? name(it) : it.name}</b>
            <span>{untilText(it, base, hi)}{cur && <em className="pn-now">{t('now', hi)}</em>}</span>
            {ex && <small>{ex}</small>}
          </div>
        )
      })}
    </div>
  </div>
)

const Empty = ({ hi }) => <p className="pn-empty">{t('noneToday', hi)}</p>

const pickCurrent = (list, now) => (Array.isArray(list) && list.length ? list.find((x) => isCurrent(x, now)) || list[0] : null)
const nowInDay = (p, now) => Boolean(now && p?.sunrise && p?.next_sunrise && now >= p.sunrise && now < p.next_sunrise)

const PERIOD_KEYS = [
  ['kharmas', 'kharmas'], ['chaturmas', 'chaturmas'], ['holashtak', 'holashtak'],
  ['pitru_paksha', 'pitruPaksha'], ['adhik_maas', 'adhikMaas'], ['shravana_maas', 'shravanaMaas'],
]

/* ───────────────────────── 1. Day header ───────────────────────── */
export function DayHead({ p, hi, now, place }) {
  const lm = p.lunar_month || {}, s = p.samvat || {}
  const tithi = pickCurrent(p.tithi, now)
  const base = p.date
  const flags = []
  PERIOD_KEYS.forEach(([k, lk]) => { if (p.periods?.[k]) flags.push([t(lk, hi), 'warn']) })
  if (lm.adhik) flags.push([t('adhik', hi), 'warn'])
  if (lm.kshaya) flags.push([t('kshaya', hi), 'warn'])
  if (p.panchak) flags.push([p.panchak.type || t('panchak', hi), 'bad'])
  if (p.bhadra?.length) flags.push([t('bhadra', hi), 'bad'])
  if (p.mool?.ganda_mula?.length) flags.push([t('gandaMula', hi), 'bad'])
  if (p.manvadi_tithi) flags.push([t('manvadi', hi), 'good'])
  if (p.yugadi_tithi) flags.push([`${t('yugadi', hi)}: ${p.yugadi_tithi}`, 'good'])
  if (p.sankranti) flags.push([p.sankranti.name || t('sankrantiSection', hi), 'good'])
  ;(p.yogas_of_day || []).forEach((y) => flags.push([y.name, y.auspicious ? 'good' : 'bad']))

  const stat = (Icon, label, iso, note) => (
    <div className="pn-sky" key={label}>
      <span className="pn-sky__ico"><Icon s={18} /></span>
      <div><small>{label}</small><b>{iso ? whenLabel(iso, base, hi) : '—'}</b>{!iso && note && <em>{note}</em>}</div>
    </div>
  )

  return (
    <section className="pn-head">
      <div className="pn-head__main">
        <div className="pn-head__eyebrow">{p.vara?.name} · {shortName(place)}</div>
        <h2 className="pn-head__date">{fmtDate(p.date, hi)}</h2>
        <p className="pn-head__lunar">
          <b>{lm.purnimanta}</b> {t('maas', hi)} · <b>{p.paksha}</b> {t('paksha', hi)} · <b>{tithi?.name}</b> {t('tithi', hi)}
        </p>
        <p className="pn-head__samvat">
          {t('vikramSamvat', hi)} {s.vikram_samvat} · {t('shakaSamvat', hi)} {s.shaka_samvat} · {s.samvatsara} {t('samvatsara', hi)}
        </p>
        {flags.length > 0 && (
          <div className="pn-head__flags">
            {flags.map(([label, tone]) => <span key={label} className={`kd-chip kd-chip--${tone}`}>{label}</span>)}
          </div>
        )}
      </div>
      <div className="pn-head__sky">
        {stat(IconSunrise, t('sunrise', hi), p.sunrise)}
        {stat(IconSun, t('sunset', hi), p.sunset)}
        {stat(IconMoon, t('moonrise', hi), p.moonrise, t('noMoonrise', hi))}
        {stat(IconMoon, t('moonset', hi), p.moonset, t('noMoonset', hi))}
      </div>
    </section>
  )
}

/* ───────────────────────── 2. The five angas ───────────────────────── */
export function PanchangCard({ p, hi, now }) {
  const base = p.date
  const live = nowInDay(p, now) ? now : null
  return (
    <Card id="pn-panchang" title={t('secPanchang', hi)} sub={`${t('vara', hi)}: ${p.vara?.name}${p.vara?.sanskrit && p.vara.sanskrit !== p.vara.name ? ` (${p.vara.sanskrit})` : ''} · ${t('lord', hi)}: ${p.vara?.lord}`}>
      <ListRow k={t('tithi', hi)} items={p.tithi || []} base={base} hi={hi} now={live}
        name={(it) => `${it.paksha} ${it.name}`} extra={(it) => [it.sanjna && `${t('sanjna', hi)}: ${it.sanjna}`, it.deity && `${t('deity', hi)}: ${it.deity}`].filter(Boolean).join(' · ')} />
      <ListRow k={t('nakshatra', hi)} items={p.nakshatra || []} base={base} hi={hi} now={live}
        extra={(it) => [it.lord && `${t('lord', hi)}: ${it.lord}`, it.is_ganda_mula && t('gandaMula', hi)].filter(Boolean).join(' · ')} />
      <ListRow k={t('yoga', hi)} items={p.yoga || []} base={base} hi={hi} now={live}
        extra={(it) => (it.auspicious === false ? t('inauspicious', hi) : null)} />
      <ListRow k={t('karana', hi)} items={p.karana || []} base={base} hi={hi} now={live}
        extra={(it) => (it.is_bhadra ? t('bhadraBadge', hi) : null)} />
      <Row k={t('vara', hi)} v={p.vara?.name} s={`${t('lord', hi)}: ${p.vara?.lord}`} />
      <Row k={t('paksha', hi)} v={`${p.paksha} ${t('paksha', hi)}`} />
    </Card>
  )
}

/* ───────────────────────── 3. Sun & moon ───────────────────────── */
export function SunMoonCard({ p, hi }) {
  const base = p.date
  return (
    <Card id="pn-sun" title={t('secSunMoon', hi)}>
      <Row k={t('sunrise', hi)} v={whenLabel(p.sunrise, base, hi)} />
      <Row k={t('sunset', hi)} v={whenLabel(p.sunset, base, hi)} />
      <Row k={t('moonrise', hi)} v={p.moonrise ? whenLabel(p.moonrise, base, hi) : t('noMoonrise', hi)} />
      <Row k={t('moonset', hi)} v={p.moonset ? whenLabel(p.moonset, base, hi) : t('noMoonset', hi)} />
      <Row k={t('madhyahna', hi)} v={whenLabel(p.madhyahna, base, hi)} />
      <Row k={t('dinamana', hi)} v={hoursLabel(p.day_length_hours)} />
      <Row k={t('ratrimana', hi)} v={hoursLabel(p.night_length_hours)} />
      <Row k={t('nextSunrise', hi)} v={whenLabel(p.next_sunrise, base, hi)} />
    </Card>
  )
}

/* ───────────────────────── 4. Auspicious timings ───────────────────────── */
export function ShubhCard({ p, hi, now }) {
  const base = p.date
  const live = nowInDay(p, now) ? now : null
  const win = (label, w, sub) => w?.start && w?.end && <Row key={label} k={label} v={spanLabel(w, base, hi)} s={sub} tone="good" now={isCurrent(w, live)} />
  const ab = p.abhijit_muhurta
  return (
    <Card id="pn-shubh" title={t('secShubh', hi)} sub={t('shubhNote', hi)}>
      {win(t('brahma', hi), p.brahma_muhurta)}
      {win(t('pratah', hi), p.pratah_sandhya)}
      {ab && (ab.valid === false
        ? <Row k={t('abhijit', hi)} v={t('no', hi)} s={t('abhijitVoid', hi)} tone="mid" />
        : win(t('abhijit', hi), ab))}
      {win(t('vijaya', hi), p.vijaya_muhurta)}
      {win(t('godhuli', hi), p.godhuli_muhurta)}
      {win(t('sayahna', hi), p.sayahna_sandhya)}
      {(p.amrit_kaal || []).map((w, i) => win(`${t('amritKaal', hi)}${p.amrit_kaal.length > 1 ? ` ${i + 1}` : ''}`, w))}
      {win(t('nishita', hi), p.nishita_muhurta)}
      {(p.yogas_of_day || []).filter((y) => y.auspicious).map((y, i) => win(y.name, y, y.note || null))}
    </Card>
  )
}

/* ───────────────────────── 5. Inauspicious timings ───────────────────────── */
export function AshubhCard({ p, hi, now }) {
  const base = p.date, d = p.dosha_muhurtas || {}, mool = p.mool || {}
  const live = nowInDay(p, now) ? now : null
  const win = (label, w, sub, tone = 'bad') => w?.start && w?.end && <Row key={label + (w.start || '')} k={label} v={spanLabel(w, base, hi)} s={sub} tone={tone} now={isCurrent(w, live)} />
  const residenceName = (b) => (typeof b.residence === 'object' && b.residence ? b.residence.name : b.residence)
  return (
    <Card id="pn-ashubh" title={t('secAshubh', hi)} sub={t('ashubhNote', hi)}>
      {win(t('rahuKaal', hi), p.rahu_kaal)}
      {win(t('yamaganda', hi), p.yamaganda)}
      {win(t('gulikaKaal', hi), p.gulika_kaal)}
      {(p.dur_muhurta || []).map((w, i) => win(`${t('durMuhurta', hi)}${p.dur_muhurta.length > 1 ? ` ${i + 1}` : ''}`, w, w.when === 'night' ? t('night', hi) : null))}
      {(p.varjyam || []).map((w, i) => win(`${t('varjyam', hi)}${p.varjyam.length > 1 ? ` ${i + 1}` : ''}`, w, w.nakshatra && `${t('nakshatra', hi)}: ${w.nakshatra}`))}
      {/* Ganda-mula: one row per entry, API labels only (no clocks / ghati-pala on these). */}
      {(mool.ganda_mula || []).map((g, i) => (
        <Row key={`g${i}`} k={t('gandaMula', hi)} tone="bad" now={isCurrent(g, live)}>
          <b>{g.nakshatra}</b><small>{fromToText(g, base, hi)}</small>
        </Row>
      ))}
      {(mool.abhukta_mula || []).map((a, i) => (
        <Row key={`a${i}`} k={t('abhukta', hi)} tone="bad" now={isCurrent(a, live)}>
          <b>{a.nakshatra || t('abhukta', hi)}</b><small>{fromToText(a, base, hi)}{a.part ? ` · ${a.part}` : ''}</small>
        </Row>
      ))}
      {(p.bhadra || []).map((b, i) => (
        <Row key={`b${i}`} k={b.kind || t('bhadra', hi)} tone="bad" now={isCurrent(b, live)}>
          <b>{spanLabel(b, base, hi)}</b>
          <small>{[residenceName(b) && `${t('bhadraVasa', hi)}: ${residenceName(b)}`, b.mukha && `${t('mukha', hi)}: ${spanLabel(b.mukha, base, hi)}`].filter(Boolean).join(' · ')}</small>
        </Row>
      ))}
      {p.panchak && win(p.panchak.type || t('panchak', hi), p.panchak, p.panchak.ends_after_this_day ? t('endsAfterDay', hi) : null)}
      {win(t('kulika', hi), d.kulika)}
      {win(t('kantaka', hi), d.kantaka)}
      {win(t('kalavela', hi), d.kalavela)}
      {win(t('yamaghanta', hi), d.yamaghanta)}
      {(p.yogas_of_day || []).filter((y) => !y.auspicious).map((y) => win(y.name, y, y.note || null))}
    </Card>
  )
}

/* ───────────────────────── 6. Lunar month & samvat ───────────────────────── */
export function SamvatCard({ p, hi }) {
  const s = p.samvat || {}, lm = p.lunar_month || {}
  return (
    <Card id="pn-samvat" title={t('secSamvat', hi)}>
      <Row k={t('shakaSamvat', hi)} v={s.shaka_samvat} />
      <Row k={t('vikramSamvat', hi)} v={s.vikram_samvat} s={`${t('kartikadi', hi)}: ${s.vikram_samvat_kartikadi}`} />
      <Row k={t('samvatsara', hi)} v={s.samvatsara} s={s.samvatsara_north && s.samvatsara_north !== s.samvatsara ? `${t('samvatsaraNorth', hi)}: ${s.samvatsara_north}` : null} />
      <Row k={t('kaliYear', hi)} v={s.kali_yuga_year} />
      <Row k={t('amanta', hi)} v={lm.amanta} s={lm.adhik ? t('adhik', hi) : null} />
      <Row k={t('purnimanta', hi)} v={lm.purnimanta} s={lm.kshaya ? t('kshaya', hi) : null} />
      <Row k={t('paksha', hi)} v={`${p.paksha} ${t('paksha', hi)}`} />
      <Row k={t('monthStart', hi)} v={fmtDateTime(lm.month_start, hi)} />
      <Row k={t('monthEnd', hi)} v={fmtDateTime(lm.month_end, hi)} />
    </Card>
  )
}

/* ───────────────────────── 7. Rashi, ritu & ayana ───────────────────────── */
export function RashiCard({ p, hi }) {
  const ay = p.ayana || {}, base = p.date
  const moonUntil = p.moon_sign_until ? (hi ? `${whenLabel(p.moon_sign_until, base, hi)} तक` : `upto ${whenLabel(p.moon_sign_until, base, hi)}`) : null
  return (
    <Card id="pn-rashi" title={t('secRashi', hi)}>
      <Row k={t('moonSign', hi)} v={p.moon_sign} s={[moonUntil, p.moon_next_sign && `${t('moonNext', hi)} ${p.moon_next_sign}`].filter(Boolean).join(' · ') || null} />
      <Row k={t('sunSign', hi)} v={p.sun_sign} />
      <Row k={t('sunNakshatra', hi)} v={p.sun_nakshatra} />
      <Row k={t('ritu', hi)} v={p.ritu} s={p.ritu_drik && p.ritu_drik !== p.ritu ? `${t('drik', hi)}: ${p.ritu_drik}` : null} />
      <Row k={t('ayana', hi)} v={ay.vedic} s={ay.drik && ay.drik !== ay.vedic ? `${t('drik', hi)}: ${ay.drik}` : null} />
      <Row k={t('gol', hi)} v={p.gol} />
      <Row k={t('dishaShool', hi)} v={p.disha_shool} s={t('dishaShoolNote', hi)} tone="bad" />
    </Card>
  )
}

/* ───────────────────────── 8. Yogas of the day ───────────────────────── */
export function YogaCard({ p, hi, now }) {
  const base = p.date
  const live = nowInDay(p, now) ? now : null
  const yod = p.yogas_of_day || [], an = p.anandadi_yoga || []
  return (
    <Card id="pn-yoga" title={t('secYogas', hi)}>
      {yod.length === 0 && <Row k={t('yogasOfDay', hi)} v={t('noSpecialYoga', hi)} />}
      {yod.map((y, i) => <Row key={i} k={y.name} v={spanLabel(y, base, hi)} s={y.note || null} tone={y.auspicious ? 'good' : 'bad'} now={isCurrent(y, live)} />)}
      {an.map((y, i) => (
        <Row key={`a${i}`} k={`${t('anandadi', hi)}${an.length > 1 ? ` ${i + 1}` : ''}`} tone={y.auspicious ? 'good' : 'bad'} now={isCurrent(y, live)}>
          <b>{y.name}</b><small>{[untilText(y, base, hi), y.result].filter(Boolean).join(' · ')}</small>
        </Row>
      ))}
    </Card>
  )
}

/* ───────────────────────── 9. Vasa & direction ───────────────────────── */
export function VasaCard({ p, hi }) {
  return (
    <Card id="pn-vasa" title={t('vasaSection', hi)}>
      <Row k={t('dishaShool', hi)} v={p.disha_shool} s={t('dishaShoolNote', hi)} />
      {p.yogini_vasa && <Row k={t('yoginiVasa', hi)} v={p.yogini_vasa.direction} s={p.yogini_vasa.result} />}
      {p.chandra_vasa && <Row k={t('chandraVasa', hi)} v={p.chandra_vasa.direction} s={p.chandra_vasa.result} />}
      {p.agnivasa && <Row k={t('agnivasa', hi)} v={p.agnivasa.residence} s={p.agnivasa.result} tone={p.agnivasa.auspicious ? 'good' : 'bad'} />}
      {p.shivavasa && <Row k={t('shivavasa', hi)} v={p.shivavasa.residence} s={p.shivavasa.result} tone={p.shivavasa.auspicious ? 'good' : 'bad'} />}
      <Row k={t('chandrabalam', hi)} v={(p.chandrabalam || []).join(', ') || '—'} s={t('balamNote', hi)} />
      <Row k={t('tarabalam', hi)} v={(p.tarabalam || []).join(', ') || '—'} />
    </Card>
  )
}

/* ───────────────────────── 10. Choghadiya ───────────────────────── */
const qLabel = (q, hi) => (q === 'good' ? t('auspicious', hi) : q === 'bad' ? t('inauspicious', hi) : t('neutral', hi))
const qTone = (q) => (q === 'good' ? 'good' : q === 'bad' ? 'bad' : 'mid')

export function ChoghadiyaCard({ p, hi, now }) {
  const base = p.date
  const live = nowInDay(p, now) ? now : null
  const col = (titleKey, list) => (
    <div className="pn-col">
      <h3 className="pn-col__title">{t(titleKey, hi)}</h3>
      {(list || []).map((c, i) => (
        <Row key={i} k={c.name} tone={qTone(c.quality)} now={isCurrent(c, live)}>
          <b>{spanLabel(c, base, hi)}</b><small>{c.quality_label || qLabel(c.quality, hi)}{c.planet_name ? ` · ${c.planet_name}` : ''}</small>
        </Row>
      ))}
    </div>
  )
  return (
    <Card id="pn-chog" title={t('choghadiya', hi)} wide>
      <div className="pn-cols">{col('day', p.choghadiya?.day)}{col('night', p.choghadiya?.night)}</div>
    </Card>
  )
}

/* ───────────────────────── 11. Secondary (collapsed) cards ───────────────────────── */
export function LagnaCard({ p, hi, now }) {
  const base = p.date
  const live = nowInDay(p, now) ? now : null
  return (
    <Card id="pn-lagna" title={t('secLagna', hi)} collapsible open={false}>
      {(p.lagna || []).map((l, i) => <Row key={i} k={`${l.number}. ${l.sign}`} v={spanLabel(l, base, hi)} now={isCurrent(l, live)} />)}
    </Card>
  )
}

export function PadaCard({ p, hi, now }) {
  const base = p.date
  const live = nowInDay(p, now) ? now : null
  return (
    <Card id="pn-pada" title={t('nakshatraPada', hi)} collapsible open={false}>
      {(p.nakshatra_pada || []).map((x, i) => (
        <Row key={i} k={`${x.nakshatra} · ${t('nakshatraPadaShort', hi)} ${x.pada}`} now={isCurrent(x, live)}>
          <b>{hi ? `${whenLabel(x.end, base, hi)} तक` : `upto ${whenLabel(x.end, base, hi)}`}</b>
          <small>{[x.syllable && `${t('syllable', hi)}: ${x.syllable}`, x.navamsa_sign && `${t('navamsaSign', hi)}: ${x.navamsa_sign}`].filter(Boolean).join(' · ')}</small>
        </Row>
      ))}
    </Card>
  )
}

export function HoraCard({ p, hi, now }) {
  const base = p.date
  const live = nowInDay(p, now) ? now : null
  const col = (titleKey, list) => (
    <div className="pn-col">
      <h3 className="pn-col__title">{t(titleKey, hi)}</h3>
      {list.map((h, i) => <Row key={i} k={`${h.number}. ${h.planet}`} v={spanLabel(h, base, hi)} now={isCurrent(h, live)} />)}
    </div>
  )
  const all = p.hora || []
  return (
    <Card id="pn-hora" title={t('hora', hi)} collapsible open={false} wide>
      <div className="pn-cols">{col('day', all.filter((h) => h.when !== 'night'))}{col('night', all.filter((h) => h.when === 'night'))}</div>
    </Card>
  )
}

export function MuhurtaCard({ p, hi, now }) {
  const base = p.date
  const live = nowInDay(p, now) ? now : null
  const col = (titleKey, list) => (
    <div className="pn-col">
      <h3 className="pn-col__title">{t(titleKey, hi)}</h3>
      {list.map((m, i) => <Row key={i} k={`${m.number}. ${m.name}`} v={spanLabel(m, base, hi)} s={m.auspicious ? t('auspicious', hi) : t('inauspicious', hi)} tone={m.auspicious ? 'good' : 'bad'} now={isCurrent(m, live)} />)}
    </div>
  )
  const all = p.muhurtas || []
  return (
    <Card id="pn-muhurta" title={t('muhurtas', hi)} collapsible open={false} wide>
      <div className="pn-cols">{col('day', all.filter((m) => m.when !== 'night'))}{col('night', all.filter((m) => m.when === 'night'))}</div>
    </Card>
  )
}

export function BhadraDetailCard({ p, hi }) {
  const base = p.date
  const list = p.bhadra || []
  if (list.length === 0) return null
  const residenceName = (b) => (typeof b.residence === 'object' && b.residence ? b.residence.name : b.residence)
  const harmful = (b) => (typeof b.harmful === 'boolean' ? b.harmful : b.residence?.harmful)
  return (
    <Card id="pn-bhadra" title={t('bhadra', hi)} collapsible open={false}>
      {list.map((b, i) => (
        <React.Fragment key={i}>
          <Row k={t('kind', hi)} v={b.kind || t('bhadra', hi)} s={harmful(b) ? t('harmful', hi) : t('notHarmful', hi)} tone={harmful(b) ? 'bad' : 'good'} />
          <Row k={t('tithi', hi)} v={b.tithi} />
          <Row k={t('bhadraVasa', hi)} v={residenceName(b)} />
          {b.full_start && <Row k={t('fullSpan', hi)} v={`${fmtDateTime(b.full_start, hi)} – ${fmtDateTime(b.full_end, hi)}`} />}
          <Row k={t('todayWindow', hi)} v={spanLabel(b, base, hi)} />
          {b.mukha && <Row k={t('mukha', hi)} v={spanLabel(b.mukha, base, hi)} tone="bad" />}
          {b.puccha && <Row k={t('puccha', hi)} v={spanLabel(b.puccha, base, hi)} tone="good" />}
          {b.note && <p className="pn-note">{b.note}</p>}
        </React.Fragment>
      ))}
    </Card>
  )
}

export function SankrantiCard({ p, hi }) {
  const s = p.sankranti, ns = p.next_sankranti, base = p.date
  return (
    <Card id="pn-sankranti" title={t('sankrantiSection', hi)} collapsible open={Boolean(s)}>
      {!s && ns && <Row k={t('nextSankranti', hi)} v={ns.sign} s={fmtDateTime(ns.time, hi)} />}
      {!s && !ns && <Empty hi={hi} />}
      {s && (<>
        <Row k={t('sankrantiSection', hi)} v={s.name || s.sign} />
        <Row k={t('time', hi)} v={`${fmtDateTime(s.time, hi)}${s.at_night ? ` (${t('atNight', hi)})` : ''}`} />
        <Row k={t('nakshatra', hi)} v={s.nakshatra} s={s.nakshatra_sanjna && `${t('sanjna', hi)}: ${s.nakshatra_sanjna}`} />
        <Row k={t('purusha', hi)} v={s.purusha} s={s.purusha_result} />
        {s.punya_kaal && <Row k={t('punyaKaal', hi)} v={spanLabel(s.punya_kaal, base, hi)} s={s.punya_kaal.day} tone="good" />}
        {s.maha_punya_kaal && <Row k={t('mahaPunyaKaal', hi)} v={spanLabel(s.maha_punya_kaal, base, hi)} tone="good" />}
        {ns && <Row k={t('nextSankranti', hi)} v={ns.sign} s={fmtDateTime(ns.time, hi)} />}
      </>)}
    </Card>
  )
}

export function GuruShukraCard({ p, hi }) {
  const card = (g) => g && (
    <Row key={g.planet} k={g.planet} v={g.state_label} tone={g.state === 'udita' ? 'good' : g.state === 'asta' ? 'bad' : 'mid'}
      s={g.state === 'asta'
        ? `${t('astaStart', hi)}: ${fmtDateTime(g.asta_start, hi)} · ${t('astaEnd', hi)}: ${g.asta_end ? fmtDateTime(g.asta_end, hi) : '—'}`
        : `${t('udaya', hi)}: ${fmtDateTime(g.udaya, hi)} · ${t('nextAsta', hi)}: ${fmtDateTime(g.next_asta, hi)}`} />
  )
  return (
    <Card id="pn-guru" title={t('guruShukraSection', hi)} collapsible open={false}>
      {card(p.guru)}{card(p.shukra)}
    </Card>
  )
}

export function VedhaCard({ p, hi }) {
  const base = p.date
  const chakraLabel = (c) => (c === 'saptashalaka' ? t('saptashalaka', hi) : c === 'panchashalaka' ? t('panchashalaka', hi) : c)
  return (
    <Card id="pn-vedha" title={t('vedhaSection', hi)} collapsible open={false}>
      {(p.shalaka_vedha || []).map((v, i) => (
        <Row key={i} k={`${chakraLabel(v.chakra)} · ${v.nakshatra}`} tone={v.has_vedha ? 'bad' : 'good'}>
          <b>{v.has_vedha ? t('hasVedha', hi) : t('noVedha', hi)}</b>
          <small>{spanLabel(v, base, hi)} · {t('vedhaNak', hi)}: {(v.vedha_nakshatras || []).join(', ') || '—'}{v.planets?.length ? ` · ${t('planets', hi)}: ${v.planets.map((pl) => `${pl.planet} (${pl.in_nakshatra})`).join(', ')}` : ''}</small>
        </Row>
      ))}
      {(p.andhadi_nakshatra || []).map((a, i) => (
        <Row key={`a${i}`} k={`${t('andhadi', hi)} · ${a.nakshatra}`}>
          <b>{a.type}</b><small>{[untilText(a, base, hi), a.result].filter(Boolean).join(' · ')}</small>
        </Row>
      ))}
    </Card>
  )
}

export function PlanetsCard({ p, hi }) {
  const base = p.date
  return (
    <Card id="pn-planets" title={t('planetsAtSunrise', hi)} sub={`${t('sunrise', hi)} ${whenLabel(p.sunrise, base, hi)} · ${t('ayanamsa', hi)}: ${p.ayanamsa}`} collapsible open={false}>
      {(p.planets_at_sunrise || []).map((pl) => (
        <Row key={pl.id} k={pl.planet} v={`${pl.sign} ${Number(pl.degrees_in_sign).toFixed(2)}°`} s={`${pl.nakshatra}${pl.is_retrograde ? ` · ${t('retro', hi)}` : ''}`} tone={pl.is_retrograde ? 'bad' : undefined} />
      ))}
    </Card>
  )
}

/* ───────────────────────── Jump links ───────────────────────── */
export const JUMP = [
  ['pn-panchang', 'secPanchang'], ['pn-shubh', 'secShubh'], ['pn-ashubh', 'secAshubh'], ['pn-chog', 'choghadiya'],
  ['pn-samvat', 'secSamvat'], ['pn-rashi', 'secRashi'], ['pn-yoga', 'secYogas'], ['pn-vasa', 'vasaSection'], ['pn-lagna', 'secLagna'],
]
export function Jump({ hi }) {
  return (
    <nav className="pn-jump" aria-label={t('onThisPage', hi)}>
      {JUMP.map(([id, key]) => <a key={id} href={`#${id}`}>{t(key, hi)}</a>)}
    </nav>
  )
}
