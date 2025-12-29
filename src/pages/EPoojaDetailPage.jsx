import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import CelebrityStrip from '../components/CelebrityStrip'
import ServicesStrip from '../components/ServicesStrip'
import Footer from '../components/Footer'
import AppDownloadBanner from '../components/AppDownloadBanner'
import { fetchPoojaBySlug } from '../services/api'

const EPoojaDetailPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  
  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang)
    if (setLanguageProp) setLanguageProp(lang)
  }, [setLanguageProp])

  const [pooja, setPooja] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [showFullDescription, setShowFullDescription] = useState(false)

  useEffect(() => {
    const loadPooja = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchPoojaBySlug(slug)
        setPooja(data)
      } catch (err) {
        setError(`Failed to load pooja: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }
    if (slug) {
      loadPooja()
    }
  }, [slug])

  // Countdown timer
  useEffect(() => {
    if (!pooja?.countdown_time) return

    const updateCountdown = () => {
      const now = new Date().getTime()
      const countdownDate = new Date(pooja.countdown_time).getTime()
      const distance = countdownDate - now

      if (distance < 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [pooja?.countdown_time])

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    })
  }

  const parseBenefits = (description) => {
    if (!description) return []
    const lines = description.split('\r\n').filter(line => line.trim())
    return lines.filter(line => line.includes('🔶') || line.includes('📿') || line.includes('🙏') || line.includes('🌿') || line.includes('🔔') || line.includes('🔱') || line.includes('🪔'))
  }

  if (loading) {
    return (
      <div className="app">
        <Header language={language} setLanguage={handleLanguageChange} />
        <CelebrityStrip language={language} />
        <div className="epooja-detail-loading">
          <div className="epooja-loader"></div>
          <p>{language === 'hindi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
        </div>
      </div>
    )
  }

  if (error || !pooja) {
    return (
      <div className="app">
        <Header language={language} setLanguage={handleLanguageChange} />
        <CelebrityStrip language={language} />
        <div className="epooja-detail-error">
          <p>⚠️ {error || (language === 'hindi' ? 'पूजा नहीं मिली' : 'Pooja not found')}</p>
          <button onClick={() => navigate('/e-pooja')}>
            {language === 'hindi' ? 'वापस जाएं' : 'Go Back'}
          </button>
        </div>
      </div>
    )
  }

  const imageUrl = pooja.image_url 
    ? (pooja.image_url.startsWith('http') ? pooja.image_url : `https://jyotishvishwakosh.in${pooja.image_url}`)
    : null

  const benefits = parseBenefits(pooja.description)

  return (
    <div className="app">
      <Header language={language} setLanguage={handleLanguageChange} />
      <CelebrityStrip language={language} />
      <ServicesStrip language={language} activeService="e-pooja" />

      <main className="epooja-detail-main">
        <div className="container">
          <div className="epooja-detail-layout">
            {/* Left Side - Image */}
            <div className="epooja-detail-image-section">
              <motion.div
                className="epooja-detail-image-wrapper"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={pooja.title} 
                    className="epooja-detail-image"
                  />
                ) : (
                  <div className="epooja-detail-image-placeholder">
                    <span style={{ fontSize: '120px' }}>🙏</span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Side - Details */}
            <div className="epooja-detail-content-section">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Title and Tagline */}
                <div className="epooja-detail-header">
                  {pooja.tagline && (
                    <p className="epooja-detail-tagline">{pooja.tagline}</p>
                  )}
                  <h1 className={`epooja-detail-title ${language === 'hindi' ? 'hindi' : ''}`}>
                    {pooja.title}
                  </h1>
                </div>

                {/* Location and Date */}
                <div className="epooja-detail-info">
                  {pooja.temple_location && (
                    <div className="epooja-detail-info-item">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{pooja.temple_location}</span>
                    </div>
                  )}
                  {pooja.puja_date && (
                    <div className="epooja-detail-info-item">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>
                        {formatTime(pooja.puja_date)}, {formatDate(pooja.puja_date)}
                        {pooja.puja_day && ` • ${pooja.puja_day}`}
                      </span>
                    </div>
                  )}
                  {pooja.total_slots !== undefined && (
                    <div className="epooja-detail-info-item">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>
                        {pooja.booked_count || 0} / {pooja.total_slots} {language === 'hindi' ? 'स्लॉट बुक' : 'slots booked'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="epooja-detail-rating">
                  <div className="epooja-detail-stars">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#FFB800" stroke="#FFB800">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <span className="epooja-detail-rating-text">5.0</span>
                  <span className="epooja-detail-rating-reviews">({language === 'hindi' ? 'समीक्षा पढ़ें' : 'Read Reviews'})</span>
                </div>

                {/* Price and Button */}
                <div className="epooja-detail-action">
                  {pooja.price !== undefined && pooja.price > 0 && (
                    <div className="epooja-detail-price">
                      <span className="epooja-price-label">{language === 'hindi' ? 'मूल्य' : 'Price'}</span>
                      <span className="epooja-price-value">₹{pooja.price.toLocaleString()}</span>
                    </div>
                  )}
                         <motion.button
                           className="epooja-detail-button"
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           onClick={() => {
                             navigate('/order', { state: { category: 'pooja', productName: pooja.title, totalAmount: pooja.price } })
                           }}
                         >
                           {language === 'hindi' ? 'ऑर्डर करें' : 'Order Now'}
                           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                             <path d="M5 12h14M12 5l7 7-7 7" />
                           </svg>
                         </motion.button>
                </div>

                {/* Description and Benefits */}
                {pooja.description && (
                  <div className="epooja-detail-description">
                    <h3 className="epooja-description-title">
                      {language === 'hindi' ? 'विवरण और लाभ' : 'Description and Benefits'}
                    </h3>
                    <div className={`epooja-description-content ${showFullDescription ? 'expanded' : ''}`}>
                      {pooja.description.split('\r\n').map((line, index) => (
                        <p key={index} className="epooja-description-line">
                          {line}
                        </p>
                      ))}
                    </div>
                    {pooja.description.length > 300 && (
                      <button
                        className="epooja-description-toggle"
                        onClick={() => setShowFullDescription(!showFullDescription)}
                      >
                        {showFullDescription 
                          ? (language === 'hindi' ? 'कम दिखाएं' : 'Show less')
                          : (language === 'hindi' ? 'अधिक दिखाएं' : 'Show more')
                        }
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <AppDownloadBanner language={language} />
      <Footer language={language} />
    </div>
  )
}

export default EPoojaDetailPage

