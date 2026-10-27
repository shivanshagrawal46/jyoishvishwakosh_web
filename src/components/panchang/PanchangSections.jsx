import React from 'react'
import { t } from './labels'
import { Badge, Chips, Empty, Eyebrow, KV, Sec, Shubh, WinTile } from './Shared'
import { clockLabel, fmtDate, fmtDateTime, gp, hhmm, hoursLabel, isCurrent, isoClock, qualityTone, rangeLabel } from './format'

/* Section ids + title keys, also used for the jump navigation on the page. */
export const SECTIONS = [
  ['sec-samvat', 'samvatSection'],
  ['sec-anga', 'panchangSection'],
  ['sec-yoga', 'yogasSection'],
  ['sec-kaal', 'kaalSection'],
  ['sec-bhadra', 'bhadraSection'],
  ['sec-lagna', 'lagnaSection'],
  ['sec-vasa', 'vasaSection'],
  ['sec-guru', 'guruShukraSection'],
  ['sec-sankranti', 'sankrantiSection'],
  ['sec-vedha', 'vedhaSection'],
  ['sec-chog', 'choghadiya'],
  ['sec-hora', 'hora'],
  ['sec-muhurta', 'muhurtas'],
  ['sec-balam', 'chandrabalam'],
  ['sec-planets', 'planetsAtSunrise'],
]

const PERIOD_KEYS = [
  ['kharmas', 'kharmas'], ['chaturmas', 'chaturmas'], ['holashtak', 'holashtak'],
  ['pitru_paksha', 'pitruPaksha'], ['adhik_maas', 'adhikMaas'], ['shravana_maas', 'shravanaMaas'],
]

/* ───────────────────────── 1. Header strip ───────────────────────── */
export function PanchangHero({ p, hi, place }) {
  const t1 = p.tithi?.[0], n1 = p.nakshatra?.[0], lm = p.lunar_month || {}, s = p.samvat || {}
  const summary = [
    lm.purnimanta && `${lm.purnimanta} ${t('maas', hi)}`,
    p.paksha && `${p.paksha} ${t('paksha', hi)}`,
    t1?.name, p.vara?.name,
    n1?.name && `${n1.name} ${t('nakshatra', hi)}`,
  ].filter(Boolean).join(', ')

  const flags = []
  PERIOD_KEYS.forEach(([k, lk]) => { if (p.periods?.[k]) flags.push([t(lk, hi), 'warn']) })
  if (lm.adhik) flags.push([t('adhik', hi), 'warn'])
  if (lm.kshaya) flags.push([t('kshaya', hi), 'warn'])
  if (p.panchak) flags.push([p.panchak.type || t('panchak', hi), 'bad'])
  if (p.bhadra?.length) flags.push([t('bhadra', hi), 'bad'])
  if (p.manvadi_tithi) flags.push([t('manvadi', hi), 'good'])
  if (p.yugadi_tithi) flags.push([`${t('yugadi', hi)}: ${p.yugadi_tithi}`, 'good'])
  if (p.sankranti) flags.push([p.sankranti.name || t('sankrantiSection', hi), 'good'])

  const stat = (label, value, small) => (
    <div className="kd-stat" key={label}><b>{label}</b><span>{value}</span>{small && <small>{small}</small>}</div>
  )

  return (
    <section className="kd-hero pv-hero">
      <div className="kd-hero__eyebrow">{t('pageTitle', hi)} · {place?.display_name}</div>
      <h1 className="kd-hero__name">{fmtDate(p.date, hi, { weekday: 'long' })}</h1>
      <p className="kd-hero__line">
        <b>{p.vara?.name}</b>{p.vara?.sanskrit ? ` (${p.vara.sanskrit})` : ''} · {t('lord', hi)}: <b>{p.vara?.lord}</b>
      </p>
      <p className="kd-hero__meta">{summary}</p>
      <p className="kd-hero__meta">
        {t('vikramSamvat', hi)} <b>{s.vikram_samvat}</b> · {t('shakaSamvat', hi)} <b>{s.shaka_samvat}</b> · {s.samvatsara} {t('samvatsara', hi)}
      </p>
      {flags.length > 0 && (
        <div className="kd-chips pv-flags">
          {flags.map(([label, tone]) => <span key={label} className={`kd-chip kd-chip--${tone}`}>{label}</span>)}
        </div>
      )}
      <div className="kd-stats pv-stats">
        {stat(t('sunrise', hi), hhmm(p.sunrise))}
        {stat(t('sunset', hi), hhmm(p.sunset))}
        {stat(t('moonrise', hi), p.moonrise ? hhmm(p.moonrise) : '—', !p.moonrise && t('noMoonrise', hi))}
        {stat(t('moonset', hi), p.moonset ? hhmm(p.moonset) : '—', !p.moonset && t('noMoonset', hi))}
        {stat(t('dinamana', hi), gp(p.dinamana, hi), hoursLabel(p.day_length_hours))}
        {stat(t('ratrimana', hi), gp(p.ratrimana, hi), hoursLabel(p.night_length_hours))}
        {stat(t('madhyahna', hi), hhmm(p.madhyahna))}
        {stat(t('nextSunrise', hi), hhmm(p.next_sunrise), fmtDate(p.next_sunrise, hi, { month: 'short' }))}
      </div>
    </section>
  )
}

