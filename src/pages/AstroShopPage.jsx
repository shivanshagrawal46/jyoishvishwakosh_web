import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import CelebrityStrip from '../components/CelebrityStrip'
import ServicesStrip from '../components/ServicesStrip'
import Footer from '../components/Footer'
import AppDownloadBanner from '../components/AppDownloadBanner'
import { fetchAstroShopCategories, fetchAstroShopProducts } from '../services/api'

const AstroShopPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const navigate = useNavigate()
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  
  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang)
    if (setLanguageProp) setLanguageProp(lang)
  }, [setLanguageProp])

  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchAstroShopCategories()
        setCategories(data || [])
        if (data && data.length > 0) {
          setSelectedCategory(data[0])
        }
      } catch (err) {
        console.error('Error loading categories:', err)
      }
    }
    loadCategories()
  }, [])

  const [allProducts, setAllProducts] = useState([])

  // Fetch all products on mount
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        // Fetch all products (we'll filter by category client-side)
        const result = await fetchAstroShopProducts(1)
        setAllProducts(result.products || [])
      } catch (err) {
        setError(`Failed to load products: ${err.message}`)
        setAllProducts([])
      } finally {
        setLoading(false)
      }
    }
    loadAllProducts()
  }, [])

  // Filter products by selected category
  useEffect(() => {
    if (!selectedCategory || allProducts.length === 0) {
      setProducts([])
      return
    }
    
    const categoryId = selectedCategory._id
    const filtered = allProducts.filter(product => 
      product.category && product.category._id === categoryId
    )
    setProducts(filtered)
  }, [selectedCategory, allProducts])

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category)
  }, [])

  return (
    <div className="app">
      <Header language={language} setLanguage={handleLanguageChange} />
      <CelebrityStrip language={language} />
      <ServicesStrip language={language} activeService="astroshop" />

      <main className="astroshop-page-main">
        <div className="container">
          <div className="astroshop-page-header">
            <h1 className={`astroshop-page-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? '🛍️ एस्ट्रो शॉप' : '🛍️ Astro Shop'}
            </h1>
            <p className="astroshop-page-subtitle">
              {language === 'hindi' 
                ? 'दिव्य उत्पादों की खरीदारी करें और आशीर्वाद प्राप्त करें' 
                : 'Shop divine products and receive blessings'}
            </p>
          </div>

          {/* Categories Filter */}
          {categories.length > 0 && (
            <div className="astroshop-categories-filter">
              {categories.map((category) => {
                const categoryImageUrl = category.image
                  ? (category.image.startsWith('http') ? category.image : `https://jyotishvishwakosh.in${category.image}`)
                  : null
                
                return (
                  <button
                    key={category._id}
                    className={`astroshop-category-btn ${selectedCategory?._id === category._id ? 'active' : ''}`}
                    onClick={() => handleCategorySelect(category)}
                  >
                    {categoryImageUrl && (
                      <img src={categoryImageUrl} alt={category.name} className="astroshop-category-img" />
                    )}
                    <span>{category.name}</span>
                  </button>
                )
              })}
            </div>
          )}

          {loading ? (
            <div className="astroshop-loading">
              <div className="astroshop-loader"></div>
              <p>{language === 'hindi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
            </div>
          ) : error ? (
            <div className="astroshop-error">
              <p>⚠️ {error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="astroshop-empty">
              <p>{language === 'hindi' ? 'कोई उत्पाद उपलब्ध नहीं' : 'No products available'}</p>
            </div>
          ) : (
            <>
              <div className="astroshop-grid">
                {products.map((product) => {
                  const imageUrl = product.images && product.images.length > 0
                    ? (product.images[0].startsWith('http') ? product.images[0] : `https://jyotishvishwakosh.in${product.images[0]}`)
                    : null
                  
                  return (
                    <Link 
                      key={product._id}
                      to={`/astroshop/${product.slug}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div className="astroshop-card-grid">
                        {/* Image Section */}
                        <div className="astroshop-card-image-wrapper">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={product.title} 
                              className="astroshop-card-image"
                              loading="lazy"
                            />
                          ) : (
                            <div className="astroshop-card-image-placeholder">
                              <span style={{ fontSize: '48px' }}>🛍️</span>
                            </div>
                          )}
                          {product.discount_percentage && (
                            <div className="astroshop-last-day-badge">
                              {product.discount_percentage}% OFF
                            </div>
                          )}
                        </div>

                        {/* Content Section */}
                        <div className="astroshop-card-content">
                          {product.category && (
                            <p className="astroshop-card-tagline">{product.category.name}</p>
                          )}
                          <h3 className={`astroshop-card-title ${language === 'hindi' ? 'hindi' : ''}`}>
                            {product.title}
                          </h3>
                          {product.short_description && (
                            <p className="astroshop-card-description">
                              {product.short_description.substring(0, 80)}...
                            </p>
                          )}
                          
                          {/* Rating */}
                          <div className="astroshop-card-rating">
                            <div className="astroshop-card-stars">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FFB800" stroke="#FFB800">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              ))}
                            </div>
                            <span className="astroshop-card-rating-text">5.0</span>
                          </div>
                          
                          <div className="astroshop-card-info">
                            {product.stock_quantity !== undefined && (
                              <div className="astroshop-card-stock">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <span>{product.stock_quantity} {language === 'hindi' ? 'उपलब्ध' : 'in stock'}</span>
                              </div>
                            )}
                          </div>

                          <div className="astroshop-card-footer">
                            <div className="astroshop-card-price-section">
                              {product.original_price && product.original_price > product.price && (
                                <span className="astroshop-card-original-price">
                                  ₹{product.original_price.toLocaleString()}
                                </span>
                              )}
                              <span className="astroshop-card-price">
                                ₹{product.price.toLocaleString()}
                              </span>
                            </div>
                            <button
                              className="astroshop-card-button"
                              onClick={(e) => {
                                e.preventDefault()
                                navigate('/order', { state: { category: 'astroshop', productName: product.title, totalAmount: product.price } })
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

            </>
          )}
        </div>
      </main>
      <AppDownloadBanner language={language} />
      <Footer language={language} />
    </div>
  )
}

export default AstroShopPage

