import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import ariesImg from '../assets/icons/aries.jpeg'
import taurusImg from '../assets/icons/taurus.jpeg'
import geminiImg from '../assets/icons/gemini.jpeg'
import cancerImg from '../assets/icons/cancer.jpeg'
import leoImg from '../assets/icons/leo.jpeg'
import virgoImg from '../assets/icons/virgo.jpeg'
import libraImg from '../assets/icons/libra.jpeg'
import scorpioImg from '../assets/icons/scorpio.jpeg'
import sagittariusImg from '../assets/icons/sagittarius.jpeg'
import capricornImg from '../assets/icons/capricorn.jpeg'
import aquariusImg from '../assets/icons/aquarius.jpeg'
import piscesImg from '../assets/icons/pisces.jpeg'

const Rashifal = ({ language }) => {
  const zodiacSigns = [
    { name: 'Aries', nameHi: 'मेष', img: ariesImg },
    { name: 'Taurus', nameHi: 'वृषभ', img: taurusImg },
    { name: 'Gemini', nameHi: 'मिथुन', img: geminiImg },
    { name: 'Cancer', nameHi: 'कर्क', img: cancerImg },
    { name: 'Leo', nameHi: 'सिंह', img: leoImg },
    { name: 'Virgo', nameHi: 'कन्या', img: virgoImg },
    { name: 'Libra', nameHi: 'तुला', img: libraImg },
    { name: 'Scorpio', nameHi: 'वृश्चिक', img: scorpioImg },
    { name: 'Sagittarius', nameHi: 'धनु', img: sagittariusImg },
    { name: 'Capricorn', nameHi: 'मकर', img: capricornImg },
    { name: 'Aquarius', nameHi: 'कुम्भ', img: aquariusImg },
    { name: 'Pisces', nameHi: 'मीन', img: piscesImg },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.85,
      rotateX: -15
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  }

  return (
    <motion.section 
      id="rashifal" 
      className="rashifal-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="rashifal-bg-overlay"></div>
      <div className="container rashifal-container">
        <motion.div 
          className="zodiac-grid"
          variants={containerVariants}
        >
          {zodiacSigns.map((sign) => (
            <motion.div
              key={sign.name}
              className="zodiac-card-ticket"
              variants={cardVariants}
              whileHover={{ 
                y: -12, 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to="/rashi-fal" style={{ textDecoration: 'none', color: 'inherit' }}>
              <motion.div 
                className="zodiac-icon-circle"
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: "0 8px 25px rgba(180, 80, 100, 0.3)"
                }}
            >
              <motion.img
                src={sign.img}
                alt={sign.nameHi}
                  className="zodiac-icon-img"
                  whileHover={{ scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 300 }}
              />
              </motion.div>
              <div className="zodiac-card-body">
                <span className={`zodiac-label ${language === 'hindi' ? 'hindi' : ''}`}>
                {language === 'hindi' ? sign.nameHi : sign.name}
                </span>
                {language === 'hindi' && (
                  <span className="zodiac-label-en">{sign.name}</span>
                )}
              </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}

export default Rashifal
