import React, { useState } from 'react'
import Header from '../components/Header'
import CelebrityStrip from '../components/CelebrityStrip'
import ServicesStrip from '../components/ServicesStrip'
import { calculateCompleteNumerology } from '../services/api'
import { useNavigate } from 'react-router-dom'

const AiAnkPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const navigate = useNavigate()
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    if (setLanguageProp) setLanguageProp(lang)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !date) {
      setError(language === 'hindi' ? 'कृपया सभी फ़ील्ड भरें' : 'Please fill all fields')
      return
    }
    setError('')
    setResult(null)
    try {
      setLoading(true)
      const res = await calculateCompleteNumerology({ fullName: name, dateOfBirth: date })
      sessionStorage.setItem('numerology_report', JSON.stringify(res))
      navigate('/numerology-report', { state: { report: res } })
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <Header language={language} setLanguage={handleLanguageChange} />
      <CelebrityStrip language={language} />
      <ServicesStrip language={language} activeService="calculations" />

      <main className="calc-page-main">
        <div className="calc-page-container">
          <div className="calc-page-hero">
            <div className="calc-hero-badge">🤖 AI Powered</div>
            <h1 className={`calc-page-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? 'AI अंक ज्योतिष' : 'AI Numerology'}
            </h1>
            <p className="calc-page-subtitle">
              {language === 'hindi' 
                ? 'अपनी पूर्ण न्यूमरोलॉजी रिपोर्ट प्राप्त करें' 
                : 'Get your complete numerology report powered by AI'}
            </p>
          </div>

          <div className="calc-form-card">
            <form onSubmit={handleSubmit} className="calc-form">
              <div className="calc-form-group">
                <label className="calc-form-label">
                  {language === 'hindi' ? 'पूरा नाम' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="calc-form-input"
                  placeholder={language === 'hindi' ? 'अपना पूरा नाम दर्ज करें' : 'Enter your full name'}
                  disabled={loading}
                  required
                />
              </div>

              <div className="calc-form-group">
                <label className="calc-form-label">
                  {language === 'hindi' ? 'जन्म तिथि' : 'Date of Birth'}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="calc-form-input"
                  disabled={loading}
                  required
                />
              </div>

              {error && (
                <div className="calc-error-message">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              <button type="submit" className="calc-form-submit" disabled={loading}>
                {loading ? (
                  <>
                    <svg className="calc-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="60 30">
                        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                    <span>{language === 'hindi' ? 'रिपोर्ट तैयार हो रही है...' : 'Generating report...'}</span>
                  </>
                ) : (
                  <span>{language === 'hindi' ? 'पूर्ण रिपोर्ट प्राप्त करें' : 'Get Complete Report'}</span>
                )}
              </button>
            </form>
          </div>

          {loading && (
            <div className="jyotish-loading-overlay compact">
              <div className="jyotish-loading-content">
                <div className="jyotish-loading-icon">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#FF6B35" strokeWidth="0.5" opacity="0.2"/>
                    <circle cx="12" cy="12" r="10" stroke="url(#grad-ai)" strokeWidth="2" strokeLinecap="round" strokeDasharray="60 30">
                      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1.2s" repeatCount="indefinite"/>
                    </circle>
                    <defs>
                      <linearGradient id="grad-ai" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FF6B35"/>
                        <stop offset="100%" stopColor="#FF9A56"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h2 className="jyotish-loading-title">
                  {language === 'hindi' ? 'रिपोर्ट तैयार हो रही है' : 'Generating Report'}
                </h2>
                <p className="jyotish-loading-subtitle">
                  {language === 'hindi'
                    ? 'कृपया प्रतीक्षा करें, आपका न्यूमरोलॉजी विश्लेषण बन रहा है।'
                    : 'Please wait while we build your numerology analysis.'}
                </p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

export default AiAnkPage
