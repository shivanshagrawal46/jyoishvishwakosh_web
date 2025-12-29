import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import CelebrityStrip from '../components/CelebrityStrip'
import Footer from '../components/Footer'
import AppDownloadBanner from '../components/AppDownloadBanner'
import { fetchDailyMuhuratData, searchCities, fetchPopularCities } from '../services/api'

const DainikMuhuratPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [muhuratData, setMuhuratData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('yoga')
  const [citySearchQuery, setCitySearchQuery] = useState('')
  const [citySuggestions, setCitySuggestions] = useState([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  const tabsList = ['yoga', 'choghadiya', 'dayMahurat']

  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang)
    if (setLanguageProp) setLanguageProp(lang)
  }, [setLanguageProp])

  // Initialize location
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const cities = await fetchPopularCities()
        if (cities && cities.length > 0) {
          const bhopal = cities.find(c => c.name?.toLowerCase().includes('bhopal'))
          setSelectedLocation(bhopal || cities[0])
        } else {
          setSelectedLocation({
            id: 1,
            name: 'Bhopal',
            state: 'Madhya Pradesh',
            displayName: 'Bhopal, Madhya Pradesh',
            coordinates: { latitude: 23.2599, longitude: 77.4126 }
          })
        }
      } catch (err) {
        console.error('Error initializing location:', err)
        setSelectedLocation({
          id: 1,
          name: 'Bhopal',
          state: 'Madhya Pradesh',
          displayName: 'Bhopal, Madhya Pradesh',
          coordinates: { latitude: 23.2599, longitude: 77.4126 }
        })
      }
    }
    initializeLocation()
  }, [])

  // Update active tab from URL query
  useEffect(() => {
    const queryTab = new URLSearchParams(location.search).get('tab')
    if (queryTab && tabsList.includes(queryTab)) {
      setActiveTab(queryTab)
    }
  }, [location.search])

  // Search cities
  useEffect(() => {
    const searchCity = async () => {
      if (citySearchQuery.length < 2) {
        setCitySuggestions([])
        return
      }

      try {
        const results = await searchCities(citySearchQuery, 10)
        setCitySuggestions(results)
        setShowCitySuggestions(true)
      } catch (err) {
        console.error('Error searching cities:', err)
        setCitySuggestions([])
      }
    }

    const timeoutId = setTimeout(searchCity, 300)
    return () => clearTimeout(timeoutId)
  }, [citySearchQuery])

  // Fetch muhurat data
  useEffect(() => {
    const loadMuhuratData = async () => {
      if (!selectedLocation) return

      setLoading(true)
      setError(null)

      try {
        const lat = selectedLocation.coordinates?.latitude || selectedLocation.lat || 23.2599
        const lon = selectedLocation.coordinates?.longitude || selectedLocation.lon || 77.4126

        const data = await fetchDailyMuhuratData({
          date: selectedDate,
          lat,
          lon,
          language
        })

        if (data) {
          setMuhuratData(data)
          setError(null)
        } else {
          setError('No data received')
          setMuhuratData(null)
        }
      } catch (err) {
        console.error('Error fetching muhurat data:', err)
        setError(err.message || 'Failed to load muhurat data')
        setMuhuratData(null)
      } finally {
        setLoading(false)
      }
    }

    loadMuhuratData()
  }, [selectedDate, selectedLocation, language])

  const handleCitySelect = (city) => {
    setSelectedLocation(city)
    setCitySearchQuery(city.displayName || `${city.name}, ${city.state}`)
    setShowCitySuggestions(false)
  }

  const handlePrevDay = () => {
    const prevDay = new Date(selectedDate)
    prevDay.setDate(prevDay.getDate() - 1)
    setSelectedDate(prevDay)
  }

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate)
    nextDay.setDate(nextDay.getDate() + 1)
    setSelectedDate(nextDay)
  }

  const handleTabSelect = (tabKey) => {
    setActiveTab(tabKey)
    navigate({
      pathname: location.pathname,
      search: `?tab=${tabKey}`,
    })
  }

  const renderYogaTab = () => {
    if (!muhuratData?.yogas) return null

    return (
      <div className="dainik-muhurat-content">
        <div className="muhurat-section">
          <h4 className={`muhurat-section-title ${language === 'hindi' ? 'hindi' : ''}`}>
            {language === 'hindi' ? 'योग' : 'Yoga'}
          </h4>
          <div className="muhurat-list">
            {muhuratData.yogas.map((item, index) => (
              <div key={index} className="muhurat-list-item">
                <span className={`muhurat-item-label ${language === 'hindi' ? 'hindi' : ''}`}>
                  {item.name || ''}
                </span>
                <span className={`muhurat-item-value ${language === 'hindi' ? 'hindi' : ''}`}>
                  {item.value || item.time || ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        {muhuratData.rituals && muhuratData.rituals.length > 0 && (
          <div className="muhurat-section">
            <h4 className={`muhurat-section-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? 'रिवाज' : 'Rituals'}
            </h4>
            <div className="muhurat-list">
              {muhuratData.rituals.map((item, index) => (
                <div key={index} className="muhurat-list-item">
                  <span className={`muhurat-item-label ${language === 'hindi' ? 'hindi' : ''}`}>
                    {item.name || ''}
                  </span>
                  <span className={`muhurat-item-value ${language === 'hindi' ? 'hindi' : ''}`}>
                    {item.value || item.time || ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {muhuratData.mool && muhuratData.mool.length > 0 && (
          <div className="muhurat-section">
            <h4 className={`muhurat-section-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? 'मूल' : 'Mool'}
            </h4>
            <div className="muhurat-list">
              {muhuratData.mool.map((item, index) => (
                <div key={index} className="muhurat-list-item">
                  <span className={`muhurat-item-label ${language === 'hindi' ? 'hindi' : ''}`}>
                    {item.name || ''}
                  </span>
                  <span className={`muhurat-item-value ${language === 'hindi' ? 'hindi' : ''}`}>
                    {item.value || item.time || ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {muhuratData.travel && muhuratData.travel.length > 0 && (
          <div className="muhurat-section">
            <h4 className={`muhurat-section-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? 'यात्रा' : 'Travel'}
            </h4>
            <div className="muhurat-list">
              {muhuratData.travel.map((item, index) => (
                <div key={index} className="muhurat-list-item">
                  <span className={`muhurat-item-label ${language === 'hindi' ? 'hindi' : ''}`}>
                    {item.name || ''}
                  </span>
                  <span className={`muhurat-item-value ${language === 'hindi' ? 'hindi' : ''}`}>
                    {item.value || item.time || ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {muhuratData.extraYoga && muhuratData.extraYoga.length > 0 && (
          <div className="muhurat-section">
            <h4 className={`muhurat-section-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? 'अतिरिक्त योग' : 'Extra Yoga'}
            </h4>
            <div className="muhurat-list">
              {muhuratData.extraYoga.map((item, index) => (
                <div key={index} className="muhurat-list-item">
                  <span className={`muhurat-item-label ${language === 'hindi' ? 'hindi' : ''}`}>
                    {item.name || ''}
                  </span>
                  <span className={`muhurat-item-value ${language === 'hindi' ? 'hindi' : ''}`}>
                    {item.value || item.time || ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderChoghadiyaTab = () => {
    if (!muhuratData?.choghadiya) return null

    return (
      <div className="dainik-muhurat-content">
        <div className="muhurat-day-night-grid">
          <div className="muhurat-section">
            <h4 className={`muhurat-section-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? 'दिन' : 'Day'}
            </h4>
            <div className="muhurat-list">
              {(muhuratData.choghadiya.day || []).map((item, index) => (
                <div key={index} className="muhurat-list-item">
                  <span className={`muhurat-item-label ${language === 'hindi' ? 'hindi' : ''}`}>
                    {item.name || ''}
                  </span>
                  <span className={`muhurat-item-value ${language === 'hindi' ? 'hindi' : ''}`}>
                    {item.value || item.time || ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="muhurat-section">
            <h4 className={`muhurat-section-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? 'रात' : 'Night'}
            </h4>
            <div className="muhurat-list">
              {(muhuratData.choghadiya.night || []).map((item, index) => (
                <div key={index} className="muhurat-list-item">
                  <span className={`muhurat-item-label ${language === 'hindi' ? 'hindi' : ''}`}>
                    {item.name || ''}
                  </span>
                  <span className={`muhurat-item-value ${language === 'hindi' ? 'hindi' : ''}`}>
                    {item.value || item.time || ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderDayMahuratTab = () => {
    if (!muhuratData?.dayMahurat) return null

    return (
      <div className="dainik-muhurat-content">
        <div className="muhurat-day-night-grid">
          <div className="muhurat-section">
            <h4 className={`muhurat-section-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? 'दिन' : 'Day'}
            </h4>
            <div className="muhurat-list">
              {(muhuratData.dayMahurat.day || []).map((item, index) => (
                <div key={index} className="muhurat-list-item">
                  <span className={`muhurat-item-label ${language === 'hindi' ? 'hindi' : ''}`}>
                    {item.name || ''}
                  </span>
                  <span className={`muhurat-item-value ${language === 'hindi' ? 'hindi' : ''}`}>
                    {item.value || item.time || ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="muhurat-section">
            <h4 className={`muhurat-section-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? 'रात' : 'Night'}
            </h4>
            <div className="muhurat-list">
              {(muhuratData.dayMahurat.night || []).map((item, index) => (
                <div key={index} className="muhurat-list-item">
                  <span className={`muhurat-item-label ${language === 'hindi' ? 'hindi' : ''}`}>
                    {item.name || ''}
                  </span>
                  <span className={`muhurat-item-value ${language === 'hindi' ? 'hindi' : ''}`}>
                    {item.value || item.time || ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header language={language} setLanguage={handleLanguageChange} />
      <CelebrityStrip language={language} />

      <main className="dainik-muhurat-page">
        <div className="container">
          {/* Page Header */}
          <motion.div
            className="page-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className={`page-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? 'दैनिक मुहूर्त' : 'Daily Muhurat'}
            </h1>
            <p className="page-subtitle">
              {language === 'hindi'
                ? 'दिन के शुभ मुहूर्त और समय जानें'
                : 'Know the auspicious times and moments of the day'}
            </p>
          </motion.div>

          {/* Input Selection Card */}
          <motion.div
            className="panchang-input-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="panchang-input-row">
              {/* Date Selection */}
              <div className="panchang-input-group">
                <label className={language === 'hindi' ? 'hindi' : ''}>
                  {language === 'hindi' ? 'तारीख चुनें' : 'Select Date'}
                </label>
                <div className="panchang-date-controls">
                  <button
                    type="button"
                    className="panchang-date-btn"
                    onClick={handlePrevDay}
                    aria-label="Previous day"
                  >
                    ←
                  </button>
                  <input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="panchang-date-input"
                  />
                  <button
                    type="button"
                    className="panchang-date-btn"
                    onClick={handleNextDay}
                    aria-label="Next day"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* City Selection */}
              <div className="panchang-input-group">
                <label className={language === 'hindi' ? 'hindi' : ''}>
                  {language === 'hindi' ? 'शहर चुनें' : 'Select City'}
                </label>
                <div className="panchang-city-input-wrapper">
                  <input
                    type="text"
                    placeholder={language === 'hindi' ? 'शहर खोजें...' : 'Search city...'}
                    value={citySearchQuery}
                    onChange={(e) => setCitySearchQuery(e.target.value)}
                    onFocus={() => setShowCitySuggestions(true)}
                    className="panchang-city-input"
                  />
                  {showCitySuggestions && citySuggestions.length > 0 && (
                    <div className="panchang-city-suggestions">
                      {citySuggestions.map((city, index) => (
                        <div
                          key={index}
                          className="panchang-city-suggestion-item"
                          onClick={() => handleCitySelect(city)}
                        >
                          {city.displayName || `${city.name}, ${city.state}`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedLocation && (
                  <div className="panchang-selected-city">
                    {selectedLocation.displayName || `${selectedLocation.name}, ${selectedLocation.state}`}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="dainik-muhurat-loading">
              <div className="muhurat-spinner"></div>
              <p className={language === 'hindi' ? 'hindi' : ''}>
                {language === 'hindi' ? 'लोड हो रहा है...' : 'Loading...'}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="dainik-muhurat-error">
              <p className={language === 'hindi' ? 'hindi' : ''}>
                {language === 'hindi' ? 'त्रुटि: ' : 'Error: '}{error}
              </p>
            </div>
          )}

          {/* Tabs and Content */}
          {!loading && !error && muhuratData && (
            <>
              {/* Tabs */}
              <motion.div
                className="dainik-muhurat-tabs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {tabsList.map((tab) => (
                  <button
                    key={tab}
                    className={`dainik-muhurat-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => handleTabSelect(tab)}
                  >
                    {tab === 'yoga' && (language === 'hindi' ? 'योग' : 'Yoga')}
                    {tab === 'choghadiya' && (language === 'hindi' ? 'चौघड़िया' : 'Choghadiya')}
                    {tab === 'dayMahurat' && (language === 'hindi' ? 'दिन मुहूर्त' : 'Day Mahurat')}
                  </button>
                ))}
              </motion.div>

              {/* Tab Content */}
              <motion.div
                className="dainik-muhurat-tab-content"
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'yoga' && renderYogaTab()}
                {activeTab === 'choghadiya' && renderChoghadiyaTab()}
                {activeTab === 'dayMahurat' && renderDayMahuratTab()}
              </motion.div>
            </>
          )}
        </div>
      </main>

      <AppDownloadBanner language={language} />
      <Footer language={language} />
    </>
  )
}

export default DainikMuhuratPage

