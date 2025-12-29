import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import CelebrityStrip from '../components/CelebrityStrip'
import ServicesStrip from '../components/ServicesStrip'
import Footer from '../components/Footer'
import AppDownloadBanner from '../components/AppDownloadBanner'
import { fetchPoojas } from '../services/api'

const EPoojaPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const navigate = useNavigate()
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  
  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang)
    if (setLanguageProp) setLanguageProp(lang)
  }, [setLanguageProp])

  const [poojas, setPoojas] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadPoojas = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await fetchPoojas(currentPage)
        setPoojas(result.poojas || [])
        setTotalPages(result.pagination?.totalPages || 1)
      } catch (err) {
        setError(`Failed to load poojas: ${err.message}`)
        setPoojas([])
      } finally {
        setLoading(false)
      }
    }
    loadPoojas()
  }, [currentPage])

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
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

  return (
    <div className="app">
      <Header language={language} setLanguage={handleLanguageChange} />
      <CelebrityStrip language={language} />
      <ServicesStrip language={language} activeService="e-pooja" />

      <main className="epooja-page-main">
        <div className="container">
          <div className="epooja-page-header">
            <h1 className={`epooja-page-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? '🙏 ई-पूजा सेवाएं' : '🙏 E-Pooja Services'}
            </h1>
            <p className="epooja-page-subtitle">
              {language === 'hindi' 
                ? 'दिव्य पूजा सेवाओं में भाग लें और आशीर्वाद प्राप्त करें' 
                : 'Participate in divine pooja services and receive blessings'}
            </p>
          </div>

          {loading ? (
            <div className="epooja-loading">
              <div className="epooja-loader"></div>
              <p>{language === 'hindi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
            </div>
          ) : error ? (
            <div className="epooja-error">
              <p>⚠️ {error}</p>
            </div>
          ) : poojas.length === 0 ? (
            <div className="epooja-empty">
              <p>{language === 'hindi' ? 'कोई पूजा उपलब्ध नहीं' : 'No poojas available'}</p>
            </div>
          ) : (
            <>
              <div className="epooja-grid">
                {poojas.map((pooja) => {
                  const imageUrl = pooja.image_url 
                    ? (pooja.image_url.startsWith('http') ? pooja.image_url : `https://jyotishvishwakosh.in${pooja.image_url}`)
                    : null
                  
                  return (
                    <Link 
                      key={pooja._id}
                      to={`/e-pooja/${pooja.slug}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div className="epooja-card-grid">
                        {/* Image Section */}
                        <div className="epooja-card-image-wrapper">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={pooja.title} 
                              className="epooja-card-image"
                              loading="lazy"
                            />
                          ) : (
                            <div className="epooja-card-image-placeholder">
                              <span style={{ fontSize: '48px' }}>🙏</span>
                            </div>
                          )}
                          {pooja.is_last_day && (
                            <div className="epooja-last-day-badge">
                              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Content Section */}
                        <div className="epooja-card-content">
                          {pooja.tagline && (
                            <p className="epooja-card-tagline">{pooja.tagline}</p>
                          )}
                          <h3 className={`epooja-card-title ${language === 'hindi' ? 'hindi' : ''}`}>
                            {pooja.title}
                          </h3>
                          {pooja.description && (
                            <p className="epooja-card-description">
                              {pooja.description.substring(0, 100)}...
                            </p>
                          )}
                          
                          {/* Rating */}
                          <div className="epooja-card-rating">
                            <div className="epooja-card-stars">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FFB800" stroke="#FFB800">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              ))}
                            </div>
                            <span className="epooja-card-rating-text">5.0</span>
                          </div>
                          
                          <div className="epooja-card-info">
                            {pooja.temple_location && (
                              <div className="epooja-card-location">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                  <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span>{pooja.temple_location}</span>
                              </div>
                            )}
                            {pooja.puja_date && (
                              <div className="epooja-card-date">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                  <line x1="16" y1="2" x2="16" y2="6" />
                                  <line x1="8" y1="2" x2="8" y2="6" />
                                  <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                <span>{formatDate(pooja.puja_date)}</span>
                              </div>
                            )}
                          </div>

                          <div className="epooja-card-footer">
                            {pooja.price !== undefined && pooja.price > 0 && (
                              <span className="epooja-card-price">
                                ₹{pooja.price.toLocaleString()}
                              </span>
                            )}
                            <button
                              className="epooja-card-button"
                              onClick={(e) => {
                                e.preventDefault()
                                navigate('/order', { state: { category: 'pooja', productName: pooja.title, totalAmount: pooja.price } })
                              }}
                            >
                              {language === 'hindi' ? 'ऑर्डर करें →' : 'Order →'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="epooja-pagination">
                  <button
                    className="epooja-pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    {language === 'hindi' ? 'पिछला' : 'Previous'}
                  </button>
                  <span className="epooja-pagination-info">
                    {language === 'hindi' ? 'पृष्ठ' : 'Page'} {currentPage} {language === 'hindi' ? 'का' : 'of'} {totalPages}
                  </span>
                  <button
                    className="epooja-pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    {language === 'hindi' ? 'अगला' : 'Next'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <AppDownloadBanner language={language} />
      <Footer language={language} />
    </div>
  )
}

export default EPoojaPage

