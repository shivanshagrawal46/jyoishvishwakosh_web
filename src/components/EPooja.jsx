import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchPoojas } from '../services/api'

const EPooja = ({ language }) => {
  const scrollRef = useRef(null)
  const navigate = useNavigate()
  const [poojas, setPoojas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPoojas = async () => {
      try {
        setLoading(true)
        const result = await fetchPoojas(1)
        // Filter only is_last_day=true items
        const lastDayPoojas = result.poojas.filter(pooja => pooja.is_last_day === true)
        setPoojas(lastDayPoojas)
      } catch (error) {
        console.error('Error loading poojas:', error)
        setPoojas([])
      } finally {
        setLoading(false)
      }
    }
    loadPoojas()
  }, [])

  // Auto-scroll effect
  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer || poojas.length === 0) return

    let scrollAmount = 0
    const cardWidth = 240
    const gap = 16
    const totalWidth = (cardWidth + gap) * poojas.length
    let direction = 1

    const autoScroll = setInterval(() => {
      if (scrollContainer) {
        scrollAmount += direction * 0.6
        
        if (scrollAmount >= totalWidth - scrollContainer.clientWidth) {
          direction = -1
        } else if (scrollAmount <= 0) {
          direction = 1
        }
        
        scrollContainer.scrollLeft = scrollAmount
      }
    }, 30)

    const handleMouseEnter = () => clearInterval(autoScroll)
    scrollContainer.addEventListener('mouseenter', handleMouseEnter)
    
    return () => {
      clearInterval(autoScroll)
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [poojas])

  return (
    <section 
      id="epooja" 
      className="epooja-section"
    >
      <div className="container">
        <div className="epooja-header">
          <h2 className={`epooja-title ${language === 'hindi' ? 'hindi' : ''}`}>
            {language === 'hindi' ? '🙏 ई-पूजा सेवाएं' : '🙏 E-Pooja Services'}
          </h2>
          <Link to="/e-pooja" className="epooja-view-all">
            {language === 'hindi' ? 'सभी देखें →' : 'View All →'}
          </Link>
        </div>

        <div className="epooja-scroll-wrapper" ref={scrollRef}>
          <div className="epooja-cards-track">
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                {language === 'hindi' ? 'लोड हो रहा है...' : 'Loading...'}
              </div>
            ) : poojas.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                {language === 'hindi' ? 'कोई पूजा उपलब्ध नहीं' : 'No poojas available'}
              </div>
            ) : (
              poojas.map((pooja, index) => {
                const imageUrl = pooja.image_url 
                  ? (pooja.image_url.startsWith('http') ? pooja.image_url : `https://jyotishvishwakosh.in${pooja.image_url}`)
                  : null
                
                return (
                  <Link 
                    key={pooja._id}
                    to={`/e-pooja/${pooja.slug}`}
                    className="epooja-card-link"
                  >
                    <div className="epooja-card">
                    {/* Card Top with Image */}
                    <div className="epooja-card-top">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={pooja.title}
                          className="epooja-card-image"
                          loading="lazy"
                        />
                      ) : (
                        <div className="epooja-card-image-placeholder">
                          <span>🙏</span>
                        </div>
                      )}
                      {pooja.tagline && (
                        <div className="epooja-tag-banner">
                          {pooja.tagline}
                        </div>
                      )}
                      {pooja.is_last_day && (
                        <div className="epooja-date-badge">
                          {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="epooja-card-body">
                      <h3 className={`epooja-name ${language === 'hindi' ? 'hindi' : ''}`}>
                        {pooja.title}
                      </h3>
                      {pooja.description && (
                        <p className={`epooja-desc ${language === 'hindi' ? 'hindi' : ''}`}>
                          {pooja.description.substring(0, 80)}...
                        </p>
                      )}
                      
                      {/* Rating */}
                      <div className="epooja-rating">
                        <div className="epooja-stars">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FFB800" stroke="#FFB800">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          ))}
                        </div>
                        <span className="epooja-rating-text">5.0</span>
                      </div>
                      
                      <div className="epooja-meta">
                        {pooja.temple_location && (
                          <span className="epooja-location">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            {pooja.temple_location}
                          </span>
                        )}
                        {pooja.price !== undefined && (
                          <span className="epooja-price">
                            ₹{pooja.price.toLocaleString()}
                          </span>
                        )}
                      </div>

                            <button
                              className="epooja-book-btn"
                              onClick={(e) => {
                                e.preventDefault()
                                navigate('/order', { state: { category: 'pooja', productName: pooja.title, totalAmount: pooja.price } })
                              }}
                            >
                                {language === 'hindi' ? 'ऑर्डर करें →' : 'Order →'}
                            </button>
                    </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default EPooja
