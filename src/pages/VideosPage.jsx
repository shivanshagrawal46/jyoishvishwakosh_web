import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import CelebrityStrip from '../components/CelebrityStrip'
import ServicesStrip from '../components/ServicesStrip'
import Footer from '../components/Footer'
import AppDownloadBanner from '../components/AppDownloadBanner'
import { fetchYouTubeVideos } from '../services/api'

const VideosPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang)
    if (setLanguageProp) setLanguageProp(lang)
  }, [setLanguageProp])

  // Fetch videos on mount
  useEffect(() => {
    const loadVideos = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchYouTubeVideos()
        setVideos(data || [])
      } catch (err) {
        setError(err.message || 'Failed to load videos')
        setVideos([])
      } finally {
        setLoading(false)
      }
    }
    loadVideos()
  }, [])

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(videos.map(v => v.category).filter(Boolean))]
    return uniqueCategories.sort()
  }, [videos])

  // Filter videos by category
  const filteredVideos = useMemo(() => {
    if (selectedCategory === 'all') return videos
    return videos.filter(video => video.category === selectedCategory)
  }, [videos, selectedCategory])

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  // Get thumbnail URL (use provided thumbnail or generate from video ID)
  const getThumbnail = (video) => {
    if (video.thumbnail) return video.thumbnail
    const videoId = getYouTubeVideoId(video.link)
    if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    return null
  }

  const handleVideoClick = (video) => {
    if (video.link) {
      window.open(video.link, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="app">
      <Header language={language} setLanguage={handleLanguageChange} />
      <CelebrityStrip language={language} />
      <ServicesStrip language={language} activeService="videos" />

      <main className="videos-page-main">
        <div className="container">
          <div className="videos-page-header">
            <h1 className={`videos-page-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? '📹 वीडियो' : '📹 Videos'}
            </h1>
            <p className="videos-page-subtitle">
              {language === 'hindi' 
                ? 'ज्योतिष और वास्तु से संबंधित वीडियो देखें' 
                : 'Watch videos on Jyotish and Vastu'}
            </p>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="videos-filters">
              <button
                className={`videos-filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                {language === 'hindi' ? 'सभी' : 'All'}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  className={`videos-filter-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="videos-loading">
              <div className="videos-loader"></div>
              <p>{language === 'hindi' ? 'वीडियो लोड हो रहे हैं...' : 'Loading videos...'}</p>
            </div>
          ) : error ? (
            <div className="videos-error">
              <p>⚠️ {error}</p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="videos-empty">
              <p>{language === 'hindi' ? 'कोई वीडियो उपलब्ध नहीं' : 'No videos available'}</p>
            </div>
          ) : (
            <div className="videos-grid">
              {filteredVideos.map((video, index) => {
                const thumbnail = getThumbnail(video)
                
                return (
                  <motion.div
                    key={video._id || index}
                    className="video-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -5, boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
                    onClick={() => handleVideoClick(video)}
                  >
                    <div className="video-thumbnail-container">
                      {thumbnail ? (
                        <img 
                          src={thumbnail} 
                          alt={video.title}
                          className="video-thumbnail"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div 
                        className="video-thumbnail-placeholder"
                        style={{ display: thumbnail ? 'none' : 'flex' }}
                      >
                        <span>📹</span>
                      </div>
                      <div className="video-play-overlay">
                        <div className="video-play-icon">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="video-card-content">
                      <div className="video-category">
                        {video.category || 'Uncategorized'}
                      </div>
                      <h3 className={`video-title ${language === 'hindi' ? 'hindi' : ''}`}>
                        {video.title}
                      </h3>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <AppDownloadBanner language={language} />
      <Footer language={language} />
    </div>
  )
}

export default VideosPage

