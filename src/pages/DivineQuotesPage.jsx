import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import html2canvas from 'html2canvas'
import Header from '../components/Header'
import CelebrityStrip from '../components/CelebrityStrip'
import ServicesStrip from '../components/ServicesStrip'
import Footer from '../components/Footer'
import AppDownloadBanner from '../components/AppDownloadBanner'
import { fetchDivineQuotes } from '../services/api'
import logoImg from '../assets/icons/logo_new.png'
import bhupendraImg from '../assets/icons/bhupendra.jpg'
import bhupendra1Img from '../assets/icons/bhupendra1.png'

// Memoized quote item - similar to KoshContentItem
const QuoteItem = React.memo(({ quote, index, getFirstChar, getIconColor, onQuoteClick }) => {
  const firstChar = getFirstChar(quote.quote)
  const iconColor = getIconColor(index)
  
  return (
    <div className="kosh-content-item">
      <div 
        className="kosh-content-icon"
        style={{ background: iconColor }}
      >
        {firstChar}
      </div>
      <div className="kosh-content-text">
        <h4 
          className="kosh-content-title kosh-content-title-clickable"
          onClick={() => onQuoteClick(quote)}
        >
          {quote.quote || 'N/A'}
        </h4>
      </div>
    </div>
  )
})

QuoteItem.displayName = 'QuoteItem'

const DivineQuotesPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  
  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang)
    if (setLanguageProp) setLanguageProp(lang)
  }, [setLanguageProp])
  
  const [quotes, setQuotes] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('template1') // template1 or template2
  const templateRef = useRef(null)
  const scrollContainerRef = useRef(null)

  // Get first character (handles Hindi, English, Numbers)
  const getFirstChar = useCallback((text) => {
    if (!text) return '#'
    const firstChar = text.charAt(0)
    
    // Check if it's a number (0-9 or Hindi digits)
    if (/[0-9०-९]/.test(firstChar)) {
      return firstChar
    }
    
    // Hindi character
    if (/[\u0900-\u097F]/.test(firstChar)) {
      return firstChar
    }
    
    // English letter
    if (/[a-zA-Z]/.test(firstChar)) {
      return firstChar.toUpperCase()
    }
    
    return '#'
  }, [])

  // Color palette for icons
  const getIconColor = useCallback((index) => {
    const colors = ['#17A2B8', '#FF6B9D', '#4ECDC4', '#FFC107', '#9C27B0', '#FF9800', '#2196F3', '#E91E63', '#00BCD4', '#8BC34A']
    return colors[index % colors.length]
  }, [])

  // Fetch quotes
  useEffect(() => {
    const loadQuotes = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await fetchDivineQuotes(currentPage)
        setQuotes(result.quotes || [])
        setTotalPages(result.pagination?.totalPages || 1)
      } catch (err) {
        setError(err.message || 'Failed to load quotes')
        setQuotes([])
      } finally {
        setLoading(false)
      }
    }
    loadQuotes()
  }, [currentPage])

  const handleQuoteClick = useCallback((quote) => {
    setSelectedQuote(quote)
    setShowQuoteModal(true)
    setSelectedTemplate('template1') // Reset to first template
  }, [])

  const handleCloseQuoteModal = useCallback(() => {
    setShowQuoteModal(false)
    setSelectedQuote(null)
  }, [])

  const handleShare = async () => {
    if (!selectedQuote || !templateRef.current) return
    
    try {
      // Show loading state
      const shareBtn = document.querySelector('.quote-share-btn')
      const originalContent = shareBtn?.innerHTML
      if (shareBtn) {
        shareBtn.disabled = true
        shareBtn.style.opacity = '0.7'
        shareBtn.innerHTML = language === 'hindi' ? 'प्रोसेस हो रहा है...' : 'Processing...'
      }

      // Ensure all images in the template are loaded before capturing
      const images = templateRef.current.querySelectorAll('img')
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve()
          return new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = resolve // Continue even if image fails to load
            setTimeout(resolve, 3000) // Timeout after 3 seconds
          })
        })
      )
      
      // Small delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Convert template to canvas/image - capture the full template with all content
      const canvas = await html2canvas(templateRef.current, {
        backgroundColor: null, // Use template's background (gradients will be captured)
        scale: 2, // Higher quality for better image
        useCORS: true, // Allow cross-origin images
        logging: false,
        allowTaint: false,
        removeContainer: false,
        imageTimeout: 15000,
        width: templateRef.current.scrollWidth,
        height: templateRef.current.scrollHeight
      })

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert(language === 'hindi' ? 'इमेज बनाने में त्रुटि' : 'Error creating image')
          if (shareBtn && originalContent) {
            shareBtn.disabled = false
            shareBtn.style.opacity = '1'
            shareBtn.innerHTML = originalContent
          }
          return
        }

        const file = new File([blob], 'divine-quote.png', { type: 'image/png' })
        const shareData = {
          title: selectedQuote.quote,
          files: [file]
        }

        try {
          if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData)
          } else if (navigator.share) {
            // Fallback: Convert blob to data URL and share as text with image
            const dataUrl = canvas.toDataURL('image/png')
            await navigator.share({
              title: selectedQuote.quote,
              text: `📱 Download Jyotish Vishwakosh App:
https://play.google.com/store/apps/details?id=jyotishvivkosh.mobileapplication

🌐 Website: jyotishvishwakosh.com`,
              url: dataUrl
            })
          } else {
            // Fallback: Download the image
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'divine-quote.png'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
            alert(language === 'hindi' ? 'इमेज डाउनलोड हो गई' : 'Image downloaded')
          }
        } catch (shareErr) {
          console.error('Error sharing:', shareErr)
          // Fallback: Download the image
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = 'divine-quote.png'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          alert(language === 'hindi' ? 'इमेज डाउनलोड हो गई' : 'Image downloaded')
        } finally {
          if (shareBtn && originalContent) {
            shareBtn.disabled = false
            shareBtn.style.opacity = '1'
            shareBtn.innerHTML = originalContent
          }
        }
      }, 'image/png')
    } catch (err) {
      console.error('Error creating image:', err)
      alert(language === 'hindi' ? 'शेयर करने में त्रुटि' : 'Error sharing')
      const shareBtn = document.querySelector('.quote-share-btn')
      if (shareBtn) {
        shareBtn.disabled = false
        shareBtn.style.opacity = '1'
        shareBtn.innerHTML = language === 'hindi' ? '<span>📤</span> शेयर करें' : '<span>📤</span> Share'
      }
    }
  }

  return (
    <div className="app">
      <Header language={language} setLanguage={handleLanguageChange} />
      <CelebrityStrip language={language} />
      <ServicesStrip language={language} activeService="divine-quotes" />

      <main className="kosh-page-main-new">
        <div className="kosh-page-layout">
          {/* Main Content Area */}
          <div className="kosh-main-content-wrapper">
            {/* Contents Card */}
            <div className="kosh-contents-card">
              <div className="kosh-contents-card-header">
                <h4 className="kosh-contents-card-title">
                  {language === 'hindi' ? 'दिव्य वाणी' : 'Divine Quotes'}
                  <span className="kosh-contents-count">
                    ({quotes.length} {language === 'hindi' ? 'उद्धरण' : 'quotes'})
                  </span>
                </h4>
              </div>
              
              {loading ? (
                <div className="kosh-loading-inline">
                  <div className="kosh-loader-small"></div>
                  <span>{language === 'hindi' ? 'लोड हो रहा है...' : 'Loading...'}</span>
                </div>
              ) : error ? (
                <div className="kosh-error-inline">
                  <p>⚠️ {error}</p>
                </div>
              ) : quotes.length === 0 ? (
                <div className="kosh-no-results-inline">
                  <p>{language === 'hindi' ? 'कोई उद्धरण उपलब्ध नहीं' : 'No quotes available'}</p>
                </div>
              ) : (
                <div 
                  className="kosh-contents-list-scroll" 
                  ref={scrollContainerRef}
                >
                  {quotes.map((quote, index) => (
                    <QuoteItem
                      key={quote._id || quote.id || index}
                      quote={quote}
                      index={index}
                      getFirstChar={getFirstChar}
                      getIconColor={getIconColor}
                      onQuoteClick={handleQuoteClick}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="quotes-pagination">
                <button
                  className="quotes-pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  {language === 'hindi' ? '← पिछला' : '← Previous'}
                </button>
                <span className="quotes-pagination-info">
                  {language === 'hindi' ? `पृष्ठ ${currentPage} / ${totalPages}` : `Page ${currentPage} / ${totalPages}`}
                </span>
                <button
                  className="quotes-pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || loading}
                >
                  {language === 'hindi' ? 'अगला →' : 'Next →'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Quote Detail Modal */}
      <AnimatePresence>
        {showQuoteModal && selectedQuote && (
          <>
            <motion.div
              className="quote-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={handleCloseQuoteModal}
            />
            <motion.div
              className="quote-modal quote-modal-fullscreen"
              initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%'
              }}
            >
              <div className="quote-modal-header">
                <div className="quote-modal-tabs">
                  <button
                    className={`quote-template-tab ${selectedTemplate === 'template1' ? 'active' : ''}`}
                    onClick={() => setSelectedTemplate('template1')}
                  >
                    {language === 'hindi' ? 'टेम्प्लेट 1' : 'Template 1'}
                  </button>
                  <button
                    className={`quote-template-tab ${selectedTemplate === 'template2' ? 'active' : ''}`}
                    onClick={() => setSelectedTemplate('template2')}
                  >
                    {language === 'hindi' ? 'टेम्प्लेट 2' : 'Template 2'}
                  </button>
                </div>
                <button
                  className="quote-modal-close"
                  onClick={handleCloseQuoteModal}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="quote-modal-body quote-modal-body-fullscreen">
                {/* Shareable Template */}
                <div 
                  ref={templateRef}
                  className={`quote-template ${selectedTemplate === 'template1' ? 'quote-template-1' : 'quote-template-2'}`}
                >
                  {/* Logo */}
                  <div className="quote-template-logo">
                    <img src={logoImg} alt="Jyotish Vishwakosh" />
                  </div>

                  {/* Quote */}
                  <div className="quote-template-quote">
                    <h2 className={`quote-template-quote-text ${language === 'hindi' ? 'hindi' : ''}`}>
                      {selectedQuote.quote}
                    </h2>
                  </div>

                  {/* Meaning */}
                  <div className="quote-template-meaning">
                    <div 
                      className={`quote-template-meaning-text ${language === 'hindi' ? 'hindi' : ''}`}
                      dangerouslySetInnerHTML={{ __html: selectedQuote.meaning?.replace(/\r\n/g, '<br/>') || '' }}
                    />
                  </div>

                  {/* Image */}
                  <div className="quote-template-image">
                    <img 
                      src={selectedTemplate === 'template1' ? bhupendraImg : bhupendra1Img} 
                      alt="Bhupendra" 
                    />
                  </div>

                  {/* Footer Links */}
                  <div className="quote-template-footer">
                    <p className="quote-template-footer-text">
                      📱 Download App: <a href="https://play.google.com/store/apps/details?id=jyotishvivkosh.mobileapplication" target="_blank" rel="noopener noreferrer">Play Store</a>
                    </p>
                    <p className="quote-template-footer-text">
                      🌐 Website: <a href="https://jyotishvishwakosh.com" target="_blank" rel="noopener noreferrer">jyotishvishwakosh.com</a>
                    </p>
                    <p className="quote-template-footer-text">
                      📺 YouTube: <a href="https://www.youtube.com/@jyotishvishwakoshapp" target="_blank" rel="noopener noreferrer">@jyotishvishwakoshapp</a>
                    </p>
                  </div>
                </div>

                {/* Share Button */}
                <div className="quote-modal-actions">
                  <button className="quote-share-btn" onClick={handleShare}>
                    <span>📤</span>
                    {language === 'hindi' ? 'शेयर करें' : 'Share'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AppDownloadBanner language={language} />
      <Footer language={language} />
    </div>
  )
}

export default DivineQuotesPage

