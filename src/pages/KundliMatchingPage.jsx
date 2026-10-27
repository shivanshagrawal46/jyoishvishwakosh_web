import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { IconChart, IconCheck, IconEdit, IconLink, IconPrint, IconSparkle, IconWarn, Mandala } from '../components/ui/Icons'
import { Card, KV, Skeleton, ToolError, ToolShell } from '../components/tools/ToolShell'
import { Avatar, SplitHero } from '../components/tools/jt'
import BirthForm, { EMPTY_BIRTH } from '../components/tools/BirthForm'
import ScoreRing, { toneFor } from '../components/tools/ScoreRing'
import useStoredState from '../components/tools/useStoredState'
import { planetName, t } from '../components/tools/toolLabels'
import { fmtDate, fmtTime, num, numParam } from '../components/tools/format'
import { fetchMatching } from '../services/kundliApi'
import '../styles/kundli.css'
import '../styles/kundli-tools.css'
import '../styles/jyotish-tools.css'

export const FORM_KEY = 'jv-matching-form'
const EMPTY = { boy: { ...EMPTY_BIRTH }, girl: { ...EMPTY_BIRTH } }
const BADGE = { good: 'yes', warn: 'warn', bad: 'bad' }

/* ───────────────────────── URL <-> form ───────────────────────── */
const encodeSide = (p, side, b) => {
  if (b.name?.trim()) p.set(`${side}_name`, b.name.trim())
  p.set(`${side}_date`, b.date)
  p.set(`${side}_time`, b.time.length === 5 ? `${b.time}:00` : b.time)
  p.set(`${side}_place`, b.placeMeta?.display_name || b.place.trim())
  if (b.placeMeta && Number.isFinite(Number(b.placeMeta.latitude))) {
    p.set(`${side}_lat`, String(b.placeMeta.latitude))
    p.set(`${side}_lon`, String(b.placeMeta.longitude))
    if (b.placeMeta.timezone) p.set(`${side}_tz`, b.placeMeta.timezone)
  }
}

/** Query string for /kundli-matching/result — the result is bookmarkable. */
export function matchingSearch(form) {
  const p = new URLSearchParams()
  encodeSide(p, 'boy', form.boy)
  encodeSide(p, 'girl', form.girl)
  return p.toString()
}

const decodeSide = (params, side) => {
  const date = params.get(`${side}_date`), time = params.get(`${side}_time`), place = params.get(`${side}_place`)
  if (!date || !time || !place) return null
  return {
    name: params.get(`${side}_name`) || '', date, time, place,
    lat: numParam(params, `${side}_lat`), lon: numParam(params, `${side}_lon`), tz: params.get(`${side}_tz`) || undefined,
  }
}
const hasCoords = (s) => s.lat != null && s.lon != null
const toPayload = (s, gender) => ({
  name: s.name || undefined, gender, date: s.date, time: s.time, place: s.place,
  ...(hasCoords(s) ? { latitude: s.lat, longitude: s.lon, ...(s.tz ? { timezone: s.tz } : {}) } : {}),
})
const toForm = (s) => ({
  name: s.name, date: s.date, time: s.time.slice(0, 5), place: s.place,
  placeMeta: hasCoords(s) ? { display_name: s.place, latitude: s.lat, longitude: s.lon, timezone: s.tz } : null,
})

