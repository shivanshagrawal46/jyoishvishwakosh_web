import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import CelebrityStrip from '../components/CelebrityStrip'
import ServicesStrip from '../components/ServicesStrip'
import Footer from '../components/Footer'
import AppDownloadBanner from '../components/AppDownloadBanner'
import youtubeIcon from '../assets/icons/youtube.png'

const ContactPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  
  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang)
    if (setLanguageProp) setLanguageProp(lang)
  }, [setLanguageProp])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  }

  return (
    <div className="app">
      <Header language={language} setLanguage={handleLanguageChange} />
      <CelebrityStrip language={language} />
      <ServicesStrip language={language} />

      <main className="contact-page-main">
        <motion.div
          className="contact-page-container"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div className="contact-page-hero" variants={itemVariants}>
            <div className="contact-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{language === 'hindi' ? 'संपर्क करें' : 'Contact Us'}</span>
            </div>
            <h1 className={`contact-page-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? 'हमसे संपर्क करें' : 'Get In Touch'}
            </h1>
            <p className={`contact-page-subtitle ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' 
                ? 'हम आपकी सहायता के लिए यहाँ हैं' 
                : 'We are here to help you'}
            </p>
          </motion.div>

          <motion.div className="contact-content-wrapper" variants={itemVariants}>
            {/* Organization Info Card */}
            <motion.div className="contact-org-card" variants={itemVariants}>
              <div className="contact-org-header">
                <div className="contact-org-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                </div>
                <h2 className={`contact-org-title ${language === 'hindi' ? 'hindi' : ''}`}>
                  {language === 'hindi' ? 'संस्था का नाम' : 'Organization Name'}
                </h2>
              </div>
              <p className={`contact-org-name ${language === 'hindi' ? 'hindi' : ''}`}>
                PANDIT AWADHNARESH PANDEY SHIKSHA SAMITI BHOPAL
              </p>
            </motion.div>

            {/* Contact Info Cards */}
            <div className="contact-info-grid">
              {/* Address Card */}
              <motion.div className="contact-info-card" variants={itemVariants}>
                <div className="contact-info-icon address-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <h3 className={`contact-info-title ${language === 'hindi' ? 'hindi' : ''}`}>
                  {language === 'hindi' ? 'पता' : 'Address'}
                </h3>
                <p className={`contact-info-value ${language === 'hindi' ? 'hindi' : ''}`}>
                  Neelbad, Bhopal
                </p>
              </motion.div>

              {/* Phone Card */}
              <motion.div className="contact-info-card" variants={itemVariants}>
                <div className="contact-info-icon phone-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <h3 className={`contact-info-title ${language === 'hindi' ? 'hindi' : ''}`}>
                  {language === 'hindi' ? 'फ़ोन' : 'Phone'}
                </h3>
                <a href="tel:+919754648985" className={`contact-info-value contact-link ${language === 'hindi' ? 'hindi' : ''}`}>
                  +91 9754648985
                </a>
              </motion.div>

              {/* Email Card */}
              <motion.div className="contact-info-card" variants={itemVariants}>
                <div className="contact-info-icon email-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <h3 className={`contact-info-title ${language === 'hindi' ? 'hindi' : ''}`}>
                  {language === 'hindi' ? 'ईमेल' : 'Email'}
                </h3>
                <a href="mailto:info@jyotishvishwakosh.com" className={`contact-info-value contact-link ${language === 'hindi' ? 'hindi' : ''}`}>
                  info@jyotishvishwakosh.com
                </a>
              </motion.div>
            </div>

            {/* Social Media Section */}
            <motion.div className="contact-social-section" variants={itemVariants}>
              <h2 className={`contact-social-title ${language === 'hindi' ? 'hindi' : ''}`}>
                {language === 'hindi' ? 'सोशल मीडिया' : 'Follow Us'}
              </h2>
              <div className="contact-social-links">
                <motion.a
                  href="https://www.youtube.com/@jyotishvishwakoshapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-social-link youtube-link"
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img src={youtubeIcon} alt="YouTube" />
                  <span>YouTube</span>
                </motion.a>
                <motion.a
                  href="https://www.facebook.com/jyotishvishwakosh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-social-link facebook-link"
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                  <span>Facebook</span>
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>

      <AppDownloadBanner language={language} />
      <Footer language={language} />
    </div>
  )
}

export default ContactPage

