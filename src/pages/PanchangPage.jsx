import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import AppDownloadBanner from '../components/AppDownloadBanner'
import { fetchPanchangFull } from '../services/kundliApi'
import { usePlaceDate } from '../components/panchang/DayPlaceControls'
import { ErrorBox } from '../components/panchang/Shared'
import { AngaTiles, DayBar, Glance, NowStrip, SeqList, TimelinePanel, WeekStrip } from '../components/panchang/Day'
import {
  AngaSection, BalamSection, BhadraSection, GuruShukraSection, KaalSection, LagnaSection,
  PlanetsSection, SamvatSection, SankrantiSection, VasaSection, VedhaSection, YogaSection,
} from '../components/panchang/PanchangSections'
import { Panel, SegTabs, Skeleton } from '../components/tools/jt'
import { t } from '../components/panchang/labels'
import { nowIsoIn, qualityTone } from '../components/panchang/format'
import '../styles/kundli.css'
import '../styles/panchang-v2.css'
import '../styles/jyotish-tools.css'

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

const TABS = ['overview', 'kaal', 'chog', 'lagna', 'detail']

const PanchangPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  const hi = language === 'hindi'
  const { date, setDate, place, setPlace } = usePlaceDate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [tab, setTab] = useState('overview')
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

  const tabs = TABS.map((id) => ({ id, label: t(`tab${id[0].toUpperCase()}${id.slice(1)}`, hi) }))
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
          <WeekStrip hi={hi} date={date} setDate={setDate} />

          {loading && !data && <Skeleton hero tiles={5} rows={2} height={160} text={t('loadingPanchang', hi)} />}
          {!loading && error && <ErrorBox hi={hi} message={error} onRetry={() => setAttempt((n) => n + 1)} />}

          {p && !error && (
            <div className={`kd-results pv-results${loading ? ' is-busy' : ''}`} aria-busy={loading} key={p.date}>
              <Glance p={p} hi={hi} now={now} place={place} />
              <AngaTiles p={p} hi={hi} now={now} />
              <NowStrip p={p} hi={hi} now={now} />
              <TimelinePanel p={p} hi={hi} now={now} />

              <SegTabs tabs={tabs} active={tab} onChange={setTab} label={t('jumpTo', hi)} />

              <div className="jt-section" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
                {tab === 'overview' && (<>
                  <YogaSection p={p} hi={hi} />
                  <VasaSection p={p} hi={hi} />
                  <BhadraSection p={p} hi={hi} />
                </>)}
                {tab === 'kaal' && (<>
                  <KaalSection p={p} hi={hi} now={now} />
                  <Panel title={t('muhurtas', hi)} sub={`${p.muhurtas?.length || 0} · ${t('sunriseFrom', hi)}`}>
                    <SeqList items={p.muhurtas || []} hi={hi} base={p.date} now={now}
                      name={(m) => `${m.number}. ${m.name}`} sub={(m) => (m.when === 'night' ? t('night', hi) : t('day', hi))}
                      tone={(m) => (m.auspicious ? 'good' : 'bad')} />
                  </Panel>
                </>)}
                {tab === 'chog' && (<>
                  <div className="jt-grid2">
                    <Panel title={`${t('choghadiya', hi)} · ${t('day', hi)}`} sub={`${p.choghadiya?.day?.length || 0} · ${t('sequence', hi)}`}>
                      <SeqList items={p.choghadiya?.day || []} hi={hi} base={p.date} now={now} name={(c) => c.name} sub={(c) => c.planet_name || c.planet} tone={(c) => qualityTone(c.quality)} />
                    </Panel>
                    <Panel title={`${t('choghadiya', hi)} · ${t('night', hi)}`} sub={`${p.choghadiya?.night?.length || 0} · ${t('sequence', hi)}`}>
                      <SeqList items={p.choghadiya?.night || []} hi={hi} base={p.date} now={now} name={(c) => c.name} sub={(c) => c.planet_name || c.planet} tone={(c) => qualityTone(c.quality)} />
                    </Panel>
                  </div>
                  <Panel title={t('hora', hi)} sub={`${p.hora?.length || 0} · ${t('sunriseFrom', hi)}`}>
                    <SeqList items={p.hora || []} hi={hi} base={p.date} now={now}
                      name={(h) => `${h.number}. ${h.planet}`} sub={(h) => (h.when === 'night' ? t('night', hi) : t('day', hi))} tone={() => 'mid'} />
                  </Panel>
                </>)}
                {tab === 'lagna' && (<>
                  <LagnaSection p={p} hi={hi} />
                  <BalamSection p={p} hi={hi} />
                  <PlanetsSection p={p} hi={hi} open />
                </>)}
                {tab === 'detail' && (<>
                  <AngaSection p={p} hi={hi} />
                  <SamvatSection p={p} hi={hi} />
                  <GuruShukraSection p={p} hi={hi} />
                  <SankrantiSection p={p} hi={hi} />
                  <VedhaSection p={p} hi={hi} open />
                </>)}
              </div>

              <p className="kd-foot">
                {t('footnote', hi)} · {t('ayanamsa', hi)}: {p.ayanamsa} · {t('sunriseMethod', hi)}: {p.sunrise_method}
                {p.location && ` · ${Number(p.location.latitude).toFixed(4)}°, ${Number(p.location.longitude).toFixed(4)}° (${p.location.timezone})`}
              </p>
            </div>
          )}
        </div>
      </main>

      <AppDownloadBanner language={language} />
      <Footer language={language} />
    </div>
  )
}

export default PanchangPage
