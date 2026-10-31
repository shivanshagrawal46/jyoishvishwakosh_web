import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import AppDownloadBanner from '../components/AppDownloadBanner'
import { fetchPanchangFull } from '../services/kundliApi'
import { usePlaceDate } from '../components/panchang/DayPlaceControls'
import { ErrorBox } from '../components/panchang/Shared'
import { DayBar, WeekStrip } from '../components/panchang/Day'
import {
  AshubhCard, BhadraDetailCard, ChoghadiyaCard, DayHead, GuruShukraCard, HiCtx, HoraCard, Jump, LagnaCard, MuhurtaCard,
  PadaCard, PanchangCard, PlanetsCard, RashiCard, SamvatCard, SankrantiCard, ShubhCard, SunMoonCard, VasaCard, VedhaCard, YogaCard,
} from '../components/panchang/Sheet'
import { Skeleton } from '../components/tools/jt'
import { t } from '../components/panchang/labels'
import { nowIsoIn } from '../components/panchang/format'
import '../styles/kundli.css'
import '../styles/jyotish-tools.css'
import '../styles/panchang-sheet.css'

/** Wall clock at the chosen place, refreshed every minute so "now" marks move. */
function useNowAt(tz) {
  const [now, setNow] = useState(() => nowIsoIn(tz))
  useEffect(() => {
    setNow(nowIsoIn(tz))
    const id = setInterval(() => setNow(nowIsoIn(tz)), 60000)
    return () => clearInterval(id)
  }, [tz])
  return now
}

/**
 * Daily panchang as a plain calendar sheet: day header, then titled cards of
 * label / value rows (panchang, sun & moon, auspicious / inauspicious timings,
 * samvat, rashi, yogas, vasa, choghadiya) and collapsed detail cards below.
 */
const PanchangPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  const hi = language === 'hindi'
  const { date, setDate, place, setPlace } = usePlaceDate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const now = useNowAt(place.timezone)

  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang)
    if (setLanguageProp) setLanguageProp(lang)
  }, [setLanguageProp])

  const opts = useMemo(() => ({
    date, latitude: place.latitude, longitude: place.longitude, timezone: place.timezone || undefined, language: hi ? 'hi' : 'en',
  }), [date, place.latitude, place.longitude, place.timezone, hi])

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true); setError('')
    fetchPanchangFull(opts, { signal: ctrl.signal })
      .then((d) => setData(d))
      .catch((err) => { if (err.name !== 'AbortError') setError(err.status ? err.message : t('offline', hi)) })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false) })
    return () => ctrl.abort()
  }, [opts, attempt]) // eslint-disable-line react-hooks/exhaustive-deps

  const p = data

  return (
    <div className="jt-page jt-nostrip">
      <Header language={language} setLanguage={handleLanguageChange} />

      <main className="calc-page-main pv-main" id="main">
        <div className="calc-page-container">
          <div className="jt-pagehead">
            <h1>{t('pageTitle', hi)}</h1>
            <p className="jt-pagehead__sub">{t('pageSub', hi)}</p>
          </div>

          <DayBar hi={hi} date={date} setDate={setDate} place={place} setPlace={setPlace} />
          <div style={{ height: 'var(--s-3)' }} />
          <WeekStrip hi={hi} date={date} setDate={setDate} />

          {loading && !data && <Skeleton hero rows={4} height={200} text={t('loadingPanchang', hi)} />}
          {!loading && error && <ErrorBox hi={hi} message={error} onRetry={() => setAttempt((n) => n + 1)} />}

          {p && !error && (
            <HiCtx.Provider value={hi}>
              <div className={`pn-results${loading ? ' is-busy' : ''}`} aria-busy={loading} key={p.date}>
                <DayHead p={p} hi={hi} now={now} place={place} />
                <Jump hi={hi} />

                <div className="pn-grid">
                  <PanchangCard p={p} hi={hi} now={now} />
                  <SunMoonCard p={p} hi={hi} />
                  <ShubhCard p={p} hi={hi} now={now} />
                  <AshubhCard p={p} hi={hi} now={now} />
                  <ChoghadiyaCard p={p} hi={hi} now={now} />
                  <SamvatCard p={p} hi={hi} />
                  <RashiCard p={p} hi={hi} />
                  <YogaCard p={p} hi={hi} now={now} />
                  <VasaCard p={p} hi={hi} />
                  <LagnaCard p={p} hi={hi} now={now} />
                  <PadaCard p={p} hi={hi} now={now} />
                  <HoraCard p={p} hi={hi} now={now} />
                  <MuhurtaCard p={p} hi={hi} now={now} />
                  <BhadraDetailCard p={p} hi={hi} />
                  <SankrantiCard p={p} hi={hi} />
                  <GuruShukraCard p={p} hi={hi} />
                  <VedhaCard p={p} hi={hi} />
                  <PlanetsCard p={p} hi={hi} />
                </div>

                <p className="pn-foot">
                  {t('timesLocal', hi)} · {t('ayanamsa', hi)}: {p.ayanamsa} · {t('sunriseMethod', hi)}: {p.sunrise_method}
                  {p.location && ` · ${Number(p.location.latitude).toFixed(4)}°, ${Number(p.location.longitude).toFixed(4)}° (${p.location.timezone})`}
                </p>
              </div>
            </HiCtx.Provider>
          )}
        </div>
      </main>

      <AppDownloadBanner language={language} />
      <Footer language={language} />
    </div>
  )
}

export default PanchangPage
