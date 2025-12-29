import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import CelebrityStrip from '../components/CelebrityStrip'
import ServicesStrip from '../components/ServicesStrip'

const NumerologyReportPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  const [report, setReport] = useState(location.state?.report || null)
  const [showLoading, setShowLoading] = useState(true)

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    if (setLanguageProp) setLanguageProp(lang)
  }

  useEffect(() => {
    if (!report) {
      const stored = sessionStorage.getItem('numerology_report')
      if (stored) {
        try {
          setReport(JSON.parse(stored))
        } catch {
          // ignore parse error
        }
      }
    }
  }, [report])

  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const goHome = () => navigate('/')

  const personal = report?.personalDetails || {}
  const nr = report?.numerologyReport || {}
  const insights = report?.enhancedInsights || {}
  const compatibility = report?.compatibility || null

  if (showLoading) {
    return (
      <div className="jyotish-loading-overlay">
        <div className="jyotish-loading-content">
          <div className="jyotish-loading-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#FF6B35" strokeWidth="0.5" opacity="0.2"/>
              <circle cx="12" cy="12" r="10" stroke="url(#grad-num)" strokeWidth="2" strokeLinecap="round" strokeDasharray="60 30">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1.5s" repeatCount="indefinite"/>
              </circle>
              <defs>
                <linearGradient id="grad-num" x1="0%" y1="0%" x2="100%" y2="0%">
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
              ? 'कृपया यह विंडो बंद न करें जब तक रिपोर्ट तैयार न हो जाए।'
              : 'Please do not close this window until the report is ready.'}
          </p>
          <div className="jyotish-loading-progress">
            <div className="jyotish-loading-progress-bar" />
          </div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="app">
        <Header language={language} setLanguage={handleLanguageChange} />
        <CelebrityStrip language={language} />
        <main className="jyotish-report-empty-main">
          <div className="jyotish-report-empty-card">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#E0E0E0" strokeWidth="2"/>
              <path d="M12 8v4M12 16h.01" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h3>{language === 'hindi' ? 'रिपोर्ट नहीं मिली' : 'No Report Found'}</h3>
            <p>{language === 'hindi' ? 'कृपया होम पेज पर जाकर अपना विवरण भरें।' : 'Please fill your details on the home page first.'}</p>
            <button className="jyotish-report-home-btn" onClick={goHome}>
              {language === 'hindi' ? 'होम पर जाएं' : 'Go to Home'}
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <Header language={language} setLanguage={handleLanguageChange} />
      <CelebrityStrip language={language} />
      <ServicesStrip language={language} activeService="ai-ank" />

      <main className="jyotish-report-main">
        <div className="jyotish-report-container">
          {/* Hero */}
          <div className="jyotish-report-hero">
            <div className="jyotish-report-hero-content">
              <h1 className="jyotish-report-hero-title">
                {personal.fullName || (language === 'hindi' ? 'आपकी न्यूमरोलॉजी रिपोर्ट' : 'Your Numerology Report')}
              </h1>
              <div className="jyotish-report-hero-meta">
                {personal.dateOfBirth && (
                  <div className="jyotish-meta-item">
                    <span>{language === 'hindi' ? 'जन्म तिथि:' : 'DOB:'}</span>
                    <strong>{personal.dateOfBirth}</strong>
                  </div>
                )}
                {personal.age && (
                  <div className="jyotish-meta-item">
                    <span>{language === 'hindi' ? 'आयु:' : 'Age:'}</span>
                    <strong>{personal.age}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Numbers Snapshot */}
          <div className="jyotish-report-section">
            <div className="jyotish-section-header">
              <div className="jyotish-section-icon">🔢</div>
              <h2 className="jyotish-section-title">{language === 'hindi' ? 'मुख्य अंक' : 'Key Numbers'}</h2>
            </div>
            <div className="ai-numerology-numbers">
              {nr.mulank && (
                <div className="ai-num-card">
                  <div className="ai-num-label">Mulank</div>
                  <div className="ai-num-value">{nr.mulank.number}</div>
                  <p className="ai-num-meaning">{nr.mulank.meaning}</p>
                </div>
              )}
              {nr.bhagyank && (
                <div className="ai-num-card">
                  <div className="ai-num-label">Bhagyank</div>
                  <div className="ai-num-value">{nr.bhagyank.number}</div>
                  <p className="ai-num-meaning">{nr.bhagyank.meaning}</p>
                </div>
              )}
              {nr.nameNumber && (
                <div className="ai-num-card">
                  <div className="ai-num-label">{language === 'hindi' ? 'नाम अंक' : 'Name Number'}</div>
                  <div className="ai-num-value">{nr.nameNumber.number}</div>
                  <p className="ai-num-meaning">{nr.nameNumber.meaning}</p>
                </div>
              )}
            </div>
          </div>

          {/* Personality */}
          {insights.personalityProfile && (
            <div className="jyotish-report-section">
              <div className="jyotish-section-header">
                <div className="jyotish-section-icon">🧠</div>
                <h2 className="jyotish-section-title">{language === 'hindi' ? 'व्यक्तित्व' : 'Personality'}</h2>
              </div>
              <div className="ai-insight-section">
                <h3 className="ai-insight-title">{language === 'hindi' ? 'मूल सार' : 'Core Essence'}</h3>
                <p className="ai-insight-text">{insights.personalityProfile.coreEssence}</p>
                {insights.personalityProfile.uniqueGifts && insights.personalityProfile.uniqueGifts.length > 0 && (
                  <div className="ai-gifts-list">
                    {insights.personalityProfile.uniqueGifts.map((gift, i) => (
                      <span key={i} className="ai-gift-tag">{gift}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Career */}
          {insights.careerInsights && (
            <div className="jyotish-report-section">
              <div className="jyotish-section-header">
                <div className="jyotish-section-icon">💼</div>
                <h2 className="jyotish-section-title">{language === 'hindi' ? 'कैरियर' : 'Career'}</h2>
              </div>
              <div className="ai-insight-section">
                <h3 className="ai-insight-title">{language === 'hindi' ? 'कैरियर पथ' : 'Career Path'}</h3>
                <p className="ai-insight-text">{insights.careerInsights.naturalCareerPath}</p>
                {insights.careerInsights.careerBreakthroughs && insights.careerInsights.careerBreakthroughs.length > 0 && (
                  <ul className="ai-breakthrough-list">
                    {insights.careerInsights.careerBreakthroughs.map((bt, i) => (
                      <li key={i}><span className="breakthrough-icon">🌟</span>{bt}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Relationships */}
          {insights.relationshipInsights && (
            <div className="jyotish-report-section">
              <div className="jyotish-section-header">
                <div className="jyotish-section-icon">💕</div>
                <h2 className="jyotish-section-title">{language === 'hindi' ? 'संबंध' : 'Relationships'}</h2>
              </div>
              <div className="ai-insight-section">
                <h3 className="ai-insight-title">{language === 'hindi' ? 'प्रेम शैली' : 'Love Style'}</h3>
                <p className="ai-insight-text">{insights.relationshipInsights.loveStyle}</p>
                {insights.relationshipInsights.idealPartner && (
                  <div className="ai-ideal-partner">
                    <h4 className="ai-partner-title">{language === 'hindi' ? 'आदर्श साथी' : 'Ideal Partner'}</h4>
                    <p className="ai-partner-text">{insights.relationshipInsights.idealPartner.compatibility}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Amazing Predictions */}
          {insights.amazingPredictions && insights.amazingPredictions.length > 0 && (
            <div className="jyotish-report-section">
              <div className="jyotish-section-header">
                <div className="jyotish-section-icon">✨</div>
                <h2 className="jyotish-section-title">{language === 'hindi' ? 'विशेष भविष्यवाणियाँ' : 'Amazing Predictions'}</h2>
              </div>
              <ul className="ai-prediction-list">
                {insights.amazingPredictions.map((pred, i) => (
                  <li key={i}><span className="prediction-icon">✨</span>{pred}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Compatibility */}
          {compatibility && (
            <div className="jyotish-report-section">
              <div className="jyotish-section-header">
                <div className="jyotish-section-icon">🤝</div>
                <h2 className="jyotish-section-title">{language === 'hindi' ? 'संगति' : 'Compatibility'}</h2>
              </div>
              <div className="ai-compatibility-card">
                <h3 className="ai-compatibility-title">{language === 'hindi' ? 'हार्मनी स्कोर' : 'Harmony Score'}</h3>
                <div className="ai-compatibility-score">
                  <div className="score-label">{language === 'hindi' ? 'स्कोर' : 'Score'}</div>
                  <div className="score-value">{compatibility.compatibilityScore}%</div>
                </div>
                <p className="ai-compatibility-text">{compatibility.analysis}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default NumerologyReportPage

