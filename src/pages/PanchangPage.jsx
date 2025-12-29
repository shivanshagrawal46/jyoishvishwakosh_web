import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import CelebrityStrip from '../components/CelebrityStrip'
import Footer from '../components/Footer'
import AppDownloadBanner from '../components/AppDownloadBanner'
import { fetchPanchangData, searchCities, fetchPopularCities } from '../services/api'

const PanchangPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  // Always default to today's date
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [panchangData, setPanchangData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [citySearchQuery, setCitySearchQuery] = useState('')
  const [citySuggestions, setCitySuggestions] = useState([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)

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

  // Fetch panchang data
  useEffect(() => {
    const loadPanchangData = async () => {
      if (!selectedLocation) return

      setLoading(true)
      setError(null)

      try {
        const lat = selectedLocation.coordinates?.latitude || selectedLocation.lat || 23.2599
        const lon = selectedLocation.coordinates?.longitude || selectedLocation.lon || 77.4126
        
        const data = await fetchPanchangData({
          date: selectedDate,
          lat,
          lon,
          language
        })

        // Handle different response structures
        if (data) {
          if (data.details) {
            setPanchangData(data)
            setError(null)
          } else if (data.response && data.response.details) {
            setPanchangData(data.response)
            setError(null)
          } else if (data.data && data.data.details) {
            setPanchangData(data.data)
            setError(null)
          } else {
            console.error('Unexpected panchang data structure:', data)
            setError('Invalid data format received')
            setPanchangData(null)
          }
        } else {
          setError('No data received')
          setPanchangData(null)
        }
      } catch (err) {
        console.error('Error fetching panchang:', err)
        setError(err.message || 'Failed to load panchang data')
      } finally {
        setLoading(false)
      }
    }

    loadPanchangData()
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

  const formatTime = (timeString) => {
    if (!timeString) return ''
    return timeString.includes(',') ? timeString.split(',')[1]?.trim() : timeString
  }

  const decimalToHHMM = (decimal) => {
    if (!decimal) return ''
    const hours = Math.floor(decimal)
    const minutes = Math.round((decimal % 1) * 60)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  const capitalize = (str) => {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  // Field name translations
  const getFieldLabel = (key) => {
    const translations = {
      // Main fields
      tithi: { en: 'Tithi', hi: 'तिथि' },
      paksha: { en: 'Paksha', hi: 'पक्ष' },
      solarMaah: { en: 'Solar Month', hi: 'सौर मास' },
      nakshatra: { en: 'Nakshatra', hi: 'नक्षत्र' },
      yoga: { en: 'Yoga', hi: 'योग' },
      ayan: { en: 'Ayan', hi: 'अयन' },
      rashi: { en: 'Rashi', hi: 'राशि' },
      karan: { en: 'Karan', hi: 'करण' },
      sunSign: { en: 'Sun Sign', hi: 'सूर्य राशि' },
      suryaRashi: { en: 'Sun Sign', hi: 'सूर्य राशि' },
      moonSign: { en: 'Moon Sign', hi: 'चंद्र राशि' },
      chandraRashi: { en: 'Moon Sign', hi: 'चंद्र राशि' },
      sunrise: { en: 'Sunrise', hi: 'सूर्योदय' },
      sunset: { en: 'Sunset', hi: 'सूर्यास्त' },
      moonRise: { en: 'Moonrise', hi: 'चंद्रोदय' },
      moonSet: { en: 'Moonset', hi: 'चंद्रास्त' },
      dayDuration: { en: 'Day Duration', hi: 'दिन की अवधि' },
      ratriman: { en: 'Night Duration', hi: 'रात्रि की अवधि' },
      rahukaal: { en: 'Rahukaal', hi: 'राहुकाल' },
      gulikaal: { en: 'Gulikaal', hi: 'गुलिकाल' },
      yamaganda: { en: 'Yamaganda', hi: 'यमगंड' },
      abhijitMuhurat: { en: 'Abhijit Muhurat', hi: 'अभिजीत मुहूर्त' },
      amritKaal: { en: 'Amrit Kaal', hi: 'अमृत काल' },
      brahmaMuhurat: { en: 'Brahma Muhurat', hi: 'ब्रह्म मुहूर्त' },
      vikramSamvat: { en: 'Vikram Samvat', hi: 'विक्रम संवत' },
      shakSamvat: { en: 'Shak Samvat', hi: 'शक संवत' },
      gol: { en: 'Gol', hi: 'गोल' },
      retu: { en: 'Retu', hi: 'रेतु' },
      lagna: { en: 'Lagna', hi: 'लग्न' },
      lagnaLord: { en: 'Lagna Lord', hi: 'लग्नेश' },
      pada: { en: 'Pada', hi: 'पद' },
      padaSamay: { en: 'Pada Samay', hi: 'पद समय' },
      padaSamay2: { en: 'Pada Samay 2', hi: 'पद समय 2' },
      padaSamay3: { en: 'Pada Samay 3', hi: 'पद समय 3' },
      padaSamay4: { en: 'Pada Samay 4', hi: 'पद समय 4' },
      tithi2: { en: 'Tithi 2', hi: 'तिथि 2' },
      tithiSamay2: { en: 'Tithi Samay 2', hi: 'तिथि समय 2' },
      karanSamay2: { en: 'Karan Samay 2', hi: 'करण समय 2' },
      nakshatra2: { en: 'Nakshatra 2', hi: 'नक्षत्र 2' },
      tithiNo: { en: 'Tithi Number', hi: 'तिथि संख्या' },
      rashiLord: { en: 'Rashi Lord', hi: 'राशि स्वामी' },
      rashi2: { en: 'Rashi 2', hi: 'राशि 2' },
      rashiSamay2: { en: 'Rashi Samay 2', hi: 'राशि समय 2' },
      suryodaya: { en: 'Sunrise', hi: 'सूर्योदय' },
      suryast: { en: 'Sunset', hi: 'सूर्यास्त' },
      dinman: { en: 'Day Duration', hi: 'दिन की अवधि' },
      chandrodaya: { en: 'Moonrise', hi: 'चंद्रोदय' },
      chandrast: { en: 'Moonset', hi: 'चंद्रास्त' },
      // Additional common fields
      purnimantMaah: { en: 'Purnimant Month', hi: 'पूर्णिमांत मास' },
      hinduDay: { en: 'Hindu Day', hi: 'हिंदू दिवस' },
      day: { en: 'Day', hi: 'दिन' },
      tithiSamay: { en: 'Tithi Time', hi: 'तिथि समय' },
      nakshatraSamay: { en: 'Nakshatra Time', hi: 'नक्षत्र समय' },
      yogaSamay: { en: 'Yoga Time', hi: 'योग समय' },
      rashiSamay: { en: 'Rashi Time', hi: 'राशि समय' },
      karanSamay: { en: 'Karan Time', hi: 'करण समय' },
      // More possible fields
      hinduMonth: { en: 'Hindu Month', hi: 'हिंदू मास' },
      hinduYear: { en: 'Hindu Year', hi: 'हिंदू वर्ष' },
      maas: { en: 'Maas', hi: 'मास' },
      ritu: { en: 'Ritu', hi: 'ऋतु' },
      adhikMaas: { en: 'Adhik Maas', hi: 'अधिक मास' },
      kshayaMaas: { en: 'Kshaya Maas', hi: 'क्षय मास' },
      amavasya: { en: 'Amavasya', hi: 'अमावस्या' },
      purnima: { en: 'Purnima', hi: 'पूर्णिमा' },
      ekadashi: { en: 'Ekadashi', hi: 'एकादशी' },
      chaturdashi: { en: 'Chaturdashi', hi: 'चतुर्दशी' },
      tritiya: { en: 'Tritiya', hi: 'तृतीया' },
      chaturthi: { en: 'Chaturthi', hi: 'चतुर्थी' },
      panchami: { en: 'Panchami', hi: 'पंचमी' },
      shashthi: { en: 'Shashthi', hi: 'षष्ठी' },
      saptami: { en: 'Saptami', hi: 'सप्तमी' },
      ashtami: { en: 'Ashtami', hi: 'अष्टमी' },
      navami: { en: 'Navami', hi: 'नवमी' },
      dashami: { en: 'Dashami', hi: 'दशमी' },
      dwadashi: { en: 'Dwadashi', hi: 'द्वादशी' },
      trayodashi: { en: 'Trayodashi', hi: 'त्रयोदशी' },
      // Time related
      dinman: { en: 'Day Duration', hi: 'दिन की अवधि' },
      ratriman: { en: 'Night Duration', hi: 'रात्रि की अवधि' },
      // Muhurat related
      shubhMuhurat: { en: 'Shubh Muhurat', hi: 'शुभ मुहूर्त' },
      ashubhMuhurat: { en: 'Ashubh Muhurat', hi: 'अशुभ मुहूर्त' },
      // Other fields
      choghadiya: { en: 'Choghadiya', hi: 'चौघड़िया' },
      hora: { en: 'Hora', hi: 'होरा' },
      vaar: { en: 'Day of Week', hi: 'वार' },
      // Additional variations
      suryaRashi: { en: 'Sun Sign', hi: 'सूर्य राशि' },
      chandraRashi: { en: 'Moon Sign', hi: 'चंद्र राशि' },
      mangalRashi: { en: 'Mars Sign', hi: 'मंगल राशि' },
      budhRashi: { en: 'Mercury Sign', hi: 'बुध राशि' },
      guruRashi: { en: 'Jupiter Sign', hi: 'गुरु राशि' },
      shukraRashi: { en: 'Venus Sign', hi: 'शुक्र राशि' },
      shaniRashi: { en: 'Saturn Sign', hi: 'शनि राशि' },
      rahuRashi: { en: 'Rahu Sign', hi: 'राहु राशि' },
      ketuRashi: { en: 'Ketu Sign', hi: 'केतु राशि' },
      // Missing fields from console logs
      nakshatraLord: { en: 'Nakshatra Lord', hi: 'नक्षत्र स्वामी' },
      subLord: { en: 'Sub Lord', hi: 'उप स्वामी' },
      suryaNakshatra: { en: 'Sun Nakshatra', hi: 'सूर्य नक्षत्र' },
      suryaNakshatraSamay: { en: 'Sun Nakshatra Time', hi: 'सूर्य नक्षत्र समय' },
      yoga2: { en: 'Yoga 2', hi: 'योग 2' },
      karan2: { en: 'Karan 2', hi: 'करण 2' },
      englishDay: { en: 'English Day', hi: 'अंग्रेजी दिवस' },
      amantMaah: { en: 'Amant Month', hi: 'अमांत मास' },
      shaptrishiSamvat: { en: 'Shaptrishi Samvat', hi: 'शप्तऋषि संवत' },
      kaliSamvat: { en: 'Kali Samvat', hi: 'कलि संवत' },
      oldShaptrishiSamvat: { en: 'Old Shaptrishi Samvat', hi: 'पुराना शप्तऋषि संवत' },
      veerNirvanSamvat: { en: 'Veer Nirvan Samvat', hi: 'वीर निर्वाण संवत' },
      kalchuriSamvat: { en: 'Kalchuri Samvat', hi: 'कलचुरी संवत' },
      lodhiSamvat: { en: 'Lodhi Samvat', hi: 'लोदी संवत' },
      julianDay: { en: 'Julian Day', hi: 'जूलियन दिवस' },
      southSamvatsara: { en: 'South Samvatsara', hi: 'दक्षिण संवत्सर' },
      mulank: { en: 'Mulank', hi: 'मूलांक' },
      bhagyank: { en: 'Bhagyank', hi: 'भाग्यांक' },
    }
    
    // Determine language code
    const isHindi = language === 'hindi' || language === 'hi'
    const lang = isHindi ? 'hi' : 'en'
    
    // First try exact match
    if (translations[key] && translations[key][lang]) {
      return translations[key][lang]
    }
    
    // Try case-insensitive match
    const lowerKey = key.toLowerCase()
    for (const [transKey, transValue] of Object.entries(translations)) {
      if (transKey.toLowerCase() === lowerKey && transValue[lang]) {
        return transValue[lang]
      }
    }
    
    // Fallback: if Hindi is selected, try to provide a basic translation
    if (isHindi) {
      // Handle compound keys with Samay
      if (key.toLowerCase().includes('samay')) {
        // Try to find base key (remove Samay and numbers)
        const baseKey = key.replace(/[Ss]amay.*/g, '').replace(/2|3|4/g, '').trim()
        const suffix = key.match(/2|3|4/)?.[0] || ''
        
        // Check if base key exists in translations
        if (translations[baseKey]?.['hi']) {
          return `${translations[baseKey]['hi']} समय${suffix ? ' ' + suffix : ''}`
        }
        
        // Try camelCase variations (e.g., suryaNakshatra -> suryaNakshatra)
        const camelCaseBase = baseKey.charAt(0).toLowerCase() + baseKey.slice(1)
        if (translations[camelCaseBase]?.['hi']) {
          return `${translations[camelCaseBase]['hi']} समय${suffix ? ' ' + suffix : ''}`
        }
        
        // Try to translate parts (e.g., suryaNakshatraSamay -> surya + nakshatra + samay)
        if (baseKey.includes('Nakshatra') || baseKey.includes('nakshatra')) {
          const prefix = baseKey.replace(/[Nn]akshatra.*/g, '').trim()
          if (prefix && translations[prefix + 'Nakshatra']?.['hi']) {
            return `${translations[prefix + 'Nakshatra']['hi']} समय${suffix ? ' ' + suffix : ''}`
          }
          if (translations['nakshatra']?.['hi']) {
            const prefixTrans = translations[prefix]?.['hi'] || prefix
            return `${prefixTrans} ${translations['nakshatra']['hi']} समय${suffix ? ' ' + suffix : ''}`
          }
        }
        
        return capitalize(key.replace(/[Ss]amay/g, ' समय'))
      }
      
      // Handle Muhurat
      if (key.toLowerCase().includes('muhurat')) {
        return capitalize(key.replace(/[Mm]uhurat/g, ' मुहूर्त'))
      }
      
      // Handle Rashi
      if (key.toLowerCase().includes('rashi')) {
        return capitalize(key.replace(/[Rr]ashi/g, ' राशि'))
      }
      
      // Handle Maah/Maas
      if (key.toLowerCase().includes('maah') || key.toLowerCase().includes('maas')) {
        const baseKey = key.replace(/[Mm]aah|[Mm]aas.*/g, '').trim()
        if (translations[baseKey]?.['hi']) {
          return `${translations[baseKey]['hi']} मास`
        }
        return capitalize(key.replace(/[Mm]aah|[Mm]aas/g, ' मास'))
      }
      
      // Handle Samvat variations
      if (key.toLowerCase().includes('samvat')) {
        const baseKey = key.replace(/[Ss]amvat.*/g, '').trim()
        if (translations[baseKey + 'Samvat']?.['hi']) {
          return translations[baseKey + 'Samvat']['hi']
        }
        // Generic fallback
        return capitalize(key.replace(/[Ss]amvat/g, ' संवत'))
      }
      
      // Log missing translation for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing Hindi translation for field key: "${key}"`)
      }
      
      // For unknown keys, still return capitalized key (will be styled with Hindi font class)
      return capitalize(key)
    }
    
    // English fallback
    return capitalize(key)
  }

  return (
    <>
      <Header language={language} setLanguage={handleLanguageChange} />
      <CelebrityStrip language={language} />
      
      <main className="panchang-page-main">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="panchang-page-header"
          >
            <h1 className={`panchang-page-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? 'दैनिक पंचांग' : 'Daily Panchang'}
            </h1>
            <p className="panchang-page-subtitle">
              {language === 'hindi' 
                ? 'विवरणीय ज्योतिषीय जानकारी प्राप्त करें' 
                : 'Get detailed astrological information'}
            </p>
          </motion.div>

          {/* Input Selection Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="panchang-input-card"
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
                <div className="panchang-city-selector">
                  <input
                    type="text"
                    value={citySearchQuery}
                    onChange={(e) => setCitySearchQuery(e.target.value)}
                    onFocus={() => setShowCitySuggestions(true)}
                    placeholder={language === 'hindi' ? 'शहर खोजें...' : 'Search city...'}
                    className="panchang-city-input"
                  />
                  {showCitySuggestions && citySuggestions.length > 0 && (
                    <div className="panchang-city-suggestions">
                      {citySuggestions.map((city) => (
                        <div
                          key={city.id}
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
                  <div className="panchang-selected-location">
                    <span className={language === 'hindi' ? 'hindi' : ''}>
                      {language === 'hindi' ? 'चयनित:' : 'Selected:'} {selectedLocation.displayName || `${selectedLocation.name}, ${selectedLocation.state}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="panchang-page-loading">
              <div className="panchang-spinner"></div>
              <p className={language === 'hindi' ? 'hindi' : ''}>
                {language === 'hindi' ? 'पंचांग डेटा लोड हो रहा है...' : 'Loading panchang data...'}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="panchang-page-error">
              <p className={language === 'hindi' ? 'hindi' : ''}>
                {language === 'hindi' ? 'त्रुटि: ' : 'Error: '}{error}
              </p>
            </div>
          )}

          {/* Panchang Data Display */}
          {panchangData && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header Banner */}
              <div className="panchang-detail-banner">
                <div className="panchang-detail-banner-content">
                  <h3 className={`panchang-detail-banner-title ${language === 'hindi' ? 'hindi' : ''}`}>
                    {language === 'hindi' ? 'आज का पंचांग' : "Today's Panchang"}
                  </h3>
                  <p className={`panchang-detail-banner-text ${language === 'hindi' ? 'hindi' : ''}`}>
                    {panchangData.details?.purnimantMaah && `${panchangData.details.purnimantMaah}, `}
                    {panchangData.details?.paksha && `${panchangData.details.paksha}, `}
                    {panchangData.details?.tithi && `${panchangData.details.tithi}, `}
                    {panchangData.details?.hinduDay && `${panchangData.details.hinduDay}, `}
                    {panchangData.details?.nakshatra && panchangData.details.nakshatra}
                  </p>
                  {panchangData.details?.vikramSamvat && (
                    <p className="panchang-detail-banner-meta">
                      {language === 'hindi' ? 'विक्रम संवत:' : 'Vikram Samvat:'} {panchangData.details.vikramSamvat}
                    </p>
                  )}
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="panchang-detail-grid">
                {/* Left Column - Main Details */}
                <div className="panchang-detail-left">
                  {/* Top Details Card */}
                  <div className="panchang-detail-card">
                    <h4 className={`panchang-detail-card-title ${language === 'hindi' ? 'hindi' : ''}`}>
                      {language === 'hindi' ? 'मुख्य जानकारी' : 'Main Information'}
                    </h4>
                    <div className="panchang-detail-list">
                      {[
                        { key: 'tithi', label: language === 'hindi' ? 'तिथि' : 'Tithi', samay: 'tithiSamay' },
                        { key: 'paksha', label: language === 'hindi' ? 'पक्ष' : 'Paksha' },
                        { key: 'day', label: language === 'hindi' ? 'दिन' : 'Day' },
                        { key: 'solarMaah', label: language === 'hindi' ? 'सौर मास' : 'Solar Month' },
                        { key: 'nakshatra', label: language === 'hindi' ? 'नक्षत्र' : 'Nakshatra', samay: 'nakshatraSamay' },
                        { key: 'yoga', label: language === 'hindi' ? 'योग' : 'Yoga', samay: 'yogaSamay' },
                        { key: 'ayan', label: language === 'hindi' ? 'अयन' : 'Ayan' },
                        { key: 'rashi', label: language === 'hindi' ? 'राशि' : 'Rashi', samay: 'rashiSamay' },
                        { key: 'karan', label: language === 'hindi' ? 'करण' : 'Karan', samay: 'karanSamay' },
                        { key: 'sunSign', label: language === 'hindi' ? 'सूर्य राशि' : 'Sun Sign', altKey: 'suryaRashi' },
                        { key: 'moonSign', label: language === 'hindi' ? 'चंद्र राशि' : 'Moon Sign', altKey: 'chandraRashi' },
                      ].map(({ key, label, samay, altKey }) => {
                        const value = panchangData.details?.[key] || (altKey ? panchangData.details?.[altKey] : null)
                        const samayValue = samay ? panchangData.details?.[samay] : null
                        if (!value) return null
                        return (
                          <div key={key} className="panchang-detail-item">
                            <span className={`panchang-detail-label ${language === 'hindi' ? 'hindi' : ''}`}>
                              {label}:
                            </span>
                            <span className={`panchang-detail-value ${language === 'hindi' ? 'hindi' : ''}`}>
                              {capitalize(value)} {samayValue || ''}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Nakshatra Charan Section */}
                  {(panchangData.details?.padaSamay || panchangData.details?.padaSamay2 || panchangData.details?.padaSamay3 || panchangData.details?.padaSamay4) && (
                    <div className="panchang-detail-card">
                      <div className="panchang-nakshatra-charan-header">
                        <h4 className={`panchang-detail-card-title ${language === 'hindi' ? 'hindi' : ''}`}>
                          {language === 'hindi' ? 'नक्षत्र चरण' : 'Nakshatra Charan'}
                        </h4>
                      </div>
                      <div className="panchang-detail-list">
                        {[
                          { key: 'padaSamay', pada: 1 },
                          { key: 'padaSamay2', pada: 2 },
                          { key: 'padaSamay3', pada: 3 },
                          { key: 'padaSamay4', pada: 4 },
                        ].map(({ key, pada }) => {
                          const padaSamay = panchangData.details?.[key]
                          if (!padaSamay) return null
                          
                          const currentPada = (parseInt(panchangData.details?.pada || 1) + pada - 1) % 4 || 4
                          const nakshatraName = pada <= (5 - parseInt(panchangData.details?.pada || 1))
                            ? panchangData.details?.nakshatra
                            : panchangData.details?.nakshatra2 || panchangData.details?.nakshatra
                          
                          return (
                            <div key={key} className="panchang-detail-item">
                              <span className={`panchang-detail-label ${language === 'hindi' ? 'hindi' : ''}`}>
                                {capitalize(nakshatraName)} {language === 'hindi' ? 'चरण' : 'Charan'} {currentPada}:
                              </span>
                              <span className={`panchang-detail-value ${language === 'hindi' ? 'hindi' : ''}`}>
                                {padaSamay}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sun & Moon Times */}
                  <div className="panchang-detail-card">
                    <h4 className={`panchang-detail-card-title ${language === 'hindi' ? 'hindi' : ''}`}>
                      {language === 'hindi' ? 'सूर्य और चंद्र समय' : 'Sun & Moon Times'}
                    </h4>
                    <div className="panchang-detail-list">
                      {[
                        { key: 'sunrise', label: language === 'hindi' ? 'सूर्योदय' : 'Sunrise' },
                        { key: 'sunset', label: language === 'hindi' ? 'सूर्यास्त' : 'Sunset' },
                        { key: 'moonRise', label: language === 'hindi' ? 'चंद्रोदय' : 'Moonrise' },
                        { key: 'moonSet', label: language === 'hindi' ? 'चंद्रास्त' : 'Moonset' },
                        { key: 'dayDuration', label: language === 'hindi' ? 'दिन की अवधि' : 'Day Duration' },
                      ].map(({ key, label }) => {
                        const value = panchangData.details?.[key]
                        if (!value) return null
                        const displayValue = key === 'dayDuration' 
                          ? decimalToHHMM(value)
                          : formatTime(value)
                        return (
                          <div key={key} className="panchang-detail-item">
                            <span className={`panchang-detail-label ${language === 'hindi' ? 'hindi' : ''}`}>
                              {label}:
                            </span>
                            <span className={`panchang-detail-value ${language === 'hindi' ? 'hindi' : ''}`}>
                              {displayValue}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column - Additional Details */}
                <div className="panchang-detail-right">
                  <div className="panchang-detail-card">
                    <h4 className={`panchang-detail-card-title ${language === 'hindi' ? 'hindi' : ''}`}>
                      {language === 'hindi' ? 'अतिरिक्त जानकारी' : 'Additional Information'}
                    </h4>
                    <div className="panchang-detail-list">
                      {panchangData.details && (() => {
                        const additionalKeys = Object.keys(panchangData.details)
                          .filter(key => ![
                            'tithi', 'paksha', 'day', 'solarMaah', 'nakshatra', 'yoga', 'ayan', 'rashi', 'karan',
                            'tithiSamay', 'nakshatraSamay', 'yogaSamay', 'rashiSamay', 'karanSamay',
                            'sunrise', 'sunset', 'moonRise', 'moonSet', 'dayDuration',
                            'purnimantMaah', 'hinduDay', 'vikramSamvat', 'shakSamvat', 'gol', 'retu',
                            'sunSign', 'suryaRashi', 'moonSign', 'chandraRashi',
                            'pada', 'padaSamay', 'padaSamay2', 'padaSamay3', 'padaSamay4', 'nakshatra2'
                          ].includes(key))
                        
                        return additionalKeys.map(key => {
                          const value = panchangData.details[key]
                          if (!value || value === '' || value === null || value === undefined) return null
                          const fieldLabel = getFieldLabel(key)
                          
                          return (
                            <div key={key} className="panchang-detail-item">
                              <span className={`panchang-detail-label ${language === 'hindi' ? 'hindi' : ''}`}>
                                {fieldLabel}:
                              </span>
                              <span className={`panchang-detail-value ${language === 'hindi' ? 'hindi' : ''}`}>
                                {typeof value === 'string' ? capitalize(value) : value}
                              </span>
                            </div>
                          )
                        })
                      })()}
                    </div>
                  </div>
                </div>
              </div>
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

