import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import ServicesStrip from '../components/ServicesStrip'
import {
  fetchNumerologyDates,
  fetchNumerologyByDate,
  fetchNumerologyMonthsByYear,
  fetchNumerologyMonthContent,
  fetchNumerologyYearsMonthly,
  fetchNumerologyYearsYearly,
  fetchNumerologyYearContent
} from '../services/api'

const AnkFalPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
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
        const list = await fetchNumerologyDates()
        setDates(list)
        if (list.length > 0) {
          setSelectedDateId(list[0]._id || list[0].id)
        }
      } catch (err) {
        setError(err.message || 'Failed to load numerology dates')
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
        const data = await fetchNumerologyByDate(selectedDateId)
        setContentsWeekly(data)
      } catch (err) {
        setError(err.message || 'Failed to load numerology')
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
        const yrs = await fetchNumerologyYearsMonthly()
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
        setError('')
        const mlist = await fetchNumerologyMonthsByYear(selectedMonthYear)
        setMonths(mlist || [])
        if (mlist && mlist.length > 0) {
          setSelectedMonth(mlist[0].month || mlist[0].name || mlist[0].id)
        } else {
          setSelectedMonth(null)
          setContentsMonthly([])
        }
      } catch (err) {
        console.error('Error loading months:', err)
        setError(err.message || 'Failed to load months')
        setMonths([])
        setSelectedMonth(null)
      }
    }
    loadMonths()
  }, [selectedMonthYear])

  // Monthly content
  useEffect(() => {
    const loadMonthContent = async () => {
      if (!selectedMonthYear || !selectedMonth) {
        setContentsMonthly([])
        return
      }
      try {
        setLoading(true)
        setError('')
        const data = await fetchNumerologyMonthContent(selectedMonthYear, selectedMonth)
        setContentsMonthly(data || [])
      } catch (err) {
        console.error('Error loading monthly content:', err)
        setError(err.message || 'Failed to load monthly numerology')
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
        const yrs = await fetchNumerologyYearsYearly()
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
        const data = await fetchNumerologyYearContent(selectedYearlyYear)
        setContentsYearly(data)
      } catch (err) {
        setError(err.message || 'Failed to load yearly numerology')
        setContentsYearly([])
      } finally {
        setLoading(false)
      }
    }
    loadYearContent()
  }, [selectedYearlyYear])

  const numberMap = useMemo(() => [
    { num: 1, hi: 'अंक 1', emoji: '1️⃣', color: 'linear-gradient(135deg, var(--saffron-100) 0%, var(--saffron-50) 100%)' },
    { num: 2, hi: 'अंक 2', emoji: '2️⃣', color: 'linear-gradient(135deg, var(--surface-2) 0%, var(--page-2) 100%)' },
    { num: 3, hi: 'अंक 3', emoji: '3️⃣', color: 'linear-gradient(135deg, var(--gold-soft) 0%, var(--gold-soft) 100%)' },
    { num: 4, hi: 'अंक 4', emoji: '4️⃣', color: 'linear-gradient(135deg, var(--surface-2) 0%, var(--page-2) 100%)' },
    { num: 5, hi: 'अंक 5', emoji: '5️⃣', color: 'linear-gradient(135deg, var(--gold-soft) 0%, var(--gold-soft) 100%)' },
    { num: 6, hi: 'अंक 6', emoji: '6️⃣', color: 'linear-gradient(135deg, var(--surface-2) 0%, var(--page-2) 100%)' },
    { num: 7, hi: 'अंक 7', emoji: '7️⃣', color: 'linear-gradient(135deg, var(--saffron-100) 0%, var(--saffron-50) 100%)' },
    { num: 8, hi: 'अंक 8', emoji: '8️⃣', color: 'linear-gradient(135deg, var(--surface-2) 0%, var(--page-2) 100%)' },
    { num: 9, hi: 'अंक 9', emoji: '9️⃣', color: 'linear-gradient(135deg, var(--saffron-100) 0%, var(--saffron-50) 100%)' }
  ], [])

  const getNumberData = (title) => {
    if (!title) return numberMap[0]
    
    const normalizedTitle = title?.trim().toLowerCase()
    
    // Try to match various patterns: मूलांक-1, मूलांक 1, अंक 1, Ank 1, Number 1, etc.
    for (let i = 1; i <= 9; i++) {
      if (
        normalizedTitle?.includes(`मूलांक-${i}`) ||
        normalizedTitle?.includes(`मूलांक ${i}`) ||
        normalizedTitle?.includes(`अंक ${i}`) ||
        normalizedTitle?.includes(`अंक-${i}`) ||
        normalizedTitle?.includes(`ank ${i}`) ||
        normalizedTitle?.includes(`ank-${i}`) ||
        normalizedTitle?.includes(`number ${i}`) ||
        normalizedTitle?.includes(`number-${i}`) ||
        normalizedTitle?.match(new RegExp(`(moolank|mulank|mool ank|mul ank).*${i}`, 'i')) ||
        title?.includes(`मूलांक-${i}`) ||
        title?.includes(`मूलांक ${i}`) ||
        title?.includes(`अंक ${i}`) ||
        title?.includes(`अंक-${i}`) ||
        title?.includes(`Ank ${i}`) ||
        title?.includes(`Ank-${i}`) ||
        title?.includes(`Number ${i}`) ||
        title?.includes(`Number-${i}`)
      ) {
        return numberMap[i - 1]
      }
    }
    
    // Try to extract number from end of title (e.g., "Moolank 5" or "मूलांक 5")
    const numberMatch = normalizedTitle?.match(/(\d+)/)
    if (numberMatch) {
      const num = parseInt(numberMatch[1])
      if (num >= 1 && num <= 9) {
        return numberMap[num - 1]
      }
    }
    
    return numberMap[0]
  }

  const activeContents = view === 'weekly'
    ? contentsWeekly
    : view === 'monthly'
    ? contentsMonthly
    : contentsYearly

  return (
    <div className="app">
      <Header language={language} setLanguage={handleLanguageChange} />
      <ServicesStrip language={language} activeService="ank-fal" />

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
              Ank Fal
            </motion.div>
            <h1 className={`rashifal-page-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? 'आपका अंक फल' : 'Your Ank Fal'}
            </h1>
            <p className="rashifal-page-subtitle">
              {language === 'hindi'
                ? 'जानें अपने अंक के अनुसार भविष्य की हर बात'
                : 'Discover what numbers have in store for you'}
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
                      disabled={loading || months.length === 0}
                    >
                      {months.length === 0 ? (
                        <option value="">{language === 'hindi' ? 'लोड हो रहा है...' : 'Loading...'}</option>
                      ) : (
                        months.map((m) => (
                          <option key={m.month || m.name || m.id} value={m.month || m.name || m.id}>
                            {m.month || m.name || m.id}
                          </option>
                        ))
                      )}
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
                <p>{language === 'hindi' ? 'अंक फल लोड हो रहा है...' : 'Loading predictions...'}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {error && !loading && (
            <motion.div 
              className="rashifal-error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span className="error-icon"></span>
              <p>{error}</p>
            </motion.div>
          )}

          {!loading && !error && activeContents.length === 0 && view === 'monthly' && selectedMonth && (
            <motion.div 
              className="rashifal-error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span className="error-icon">ℹ</span>
              <p>{language === 'hindi' ? 'इस महीने के लिए कोई अंक फल उपलब्ध नहीं है' : 'No numerology predictions available for this month'}</p>
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
                  const numberData = getNumberData(title)
                  
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
                          style={{ 
                            background: numberData.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            color: 'var(--surface)',
                            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                        >
                          {numberData.num}
                        </motion.div>
                        <div className="rashifal-card-title-section">
                          <span className="rashifal-emoji">{numberData.emoji}</span>
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

export default AnkFalPage

