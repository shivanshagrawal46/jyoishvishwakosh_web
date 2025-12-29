import React, { useState } from 'react'
import Header from '../components/Header'
import CelebrityStrip from '../components/CelebrityStrip'
import ServicesStrip from '../components/ServicesStrip'
import { calculateMulank } from '../services/api'

const MulankPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
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
    if (!date) {
      setError(language === 'hindi' ? 'कृपया जन्म तिथि दर्ज करें' : 'Please enter birth date')
      return
    }
    setError('')
    setResult(null)
    try {
      setLoading(true)
      const res = await calculateMulank(date)
      setResult(res)
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
            <div className="calc-hero-badge">🔢 Numerology</div>
            <h1 className={`calc-page-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? 'मूलांक कैलकुलेटर' : 'Mulank Calculator'}
            </h1>
            <p className="calc-page-subtitle">
              {language === 'hindi' 
                ? 'अपने जन्म तिथि से अपना मूलांक जानें' 
                : 'Discover your root number from your birth date'}
            </p>
          </div>

          <div className="calc-form-card">
            <form onSubmit={handleSubmit} className="calc-form">
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
                    <span>{language === 'hindi' ? 'गणना हो रही है...' : 'Calculating...'}</span>
                  </>
                ) : (
                  <span>{language === 'hindi' ? 'मूलांक प्राप्त करें' : 'Calculate Mulank'}</span>
                )}
              </button>
            </form>
          </div>

          {result && (
            <div className="calc-result-card">
              <div className="calc-result-header">
                <div className="calc-result-badge">✨ Your Result</div>
                <h2 className="calc-result-title">{result.description}</h2>
              </div>

              <div className="calc-result-number-section">
                <div className="calc-result-number-card">
                  <div className="result-number-label">Mulank</div>
                  <div className="result-number-value">{result.mulank}</div>
                </div>
              </div>

              <div className="calc-result-meaning">
                <h3 className="calc-result-meaning-title">Meaning & Significance</h3>
                <p className="calc-result-meaning-text">{result.meaning}</p>
              </div>

              {result.dateOfBirth && (
                <div className="calc-result-meta">
                  <span className="calc-meta-label">Date of Birth:</span>
                  <span className="calc-meta-value">{result.dateOfBirth}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default MulankPage