/* ───────────────────────────── Form ───────────────────────────── */
function MatchingForm({ hi, language, onLanguage }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useStoredState(FORM_KEY, EMPTY)
  const [error, setError] = useState('')

  // Arriving from a result link ("edit details") seeds the form from the URL.
  useEffect(() => {
    const b = decodeSide(params, 'boy'), g = decodeSide(params, 'girl')
    if (b && g) setForm({ boy: toForm(b), girl: toForm(g) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = (e) => {
    e.preventDefault()
    for (const side of ['boy', 'girl']) {
      const s = form[side] || EMPTY_BIRTH
      if (!s.date || !s.time) { setError(`${t(side, hi)}: ${t('needDate', hi)}`); return }
      if (!s.place?.trim()) { setError(`${t(side, hi)}: ${t('needPlace', hi)}`); return }
    }
    setError('')
    navigate(`/kundli-matching/result?${matchingSearch(form)}`)
  }

  return (
    <ToolShell language={language} onLanguage={onLanguage} active="matching" wide>
      <SplitHero wide
        eyebrow={t('mBadge', hi)} title={t('mTitle', hi)} subtitle={t('mSubtitle', hi)}
        points={[
          [IconChart, t('mvp1', hi), t('mvp1s', hi)],
          [IconWarn, t('mvp2', hi), t('mvp2s', hi)],
          [IconSparkle, t('mvp3', hi), t('mvp3s', hi)],
          [IconCheck, t('mvp4', hi), t('mvp4s', hi)],
        ]}
      >
        <div className="jt-card">
          <form onSubmit={submit} className="kd-form" noValidate>
            <div className="kt-pair">
              <BirthForm id="boy" tone="boy" title={t('boyDetails', hi)} icon={<Avatar name={form.boy?.name} side="boy" />} hi={hi}
                value={form.boy || EMPTY_BIRTH} onChange={(v) => setForm((f) => ({ ...f, boy: v }))} />
              <BirthForm id="girl" tone="girl" title={t('girlDetails', hi)} icon={<Avatar name={form.girl?.name} side="girl" />} hi={hi}
                value={form.girl || EMPTY_BIRTH} onChange={(v) => setForm((f) => ({ ...f, girl: v }))} />
            </div>
            {error && <div className="calc-error-message" role="alert">{error}</div>}
            <button type="submit" className="calc-form-submit">{t('mSubmit', hi)}</button>
          </form>
        </div>
      </SplitHero>
    </ToolShell>
  )
}

/* ──────────────────────────── Result ──────────────────────────── */
const Native = ({ n, side, bd, hi }) => (
  <Card className={`kt-native kt-native--${side}`} title={<span className="kt-native__title"><Avatar name={bd?.name} side={side} />{bd?.name || t(side, hi)}</span>}
    right={<span className="kd-hint">{fmtDate(bd?.date, hi)} · {fmtTime(bd?.time)}</span>} sub={bd?.place}>
    <KV rows={[
      [t('moonSign', hi), n.moon_sign ? `${n.moon_sign}${n.moon_sign_lord ? ` · ${n.moon_sign_lord}` : ''}` : null],
      [t('nakshatra', hi), n.nakshatra ? `${n.nakshatra}${n.pada ? ` (${t('pada', hi)} ${n.pada})` : ''}` : null],
      [t('lagna', hi), n.lagna], [t('varna', hi), n.varna], [t('vashya', hi), n.vashya],
      [t('yoni', hi), n.yoni], [t('gana', hi), n.gana], [t('nadi', hi), n.nadi],
    ]} />
  </Card>
)

const Koota = ({ k, hi }) => {
  const pts = Number(k.points) || 0, mx = Number(k.max) || 0, ratio = mx ? pts / mx : 0
  const live = k.dosha && !k.dosha_cancelled
  const cancels = Array.isArray(k.cancellation) ? k.cancellation : []
  return (
    <article className={`kt-koota kt-koota--${toneFor(ratio)}${live ? ' is-dosha' : ''}`}>
      <header className="kt-koota__head">
        <h3>{k.koota_label ?? k.koota}</h3>
        <span className="kt-koota__pts"><b>{num(pts, 1)}</b> / {mx}</span>
      </header>
      <div className="kt-bar" aria-hidden="true"><span style={{ width: `${Math.round(ratio * 100)}%` }} /></div>
      <div className="kt-vs">
        <div className="kt-vs__side kt-vs__side--boy"><small>{t('boy', hi)}</small><span>{k.boy ?? '-'}</span></div>
        <div className="kt-vs__side kt-vs__side--girl"><small>{t('girl', hi)}</small><span>{k.girl ?? '-'}</span></div>
      </div>
      {(k.relation || k.dosha != null) && (
        <div className="kt-koota__tags">
          {k.relation && <span className="kd-badge kd-badge--no">{t('relation', hi)} {k.relation}</span>}
          {k.dosha != null && (k.dosha
            ? <span className={`kd-badge kd-badge--${k.dosha_cancelled ? 'warn' : 'bad'}`}>{k.dosha_cancelled ? t('doshaCancelled', hi) : t('doshaPresent', hi)}</span>
            : <span className="kd-badge kd-badge--yes">{t('doshaNone', hi)}</span>)}
        </div>
      )}
      {cancels.length > 0 && <ul className="kt-list kt-list--ok">{cancels.map((c, i) => <li key={i}>{c}</li>)}</ul>}
      {k.description && <p className="kt-koota__desc">{k.description}</p>}
    </article>
  )
}

const ManglikSide = ({ m, side, hi, name }) => {
  if (!m) return null
  const from = m.from && typeof m.from === 'object' ? Object.entries(m.from) : []
  const cancels = Array.isArray(m.cancellations) ? m.cancellations : []
  return (
    <div className={`kd-dosha kt-mside${m.present ? ' is-present' : ''}`}>
      <div className="kd-dosha__title">
        <span className="kt-native__title"><Avatar name={name} side={side} />{name || t(side, hi)}</span>
        <span className={`kd-badge kd-badge--${m.present ? 'bad' : 'yes'}`}>{m.present ? t('manglikYes', hi) : t('manglikNo', hi)}</span>
      </div>
      <KV rows={[
        [t('manglikLevel', hi), m.level_label ?? m.level],
        from.length ? [t('manglikFrom', hi), from.map(([p, h]) => `${planetName(p, hi)} ${h}`).join(' · ')] : null,
      ]} />
      {cancels.length > 0 && (<>
        <div className="kd-eyebrow" style={{ marginTop: 8 }}>{t('cancellations', hi)}</div>
        <ul className="kt-list kt-list--ok">{cancels.map((c, i) => <li key={i}>{c}</li>)}</ul>
      </>)}
    </div>
  )
}

function MatchingResult({ hi, language, onLanguage }) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const sides = useMemo(() => {
    const boy = decodeSide(params, 'boy'), girl = decodeSide(params, 'girl')
    return boy && girl ? { boy, girl } : null
  }, [params])

  useEffect(() => {
    if (!sides) { setLoading(false); setError(t('missingParams', hi)); return }
    const ctrl = new AbortController()
    setLoading(true); setError('')
    fetchMatching(toPayload(sides.boy, 'male'), toPayload(sides.girl, 'female'), hi ? 'hi' : 'en', { signal: ctrl.signal })
      .then((data) => setResult(data))
      .catch((err) => { if (err.name !== 'AbortError') { setResult(null); setError(err.status ? err.message : t('offline', hi)) } })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false) })
    return () => ctrl.abort()
  }, [sides, hi, attempt])

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch {}
  }
  const editHref = `/kundli-matching?${params.toString()}`

  const boy = result?.boy || {}, girl = result?.girl || {}
  const bb = boy.birth_details || {}, gb = girl.birth_details || {}
  const total = Number(result?.total_points) || 0
  const max = Number(result?.max_points) || 36
  const tone = toneFor(total / max)
  const verdict = result?.verdict_label ?? result?.verdict
  const overall = result?.overall_label ?? result?.overall
  const kootas = Array.isArray(result?.kootas) ? result.kootas : []
  const doshaKootas = kootas.filter((k) => k.dosha != null)
  const manglik = result?.manglik
  const notes = Array.isArray(result?.notes) ? result.notes : []
  const boyName = bb.name || sides?.boy?.name || t('boy', hi)
  const girlName = gb.name || sides?.girl?.name || t('girl', hi)

  return (
    <ToolShell language={language} onLanguage={onLanguage} active="matching" wide className="kt-report">
      {loading && <Skeleton hero rows={3} height={180} text={t('mWorking', hi)} />}

      {!loading && error && (
        <ToolError message={error} onRetry={sides ? () => setAttempt((a) => a + 1) : undefined} retryLabel={t('retry', hi)}>
          <Link to={sides ? editHref : '/kundli-matching'} className="kd-btn-ghost"><IconEdit s={15} /> {t('edit', hi)}</Link>
        </ToolError>
      )}

      {!loading && result && (
        <div className="kd-results">
          <section className="kd-hero kd-hero--v2 kt-mhero">
            <Mandala className="kd-hero__mandala" aria-hidden="true" />
            <div className="kd-hero__text">
              <div className="kd-hero__eyebrow">{t('mReport', hi)}</div>
              <h1 className="kd-hero__name">{boyName} <span className="kt-amp">&amp;</span> {girlName}</h1>
              <p className="kd-hero__line"><b>{t('boy', hi)}</b> · {fmtDate(bb.date, hi)}, {fmtTime(bb.time)}{bb.place ? ` · ${bb.place}` : ''}</p>
              <p className="kd-hero__line"><b>{t('girl', hi)}</b> · {fmtDate(gb.date, hi)}, {fmtTime(gb.time)}{gb.place ? ` · ${gb.place}` : ''}</p>
              <div className="kt-verdicts">
                {verdict && <span className={`kd-badge kd-badge--${BADGE[tone]} kt-verdict`}>{verdict}</span>}
                {overall && overall !== verdict && <span className="kd-badge kd-badge--no kt-verdict">{t('overall', hi)}: {overall}</span>}
              </div>
              <div className="kd-hero__actions">
                <button type="button" className="kd-btn-ghost" onClick={() => navigate(editHref)}><IconEdit s={15} /> {t('edit', hi)}</button>
                <button type="button" className="kd-btn-ghost" onClick={() => window.print()}><IconPrint s={15} /> {t('print', hi)}</button>
                <button type="button" className="kd-btn-ghost" onClick={copyLink}><IconLink s={15} /> {copied ? t('copied', hi) : t('share', hi)}</button>
              </div>
            </div>
            <div className="kt-mhero__score">
              <ScoreRing value={total} max={max} size={172} stroke={14} tone={tone} label={num(total, 1)} sub={`/ ${max} ${t('points', hi)}`} />
              <div className="kt-mhero__facts">
                <div><b>{t('effective', hi)}</b><span>{num(result.effective_points_after_cancellations, 1)} / {max}</span></div>
                <div><b>{t('percentage', hi)}</b><span>{num(result.percentage, 1)}%</span></div>
              </div>
            </div>
          </section>

          <div className="kd-eyebrow">{t('natives', hi)}</div>
          <div className="kd-two kt-natives">
            <Native n={boy} bd={bb} side="boy" hi={hi} />
            <Native n={girl} bd={gb} side="girl" hi={hi} />
          </div>

          <Card title={t('kootas', hi)} sub={t('kootasSub', hi)}
            right={<span className="kd-hint"><strong>{num(total, 1)}</strong> / {max}</span>}>
            <div className="kt-kootas">{kootas.map((k) => <Koota key={k.koota ?? k.koota_label} k={k} hi={hi} />)}</div>
          </Card>

          {doshaKootas.length > 0 && (
            <Card title={t('doshas', hi)} sub={t('doshasSub', hi)}
              right={<span className="kd-hint">{t('effective', hi)}: <strong>{num(result.effective_points_after_cancellations, 1)}</strong> / {max}</span>}>
              <div className="kt-doshas">
                {doshaKootas.map((k) => {
                  const live = k.dosha && !k.dosha_cancelled
                  const cancels = Array.isArray(k.cancellation) ? k.cancellation : []
                  return (
                    <div key={k.koota ?? k.koota_label} className={`kd-dosha${live ? ' is-present' : ''}`}>
                      <div className="kd-dosha__title">
                        <span>{k.koota_label ?? k.koota}</span>
                        {k.dosha
                          ? <span className={`kd-badge kd-badge--${k.dosha_cancelled ? 'warn' : 'bad'}`}>{k.dosha_cancelled ? t('doshaCancelled', hi) : t('doshaPresent', hi)}</span>
                          : <span className="kd-badge kd-badge--yes">{t('doshaNone', hi)}</span>}
                      </div>
                      <KV rows={[
                        [t('boy', hi), k.boy], [t('girl', hi), k.girl],
                        k.relation ? [t('relation', hi), k.relation] : null,
                        [t('points', hi), `${num(k.points, 1)} / ${k.max ?? '-'}`],
                      ]} />
                      <div className="kd-eyebrow" style={{ marginTop: 8 }}>{t('cancellations', hi)}</div>
                      {cancels.length > 0
                        ? <ul className="kt-list kt-list--ok">{cancels.map((c, i) => <li key={i}>{c}</li>)}</ul>
                        : <p className="kd-hint">{k.dosha ? t('noCancellation', hi) : t('doshaNone', hi)}</p>}
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {manglik && (
            <Card title={t('manglik', hi)}
              right={manglik.compatible != null && <span className={`kd-badge kd-badge--${manglik.compatible ? 'yes' : 'bad'}`}>{manglik.compatible ? t('compatible', hi) : t('notCompatible', hi)}</span>}>
              <div className="kt-manglik">
                <ManglikSide m={manglik.boy} side="boy" hi={hi} name={bb.name} />
                <ManglikSide m={manglik.girl} side="girl" hi={hi} name={gb.name} />
              </div>
              {(manglik.verdict_label ?? manglik.verdict) && (
                <p className="kt-manglik__verdict">{manglik.verdict_label ?? manglik.verdict}</p>
              )}
            </Card>
          )}

          {notes.length > 0 && (
            <Card title={t('notes', hi)}>
              <ul className="kt-list kt-list--notes">{notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
            </Card>
          )}

          <p className="kd-foot">{t('mFoot', hi)} · {t('footnote', hi)}</p>
        </div>
      )}
    </ToolShell>
  )
}

/* ───────────────────────────── Page ───────────────────────────── */
const KundliMatchingPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const { pathname } = useLocation()
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  const hi = language === 'hindi'
  const onLanguage = (lang) => { setLanguage(lang); if (setLanguageProp) setLanguageProp(lang) }
  const props = { hi, language, onLanguage }
  return /\/result\/?$/.test(pathname) ? <MatchingResult {...props} /> : <MatchingForm {...props} />
}

export default KundliMatchingPage
