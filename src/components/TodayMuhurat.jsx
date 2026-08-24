import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, Skeleton } from './ui'
import { IconArrowRight } from './ui/Icons'
import { fetchDailyMuhuratData, fetchPopularCities } from '../services/api'

const FALLBACK_CITY = {
  id: 1,
  name: 'Bhopal',
  state: 'Madhya Pradesh',
  coordinates: { latitude: 23.2599, longitude: 77.4126 },
}

const shape = (list = [], limit) =>
  list.slice(0, limit).map((item) => ({
    label: item.name || '',
    value: item.value || item.time || '',
  }))

const TodayMuhurat = ({ language }) => {
  const hi = language === 'hindi'
  const [activeTab, setActiveTab] = useState('yoga')
  const [muhuratData, setMuhuratData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [location, setLocation] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchPopularCities()
      .then((cities) => {
        if (cancelled) return
        const bhopal = (cities || []).find(c => c.name?.toLowerCase().includes('bhopal'))
        setLocation(bhopal || cities?.[0] || FALLBACK_CITY)
      })
      .catch(() => { if (!cancelled) setLocation(FALLBACK_CITY) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!location) return
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchDailyMuhuratData({
      date: new Date(),
      lat: location?.coordinates?.latitude || location?.lat || FALLBACK_CITY.coordinates.latitude,
      lon: location?.coordinates?.longitude || location?.lon || FALLBACK_CITY.coordinates.longitude,
      language,
    })
      .then((data) => {
        if (cancelled) return
        if (!data) { setError('empty'); return }
        setMuhuratData({
          yoga: shape(data.yogas, 7),
          choghadiya: shape(data.choghadiya?.day, 4),
          dayMahurat: shape(data.dayMahurat?.day, 3),
        })
      })
      .catch(() => { if (!cancelled) setError('failed') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [location, language])

  const tabs = [
    { id: 'yoga', name: 'Yoga', nameHi: 'योग' },
    { id: 'choghadiya', name: 'Choghadiya', nameHi: 'चौघड़िया' },
    { id: 'dayMahurat', name: 'Muhurat', nameHi: 'मुहूर्त' },
  ]

  const rows = muhuratData?.[activeTab] || []

  return (
    <div className="aj">
      <div className="aj__head">
        <h3 className="aj__title">{hi ? 'आज का मुहूर्त' : "Today's muhurat"}</h3>
        <p className="aj__note">
          {location?.name
            ? (hi ? `${location.name} के सूर्योदय के अनुसार` : `Calculated for sunrise at ${location.name}`)
            : (hi ? 'सूर्योदय के अनुसार गणना' : 'Calculated from local sunrise')}
        </p>
      </div>

      <div className="aj__body">
        <div className="aj-seg" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
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
            body={hi ? 'पूरा दैनिक मुहूर्त पंचांग पर देखें।' : "See the full daily muhurat on the panchang."}
          />
        ) : (
          <div className="aj-rows" key={activeTab}>
            {rows.map((row, i) => (
              <div key={i} className="aj-item">
                <span className="aj-item__k">{row.label}</span>
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
