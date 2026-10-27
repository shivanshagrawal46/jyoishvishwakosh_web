import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import AppDownloadBanner from '../components/AppDownloadBanner'
import { fetchMuhuratDay } from '../services/kundliApi'
import DayPlaceControls, { usePlaceDate } from '../components/panchang/DayPlaceControls'
import { ErrorBox, PageSkeleton } from '../components/panchang/Shared'
import { ChoghadiyaSection } from '../components/panchang/PanchangSections'
import { ActivitySection, MuhuratAngaSection, MuhuratHero, RestrictionsSection, WindowsSection } from '../components/panchang/MuhuratSections'
import { t } from '../components/panchang/labels'
import { nowIsoIn } from '../components/panchang/format'
import '../styles/kundli.css'
import '../styles/panchang-v2.css'

const DainikMuhuratPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  const hi = language === 'hindi'
  const { date, setDate, place, setPlace } = usePlaceDate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [now, setNow] = useState(() => nowIsoIn(place.timezone))

  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang)
    if (setLanguageProp) setLanguageProp(lang)
  }, [setLanguageProp])

  useEffect(() => {
    setNow(nowIsoIn(place.timezone))
    const id = setInterval(() => setNow(nowIsoIn(place.timezone)), 60000)
    return () => clearInterval(id)
  }, [place.timezone])

  const opts = useMemo(() => ({
    date, latitude: place.latitude, longitude: place.longitude, timezone: place.timezone || undefined, language: hi ? 'hi' : 'en',
  }), [date, place.latitude, place.longitude, place.timezone, hi])

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true); setError('')
    fetchMuhuratDay(opts, { signal: ctrl.signal })
      .then((d) => setData(d))
      .catch((err) => { if (err.name !== 'AbortError') setError(err.status ? err.message : t('offline', hi)) })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false) })
    return () => ctrl.abort()
  }, [opts, attempt]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Header language={language} setLanguage={handleLanguageChange} />

      <main className="calc-page-main pv-main" id="main">
        <div className="calc-page-container">
          <motion.div className="panchang-page-header" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className={`panchang-page-title${hi ? ' hindi' : ''}`}>{t('muhuratTitle', hi)}</h1>
            <p className="panchang-page-subtitle">{t('muhuratSub', hi)}</p>
          </motion.div>

          <DayPlaceControls hi={hi} date={date} setDate={setDate} place={place} setPlace={setPlace} />

          {loading && !data && <PageSkeleton hi={hi} text={t('loadingMuhurat', hi)} />}
          {!loading && error && <ErrorBox hi={hi} message={error} onRetry={() => setAttempt((n) => n + 1)} />}

          {data && !error && (
            <motion.div className={`kd-results pv-results${loading ? ' is-busy' : ''}`} aria-busy={loading}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
              <MuhuratHero m={data} hi={hi} place={place} />
              <WindowsSection m={data} hi={hi} now={now} />
              <RestrictionsSection m={data} hi={hi} />
              <ActivitySection m={data} hi={hi} />
              <ChoghadiyaSection p={data} hi={hi} now={now} />
              <MuhuratAngaSection m={data} hi={hi} />

              <section className="kd-card">
                <div className="kd-card__body" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div className="kd-card__title">{t('findDays', hi)}</div>
                    <p className="kd-hint">{t('findDaysSub', hi)}</p>
                  </div>
                  <Link to="/muhurat-finder" className="calc-form-submit pv-cta">{hi ? 'शुभ दिन खोजें' : 'Find auspicious days'} →</Link>
                </div>
              </section>

              <p className="kd-foot">{t('footnote', hi)}</p>
            </motion.div>
          )}
        </div>
      </main>

      <AppDownloadBanner language={language} />
      <Footer language={language} />
    </>
  )
}

export default DainikMuhuratPage
