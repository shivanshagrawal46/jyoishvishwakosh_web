import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import CelebrityStrip from '../components/CelebrityStrip'
import ServicesStrip from '../components/ServicesStrip'
import {
  fetchRashifalDates,
  fetchRashifalByDate,
  fetchRashifalMonthsByYear,
  fetchRashifalMonthContent,
  fetchRashifalYearsMonthly,
  fetchRashifalYearsYearly,
  fetchRashifalYearContent
} from '../services/api'
import ariesImg from '../assets/icons/aries.jpeg'
import taurusImg from '../assets/icons/taurus.jpeg'
import geminiImg from '../assets/icons/gemini.jpeg'
import cancerImg from '../assets/icons/cancer.jpeg'
import leoImg from '../assets/icons/leo.jpeg'
import virgoImg from '../assets/icons/virgo.jpeg'
import libraImg from '../assets/icons/libra.jpeg'
import scorpioImg from '../assets/icons/scorpio.jpeg'
import sagittariusImg from '../assets/icons/sagittarius.jpeg'
import capricornImg from '../assets/icons/capricorn.jpeg'
import aquariusImg from '../assets/icons/aquarius.jpeg'
import piscesImg from '../assets/icons/pisces.jpeg'

const RashiFalPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  const [view, setView] = useState('weekly') // weekly, monthly, yearly
  const [dates, setDates] = useState([])
  const [selectedDateId, setSelectedDateId] = useState(null)
  const [contentsWeekly, setContentsWeekly] = useState([])
  const [monthsYears, setMonthsYears] = useState([])
  const [selectedMonthYear, setSelectedMonthYear] = useState(null)
  const [months, setMonths] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [contentsMonthly, setContentsMonthly] = useState([])
  const [yearlyYears, setYearlyYears] = useState([])
  const [selectedYearlyYear, setSelectedYearlyYear] = useState(null)
  const [contentsYearly, setContentsYearly] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    if (setLanguageProp) setLanguageProp(lang)
  }

  // Weekly dates and content
  useEffect(() => {
    const loadDates = async () => {
      try {
        setLoading(true)
        setError('')
        const list = await fetchRashifalDates()
        setDates(list)
        if (list.length > 0) {
          setSelectedDateId(list[0]._id || list[0].id)
        }
      } catch (err) {
        setError(err.message || 'Failed to load rashifal dates')
      } finally {
        setLoading(false)
      }
    }
    loadDates()
  }, [])

  useEffect(() => {
    const loadContent = async () => {
      if (!selectedDateId) return
      try {
        setLoading(true)
        setError('')
        const data = await fetchRashifalByDate(selectedDateId)
        setContentsWeekly(data)
      } catch (err) {
        setError(err.message || 'Failed to load rashifal')
        setContentsWeekly([])
      } finally {
        setLoading(false)
      }
    }
    loadContent()
  }, [selectedDateId])

  // Monthly years
  useEffect(() => {
    const loadYears = async () => {
      try {
        const yrs = await fetchRashifalYearsMonthly()
        setMonthsYears(yrs)
        if (yrs && yrs.length > 0) {
          setSelectedMonthYear(yrs[0]._id || yrs[0].id)
        }
      } catch (err) {
        console.error(err)
      }
    }
    loadYears()
  }, [])

  // Months for year
  useEffect(() => {
    const loadMonths = async () => {
      if (!selectedMonthYear) return
      try {
        setLoading(true)
        setError('')
        const mlist = await fetchRashifalMonthsByYear(selectedMonthYear)
        setMonths(mlist)
        if (mlist && mlist.length > 0) {
          setSelectedMonth(mlist[0].month || mlist[0].name || mlist[0].id)
        }
      } catch (err) {
        setError(err.message || 'Failed to load months')
      } finally {
        setLoading(false)
      }
    }
    loadMonths()
  }, [selectedMonthYear])

  // Monthly content
  useEffect(() => {
    const loadMonthContent = async () => {
      if (!selectedMonthYear || !selectedMonth) return
      try {
        setLoading(true)
        setError('')
        const data = await fetchRashifalMonthContent(selectedMonthYear, selectedMonth)
        setContentsMonthly(data)
      } catch (err) {
        setError(err.message || 'Failed to load monthly rashifal')
        setContentsMonthly([])
      } finally {
        setLoading(false)
      }
    }
    loadMonthContent()
  }, [selectedMonthYear, selectedMonth])

  // Yearly years
  useEffect(() => {
    const loadYearly = async () => {
      try {
        const yrs = await fetchRashifalYearsYearly()
        setYearlyYears(yrs)
        if (yrs && yrs.length > 0) {
          setSelectedYearlyYear(yrs[0]._id || yrs[0].id)
        }
      } catch (err) {
        console.error(err)
      }
    }
    loadYearly()
  }, [])

  // Yearly content
  useEffect(() => {
    const loadYearContent = async () => {
      if (!selectedYearlyYear) return
      try {
        setLoading(true)
        setError('')
        const data = await fetchRashifalYearContent(selectedYearlyYear)
        setContentsYearly(data)
      } catch (err) {
        setError(err.message || 'Failed to load yearly rashifal')
        setContentsYearly([])
      } finally {
        setLoading(false)
      }
    }
    loadYearContent()
  }, [selectedYearlyYear])

  const zodiacMap = useMemo(() => [
    { en: 'Aries', hi: 'मेष', img: ariesImg, emoji: '♈' },
    { en: 'Taurus', hi: 'वृषभ', img: taurusImg, emoji: '♉' },
    { en: 'Gemini', hi: 'मिथुन', img: geminiImg, emoji: '♊' },
    { en: 'Cancer', hi: 'कर्क', img: cancerImg, emoji: '♋' },
    { en: 'Leo', hi: 'सिंह', img: leoImg, emoji: '♌' },
    { en: 'Virgo', hi: 'कन्या', img: virgoImg, emoji: '♍' },
    { en: 'Libra', hi: 'तुला', img: libraImg, emoji: '♎' },
    { en: 'Scorpio', hi: 'वृश्चिक', img: scorpioImg, emoji: '♏' },
    { en: 'Sagittarius', hi: 'धनु', img: sagittariusImg, emoji: '♐' },
    { en: 'Capricorn', hi: 'मकर', img: capricornImg, emoji: '♑' },
    // Aquarius: handle both कुम्भ and कुंभ spellings
    { en: 'Aquarius', hi: 'कुम्भ', img: aquariusImg, emoji: '♒' },
    { en: 'Pisces', hi: 'मीन', img: piscesImg, emoji: '♓' }
  ], [])

  const getZodiacData = (title) => {
    const normalizedTitle = title?.trim().toLowerCase()
    return (
      zodiacMap.find(z => {
        const en = z.en.toLowerCase()
        const hi = z.hi
        return (
          normalizedTitle?.includes(en) ||
          normalizedTitle?.includes(hi) ||
          // Also match alternate Aquarius spelling कुंभ
          (z.en === 'Aquarius' && (normalizedTitle?.includes('कुंभ') || normalizedTitle?.includes('कुम्भ'))) ||
          title?.includes(hi) ||
          title?.includes(z.en)
        )
      }) || zodiacMap[0]
    )
  }

  const activeContents = view === 'weekly'
    ? contentsWeekly
    : view === 'monthly'
    ? contentsMonthly
    : contentsYearly

  return (
    <div className="app">
      <Header language={language} setLanguage={handleLanguageChange} />
      <CelebrityStrip language={language} />
      <ServicesStrip language={language} activeService="rashifal" />

      <main className="rashifal-page-main">
        <div className="rashifal-page-container">
          <motion.div 
            className="rashifal-page-hero"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="rashifal-hero-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              ✨ Rashifal
            </motion.div>
            <h1 className={`rashifal-page-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? 'आपका राशिफल' : 'Your Rashifal'}
            </h1>
            <p className="rashifal-page-subtitle">
              {language === 'hindi'
                ? 'जानें अपने भविष्य की हर बात'
                : 'Discover what the stars have in store for you'}
            </p>
            
            <motion.div 
              className="rashifal-tabs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                className={`rashifal-tab ${view === 'weekly' ? 'active' : ''}`}
                onClick={() => setView('weekly')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="tab-icon">📅</span>
                <span>{language === 'hindi' ? 'साप्ताहिक' : 'Weekly'}</span>
              </motion.button>
              <motion.button
                className={`rashifal-tab ${view === 'monthly' ? 'active' : ''}`}
                onClick={() => setView('monthly')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="tab-icon">🗓️</span>
                <span>{language === 'hindi' ? 'मासिक' : 'Monthly'}</span>
              </motion.button>
              <motion.button
                className={`rashifal-tab ${view === 'yearly' ? 'active' : ''}`}
                onClick={() => setView('yearly')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="tab-icon">📆</span>
                <span>{language === 'hindi' ? 'वार्षिक' : 'Yearly'}</span>
              </motion.button>
            </motion.div>
          </motion.div>

          <AnimatePresence mode="wait">
            {view === 'weekly' && dates.length > 0 && (
              <motion.div 
                className="rashifal-selector-card"
                key="weekly-selector"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="selector-group">
                  <label className="selector-label">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>{language === 'hindi' ? 'सप्ताह चुनें' : 'Select Week'}</span>
                  </label>
                  <select
                    className="selector-input"
                    value={selectedDateId || ''}
                    onChange={(e) => setSelectedDateId(e.target.value)}
                    disabled={loading}
                  >
                    {dates.map((d) => (
                      <option key={d._id || d.id} value={d._id || d.id}>
                        {d.dateLabel || d.dateISO || d.date || d.dateId}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {view === 'monthly' && monthsYears.length > 0 && (
              <motion.div 
                className="rashifal-selector-card"
                key="monthly-selector"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="selector-row">
                  <div className="selector-group">
                    <label className="selector-label">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      </svg>
                      <span>{language === 'hindi' ? 'वर्ष चुनें' : 'Select Year'}</span>
                    </label>
                    <select
                      className="selector-input"
                      value={selectedMonthYear || ''}
                      onChange={(e) => setSelectedMonthYear(e.target.value)}
                      disabled={loading}
                    >
                      {monthsYears.map((y) => (
                        <option key={y._id || y.id} value={y._id || y.id}>
                          {y.year || y.name || y.id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="selector-group">
                    <label className="selector-label">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span>{language === 'hindi' ? 'माह चुनें' : 'Select Month'}</span>
                    </label>
                    <select
                      className="selector-input"
                      value={selectedMonth || ''}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      disabled={loading}
                    >
                      {months.map((m) => (
                        <option key={m.month || m.name || m.id} value={m.month || m.name || m.id}>
                          {m.month || m.name || m.id}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {view === 'yearly' && yearlyYears.length > 0 && (
              <motion.div 
                className="rashifal-selector-card"
                key="yearly-selector"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="selector-group">
                  <label className="selector-label">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    </svg>
                    <span>{language === 'hindi' ? 'वर्ष चुनें' : 'Select Year'}</span>
                  </label>
                  <select
                    className="selector-input"
                    value={selectedYearlyYear || ''}
                    onChange={(e) => setSelectedYearlyYear(e.target.value)}
                    disabled={loading}
                  >
                    {yearlyYears.map((y) => (
                      <option key={y._id || y.id} value={y._id || y.id}>
                        {y.year || y.name || y.id}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {loading && (
              <motion.div 
                className="rashifal-loading"
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div 
                  className="loading-spinner"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  ✨
                </motion.div>
                <p>{language === 'hindi' ? 'राशिफल लोड हो रहा है...' : 'Loading predictions...'}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {error && !loading && (
            <motion.div 
              className="rashifal-error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {!loading && !error && activeContents.length > 0 && (
              <motion.div 
                className="rashifal-grid"
                key={view}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {activeContents.map((item, idx) => {
                  const title = language === 'hindi' ? item.title_hn || item.title_en : item.title_en || item.title_hn
                  const details = language === 'hindi' ? item.details_hn || item.details_en : item.details_en || item.details_hn
                  const zodiacData = getZodiacData(title)
                  
                  return (
                    <motion.div 
                      key={item._id || idx} 
                      className="rashifal-card"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: idx * 0.1, 
                        duration: 0.5,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ 
                        y: -8, 
                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      <div className="rashifal-card-header">
                        <motion.div 
                          className="rashifal-icon-circle"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <img 
                            src={zodiacData.img} 
                            alt={title} 
                            className="rashifal-icon-img"
                          />
                        </motion.div>
                        <div className="rashifal-card-title-section">
                          <span className="rashifal-emoji">{zodiacData.emoji}</span>
                          <h3 className={`rashifal-card-title ${language === 'hindi' ? 'hindi' : ''}`}>
                            {title}
                          </h3>
                        </div>
                      </div>
                      <div className="rashifal-card-content">
                        <p className="rashifal-card-details">
                          {details}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

export default RashiFalPage

