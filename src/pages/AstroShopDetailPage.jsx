import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import CelebrityStrip from '../components/CelebrityStrip'
import ServicesStrip from '../components/ServicesStrip'
import Footer from '../components/Footer'
import AppDownloadBanner from '../components/AppDownloadBanner'
import { fetchAstroShopProductBySlug } from '../services/api'

const AstroShopDetailPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  
  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang)
    if (setLanguageProp) setLanguageProp(lang)
  }, [setLanguageProp])

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchAstroShopProductBySlug(slug)
        setProduct(data)
      } catch (err) {
        setError(`Failed to load product: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }
    if (slug) {
      loadProduct()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="app">
        <Header language={language} setLanguage={handleLanguageChange} />
        <CelebrityStrip language={language} />
        <div className="astroshop-detail-loading">
          <div className="astroshop-loader"></div>
          <p>{language === 'hindi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="app">
        <Header language={language} setLanguage={handleLanguageChange} />
        <CelebrityStrip language={language} />
        <div className="astroshop-detail-error">
          <p>⚠️ {error || (language === 'hindi' ? 'उत्पाद नहीं मिला' : 'Product not found')}</p>
          <button onClick={() => navigate('/astroshop')}>
            {language === 'hindi' ? 'वापस जाएं' : 'Go Back'}
          </button>
        </div>
      </div>
    )
  }

  const mainImageUrl = product.images && product.images.length > 0
    ? (product.images[selectedImageIndex].startsWith('http') 
        ? product.images[selectedImageIndex] 
        : `https://jyotishvishwakosh.in${product.images[selectedImageIndex]}`)
    : null

  return (
    <div className="app">
      <Header language={language} setLanguage={handleLanguageChange} />
      <CelebrityStrip language={language} />
      <ServicesStrip language={language} activeService="astroshop" />

      <main className="astroshop-detail-main">
        <div className="container">
          <div className="astroshop-detail-layout">
            {/* Left Side - Images */}
            <div className="astroshop-detail-image-section">
              <div className="astroshop-detail-image-wrapper">
                {mainImageUrl ? (
                  <img 
                    src={mainImageUrl} 
                    alt={product.title} 
                    className="astroshop-detail-image"
                  />
                ) : (
                  <div className="astroshop-detail-image-placeholder">
                    <span style={{ fontSize: '120px' }}>🛍️</span>
                  </div>
                )}
              </div>
              
              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="astroshop-detail-thumbnails">
                  {product.images.map((img, index) => {
                    const thumbUrl = img.startsWith('http') ? img : `https://jyotishvishwakosh.in${img}`
                    return (
                      <button
                        key={index}
                        className={`astroshop-thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img src={thumbUrl} alt={`${product.title} ${index + 1}`} />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right Side - Details */}
            <div className="astroshop-detail-content-section">
              {/* Category */}
              {product.category && (
                <p className="astroshop-detail-category">{product.category.name}</p>
              )}
              
              {/* Title */}
              <h1 className={`astroshop-detail-title ${language === 'hindi' ? 'hindi' : ''}`}>
                {product.title}
              </h1>

              {/* Rating */}
              <div className="astroshop-detail-rating">
                <div className="astroshop-detail-stars">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#FFB800" stroke="#FFB800">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <span className="astroshop-detail-rating-text">5.0</span>
                <span className="astroshop-detail-rating-reviews">
                  ({product.total_reviews || 0} {language === 'hindi' ? 'समीक्षाएं' : 'reviews'})
                </span>
              </div>

              {/* Price Section */}
              <div className="astroshop-detail-price-section">
                {product.original_price && product.original_price > product.price && (
                  <>
                    <span className="astroshop-detail-original-price">
                      ₹{product.original_price.toLocaleString()}
                    </span>
                    {product.discount_percentage && (
                      <span className="astroshop-detail-discount">
                        {product.discount_percentage}% {language === 'hindi' ? 'छूट' : 'OFF'}
                      </span>
                    )}
                  </>
                )}
                <span className="astroshop-detail-price">
                  ₹{product.price.toLocaleString()}
                </span>
              </div>

              {/* Stock Info */}
              {product.stock_quantity !== undefined && (
                <div className="astroshop-detail-stock">
                  <span className={product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}>
                    {product.stock_quantity > 0 
                      ? `${product.stock_quantity} ${language === 'hindi' ? 'उपलब्ध' : 'in stock'}`
                      : (language === 'hindi' ? 'स्टॉक खत्म' : 'Out of stock')
                    }
                  </span>
                </div>
              )}

              {/* Short Description */}
              {product.short_description && (
                <div className="astroshop-detail-short-desc">
                  <p>{product.short_description}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="astroshop-detail-actions">
                <button
                  className="astroshop-detail-buy-btn"
                  disabled={!product.stock_quantity || product.stock_quantity === 0}
                  onClick={() => navigate('/order', { state: { category: 'astroshop', productName: product.title, totalAmount: product.price } })}
                >
                  {language === 'hindi' ? 'ऑर्डर करें' : 'Order Now'}
                </button>
                <button
                  className="astroshop-detail-cart-btn"
                  onClick={() => navigate('/order', { state: { category: 'astroshop', productName: product.title, totalAmount: product.price } })}
                >
                  {language === 'hindi' ? 'ऑर्डर करें' : 'Order'}
                </button>
              </div>

              {/* Full Description */}
              {product.full_description && (
                <div className="astroshop-detail-description">
                  <h3 className="astroshop-description-title">
                    {language === 'hindi' ? 'विवरण' : 'Description'}
                  </h3>
                  <div className="astroshop-description-content">
                    {product.full_description.split('\r\n').map((line, index) => (
                      <p key={index} className="astroshop-description-line">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <AppDownloadBanner language={language} />
      <Footer language={language} />
    </div>
  )
}

export default AstroShopDetailPage

