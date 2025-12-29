import React from 'react'
import { motion } from 'framer-motion'
import appImage from '../assets/icons/app_image.jpeg'

const AppDownloadBanner = ({ language }) => {
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=jyotishvivkosh.mobileapplication'
  const appStoreUrl = 'https://apps.apple.com/app/jyotish-vishwakosh' // Update with actual App Store URL if available

  return (
    <motion.section
      id="app-download"
      className="app-download-banner"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container">
        <div className="app-download-content">
          {/* Left Side - Mobile App Preview */}
          <motion.div
            className="app-download-image-container"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="app-phone-frame">
              <img 
                src={appImage} 
                alt="Jyotish Vishwakosh App" 
                className="app-preview-image"
              />
            </div>
          </motion.div>

          {/* Right Side - Download Banner */}
          <motion.div
            className="app-download-banner-card"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="app-download-banner-title">
              {language === 'hindi' ? 'ऐप डाउनलोड करें' : 'Download the App from'}
            </h3>

            {/* Download Buttons - Side by Side */}
            <div className="app-download-buttons-row">
              <motion.a
                href={appStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="app-download-btn app-download-btn-apple"
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#000000">
                  <path d="M17.05,20.28C16.26,21.63 15.31,21.54 14.29,21C13.29,20.44 12.34,20.39 11.24,21C10.03,21.68 9.31,21.5 8.56,20.28C3.82,11.56 8.67,6.2 13.11,6.2C14.13,6.2 15.06,6.68 15.83,6.68C16.6,6.68 17.76,6.05 19.05,6.13C20.35,6.22 21.33,6.75 21.89,7.75C18.05,9.73 19.17,14.7 17.05,20.28M12.03,6.09C11.71,3.71 13.65,1.74 15.87,1.5C16.08,4.03 13.28,6.22 12.03,6.09Z" />
                </svg>
                <span className="app-download-btn-text">Download on the App Store</span>
              </motion.a>

              <motion.a
                href={playStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="app-download-btn app-download-btn-google"
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#000000">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L16.81,15.12L14.54,12.85L16.81,10.81L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <span className="app-download-btn-text">GET IT ON Google Play</span>
              </motion.a>
            </div>

            {/* Rating */}
            <div className="app-rating">
              <div className="app-stars">★★★★★</div>
              <span className="app-rating-text">4.5+</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

export default AppDownloadBanner

