import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import AppDownloadBanner from '../components/AppDownloadBanner'
import { fetchPanchangFull } from '../services/kundliApi'
import DayPlaceControls, { usePlaceDate } from '../components/panchang/DayPlaceControls'
import { ErrorBox, PageSkeleton } from '../components/panchang/Shared'
import {
  AngaSection, BalamSection, BhadraSection, ChoghadiyaSection, GuruShukraSection, HoraSection, KaalSection, LagnaSection,
  MuhurtaSection, PanchangHero, PlanetsSection, SECTIONS, SamvatSection, SankrantiSection, VasaSection, VedhaSection, YogaSection,
} from '../components/panchang/PanchangSections'
import { t } from '../components/panchang/labels'
import { nowIsoIn } from '../components/panchang/format'
import '../styles/kundli.css'
import '../styles/panchang-v2.css'

/** Wall clock at the chosen place, refreshed every minute so "now" highlights move. */
function useNowAt(tz) {
  const [now, setNow] = useState(() => nowIsoIn(tz))
  useEffect(() => {
    setNow(nowIsoIn(tz))
    const id = setInterval(() => setNow(nowIsoIn(tz)), 60000)
    return () => clearInterval(id)
  }, [tz])
  return now
}

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

  const jump = (e, id) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    el.open = true
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <Header language={language} setLanguage={handleLanguageChange} />

      <main className="calc-page-main pv-main" id="main">
        <div className="calc-page-container">
          <motion.div className="panchang-page-header" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className={`panchang-page-title${hi ? ' hindi' : ''}`}>{t('pageTitle', hi)}</h1>
            <p className="panchang-page-subtitle">{t('pageSub', hi)}</p>
          </motion.div>

          <DayPlaceControls hi={hi} date={date} setDate={setDate} place={place} setPlace={setPlace} />

          {loading && !data && <PageSkeleton hi={hi} text={t('loadingPanchang', hi)} />}
          {!loading && error && <ErrorBox hi={hi} message={error} onRetry={() => setAttempt((n) => n + 1)} />}

          {data && !error && (
            <motion.div className={`kd-results pv-results${loading ? ' is-busy' : ''}`} aria-busy={loading}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
              <PanchangHero p={data} hi={hi} place={place} />

              <nav className="pv-nav" aria-label={t('jumpTo', hi)}>
                {SECTIONS.map(([id, key]) => (
                  <a key={id} href={`#${id}`} className="kd-chip" onClick={(e) => jump(e, id)}>{t(key, hi)}</a>
                ))}
              </nav>

              <SamvatSection p={data} hi={hi} />
              <AngaSection p={data} hi={hi} />
              <YogaSection p={data} hi={hi} />
              <KaalSection p={data} hi={hi} now={now} />
              <BhadraSection p={data} hi={hi} />
              <LagnaSection p={data} hi={hi} />
              <VasaSection p={data} hi={hi} />
              <GuruShukraSection p={data} hi={hi} />
              <SankrantiSection p={data} hi={hi} />
              <VedhaSection p={data} hi={hi} />
              <ChoghadiyaSection p={data} hi={hi} now={now} />
              <HoraSection p={data} hi={hi} now={now} />
              <MuhurtaSection p={data} hi={hi} now={now} />
              <BalamSection p={data} hi={hi} />
              <PlanetsSection p={data} hi={hi} />

              <p className="kd-foot">
                {t('footnote', hi)} · {t('ayanamsa', hi)}: {data.ayanamsa} · {t('sunriseMethod', hi)}: {data.sunrise_method}
                {data.location && ` · ${Number(data.location.latitude).toFixed(4)}°, ${Number(data.location.longitude).toFixed(4)}° (${data.location.timezone})`}
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <AppDownloadBanner language={language} />
      <Footer language={language} />
    </>
  )
}

export default PanchangPage
