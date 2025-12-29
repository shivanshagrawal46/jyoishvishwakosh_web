import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import panchangIcon from '../assets/icons/panchang.png'
import rashifalsIcon from '../assets/icons/rashifals.png'
import epoojaIcon from '../assets/icons/e_pooja.png'
import karmkandIcon from '../assets/icons/karmkand1.png'
import koshIcon from '../assets/icons/kosh.png'
import astroshopIcon from '../assets/icons/astroshop.png'
import jyotishPredIcon from '../assets/icons/jyotish_prediction.png'
import tantraIcon from '../assets/icons/tantra.png'
import calculatorIcon from '../assets/icons/calculator.png'
import hasthRekhaIcon from '../assets/icons/hasth_rekha.png'
import vastuIcon from '../assets/icons/vastu.png'
import dharmaIcon from '../assets/icons/dharma.png'
import ankjyotishIcon from '../assets/icons/ankjyotish.png'
import granthIcon from '../assets/icons/granth.png'
import emagazineIcon from '../assets/icons/emagazine.png'
import youtubeIcon from '../assets/icons/youtube.png'
import numerologyIcon from '../assets/icons/numerology.png'
import numerologyCalcIcon from '../assets/icons/numerology_calculator.png'
import divineQuotesIcon from '../assets/icons/divine_quotes.png'
import aartiIcon from '../assets/icons/aarti.png'
import kundliIcon from '../assets/icons/kundli.png'

