import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import TodayMuhurat from './TodayMuhurat'
import PrashanYantra from './PrashanYantra'
import {
  fetchJyotishChart,
  fetchPopularCities,
  searchCities
} from '../services/api'

const AIJyotishSection = ({ language }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    birthDate: '',
    birthTime: '',
    timePeriod: 'AM',
    birthPlace: ''
  })

  const navigate = useNavigate()
  const [popularCities, setPopularCities] = useState([])
  const [cityResults, setCityResults] = useState([])
  const [selectedCity, setSelectedCity] = useState(null)
  const [cityLoading, setCityLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [error, setError] = useState('')
  const searchTimerRef = useRef(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'birthPlace') {
      handleCitySearch(value)
    }
  }

  const handleGenderSelect = (gender) => {
    setFormData(prev => ({ ...prev, gender }))
  }

  const handleTimePeriodSelect = (period) => {
    setFormData(prev => ({ ...prev, timePeriod: period }))
  }

  useEffect(() => {
    const loadPopular = async () => {
      const cities = await fetchPopularCities()
      setPopularCities(cities || [])
    }
    loadPopular()
  }, [])

  const handleCitySearch = (value) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    if (!value || value.length < 2) {
      setCityResults([])
      return
    }
    searchTimerRef.current = setTimeout(async () => {
      setCityLoading(true)
      const cities = await searchCities(value, 8)
      setCityResults(cities || [])
      setCityLoading(false)
    }, 300)
  }

  const handleCitySelect = (city) => {
    setSelectedCity(city)
    setFormData(prev => ({ ...prev, birthPlace: city.displayName || city.name || '' }))
    setCityResults([])
  }

  const formatTime24 = useMemo(() => {
    return (timeStr, period) => {
      if (!timeStr) return ''
      const [rawH, rawM] = timeStr.split(':')
      let h = parseInt(rawH || '0', 10)
      const m = rawM || '00'
      if (period === 'PM' && h < 12) h += 12
      if (period === 'AM' && h === 12) h = 0
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setPrediction(null)

    if (!formData.birthDate || !formData.birthTime || !selectedCity) {
      setError(language === 'hindi' ? 'कृपया सभी अनिवार्य विवरण भरें' : 'Please fill all required details.')
      return
    }

    try {
      setSubmitLoading(true)
      const timeOfBirth = formatTime24(formData.birthTime, formData.timePeriod)
      const payload = {
        fullName: formData.name,
        dateOfBirth: formData.birthDate,
        timeOfBirth,
        locationId: selectedCity.id || selectedCity._id || selectedCity.id
      }
      const result = await fetchJyotishChart(payload)
      setPrediction(result)
      // persist in session for direct page access
      sessionStorage.setItem('jyotish_report', JSON.stringify(result))
      navigate('/jyotish-report', { state: { report: result } })
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSubmitLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const columnVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 80, damping: 15 }
    }
  }

  return (
    <motion.section 
      id="ai-jyotish" 
      className="ai-jyotish-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <div className="container">
        <motion.h2 
          className={`ai-jyotish-main-title ${language === 'hindi' ? 'hindi' : ''}`}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {language === 'hindi' ? '🤖 AI ज्योतिष सेवाएं' : '🤖 AI Jyotish Services'}
        </motion.h2>

        <div className="ai-jyotish-grid">
          {/* Column 1: AI Jyotish Prediction Form */}
          <motion.div 
            className="ai-jyotish-column"
            variants={columnVariants}
          >
            <div className="ai-prediction-card">
              <div className="ai-prediction-header">
                <h3 className="ai-prediction-title">
                  {language === 'hindi' ? 'Enter Details for ' : 'Enter Details for '}
                  <span className="free">FREE</span>
                  {language === 'hindi' ? ' PREDICTION' : ' PREDICTION'}
                </h3>
              </div>

              <form className="ai-prediction-form" onSubmit={handleSubmit}>
                {/* Name Field */}
                <div className="form-group">
                  <label className="form-label">{language === 'hindi' ? 'नाम' : 'Name'}</label>
                  <div className="form-input-wrapper">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={language === 'hindi' ? 'अपना नाम दर्ज करें' : 'Enter Your Name'}
                      className="form-input"
                      required
                    />
                    <svg className="form-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                </div>

                {/* Gender Field */}
                <div className="form-group">
                  <label className="form-label">{language === 'hindi' ? 'लिंग' : 'Gender'}</label>
                  <div className="gender-options">
                    <motion.button
                      type="button"
                      className={`gender-option ${formData.gender === 'male' ? 'active' : ''}`}
                      onClick={() => handleGenderSelect('male')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>{language === 'hindi' ? 'पुरुष' : 'Male'}</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2v20M2 12h20" stroke="white" strokeWidth="2" />
                      </svg>
                    </motion.button>
                    <motion.button
                      type="button"
                      className={`gender-option ${formData.gender === 'female' ? 'active' : ''}`}
                      onClick={() => handleGenderSelect('female')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>{language === 'hindi' ? 'महिला' : 'Female'}</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v8M8 12h8" stroke="white" strokeWidth="2" />
                      </svg>
                    </motion.button>
                  </div>
                </div>

                {/* Birth Date Field */}
                <div className="form-group">
                  <label className="form-label">{language === 'hindi' ? 'जन्म तिथि' : 'Birth Date'}</label>
                  <div className="form-input-wrapper">
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      placeholder="YYYY-MM-DD"
                      className="form-input"
                      required
                    />
                    <svg className="form-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                </div>

                {/* Birth Time Field */}
                <div className="form-group">
                  <label className="form-label">{language === 'hindi' ? 'जन्म समय' : 'Birth Time'}</label>
                  <div className="time-input-group">
                    <div className="form-input-wrapper time-input">
                      <input
                        type="time"
                        name="birthTime"
                        value={formData.birthTime}
                        onChange={handleInputChange}
                        placeholder="HH : MM"
                        className="form-input"
                        required
                      />
                      <svg className="form-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div className="time-period-options">
                      <motion.button
                        type="button"
                        className={`time-period-option ${formData.timePeriod === 'AM' ? 'active' : ''}`}
                        onClick={() => handleTimePeriodSelect('AM')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>AM</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="5" />
                          <line x1="12" y1="1" x2="12" y2="3" />
                          <line x1="12" y1="21" x2="12" y2="23" />
                          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                          <line x1="1" y1="12" x2="3" y2="12" />
                          <line x1="21" y1="12" x2="23" y2="12" />
                          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                      </motion.button>
                      <motion.button
                        type="button"
                        className={`time-period-option ${formData.timePeriod === 'PM' ? 'active' : ''}`}
                        onClick={() => handleTimePeriodSelect('PM')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>PM</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Birth Place Field */}
                <div className="form-group">
                  <label className="form-label">{language === 'hindi' ? 'जन्म स्थान' : 'Birth Place'}</label>
                  <div className="form-input-wrapper">
                    <input
                      type="text"
                      name="birthPlace"
                      value={formData.birthPlace}
                      onChange={handleInputChange}
                      placeholder={language === 'hindi' ? 'टाइप करना शुरू करें, फिर सूची से निकटतम स्थान चुनें' : 'Start Typing, then choose nearest place from list'}
                      className="form-input"
                      required
                    />
                    <svg className="form-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  {cityLoading && (
                    <div className="city-hint">{language === 'hindi' ? 'खोज हो रही है...' : 'Searching...'}</div>
                  )}
                  {cityResults.length > 0 && (
                    <div className="city-dropdown">
                      {cityResults.map(city => (
                        <button
                          key={city.id || city._id}
                          type="button"
                          className="city-option"
                          onClick={() => handleCitySelect(city)}
                        >
                          {city.displayName || city.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <motion.button
                  type="submit"
                  className="ai-prediction-submit-btn"
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(255, 107, 53, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  disabled={submitLoading}
                >
                  {submitLoading
                    ? (language === 'hindi' ? 'लोड हो रहा है...' : 'Loading...')
                    : (language === 'hindi' ? 'मुफ्त भविष्यवाणी प्राप्त करें' : 'Get FREE Prediction')}
                </motion.button>

                {error && (
                  <div className="ai-error">
                    {error}
                  </div>
                )}
              </form>

              {prediction && (
                <div className="ai-prediction-result">
                  <h4 className="ai-result-title">
                    {language === 'hindi' ? 'आपकी ज्योतिष रिपोर्ट' : 'Your Jyotish Report'}
                  </h4>
                  <div className="ai-result-grid">
                    {prediction.ascendant?.sign && (
                      <div className="ai-result-item">
                        <span className="ai-result-label">{language === 'hindi' ? 'लग्न' : 'Ascendant'}</span>
                        <span className="ai-result-value">{prediction.ascendant.sign}</span>
                      </div>
                    )}
                    {prediction.birthDetails?.date && (
                      <div className="ai-result-item">
                        <span className="ai-result-label">{language === 'hindi' ? 'जन्म तिथि' : 'Birth Date'}</span>
                        <span className="ai-result-value">{prediction.birthDetails.date}</span>
                      </div>
                    )}
                    {prediction.location?.displayName && (
                      <div className="ai-result-item">
                        <span className="ai-result-label">{language === 'hindi' ? 'स्थान' : 'Location'}</span>
                        <span className="ai-result-value">{prediction.location.displayName}</span>
                      </div>
                    )}
                    {prediction.predictions?.careerAnalysis?.overallCareerProfile && (
                      <div className="ai-result-block">
                        <span className="ai-result-label">{language === 'hindi' ? 'कैरियर' : 'Career'}</span>
                        <p className="ai-result-text">
                          {prediction.predictions.careerAnalysis.overallCareerProfile}
                        </p>
                      </div>
                    )}
                    {prediction.predictions?.marriageAnalysis?.marriageProspects?.likelihood && (
                      <div className="ai-result-block">
                        <span className="ai-result-label">{language === 'hindi' ? 'विवाह संभावना' : 'Marriage Likelihood'}</span>
                        <p className="ai-result-text">
                          {prediction.predictions.marriageAnalysis.marriageProspects.likelihood}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Column 2: Today's Muhurat */}
          <motion.div 
            className="ai-jyotish-column"
            variants={columnVariants}
          >
            <TodayMuhurat language={language} />
          </motion.div>

          {/* Column 3: Prashan Yantra */}
          <motion.div 
            className="ai-jyotish-column"
            variants={columnVariants}
          >
            <PrashanYantra language={language} />
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

export default AIJyotishSection