/* ───────────────────────── 2. Samvat ───────────────────────── */
export function SamvatSection({ p, hi }) {
  const s = p.samvat || {}, lm = p.lunar_month || {}, ay = p.ayana || {}
  return (
    <Sec id="sec-samvat" title={t('samvatSection', hi)}>
      <KV rows={[
        [t('vikramSamvat', hi), s.vikram_samvat, `${t('kartikadi', hi)} ${s.vikram_samvat_kartikadi}`],
        [t('shakaSamvat', hi), s.shaka_samvat],
        [t('samvatsara', hi), s.samvatsara],
        [t('samvatsaraNorth', hi), s.samvatsara_north],
        [t('kaliYear', hi), s.kali_yuga_year],
        [t('gol', hi), p.gol],
        [t('ayana', hi), ay.vedic, ay.drik && ay.drik !== ay.vedic ? `${t('drik', hi)}: ${ay.drik}` : null],
        [t('ritu', hi), p.ritu, p.ritu_drik && p.ritu_drik !== p.ritu ? `${t('drik', hi)}: ${p.ritu_drik}` : null],
        [t('amanta', hi), lm.amanta],
        [t('purnimanta', hi), lm.purnimanta],
        [t('paksha', hi), p.paksha],
        [t('monthStart', hi), fmtDateTime(lm.month_start, hi)],
        [t('monthEnd', hi), fmtDateTime(lm.month_end, hi)],
      ]} />
      <div className="kd-chips" style={{ marginTop: 14 }}>
        <span className={`kd-chip${lm.adhik ? ' kd-chip--warn' : ''}`}>{t('adhik', hi)}: {lm.adhik ? t('yes', hi) : t('no', hi)}</span>
        <span className={`kd-chip${lm.kshaya ? ' kd-chip--warn' : ''}`}>{t('kshaya', hi)}: {lm.kshaya ? t('yes', hi) : t('no', hi)}</span>
      </div>
    </Sec>
  )
}

/* ───────────────────────── 3. Tithi / nakshatra / yoga / karana ───────────────────────── */
function AngaItem({ it, hi, meta = [], badges = null, number }) {
  return (
    <div className="pv-anga">
      <div className="pv-anga__head">
        {number != null && <span className="pv-anga__n">{number}</span>}
        <b className="pv-anga__name">{it.name}</b>
        {badges}
        {it.ends_after_next_sunrise && <Badge tone="warn">{t('endsAfterSunrise', hi)}</Badge>}
      </div>
      {meta.filter(Boolean).length > 0 && (
        <div className="pv-anga__meta">{meta.filter(Boolean).map((m, i) => <span key={i}>{m}</span>)}</div>
      )}
      <div className="pv-anga__time">
        <span><i>{t('start', hi)}</i> {clockLabel(it.start_clock, hi)}</span>
        <span><i>{t('end', hi)}</i> {clockLabel(it.end_clock, hi)}</span>
        {it.end_ghati_pala && <span className="kd-hint">{gp(it.end_ghati_pala, hi)}</span>}
      </div>
    </div>
  )
}

