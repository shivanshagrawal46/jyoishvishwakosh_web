import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import CelebrityStrip from '../components/CelebrityStrip'
import ServicesStrip from '../components/ServicesStrip'

const JyotishReportPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
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
      const stored = sessionStorage.getItem('jyotish_report')
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

  const planets = useMemo(() => {
    if (!report?.planets) return []
    return Object.entries(report.planets).map(([name, data]) => ({ name, ...data }))
  }, [report])

  const houses = useMemo(() => {
    if (!report?.houseAnalysis) return []
    return Object.entries(report.houseAnalysis).map(([num, data]) => ({ num, ...data }))
  }, [report])

  if (showLoading) {
    return (
      <div className="jyotish-loading-overlay">
        <div className="jyotish-loading-content">
          <div className="jyotish-loading-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#FF6B35" strokeWidth="0.5" opacity="0.2"/>
              <circle cx="12" cy="12" r="10" stroke="url(#grad)" strokeWidth="2" strokeLinecap="round" strokeDasharray="60 30">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1.5s" repeatCount="indefinite"/>
              </circle>
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF6B35"/>
                  <stop offset="100%" stopColor="#FF9A56"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h2 className="jyotish-loading-title">
            Generating <span>Report</span>
          </h2>
          <p className="jyotish-loading-subtitle">
            Please do not close this window or refresh your browser<br/>
            before report generation is completed!
          </p>
          <ul className="jyotish-loading-steps">
            <li><span className="step-icon">✓</span> Analyzing Birth Details</li>
            <li><span className="step-icon">✓</span> Preparing All Charts</li>
            <li><span className="step-icon">✓</span> Analyzing All Charts</li>
            <li><span className="step-icon">⋯</span> Calculating Dasha Periods</li>
            <li><span className="step-icon">⋯</span> Analyzing Yogas & Doshas</li>
            <li><span className="step-icon">⋯</span> Generating Predictions</li>
          </ul>
          <div className="jyotish-loading-progress">
            <div className="jyotish-loading-progress-bar"></div>
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

  const birthDetails = report.birthDetails || {}
  const location_data = report.location || {}
  const ascendant = report.ascendant || {}
  const predictions = report.predictions || {}
  const nameAnalysis = report.nameAnalysis || null

  return (
    <div className="app">
      <Header language={language} setLanguage={handleLanguageChange} />
      <CelebrityStrip language={language} />
      <ServicesStrip language={language} activeService="ai-jyotish" />

      <main className="jyotish-report-main">
        <div className="jyotish-report-container">
          {/* Hero Section */}
          <div className="jyotish-report-hero">
            <div className="jyotish-report-hero-content">
              <h1 className="jyotish-report-hero-title">
                {birthDetails.name || 'Jyotish Analysis'}
              </h1>
              <div className="jyotish-report-hero-meta">
                <div className="jyotish-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>{birthDetails.date}</span>
                </div>
                <div className="jyotish-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>{birthDetails.time}</span>
                </div>
                <div className="jyotish-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{location_data.displayName || location_data.name}</span>
                </div>
                <div className="jyotish-meta-item ascendant-inline">
                  <span className="ascendant-label-inline">Ascendant:</span>
                  <span className="ascendant-value-inline">{ascendant.sign} ({ascendant.degree}°)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Career Analysis */}
          {predictions.careerAnalysis && (
            <div className="jyotish-report-section">
              <div className="jyotish-section-header">
                <div className="jyotish-section-icon">💼</div>
                <h2 className="jyotish-section-title">Career Destiny & Life Path</h2>
              </div>
              <div className="jyotish-career-card">
                <p className="jyotish-career-profile">{predictions.careerAnalysis.overallCareerProfile}</p>
                
                {predictions.careerAnalysis.naturalTalents && predictions.careerAnalysis.naturalTalents.length > 0 && (
                  <div className="jyotish-subsection">
                    <h3 className="jyotish-subsection-title">Your Natural Talents</h3>
                    <ul className="jyotish-talent-list">
                      {predictions.careerAnalysis.naturalTalents.map((talent, i) => (
                        <li key={i}><span className="talent-icon">✨</span>{talent}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {predictions.careerAnalysis.careerFields && (
                  <div className="jyotish-subsection">
                    <h3 className="jyotish-subsection-title">Recommended Career Fields</h3>
                    <div className="jyotish-career-fields">
                      {predictions.careerAnalysis.careerFields.primary && predictions.careerAnalysis.careerFields.primary.map((field, i) => (
                        <span key={i} className="career-field primary">{field}</span>
                      ))}
                      {predictions.careerAnalysis.careerFields.secondary && predictions.careerAnalysis.careerFields.secondary.map((field, i) => (
                        <span key={i} className="career-field secondary">{field}</span>
                      ))}
                    </div>
                  </div>
                )}

                {predictions.careerAnalysis.careerBreakthroughs && predictions.careerAnalysis.careerBreakthroughs.length > 0 && (
                  <div className="jyotish-subsection">
                    <h3 className="jyotish-subsection-title">Career Breakthroughs</h3>
                    <ul className="jyotish-breakthrough-list">
                      {predictions.careerAnalysis.careerBreakthroughs.map((bt, i) => (
                        <li key={i}><span className="breakthrough-icon">🌟</span>{bt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Marriage Analysis */}
          {predictions.marriageAnalysis && (
            <div className="jyotish-report-section">
              <div className="jyotish-section-header">
                <div className="jyotish-section-icon">💕</div>
                <h2 className="jyotish-section-title">Marriage & Life Partner</h2>
              </div>
              <div className="jyotish-marriage-card">
                {predictions.marriageAnalysis.marriageProspects && (
                  <>
                    <div className="jyotish-marriage-likelihood">
                      <div className="likelihood-label">Marriage Likelihood</div>
                      <div className="likelihood-value">{predictions.marriageAnalysis.marriageProspects.likelihood}</div>
                    </div>
                    
                    {predictions.marriageAnalysis.marriageProspects.timing && (
                      <div className="jyotish-subsection">
                        <h3 className="jyotish-subsection-title">Marriage Timing</h3>
                        <p className="jyotish-marriage-timing">
                          <strong>Age Range:</strong> {predictions.marriageAnalysis.marriageProspects.timing.ageRange}
                        </p>
                        {predictions.marriageAnalysis.marriageProspects.timing.specificYears && (
                          <div className="jyotish-specific-years">
                            {predictions.marriageAnalysis.marriageProspects.timing.specificYears.map((year, i) => (
                              <div key={i} className="year-card">
                                <div className="year-value">{year.year}</div>
                                <div className="year-prob">{year.probability}% likely</div>
                                <div className="year-reason">{year.reason}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {predictions.marriageAnalysis.marriageProspects.meetingStory && (
                      <div className="jyotish-subsection">
                        <h3 className="jyotish-subsection-title">How You'll Meet</h3>
                        <p className="jyotish-meeting-story">{predictions.marriageAnalysis.marriageProspects.meetingStory}</p>
                      </div>
                    )}
                  </>
                )}

                {predictions.marriageAnalysis.spouseCharacteristics && (
                  <div className="jyotish-subsection">
                    <h3 className="jyotish-subsection-title">Spouse Characteristics</h3>
                    
                    {predictions.marriageAnalysis.spouseCharacteristics.physicalAppearance && (
                      <div className="spouse-detail-card">
                        <h4 className="spouse-detail-title">Physical Appearance</h4>
                        <div className="spouse-detail-grid">
                          <div className="spouse-detail-item">
                            <span className="detail-label">Height</span>
                            <span className="detail-value">{predictions.marriageAnalysis.spouseCharacteristics.physicalAppearance.height}</span>
                          </div>
                          <div className="spouse-detail-item">
                            <span className="detail-label">Complexion</span>
                            <span className="detail-value">{predictions.marriageAnalysis.spouseCharacteristics.physicalAppearance.complexion}</span>
                          </div>
                          <div className="spouse-detail-item">
                            <span className="detail-label">Features</span>
                            <span className="detail-value">{predictions.marriageAnalysis.spouseCharacteristics.physicalAppearance.features}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {predictions.marriageAnalysis.spouseCharacteristics.personality && (
                      <div className="spouse-detail-card">
                        <h4 className="spouse-detail-title">Personality</h4>
                        <p className="spouse-personality-desc">{predictions.marriageAnalysis.spouseCharacteristics.personality.nature}</p>
                        {predictions.marriageAnalysis.spouseCharacteristics.personality.interests && (
                          <div className="spouse-interests">
                            {predictions.marriageAnalysis.spouseCharacteristics.personality.interests.map((interest, i) => (
                              <span key={i} className="interest-tag">{interest}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {predictions.marriageAnalysis.amazingPredictions && predictions.marriageAnalysis.amazingPredictions.length > 0 && (
                  <div className="jyotish-subsection">
                    <h3 className="jyotish-subsection-title">Amazing Predictions</h3>
                    <ul className="jyotish-amazing-list">
                      {predictions.marriageAnalysis.amazingPredictions.map((pred, i) => (
                        <li key={i}><span className="amazing-icon">✨</span>{pred}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Name Analysis */}
          {nameAnalysis && (
            <div className="jyotish-report-section">
              <div className="jyotish-section-header">
                <div className="jyotish-section-icon">📝</div>
                <h2 className="jyotish-section-title">Name Analysis & Compatibility</h2>
              </div>
              <div className="jyotish-name-card">
                <div className="jyotish-name-header">
                  <div className="name-number-badge">
                    <div className="name-number-label">Name Number</div>
                    <div className="name-number-value">{nameAnalysis.nameNumber}</div>
                  </div>
                  <div className="name-score-badge">
                    <div className="name-score-label">Compatibility Score</div>
                    <div className="name-score-value">{nameAnalysis.overallScore}%</div>
                  </div>
                </div>
                
                {nameAnalysis.nakshatraCompatibility && (
                  <div className="jyotish-subsection">
                    <h3 className="jyotish-subsection-title">Nakshatra Compatibility</h3>
                    <div className={`compatibility-status ${nameAnalysis.nakshatraCompatibility.isCompatible ? 'compatible' : 'incompatible'}`}>
                      <span className="status-icon">{nameAnalysis.nakshatraCompatibility.isCompatible ? '✓' : '✗'}</span>
                      <span className="status-text">{nameAnalysis.nakshatraCompatibility.isCompatible ? 'Compatible' : 'Not Compatible'}</span>
                    </div>
                    <p className="compatibility-analysis">{nameAnalysis.nakshatraCompatibility.analysis}</p>
                  </div>
                )}

                {nameAnalysis.recommendations && nameAnalysis.recommendations.length > 0 && (
                  <div className="jyotish-subsection">
                    <h3 className="jyotish-subsection-title">Recommendations</h3>
                    <ul className="jyotish-recommendation-list">
                      {nameAnalysis.recommendations.map((rec, i) => (
                        <li key={i}><span className="rec-icon">💡</span>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Planetary Positions */}
          {planets.length > 0 && (
            <div className="jyotish-report-section">
              <div className="jyotish-section-header">
                <div className="jyotish-section-icon">🪐</div>
                <h2 className="jyotish-section-title">Planetary Positions</h2>
              </div>
              <div className="jyotish-planets-grid">
                {planets.map((planet) => (
                  <div key={planet.name} className="jyotish-planet-card">
                    <div className="planet-header">
                      <h3 className="planet-name">{planet.name}</h3>
                      {planet.retrograde && <span className="planet-retrograde-badge">R</span>}
                    </div>
                    <div className="planet-details">
                      <div className="planet-detail-row">
                        <span className="planet-label">Sign</span>
                        <span className="planet-value">{planet.sign}</span>
                      </div>
                      <div className="planet-detail-row">
                        <span className="planet-label">Degree</span>
                        <span className="planet-value">{planet.degree}°</span>
                      </div>
                      {planet.nakshatra && (
                        <div className="planet-detail-row">
                          <span className="planet-label">Nakshatra</span>
                          <span className="planet-value">{planet.nakshatra.name} ({planet.nakshatra.pada})</span>
                        </div>
                      )}
                      <div className="planet-detail-row">
                        <span className="planet-label">House</span>
                        <span className="planet-value">{planet.house}</span>
                      </div>
                      {planet.strength !== undefined && (
                        <div className="planet-strength-bar">
                          <div className="strength-label">Strength: {planet.strength}%</div>
                          <div className="strength-progress">
                            <div className="strength-fill" style={{width: `${planet.strength}%`}}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* House Analysis */}
          {houses.length > 0 && (
            <div className="jyotish-report-section">
              <div className="jyotish-section-header">
                <div className="jyotish-section-icon">🏠</div>
                <h2 className="jyotish-section-title">House Analysis</h2>
              </div>
              <div className="jyotish-houses-grid">
                {houses.map((house) => (
                  <div key={house.num} className="jyotish-house-card">
                    <div className="house-header">
                      <div className="house-number">{house.num}</div>
                      <h3 className="house-name">{house.name}</h3>
                    </div>
                    {house.lifeAreas && house.lifeAreas.length > 0 && (
                      <div className="house-life-areas">
                        {house.lifeAreas.map((area, i) => (
                          <span key={i} className="life-area-tag">{area}</span>
                        ))}
                      </div>
                    )}
                    {house.planets && house.planets.length > 0 && (
                      <div className="house-planets-list">
                        <h4 className="house-planets-title">Planets</h4>
                        {house.planets.map((p, i) => (
                          <div key={i} className="house-planet-item">{p.name} in {p.sign}</div>
                        ))}
                      </div>
                    )}
                    {house.analysis?.summary && (
                      <p className="house-analysis-summary">{house.analysis.summary}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remedies */}
          {report.remedies && (
            <div className="jyotish-report-section">
              <div className="jyotish-section-header">
                <div className="jyotish-section-icon">🙏</div>
                <h2 className="jyotish-section-title">Recommended Remedies</h2>
              </div>
              <div className="jyotish-remedies-card">
                {report.remedies.gemstones && report.remedies.gemstones.length > 0 && (
                  <div className="remedy-section">
                    <h3 className="remedy-title">Gemstones</h3>
                    <div className="remedy-chips">
                      {report.remedies.gemstones.map((gem, i) => (
                        <span key={i} className="remedy-chip gemstone">{gem}</span>
                      ))}
                    </div>
                  </div>
                )}
                {report.remedies.mantras && report.remedies.mantras.length > 0 && (
                  <div className="remedy-section">
                    <h3 className="remedy-title">Mantras</h3>
                    <div className="remedy-chips">
                      {report.remedies.mantras.map((mantra, i) => (
                        <span key={i} className="remedy-chip mantra">{mantra}</span>
                      ))}
                    </div>
                  </div>
                )}
                {report.remedies.colors && report.remedies.colors.length > 0 && (
                  <div className="remedy-section">
                    <h3 className="remedy-title">Lucky Colors</h3>
                    <div className="remedy-chips">
                      {report.remedies.colors.map((color, i) => (
                        <span key={i} className="remedy-chip color">{color}</span>
                      ))}
                    </div>
                  </div>
                )}
                {report.remedies.charitable && report.remedies.charitable.length > 0 && (
                  <div className="remedy-section">
                    <h3 className="remedy-title">Charitable Activities</h3>
                    <div className="remedy-chips">
                      {report.remedies.charitable.map((charity, i) => (
                        <span key={i} className="remedy-chip charity">{charity}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default JyotishReportPage
