import React from 'react'
import { motion } from 'framer-motion'
import bhupendraImg from '../assets/icons/bhupendra.jpg'

const CelebrityStrip = () => {
  return (
    <div className="celebrity-strip">
      <div className="celebrity-strip-track">
        <motion.div 
          className="celebrity-strip-item"
          initial={{ x: '100vw' }}
          animate={{ x: '-100%' }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
            repeatDelay: 0
          }}
        >
          <img 
            src={bhupendraImg} 
            alt="Dr. Bhupendra Pandey" 
            className="celebrity-image"
          />
          <span className="celebrity-text">
            Dr. Bhupendra Pandey - Celebrity Astrologer
          </span>
          <span className="celebrity-separator">•</span>
          <span className="celebrity-app-text">
            Download Jyotish Vishwakosh-Astrology App
          </span>
        </motion.div>
      </div>
    </div>
  )
}

export default CelebrityStrip
