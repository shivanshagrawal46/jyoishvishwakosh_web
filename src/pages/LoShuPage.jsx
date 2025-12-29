import React, { useState } from 'react'
import Header from '../components/Header'
import CelebrityStrip from '../components/CelebrityStrip'
import ServicesStrip from '../components/ServicesStrip'
import { calculateLoShu } from '../services/api'

const LoShuPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
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
      const res = await calculateLoShu(date)
      setResult(res)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const renderGrid = () => {
    if (!result) return null
    const grid = result.gridVisualization || result.grid
    if (!grid) return null

    const rows = Array.isArray(grid)
      ? grid
      : [
          [grid['1'], grid['2'], grid['3']],
          [grid['4'], grid['5'], grid['6']],
          [grid['7'], grid['8'], grid['9']]
        ]

    return (
      <div className="loshu-grid-container">
        {rows.map((row, i) => (
          <div key={i} className="loshu-grid-row">
            {row.map((cell, j) => (
              <div key={j} className={`loshu-grid-cell ${cell === '-' || cell === 0 ? 'empty' : 'filled'}`}>
                {cell !== '-' && cell !== 0 ? cell : ''}
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="app">
      <Header language={language} setLanguage={handleLanguageChange} />
      <CelebrityStrip language={language} />
      <ServicesStrip language={language} activeService="calculations" />

      <main className="calc-page-main">
        <div className="calc-page-container">
          <div className="calc-page-hero">
            <div className="calc-hero-badge">🔳 Lo Shu Grid</div>
            <h1 className={`calc-page-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? 'लो शू ग्रिड कैलकुलेटर' : 'Lo Shu Grid Calculator'}
            </h1>
            <p className="calc-page-subtitle">
              {language === 'hindi' 
                ? 'अपने जन्म तिथि से अपनी लो शू ग्रिड का विश्लेषण करें' 
                : 'Analyze your Lo Shu Grid from your birth date'}
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
                  <span>{language === 'hindi' ? 'ग्रिड प्राप्त करें' : 'Calculate Grid'}</span>
                )}
              </button>
            </form>
          </div>

          {result && (
            <div className="calc-result-card">
              <div className="calc-result-header">
                <div className="calc-result-badge">✨ Your Lo Shu Grid</div>
                <h2 className="calc-result-title">Your Numerological Blueprint</h2>
              </div>

              {renderGrid()}

              {result.analysis && (
                <>
                  {result.analysis.missingNumbers && result.analysis.missingNumbers.length > 0 && (
                    <div className="loshu-analysis-section">
                      <h3 className="loshu-analysis-title">Missing Numbers</h3>
                      <div className="loshu-number-chips">
                        {result.analysis.missingNumbers.map((num, i) => (
                          <span key={i} className="loshu-number-chip missing">{num}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.analysis.repeatedNumbers && result.analysis.repeatedNumbers.length > 0 && (
                    <div className="loshu-analysis-section">
                      <h3 className="loshu-analysis-title">Repeated Numbers</h3>
                      <div className="loshu-repeated-list">
                        {result.analysis.repeatedNumbers.map((item, i) => (
                          <div key={i} className="loshu-repeated-item">
                            <span className="repeated-number">{item.number}</span>
                            <span className="repeated-count">{item.count}x</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.analysis.planes && (
                    <div className="loshu-analysis-section">
                      <h3 className="loshu-analysis-title">Planes Analysis</h3>
                      <div className="loshu-planes-grid">
                        <div className="loshu-plane-card">
                          <div className="plane-label">Mental</div>
                          <div className="plane-value">{result.analysis.planes.mental}</div>
                        </div>
                        <div className="loshu-plane-card">
                          <div className="plane-label">Emotional</div>
                          <div className="plane-value">{result.analysis.planes.emotional}</div>
                        </div>
                        <div className="loshu-plane-card">
                          <div className="plane-label">Physical</div>
                          <div className="plane-value">{result.analysis.planes.physical}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {result.analysis.insights && result.analysis.insights.length > 0 && (
                    <div className="loshu-analysis-section">
                      <h3 className="loshu-analysis-title">Key Insights</h3>
                      <ul className="loshu-insights-list">
                        {result.analysis.insights.map((insight, i) => (
                          <li key={i}>
                            <span className="insight-icon">💡</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default LoShuPage