export function AngaSection({ p, hi }) {
  const group = (titleKey, children) => (
    <div className="pv-group">
      <Eyebrow>{t(titleKey, hi)}</Eyebrow>
      <div className="pv-anga-list">{children}</div>
    </div>
  )
  return (
    <Sec id="sec-anga" title={t('panchangSection', hi)} sub={`${t('vara', hi)}: ${p.vara?.name}${p.vara?.sanskrit ? ` (${p.vara.sanskrit})` : ''}`}>
      <div className="pv-anga-grid">
        {group('tithi', (p.tithi || []).map((it, i) => (
          <AngaItem key={`${it.id}-${i}`} it={it} hi={hi} number={it.number_in_paksha}
            meta={[`${it.paksha} ${t('paksha', hi)}`, it.sanjna && `${t('sanjna', hi)}: ${it.sanjna}`, it.deity && `${t('deity', hi)}: ${it.deity}`]} />
        )))}
        {group('nakshatra', (p.nakshatra || []).map((it, i) => (
          <AngaItem key={`${it.id}-${i}`} it={it} hi={hi} number={it.number}
            badges={it.is_ganda_mula ? <Badge tone="bad">{t('gandaMula', hi)}</Badge> : null}
            meta={[
              it.lord && `${t('lord', hi)}: ${it.lord}`, it.deity && `${t('deity', hi)}: ${it.deity}`, it.sanjna && `${t('sanjna', hi)}: ${it.sanjna}`,
              it.stars != null && `${t('stars', hi)}: ${it.stars}`, it.shape && `${t('shape', hi)}: ${it.shape}`,
              it.gana && `${t('gana', hi)}: ${it.gana}`, it.yoni && `${t('yoni', hi)}: ${it.yoni}`, it.nadi && `${t('nadi', hi)}: ${it.nadi}`,
            ]} />
        )))}
        {group('yoga', (p.yoga || []).map((it, i) => (
          <AngaItem key={`${it.id}-${i}`} it={it} hi={hi} number={it.number} badges={<Shubh ok={it.auspicious} hi={hi} />} />
        )))}
        {group('karana', (p.karana || []).map((it, i) => (
          <AngaItem key={`${it.id}-${i}`} it={it} hi={hi} number={it.number}
            badges={it.is_bhadra ? <Badge tone="bad">{t('bhadraBadge', hi)}</Badge> : null}
            meta={[it.lord && `${t('lord', hi)}: ${it.lord}`]} />
        )))}
      </div>

      {p.nakshatra_pada?.length > 0 && (
        <div className="pv-group">
          <Eyebrow>{t('nakshatraPada', hi)}</Eyebrow>
          <div className="kd-tablewrap">
            <table className="kd-table pv-table">
              <thead><tr><th>{t('nakshatra', hi)}</th><th>{t('pada', hi)}</th><th>{t('syllable', hi)}</th><th>{t('navamsaSign', hi)}</th><th>{t('end', hi)}</th><th>{t('ghati', hi)}-{t('pala', hi)}</th></tr></thead>
              <tbody>
                {p.nakshatra_pada.map((x, i) => (
                  <tr key={i}>
                    <td className="kd-name">{x.nakshatra}</td><td>{x.pada}</td><td>{x.syllable}</td><td>{x.navamsa_sign}</td>
                    <td>{clockLabel(x.end_clock, hi)}</td><td>{gp(x.end_ghati_pala, hi)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Sec>
  )
}

/* ───────────────────────── 4. Anandadi + yogas of the day ───────────────────────── */
export function YogaSection({ p, hi }) {
  const base = p.date
  return (
    <Sec id="sec-yoga" title={t('yogasSection', hi)}>
      <div className="kd-two">
        <div>
          <Eyebrow>{t('anandadi', hi)}</Eyebrow>
          <div className="pv-anga-list">
            {(p.anandadi_yoga || []).map((y, i) => (
              <AngaItem key={`${y.id}-${i}`} it={y} hi={hi} badges={<Shubh ok={y.auspicious} hi={hi} />}
                meta={[y.result && `${t('result', hi)}: ${y.result}`, y.nakshatra && `${t('nakshatra', hi)}: ${y.nakshatra}`]} />
            ))}
            {(!p.anandadi_yoga || p.anandadi_yoga.length === 0) && <Empty>{t('dash', hi)}</Empty>}
          </div>
        </div>
        <div>
          <Eyebrow>{t('yogasOfDay', hi)}</Eyebrow>
          <div className="pv-wins">
            {(p.yogas_of_day || []).map((y, i) => (
              <WinTile key={`${y.id}-${i}`} label={y.name} w={y} hi={hi} base={base} tone={y.auspicious ? 'good' : 'bad'}
                badge={<Shubh ok={y.auspicious} hi={hi} />} sub={y.note || null} />
            ))}
            {(!p.yogas_of_day || p.yogas_of_day.length === 0) && <Empty>{t('noSpecialYoga', hi)}</Empty>}
          </div>
        </div>
      </div>
    </Sec>
  )
}

/* ───────────────────────── 5. Auspicious / inauspicious periods ───────────────────────── */
export function KaalSection({ p, hi, now }) {
  const base = p.date, d = p.dosha_muhurtas || {}
  const tile = (label, w, tone, sub, badge) => w && (
    <WinTile key={label + (w.start || '')} label={label} w={w} hi={hi} base={base} tone={tone} sub={sub} badge={badge} current={isCurrent(w, now)} />
  )
  const abhijit = p.abhijit_muhurta
  return (
    <Sec id="sec-kaal" title={t('kaalSection', hi)}>
      <div className="kd-two">
        <div>
          <Eyebrow>{t('shubhKaal', hi)}</Eyebrow>
          <div className="pv-wins">
            {abhijit && (abhijit.valid === false
              ? <div className="pv-win pv-win--mid"><div className="pv-win__head"><b>{t('abhijit', hi)}</b><Badge tone="no">{t('no', hi)}</Badge></div><small className="pv-win__sub">{t('abhijitVoid', hi)}</small></div>
              : tile(t('abhijit', hi), abhijit, 'good'))}
            {tile(t('vijaya', hi), p.vijaya_muhurta, 'good')}
            {tile(t('brahma', hi), p.brahma_muhurta, 'good')}
            {tile(t('pratah', hi), p.pratah_sandhya, 'good')}
            {tile(t('sayahna', hi), p.sayahna_sandhya, 'good')}
            {tile(t('godhuli', hi), p.godhuli_muhurta, 'good')}
            {tile(t('nishita', hi), p.nishita_muhurta, 'good')}
            {(p.amrit_kaal || []).map((w, i) => tile(`${t('amritKaal', hi)}${p.amrit_kaal.length > 1 ? ` ${i + 1}` : ''}`, w, 'good', w.nakshatra && `${t('nakshatra', hi)}: ${w.nakshatra}`))}
          </div>
        </div>
        <div>
          <Eyebrow>{t('ashubhKaal', hi)}</Eyebrow>
          <div className="pv-wins">
            {tile(t('rahuKaal', hi), p.rahu_kaal, 'bad')}
            {tile(t('gulikaKaal', hi), p.gulika_kaal, 'bad')}
            {tile(t('yamaganda', hi), p.yamaganda, 'bad')}
            {(p.dur_muhurta || []).map((w, i) => tile(`${t('durMuhurta', hi)} ${i + 1}`, w, 'bad', `${t('muhurtaNo', hi)} ${w.muhurta} · ${w.when === 'night' ? t('night', hi) : t('day', hi)}`))}
            {(p.varjyam || []).map((w, i) => tile(`${t('varjyam', hi)}${p.varjyam.length > 1 ? ` ${i + 1}` : ''}`, w, 'bad', w.nakshatra && `${t('nakshatra', hi)}: ${w.nakshatra}`))}
            {tile(t('kulika', hi), d.kulika, 'bad', d.kulika?.muhurta != null && `${t('muhurtaNo', hi)} ${d.kulika.muhurta}`)}
            {tile(t('kantaka', hi), d.kantaka, 'bad', d.kantaka?.muhurta != null && `${t('muhurtaNo', hi)} ${d.kantaka.muhurta}`)}
            {tile(t('kalavela', hi), d.kalavela, 'bad', d.kalavela?.muhurta != null && `${t('muhurtaNo', hi)} ${d.kalavela.muhurta}`)}
            {tile(t('yamaghanta', hi), d.yamaghanta, 'bad', d.yamaghanta?.muhurta != null && `${t('muhurtaNo', hi)} ${d.yamaghanta.muhurta}`)}
          </div>
        </div>
      </div>
    </Sec>
  )
}

/* ───────────────────────── 6. Bhadra / Panchak / Mool / periods ───────────────────────── */
export function BhadraSection({ p, hi }) {
  const base = p.date, mool = p.mool || {}
  const hasMool = (mool.ganda_mula?.length || 0) + (mool.abhukta_mula?.length || 0) > 0
  const residenceName = (b) => (typeof b.residence === 'object' && b.residence ? b.residence.name : b.residence)
  const harmful = (b) => (typeof b.harmful === 'boolean' ? b.harmful : b.residence?.harmful)
  return (
    <Sec id="sec-bhadra" title={t('bhadraSection', hi)}>
      <div className="kd-two">
        <div className="pv-group">
          <Eyebrow>{t('bhadra', hi)}</Eyebrow>
          {(p.bhadra || []).length === 0 && <Empty>{t('noBhadra', hi)}</Empty>}
          {(p.bhadra || []).map((b, i) => (
            <div key={i} className="kd-dosha is-present pv-bhadra">
              <div className="kd-dosha__title">
                <span>{b.kind || t('bhadra', hi)}</span>
                <Badge tone={harmful(b) ? 'bad' : 'yes'}>{harmful(b) ? t('harmful', hi) : t('notHarmful', hi)}</Badge>
              </div>
              <KV rows={[
                [t('tithi', hi), b.tithi],
                [t('bhadraVasa', hi), residenceName(b)],
                [t('fullSpan', hi), b.full_start ? `${fmtDateTime(b.full_start, hi)} – ${fmtDateTime(b.full_end, hi)}` : null],
                [t('todayWindow', hi), rangeLabel(b, hi, base)],
                b.mukha && [t('mukha', hi), rangeLabel(b.mukha, hi, base)],
                b.puccha && [t('puccha', hi), rangeLabel(b.puccha, hi, base)],
              ]} />
              {b.note && <p className="kd-hint" style={{ marginTop: 8 }}>{b.note}</p>}
            </div>
          ))}
        </div>
        <div className="pv-stack">
          <div className="pv-group">
            <Eyebrow>{t('panchak', hi)}</Eyebrow>
            {!p.panchak && <Empty>{t('noPanchak', hi)}</Empty>}
            {p.panchak && (
              <div className="pv-wins">
                <WinTile label={p.panchak.type || t('panchak', hi)} w={p.panchak} hi={hi} base={base} tone={p.panchak.harmful ? 'bad' : 'mid'}
                  badge={p.panchak.harmful ? <Badge tone="bad">{t('harmful', hi)}</Badge> : null}
                  sub={p.panchak.ends_after_this_day ? t('endsAfterDay', hi) : null} />
              </div>
            )}
          </div>
          <div className="pv-group">
            <Eyebrow>{t('mool', hi)}</Eyebrow>
            {!hasMool && <Empty>{t('noMool', hi)}</Empty>}
            {hasMool && (
              <div className="pv-wins">
                {(mool.ganda_mula || []).map((w, i) => <WinTile key={`g${i}`} label={`${t('gandaMulaWindows', hi)}: ${w.nakshatra}`} w={w} hi={hi} base={base} tone="bad" />)}
                {(mool.abhukta_mula || []).map((w, i) => <WinTile key={`a${i}`} label={t('abhukta', hi)} w={w} hi={hi} base={base} tone="bad" sub={w.part} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pv-group">
        <Eyebrow>{t('periods', hi)}</Eyebrow>
        <div className="kd-chips">
          {PERIOD_KEYS.map(([k, lk]) => (
            <span key={k} className={`kd-chip${p.periods?.[k] ? ' kd-chip--warn' : ' pv-chip--off'}`}>
              {t(lk, hi)}: {p.periods?.[k] ? t('active', hi) : t('no', hi)}
            </span>
          ))}
          <span className={`kd-chip${p.manvadi_tithi ? ' kd-chip--good' : ' pv-chip--off'}`}>{t('manvadi', hi)}: {p.manvadi_tithi ? t('yes', hi) : t('no', hi)}</span>
          <span className={`kd-chip${p.yugadi_tithi ? ' kd-chip--good' : ' pv-chip--off'}`}>{t('yugadi', hi)}: {p.yugadi_tithi || t('no', hi)}</span>
        </div>
      </div>
    </Sec>
  )
}

/* ───────────────────────── 7. Lagna + signs ───────────────────────── */
export function LagnaSection({ p, hi }) {
  const base = p.date
  return (
    <Sec id="sec-lagna" title={t('lagnaSection', hi)} count={p.lagna?.length}>
      <div className="kd-stats" style={{ marginTop: 0, marginBottom: 20 }}>
        <div className="kd-stat kd-stat--accent"><b>{t('moonSign', hi)}</b><span>{p.moon_sign}</span>
          <small>{t('until', hi)} {clockLabel(p.moon_sign_until_clock || isoClock(p.moon_sign_until, base), hi)} · {t('moonNext', hi)} {p.moon_next_sign}</small></div>
        <div className="kd-stat"><b>{t('sunSign', hi)}</b><span>{p.sun_sign}</span></div>
        <div className="kd-stat"><b>{t('sunNakshatra', hi)}</b><span>{p.sun_nakshatra}</span></div>
      </div>
      <Eyebrow>{t('lagnaTable', hi)}</Eyebrow>
      <div className="kd-tablewrap">
        <table className="kd-table pv-table">
          <thead><tr><th>{t('number', hi)}</th><th>{t('lagna', hi)}</th><th>{t('start', hi)}</th><th>{t('end', hi)}</th><th>{t('ghati', hi)}-{t('pala', hi)}</th></tr></thead>
          <tbody>
            {(p.lagna || []).map((l, i) => (
              <tr key={i}>
                <td>{l.number}</td><td className="kd-name">{l.sign}</td>
                <td>{clockLabel(isoClock(l.start, base), hi)}</td><td>{clockLabel(l.end_clock, hi)}</td><td>{gp(l.end_ghati_pala, hi)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Sec>
  )
}

/* ───────────────────────── 8. Vasa / directions ───────────────────────── */
export function VasaSection({ p, hi }) {
  const tile = (label, head, result, badge) => (
    <div className="pv-vasa">
      <b className="pv-vasa__label">{label}</b>
      <div className="pv-vasa__head"><span className="pv-vasa__value">{head}</span>{badge}</div>
      {result && <p className="pv-vasa__result">{result}</p>}
    </div>
  )
  return (
    <Sec id="sec-vasa" title={t('vasaSection', hi)}>
      <div className="pv-vasa-grid">
        {tile(t('dishaShool', hi), p.disha_shool, t('dishaShoolNote', hi))}
        {p.yogini_vasa && tile(t('yoginiVasa', hi), p.yogini_vasa.direction, p.yogini_vasa.result)}
        {p.chandra_vasa && tile(t('chandraVasa', hi), p.chandra_vasa.direction, p.chandra_vasa.result)}
        {p.agnivasa && tile(t('agnivasa', hi), p.agnivasa.residence, p.agnivasa.result, <Shubh ok={p.agnivasa.auspicious} hi={hi} />)}
        {p.shivavasa && tile(t('shivavasa', hi), p.shivavasa.residence, p.shivavasa.result, <Shubh ok={p.shivavasa.auspicious} hi={hi} />)}
      </div>
    </Sec>
  )
}

/* ───────────────────────── 9. Guru / Shukra ───────────────────────── */
export function GuruShukraSection({ p, hi }) {
  const tone = (state) => (state === 'udita' ? 'yes' : state === 'asta' ? 'bad' : 'warn')
  const card = (g) => g && (
    <div key={g.planet} className={`kd-yoga is-present${g.state === 'asta' ? ' is-bad' : ''}`}>
      <div className="kd-yoga__head"><span className="kd-yoga__name">{g.planet}</span><Badge tone={tone(g.state)}>{g.state_label}</Badge></div>
      <KV rows={[
        [t('udaya', hi), fmtDateTime(g.udaya, hi)],
        [t('astaStart', hi), fmtDateTime(g.asta_start, hi)],
        [t('astaEnd', hi), g.asta_end ? fmtDateTime(g.asta_end, hi) : '—'],
        [t('nextAsta', hi), fmtDateTime(g.next_asta, hi)],
      ]} />
    </div>
  )
  return (
    <Sec id="sec-guru" title={t('guruShukraSection', hi)}>
      <div className="kd-yogas">{card(p.guru)}{card(p.shukra)}</div>
    </Sec>
  )
}

/* ───────────────────────── 10. Sankranti ───────────────────────── */
export function SankrantiSection({ p, hi }) {
  const s = p.sankranti, ns = p.next_sankranti, base = p.date
  return (
    <Sec id="sec-sankranti" title={t('sankrantiSection', hi)} open={Boolean(s)}>
      {!s && <Empty>{t('noSankranti', hi)}</Empty>}
      {s && (
        <KV rows={[
          [t('sankrantiSection', hi), s.name || s.sign],
          [t('sign', hi), s.sign],
          [t('time', hi), `${fmtDateTime(s.time, hi)}${s.at_night ? ` (${t('atNight', hi)})` : ''}`],
          [t('vara', hi), s.weekday],
          [t('nakshatra', hi), s.nakshatra, s.nakshatra_sanjna && `${t('sanjna', hi)}: ${s.nakshatra_sanjna}`],
          [t('purusha', hi), s.purusha, s.purusha_result],
          [t('punyaKaal', hi), s.punya_kaal ? rangeLabel(s.punya_kaal, hi, base) : '—', s.punya_kaal?.day],
          [t('mahaPunyaKaal', hi), s.maha_punya_kaal ? rangeLabel(s.maha_punya_kaal, hi, base) : '—'],
        ]} />
      )}
      {ns && (
        <div className="kd-stats" style={{ marginTop: 16 }}>
          <div className="kd-stat kd-stat--accent"><b>{t('nextSankranti', hi)}</b><span>{ns.sign}</span><small>{fmtDateTime(ns.time, hi)}</small></div>
        </div>
      )}
    </Sec>
  )
}

/* ───────────────────────── 11. Shalaka vedha + Andhadi ───────────────────────── */
export function VedhaSection({ p, hi, open = false }) {
  const base = p.date
  const chakraLabel = (c) => (c === 'saptashalaka' ? t('saptashalaka', hi) : c === 'panchashalaka' ? t('panchashalaka', hi) : c)
  return (
    <Sec id="sec-vedha" title={t('vedhaSection', hi)} open={open}>
      <Eyebrow>{t('shalaka', hi)}</Eyebrow>
      <div className="kd-tablewrap">
        <table className="kd-table pv-table">
          <thead><tr><th>{t('chakra', hi)}</th><th>{t('moonNakshatra', hi)}</th><th>{t('time', hi)}</th><th>{t('vedhaNak', hi)}</th><th>{t('planets', hi)}</th><th>{t('hasVedha', hi)}</th></tr></thead>
          <tbody>
            {(p.shalaka_vedha || []).map((v, i) => (
              <tr key={i}>
                <td className="kd-name">{chakraLabel(v.chakra)}</td>
                <td>{v.nakshatra}</td>
                <td>{rangeLabel(v, hi, base)}</td>
                <td className="pv-wrap">{(v.vedha_nakshatras || []).join(', ')}</td>
                <td className="pv-wrap">{v.planets?.length ? v.planets.map((pl) => `${pl.planet} (${pl.in_nakshatra})`).join(', ') : '—'}</td>
                <td><Badge tone={v.has_vedha ? 'bad' : 'yes'}>{v.has_vedha ? t('hasVedha', hi) : t('noVedha', hi)}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Eyebrow style={{ marginTop: 20 }}>{t('andhadi', hi)}</Eyebrow>
      <div className="pv-anga-list">
        {(p.andhadi_nakshatra || []).map((a, i) => (
          <AngaItem key={i} it={a} hi={hi} meta={[a.result]} badges={<Badge tone="warn">{a.type}</Badge>} />
        ))}
      </div>
    </Sec>
  )
}

/* ───────────────────────── 12. Choghadiya / Hora / Muhurtas / Balam / Planets ───────────────────────── */
export function ChoghadiyaSection({ p, hi, now, id = 'sec-chog', open = true }) {
  const base = p.date
  const col = (titleKey, list) => (
    <div>
      <Eyebrow>{t(titleKey, hi)}</Eyebrow>
      <div className="pv-chog-list">
        {(list || []).map((c, i) => {
          const cur = isCurrent(c, now)
          return (
            <div key={i} className={`pv-chog pv-chog--${qualityTone(c.quality)}${cur ? ' is-now' : ''}`}>
              <b>{c.name}</b>
              <span className="pv-chog__planet">{c.planet_name || c.planet}</span>
              <span className="pv-chog__time">{rangeLabel(c, hi, base)}</span>
              <span className="pv-chog__q">{c.quality === 'good' ? t('auspicious', hi) : c.quality === 'bad' ? t('inauspicious', hi) : t('neutral', hi)}{cur ? ` · ${t('now', hi)}` : ''}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
  return (
    <Sec id={id} title={t('choghadiya', hi)} open={open}>
      <div className="kd-two">{col('day', p.choghadiya?.day)}{col('night', p.choghadiya?.night)}</div>
    </Sec>
  )
}

export function HoraSection({ p, hi, now }) {
  const base = p.date
  return (
    <Sec id="sec-hora" title={t('hora', hi)} count={p.hora?.length} open={false}>
      <div className="kd-tablewrap">
        <table className="kd-table pv-table pv-table--tight">
          <thead><tr><th>{t('number', hi)}</th><th>{t('planet', hi)}</th><th>{t('day', hi)}/{t('night', hi)}</th><th>{t('time', hi)}</th><th>{t('ghati', hi)}-{t('pala', hi)}</th></tr></thead>
          <tbody>
            {(p.hora || []).map((h, i) => (
              <tr key={i} className={isCurrent(h, now) ? 'is-asc' : ''}>
                <td>{h.number}</td><td className="kd-name">{h.planet}</td><td>{h.when === 'night' ? t('night', hi) : t('day', hi)}</td>
                <td>{rangeLabel(h, hi, base)}</td><td>{gp(h.end_ghati_pala, hi)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Sec>
  )
}

export function MuhurtaSection({ p, hi, now }) {
  const base = p.date
  return (
    <Sec id="sec-muhurta" title={t('muhurtas', hi)} count={p.muhurtas?.length} open={false}>
      <div className="kd-tablewrap">
        <table className="kd-table pv-table pv-table--tight">
          <thead><tr><th>{t('number', hi)}</th><th>{t('name', hi)}</th><th>{t('quality', hi)}</th><th>{t('day', hi)}/{t('night', hi)}</th><th>{t('time', hi)}</th></tr></thead>
          <tbody>
            {(p.muhurtas || []).map((m, i) => (
              <tr key={i} className={isCurrent(m, now) ? 'is-asc' : ''}>
                <td>{m.number}</td><td className="kd-name">{m.name}</td>
                <td className={m.auspicious ? 'c-good' : 'c-bad'}>{m.auspicious ? t('auspicious', hi) : t('inauspicious', hi)}</td>
                <td>{m.when === 'night' ? t('night', hi) : t('day', hi)}</td><td>{rangeLabel(m, hi, base)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Sec>
  )
}

export function BalamSection({ p, hi }) {
  return (
    <Sec id="sec-balam" title={`${t('chandrabalam', hi)} / ${t('tarabalam', hi)}`} sub={t('balamNote', hi)}>
      <Eyebrow>{t('chandrabalam', hi)}</Eyebrow>
      <Chips items={p.chandrabalam || []} tone="good" />
      <Eyebrow style={{ marginTop: 16 }}>{t('tarabalam', hi)}</Eyebrow>
      <Chips items={p.tarabalam || []} tone="good" />
    </Sec>
  )
}

export function PlanetsSection({ p, hi, open = false }) {
  return (
    <Sec id="sec-planets" title={t('planetsAtSunrise', hi)} sub={`${t('sunrise', hi)} ${hhmm(p.sunrise)} · ${t('ayanamsa', hi)}: ${p.ayanamsa}`} open={open}>
      <div className="kd-tablewrap">
        <table className="kd-table pv-table pv-table--tight">
          <thead><tr><th>{t('planet', hi)}</th><th>{t('sign', hi)}</th><th>{t('degrees', hi)}</th><th>{t('nakshatra', hi)}</th><th>{t('state', hi)}</th></tr></thead>
          <tbody>
            {(p.planets_at_sunrise || []).map((pl) => (
              <tr key={pl.id}>
                <td className="kd-name">{pl.planet}</td><td>{pl.sign}</td><td className="kd-deg">{Number(pl.degrees_in_sign).toFixed(2)}°</td><td>{pl.nakshatra}</td>
                <td>{pl.is_retrograde ? <Badge tone="bad">{t('retro', hi)}</Badge> : <span className="kd-hint">{t('direct', hi)}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Sec>
  )
}
