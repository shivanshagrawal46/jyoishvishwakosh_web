import React from 'react'
import { motion } from 'framer-motion'
import bhupendraImg from '../assets/icons/bhupendra1.png'

const VisionarySection = ({ language }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15
      }
    }
  }

  const slideUpVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  }

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.85, rotate: -5 },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay: 0.2
      }
    }
  }

  const glowVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 1,
        delay: 0.4
      }
    }
  }

  return (
    <motion.section 
      id="visionary" 
      className="visionary-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      {/* Decorative Background Elements */}
      <div className="visionary-bg-decoration">
        <div className="visionary-bg-circle visionary-bg-circle-1"></div>
        <div className="visionary-bg-circle visionary-bg-circle-2"></div>
        <div className="visionary-bg-circle visionary-bg-circle-3"></div>
      </div>

      <div className="container">
        <motion.div
          className="visionary-content"
          variants={slideUpVariants}
        >
          {/* Badge */}
          <motion.div
            className="visionary-badge"
            variants={slideUpVariants}
            whileHover={{ scale: 1.05 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <span className={language === 'hindi' ? 'hindi' : ''}>
              {language === 'hindi' ? 'सेलिब्रिटी ज्योतिषी' : 'Celebrity Astrologer'}
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            className={`visionary-heading ${language === 'hindi' ? 'hindi' : ''}`}
            variants={slideUpVariants}
          >
            <span className="visionary-heading-accent">
              {language === 'hindi' ? 'दृष्टिकोण से मिलें' : 'Meet the Visionary'}
            </span>
            <span className="visionary-heading-main">
              {language === 'hindi' ? 'ज्ञान के पीछे' : 'Behind the Wisdom'}
            </span>
          </motion.h2>

          {/* Main Card */}
          <motion.div
            className="visionary-card"
            variants={slideUpVariants}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="visionary-card-inner">
              {/* Image Section */}
              <motion.div
                className="visionary-image-container"
                variants={imageVariants}
              >
                <div className="visionary-image-glow" variants={glowVariants}></div>
                <div className="visionary-image-frame">
                  <motion.img
                    src={bhupendraImg}
                    alt={language === 'hindi' ? 'डॉ. भूपेंद्र पांडे' : 'Dr. Bhupendra Pandey'}
                    className="visionary-image"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <div className="visionary-image-shine"></div>
              </motion.div>

              {/* Content Section */}
              <div className="visionary-content-section">
                <motion.div
                  className="visionary-name-section"
                  variants={slideUpVariants}
                >
                  <h3 className={`visionary-name ${language === 'hindi' ? 'hindi' : ''}`}>
                    Dr. Bhupendra Pandey
                  </h3>
                  <div className={`visionary-title ${language === 'hindi' ? 'hindi' : ''}`}>
                    {language === 'hindi' ? 'सेलिब्रिटी ज्योतिषी • वैश्विक प्रतिष्ठा' : 'Celebrity Astrologer • Global Repute'}
                  </div>
                </motion.div>

                <motion.div
                  className="visionary-text"
                  variants={slideUpVariants}
                >
                  <p className={`visionary-description ${language === 'hindi' ? 'hindi' : ''}`}>
                    {language === 'hindi' ? (
                      <>
                        इस ऐप के पीछे की दूरदर्शी शक्ति, <strong>डॉ. भूपेंद्र पांडे</strong> वैश्विक प्रतिष्ठा के सेलिब्रिटी ज्योतिषी हैं। उनकी सटीक अंतर्दृष्टि, जिस पर दुनिया भर के लोग भरोसा करते हैं, हमारे प्लेटफॉर्म की नींव बनती है—जो आपके लिए प्रामाणिक, शक्तिशाली ज्योतिष सीधे लाती है।
                      </>
                    ) : (
                      <>
                        The visionary force behind this app, <strong>Dr. Bhupendra Pandey</strong> is a celebrity astrologer of global repute. His accurate insights, trusted by people worldwide, form the foundation of our platform—bringing authentic, powerful astrology directly to you.
                      </>
                    )}
                  </p>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                  className="visionary-trust-indicators"
                  variants={slideUpVariants}
                >
                  <div className="trust-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span className={language === 'hindi' ? 'hindi' : ''}>
                      {language === 'hindi' ? 'विश्व भर में विश्वसनीय' : 'Trusted Worldwide'}
                    </span>
                  </div>
                  <div className="trust-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
                    </svg>
                    <span className={language === 'hindi' ? 'hindi' : ''}>
                      {language === 'hindi' ? 'सटीक अंतर्दृष्टि' : 'Accurate Insights'}
                    </span>
                  </div>
                  <div className="trust-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span className={language === 'hindi' ? 'hindi' : ''}>
                      {language === 'hindi' ? 'वैश्विक मान्यता' : 'Global Recognition'}
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default VisionarySection

