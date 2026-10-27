import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, Skeleton } from './ui'
import { IconArrowRight } from './ui/Icons'
import { fetchMuhuratDay } from '../services/kundliApi'
import { loadPlace, shortName } from './panchang/place'
import { durationLabel, rangeLabel, todayYmd } from './panchang/format'

/**
 * Home-page "today's muhurat" card on the Kundli API (`/api/v1/muhurat`):
 * choghadiya, auspicious windows and periods to avoid for today at the
 * place chosen on /panchang (New Delhi by default).
 */
const TodayMuhurat = ({ language }) => {
  const hi = language === 'hindi'
  const [activeTab, setActiveTab] = useState('choghadiya')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const place = useMemo(() => loadPlace(), [])

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    setError(null)
    fetchMuhuratDay({
      date: todayYmd(), latitude: place.latitude, longitude: place.longitude, timezone: place.timezone || undefined, language: hi ? 'hi' : 'en',
    }, { signal: ctrl.signal })
      .then((d) => { if (!d) throw new Error('empty'); setData(d) })
      .catch((e) => { if (e.name !== 'AbortError') setError('failed') })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false) })
    return () => ctrl.abort()
  }, [place, hi])

  const tabs = [
    { id: 'choghadiya', name: 'Choghadiya', nameHi: 'चौघड़िया' },
    { id: 'shubh', name: 'Auspicious', nameHi: 'शुभ समय' },
    { id: 'ashubh', name: 'Avoid', nameHi: 'वर्जित समय' },
  ]

  const rows = useMemo(() => {
    if (!data) return []
    const base = data.date
    const q = (c) => (c.quality === 'good' ? (hi ? 'शुभ' : 'good') : c.quality === 'bad' ? (hi ? 'अशुभ' : 'avoid') : (hi ? 'सम' : 'neutral'))
    if (activeTab === 'choghadiya') {
      return (data.choghadiya?.day || []).map((c) => ({ label: `${c.name} · ${q(c)}`, value: rangeLabel(c, hi, base), tone: c.quality }))
    }
    if (activeTab === 'shubh') {
      const out = []
      if (data.abhijit_muhurta && data.abhijit_muhurta.valid !== false) out.push({ label: hi ? 'अभिजीत मुहूर्त' : 'Abhijit Muhurat', value: rangeLabel(data.abhijit_muhurta, hi, base), tone: 'good' })
      ;(data.auspicious_windows || []).forEach((w, i) => out.push({
        label: `${hi ? 'शुभ समय' : 'Auspicious'} ${i + 1} · ${durationLabel(w.minutes, hi)}`, value: rangeLabel(w, hi, base), tone: 'good',
      }))
      return out
    }
    const out = []
    if (data.rahu_kaal) out.push({ label: hi ? 'राहु काल' : 'Rahu Kaal', value: rangeLabel(data.rahu_kaal, hi, base), tone: 'bad' })
    ;(data.avoid_windows || []).forEach((w, i) => out.push({ label: `${hi ? 'वर्जित समय' : 'Avoid'} ${i + 1}`, value: rangeLabel(w, hi, base), tone: 'bad' }))
    return out
  }, [data, activeTab, hi])

  const city = shortName(place)

  return (
    <div className="aj">
      <div className="aj__head">
        <h3 className="aj__title">{hi ? 'आज का मुहूर्त' : "Today's muhurat"}</h3>
        <p className="aj__note">
          {city
            ? (hi ? `${city} के सूर्योदय के अनुसार` : `Calculated for sunrise at ${city}`)
            : (hi ? 'सूर्योदय के अनुसार गणना' : 'Calculated from local sunrise')}
        </p>
      </div>

      <div className="aj__body">
        <div className="aj-seg" role="tablist">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>
              {hi ? tab.nameHi : tab.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="aj-rows">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="aj-item">
                <Skeleton w="38%" h="13px" />
                <Skeleton w="30%" h="13px" />
              </div>
            ))}
          </div>
        ) : error || rows.length === 0 ? (
          <EmptyState
            title={hi ? 'आज का डेटा उपलब्ध नहीं' : 'Not available right now'}
            body={hi ? 'पूरा दैनिक मुहूर्त पंचांग पर देखें।' : 'See the full daily muhurat on the panchang.'}
          />
        ) : (
          <div className="aj-rows" key={activeTab}>
            {rows.map((row, i) => (
              <div key={i} className="aj-item">
                <span className="aj-item__k" style={row.tone === 'bad' ? { color: 'var(--vermilion)' } : row.tone === 'good' ? { color: 'var(--jade)' } : undefined}>{row.label}</span>
                <span className="aj-item__v">{row.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="aj__foot">
        <Link to="/dainik-muhurat" className="aj__link">
          {hi ? 'पूरा दैनिक मुहूर्त' : 'Full daily muhurat'}<IconArrowRight s={15} />
        </Link>
      </div>
    </div>
  )
}

export default TodayMuhurat
