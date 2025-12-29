import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAstroShopCategories } from '../services/api'

const AstroShop = ({ language }) => {
  const scrollRef = useRef(null)
  const autoScrollIntervalRef = useRef(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true)
        const result = await fetchAstroShopCategories()
        // Show all categories
        setCategories(result || [])
      } catch (error) {
        console.error('Error loading categories:', error)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    loadCategories()
  }, [])

  // Auto-scroll effect
  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer || categories.length === 0) return

    let scrollAmount = scrollContainer.scrollLeft || 0
    const cardWidth = 240
    const gap = 16
    const totalWidth = (cardWidth + gap) * categories.length
    let direction = 1

    const startAutoScroll = () => {
      autoScrollIntervalRef.current = setInterval(() => {
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
    }

    startAutoScroll()

    const handleMouseEnter = () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
        autoScrollIntervalRef.current = null
      }
    }

    const handleMouseLeave = () => {
      if (!autoScrollIntervalRef.current) {
        scrollAmount = scrollContainer.scrollLeft
        startAutoScroll()
      }
    }

    scrollContainer.addEventListener('mouseenter', handleMouseEnter)
    scrollContainer.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
      }
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter)
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [categories])

  const scrollLeft = () => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return
    
    // Pause auto-scroll temporarily
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current)
      autoScrollIntervalRef.current = null
    }
    
    const cardWidth = 240
    const gap = 16
    scrollContainer.scrollBy({
      left: -(cardWidth + gap),
      behavior: 'smooth'
    })
    
    // Resume auto-scroll after a delay
    setTimeout(() => {
      if (!autoScrollIntervalRef.current && scrollContainer) {
        let scrollAmount = scrollContainer.scrollLeft
        const totalWidth = (cardWidth + gap) * categories.length
        let direction = scrollAmount >= totalWidth - scrollContainer.clientWidth ? -1 : 1
        
        autoScrollIntervalRef.current = setInterval(() => {
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
      }
    }, 2000)
  }

  const scrollRight = () => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return
    
    // Pause auto-scroll temporarily
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current)
      autoScrollIntervalRef.current = null
    }
    
    const cardWidth = 240
    const gap = 16
    scrollContainer.scrollBy({
      left: cardWidth + gap,
      behavior: 'smooth'
    })
    
    // Resume auto-scroll after a delay
    setTimeout(() => {
      if (!autoScrollIntervalRef.current && scrollContainer) {
        let scrollAmount = scrollContainer.scrollLeft
        const totalWidth = (cardWidth + gap) * categories.length
        let direction = scrollAmount >= totalWidth - scrollContainer.clientWidth ? -1 : 1
        
        autoScrollIntervalRef.current = setInterval(() => {
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
      }
    }, 2000)
  }

  return (
    <section id="astroshop" className="astroshop-section">
      <div className="container">
        <div className="astroshop-header">
          <h2 className={`astroshop-title ${language === 'hindi' ? 'hindi' : ''}`}>
            {language === 'hindi' ? '🛍️ एस्ट्रो शॉप' : '🛍️ Astro Shop'}
          </h2>
          <Link to="/astroshop" className="astroshop-view-all">
            {language === 'hindi' ? 'सभी देखें →' : 'View All →'}
          </Link>
        </div>

        <div className="astroshop-scroll-container">
          <button 
            className="astroshop-nav-btn astroshop-nav-btn-prev"
            onClick={scrollLeft}
            aria-label="Previous"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          
          <div className="astroshop-scroll-wrapper" ref={scrollRef}>
            <div className="astroshop-cards-track">
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                {language === 'hindi' ? 'लोड हो रहा है...' : 'Loading...'}
              </div>
            ) : categories.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                {language === 'hindi' ? 'कोई श्रेणी उपलब्ध नहीं' : 'No categories available'}
              </div>
            ) : (
              categories.map((category) => {
                const imageUrl = category.image
                  ? (category.image.startsWith('http') ? category.image : `https://jyotishvishwakosh.in${category.image}`)
                  : null
                
                return (
                  <Link 
                    key={category._id}
                    to="/astroshop"
                    className="astroshop-card-link"
                  >
                    <div className="astroshop-card">
                      {/* Card Top with Image */}
                      <div className="astroshop-card-top">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={category.name}
                            className="astroshop-card-image"
                            loading="lazy"
                          />
                        ) : (
                          <div className="astroshop-card-image-placeholder">
                            <span>🛍️</span>
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="astroshop-card-body">
                        <h3 className={`astroshop-name ${language === 'hindi' ? 'hindi' : ''}`}>
                          {category.name}
                        </h3>

                        <button className="astroshop-book-btn">
                          {language === 'hindi' ? 'देखें →' : 'View →'}
                        </button>
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
            </div>
          </div>
          
          <button 
            className="astroshop-nav-btn astroshop-nav-btn-next"
            onClick={scrollRight}
            aria-label="Next"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

export default AstroShop