const Services = ({ language }) => {
  const services = [
    { name: 'Panchang', nameHi: 'पंचांग', icon: panchangIcon },
    { name: 'Rashifals', nameHi: 'राशिफल', icon: rashifalsIcon },
    { name: 'E-Pooja', nameHi: 'ई-पूजा', icon: epoojaIcon },
    { name: 'Karmkand', nameHi: 'कर्मकांड', icon: karmkandIcon },
    { name: 'Kosh', nameHi: 'कोष', icon: koshIcon },
    { name: 'AstroShop', nameHi: 'एस्ट्रो शॉप', icon: astroshopIcon },
    { name: 'AI Jyotish', nameHi: 'AI ज्योतिष', icon: jyotishPredIcon },
    { name: 'Mantra Tantra', nameHi: 'मंत्र तंत्र', icon: tantraIcon },
    { name: 'Calculator', nameHi: 'कैलकुलेटर', icon: calculatorIcon },
    { name: 'Hasth Rekha', nameHi: 'हस्त रेखा', icon: hasthRekhaIcon },
    { name: 'Vastu', nameHi: 'वास्तु', icon: vastuIcon },
    { name: 'Dharma Shastra', nameHi: 'धर्म शास्त्र', icon: dharmaIcon },
    { name: 'Ank Jyotish', nameHi: 'अंक ज्योतिष', icon: ankjyotishIcon },
    { name: 'Book (Granth)', nameHi: 'ग्रंथ', icon: granthIcon },
    { name: 'E-Magazine', nameHi: 'ई-मैगज़ीन', icon: emagazineIcon },
    { name: 'Videos', nameHi: 'वीडियो', icon: youtubeIcon },
    { name: 'AI Numerology', nameHi: 'AI न्यूमरोलॉजी', icon: numerologyIcon },
    { name: 'Ank Fal', nameHi: 'अंक फल', icon: numerologyCalcIcon },
    { name: 'Divine Quotes', nameHi: 'दिव्य वाणी', icon: divineQuotesIcon },
    { name: 'Chalisa Aarti', nameHi: 'चालीसा आरती', icon: aartiIcon },
    { name: 'Kundli', nameHi: 'कुंडली', icon: kundliIcon },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.8 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  }

  return (
    <motion.section 
      id="services" 
      className="services-section"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container">
        <motion.div 
          className="services-grid-circular"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {services.map((service, index) => {
            const isPanchang = service.name === 'Panchang'
            const isRashifals = service.name === 'Rashifals'
            const isKosh = service.name === 'Kosh'
            const isHasthRekha = service.name === 'Hasth Rekha'
            const isVastu = service.name === 'Vastu'
            const isAnkJyotish = service.name === 'Ank Jyotish'
            const isChalisaAarti = service.name === 'Chalisa Aarti'
            const isMantraTantra = service.name === 'Mantra Tantra'
            const isDharmaShastra = service.name === 'Dharma Shastra'
            const isKarmkand = service.name === 'Karmkand'
            const isEPooja = service.name === 'E-Pooja'
            const isAstroShop = service.name === 'AstroShop'
            const isGranth = service.name === 'Book (Granth)'
            const isCalculator = service.name === 'Calculator'
            const isAIJyotish = service.name === 'AI Jyotish'
            const isAINumerology = service.name === 'AI Numerology'
            const isEMagazine = service.name === 'E-Magazine'
            const isAnkFal = service.name === 'Ank Fal'
            const isVideos = service.name === 'Videos'
            const isDivineQuotes = service.name === 'Divine Quotes'
            const isKundli = service.name === 'Kundli'
            
            // Services with pages (excluding Calculator, AI Jyotish, and Kundli which use hash links)
            const hasPage = isPanchang || isRashifals || isKosh || isHasthRekha || isVastu || isAnkJyotish || isChalisaAarti || isMantraTantra || isDharmaShastra || isKarmkand || isEPooja || isAstroShop || isGranth || isAINumerology || isEMagazine || isAnkFal || isVideos || isDivineQuotes
            
            // Services with hash links (scroll to section on home page)
            const hasHashLink = isCalculator || isAIJyotish || isKundli
            
            // Services that are clickable (have page or hash link)
            const isClickable = hasPage || hasHashLink
            
            // Determine component and props
            let Component, linkProps
            if (hasPage) {
              Component = motion(Link)
              linkProps = isPanchang
                ? { to: '/panchang' }
                : isRashifals
                ? { to: '/rashi-fal' }
                : isKosh 
                ? { to: '/kosh' }
                : isHasthRekha
                ? { to: '/hasth-rekha' }
                : isVastu
                ? { to: '/vastu' }
                : isAnkJyotish
                ? { to: '/ank-jyotish' }
                : isChalisaAarti
                ? { to: '/chalisa-aarti' }
                : isMantraTantra
                ? { to: '/mantra-tantra' }
                : isDharmaShastra
                ? { to: '/dharma-shastra' }
                : isKarmkand
                ? { to: '/karmkand' }
                : isEPooja
                ? { to: '/e-pooja' }
                : isAstroShop
                ? { to: '/astroshop' }
                : isGranth
                ? { to: '/books' }
                : isAINumerology
                ? { to: '/ai-ank' }
                : isEMagazine
                ? { to: '/emagazine' }
                : isAnkFal
                ? { to: '/ank-fal' }
                : isVideos
                ? { to: '/videos' }
                : isDivineQuotes
                ? { to: '/divine-quotes' }
                : {}
            } else if (hasHashLink) {
              Component = motion.a
              linkProps = isCalculator
                ? { href: '/#calculations' }
                : isAIJyotish
                ? { href: '/#ai-jyotish' }
                : isKundli
                ? { href: '/#app-download' }
                : {}
            } else {
              Component = motion.div
              linkProps = {}
            }
            
            const handleComingSoon = (e) => {
              if (!isClickable) {
                e.preventDefault()
                e.stopPropagation()
                alert(language === 'hindi' ? 'जल्द ही आ रहा है' : 'Coming Soon')
              }
            }
            
            // For services without pages, use a div with coming soon message
            if (!isClickable) {
              return (
                <motion.div
                  key={service.name}
                  className="service-item service-item-disabled"
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleComingSoon}
                >
                  <motion.div 
                    className="service-circle"
                    whileHover={{ 
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                    }}
                  >
                    <img src={service.icon} alt={service.name} />
                  </motion.div>
                  <span className={`service-name ${language === 'hindi' ? 'hindi' : ''}`}>
                    {language === 'hindi' ? service.nameHi : service.name}
                  </span>
                  <span className="service-coming-soon">
                    {language === 'hindi' ? 'जल्द आएगा' : 'Soon'}
                  </span>
                </motion.div>
              )
            }
            
            return (
              <Component
                key={service.name}
                {...linkProps}
                className="service-item"
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.08, 
                  y: -6,
                  transition: { type: "spring", stiffness: 400, damping: 17 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className="service-circle"
                  whileHover={{ 
                    boxShadow: "0 8px 25px rgba(255, 107, 53, 0.25)"
                  }}
                >
                  <img src={service.icon} alt={service.name} />
                </motion.div>
                <span className={`service-name ${language === 'hindi' ? 'hindi' : ''}`}>
                  {language === 'hindi' ? service.nameHi : service.name}
                </span>
              </Component>
            )
          })}
        </motion.div>
      </div>
    </motion.section>
  )
}

export default Services
