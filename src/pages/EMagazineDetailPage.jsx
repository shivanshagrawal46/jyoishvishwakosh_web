import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import CelebrityStrip from '../components/CelebrityStrip'
import ServicesStrip from '../components/ServicesStrip'
import Footer from '../components/Footer'
import AppDownloadBanner from '../components/AppDownloadBanner'
import { fetchEMagazineWriters } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const EMagazineDetailPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  
  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang)
    if (setLanguageProp) setLanguageProp(lang)
  }, [setLanguageProp])

  const [magazine, setMagazine] = useState(location.state?.magazine || null)
  const [writers, setWriters] = useState([])
  const [loading, setLoading] = useState(!magazine)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadWriters = async () => {
      try {
        const writersData = await fetchEMagazineWriters()
        setWriters(writersData || [])
      } catch (err) {
        console.error('Error loading writers:', err)
      }
    }
    loadWriters()
  }, [])

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      setError(language === 'hindi' ? 'कृपया पहले लॉगिन करें' : 'Please login first')
      setLoading(false)
      // Redirect to login or home after a delay
      setTimeout(() => {
        navigate('/emagazine')
      }, 2000)
      return
    }

    // If magazine is not in state, we'd need to fetch it by ID
    // For now, we'll use the state from navigation
    if (!magazine && id) {
      // Could implement fetch by ID here if API supports it
      setError('Magazine not found')
      setLoading(false)
    }
  }, [id, magazine, user, navigate, language])

  const getWriterImage = (writerName) => {
    const writer = writers.find(w => w.name === writerName)
    if (writer && writer.image) {
      return writer.image.startsWith('http') 
        ? writer.image 
        : `https://www.jyotishvishwakosh.in${writer.image}`
    }
    return null
  }

  if (loading) {
    return (
      <div className="app">
        <Header language={language} setLanguage={handleLanguageChange} />
        <CelebrityStrip language={language} />
        <ServicesStrip language={language} activeService="emagazine" />
        <main className="emagazine-detail-main">
          <div className="container">
            <div className="emagazine-detail-loading">
              <div className="emagazine-loader"></div>
              <p>{language === 'hindi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
            </div>
          </div>
        </main>
        <AppDownloadBanner language={language} />
        <Footer language={language} />
      </div>
    )
  }

  if (error || !magazine) {
    const isAuthError = error && (error.includes('लॉगिन') || error.includes('login'))
    
    return (
      <div className="app">
        <Header language={language} setLanguage={handleLanguageChange} />
        <CelebrityStrip language={language} />
        <ServicesStrip language={language} activeService="emagazine" />
        <main className="emagazine-detail-main">
          <div className="container">
            <div className="emagazine-detail-error">
              <p>⚠️ {error || (language === 'hindi' ? 'मैगजीन नहीं मिली' : 'Magazine not found')}</p>
              {isAuthError && (
                <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                  {language === 'hindi' ? 'आपको मैगजीन पढ़ने के लिए लॉगिन करना होगा' : 'You need to login to read the magazine'}
                </p>
              )}
              <button 
                className="emagazine-back-btn"
                onClick={() => navigate('/emagazine')}
              >
                {language === 'hindi' ? '← वापस' : '← Back'}
              </button>
            </div>
          </div>
        </main>
        <AppDownloadBanner language={language} />
        <Footer language={language} />
      </div>
    )
  }

  const writerImage = getWriterImage(magazine.writer)

  return (
    <div className="app">
      <Header language={language} setLanguage={handleLanguageChange} />
      <CelebrityStrip language={language} />
      <ServicesStrip language={language} activeService="emagazine" />

      <main className="emagazine-detail-main">
        <div className="container">
          <motion.button
            className="emagazine-back-btn"
            onClick={() => navigate('/emagazine')}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            ← {language === 'hindi' ? 'वापस मैगजीन सूची' : 'Back to Magazine List'}
          </motion.button>

          <motion.article
            className="emagazine-detail-article"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header Section */}
            <div className="emagazine-detail-header">
              <div className="emagazine-detail-writer-info">
                {writerImage ? (
                  <img 
                    src={writerImage} 
                    alt={magazine.writer} 
                    className="emagazine-detail-writer-image"
                  />
                ) : (
                  <div className="emagazine-detail-writer-placeholder">
                    <span>👤</span>
                  </div>
                )}
                <div className="emagazine-detail-writer-details">
                  <h3 className={`emagazine-detail-writer-name ${language === 'hindi' ? 'hindi' : ''}`}>
                    {magazine.writer}
                  </h3>
                  <div className="emagazine-detail-meta">
                    <span className="emagazine-detail-language">{magazine.language}</span>
                    <span className="emagazine-detail-date">
                      {magazine.month} {magazine.year}
                    </span>
                  </div>
                </div>
              </div>

              <div className="emagazine-detail-categories">
                <span className="emagazine-detail-category">{magazine.category}</span>
                <span className="emagazine-detail-subject">{magazine.subject}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className={`emagazine-detail-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {magazine.title}
            </h1>

            {/* Introduction */}
            {magazine.introduction && (
              <div 
                className="emagazine-detail-introduction"
                dangerouslySetInnerHTML={{ __html: magazine.introduction }}
              />
            )}

            {/* Sub Points */}
            {magazine.subPoints && (
              <div 
                className="emagazine-detail-subpoints"
                dangerouslySetInnerHTML={{ __html: magazine.subPoints }}
              />
            )}

            {/* Importance */}
            {magazine.importance && (
              <div 
                className="emagazine-detail-importance"
                dangerouslySetInnerHTML={{ __html: magazine.importance }}
              />
            )}

            {/* Explain */}
            {magazine.explain && (
              <div 
                className="emagazine-detail-explain"
                dangerouslySetInnerHTML={{ __html: magazine.explain }}
              />
            )}

            {/* Summary */}
            {magazine.summary && (
              <div 
                className="emagazine-detail-summary"
                dangerouslySetInnerHTML={{ __html: magazine.summary }}
              />
            )}

            {/* Reference */}
            {magazine.reference && (
              <div 
                className="emagazine-detail-reference"
                dangerouslySetInnerHTML={{ __html: magazine.reference }}
              />
            )}

            {/* Images */}
            {magazine.images && magazine.images.length > 0 && (
              <div className="emagazine-detail-images">
                {magazine.images.map((image, index) => (
                  <img 
                    key={index}
                    src={image.startsWith('http') ? image : `https://www.jyotishvishwakosh.in${image}`}
                    alt={`${magazine.title} - Image ${index + 1}`}
                    className="emagazine-detail-image"
                    loading="lazy"
                  />
                ))}
              </div>
            )}
          </motion.article>
        </div>
      </main>

      <AppDownloadBanner language={language} />
      <Footer language={language} />
    </div>
  )
}

export default EMagazineDetailPage

