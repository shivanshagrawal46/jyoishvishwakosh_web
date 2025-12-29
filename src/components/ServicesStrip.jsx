import React from 'react'
import { Link } from 'react-router-dom'

// Service icons
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

const services = [
  { id: 'panchang', name: 'Panchang', nameHi: 'पंचांग', icon: panchangIcon, path: '/panchang' },
  { id: 'rashifal', name: 'Rashifals', nameHi: 'राशिफल', icon: rashifalsIcon, path: '/rashi-fal' },
  { id: 'e-pooja', name: 'E-Pooja', nameHi: 'ई-पूजा', icon: epoojaIcon, path: '/e-pooja' },
  { id: 'karmkand', name: 'Karmkand', nameHi: 'कर्मकांड', icon: karmkandIcon, path: '/karmkand' },
  { id: 'kosh', name: 'Kosh', nameHi: 'कोष', icon: koshIcon, path: '/kosh' },
  { id: 'astroshop', name: 'AstroShop', nameHi: 'एस्ट्रो शॉप', icon: astroshopIcon, path: '/astroshop' },
  { id: 'ai-jyotish', name: 'AI Jyotish', nameHi: 'AI ज्योतिष', icon: jyotishPredIcon, path: '#ai-jyotish' },
  { id: 'mantra-tantra', name: 'Mantra Tantra', nameHi: 'मंत्र तंत्र', icon: tantraIcon, path: '/mantra-tantra' },
  { id: 'calculator', name: 'Calculator', nameHi: 'कैलकुलेटर', icon: calculatorIcon, path: '#calculator' },
  { id: 'hasth-rekha', name: 'Hasth Rekha', nameHi: 'हस्त रेखा', icon: hasthRekhaIcon, path: '/hasth-rekha' },
  { id: 'vastu', name: 'Vastu', nameHi: 'वास्तु', icon: vastuIcon, path: '/vastu' },
  { id: 'dharma', name: 'Dharma Shastra', nameHi: 'धर्म शास्त्र', icon: dharmaIcon, path: '/dharma-shastra' },
  { id: 'ank-jyotish', name: 'Ank Jyotish', nameHi: 'अंक ज्योतिष', icon: ankjyotishIcon, path: '/ank-jyotish' },
  { id: 'granth', name: 'Granth', nameHi: 'ग्रंथ', icon: granthIcon, path: '#granth' },
  { id: 'e-magazine', name: 'E-Magazine', nameHi: 'ई-मैगज़ीन', icon: emagazineIcon, path: '/emagazine' },
  { id: 'videos', name: 'Videos', nameHi: 'वीडियो', icon: youtubeIcon, path: '/videos' },
  { id: 'ai-numerology', name: 'AI Numerology', nameHi: 'AI न्यूमरोलॉजी', icon: numerologyIcon, path: '#ai-numerology' },
  { id: 'ank-fal', name: 'Ank Fal', nameHi: 'अंक फल', icon: numerologyCalcIcon, path: '/ank-fal' },
  { id: 'divine-quotes', name: 'Divine Quotes', nameHi: 'दिव्य वाणी', icon: divineQuotesIcon, path: '/divine-quotes' },
  { id: 'chalisa-aarti', name: 'Chalisa Aarti', nameHi: 'चालीसा आरती', icon: aartiIcon, path: '/chalisa-aarti' },
  { id: 'kundli', name: 'Kundli', nameHi: 'कुंडली', icon: kundliIcon, path: '#kundli' },
]

const ServicesStrip = ({ language = 'hindi', activeService = null }) => {
  const renderServiceItem = (service, keyPrefix) => {
    const isActive = activeService === service.id
    const isInternalLink = service.path.startsWith('/')
    
    const content = (
      <>
        <div className="services-strip-icon">
          <img src={service.icon} alt={service.name} />
        </div>
        <span className="services-strip-name">
          {language === 'hindi' ? service.nameHi : service.name}
        </span>
      </>
    )

    if (isInternalLink) {
      return (
        <Link
          key={`${keyPrefix}-${service.id}`}
          to={service.path}
          className={`services-strip-item ${isActive ? 'active' : ''}`}
        >
          {content}
        </Link>
      )
    }

    return (
      <a
        key={`${keyPrefix}-${service.id}`}
        href={service.path}
        className={`services-strip-item ${isActive ? 'active' : ''}`}
      >
        {content}
      </a>
    )
  }

  return (
    <div className="services-strip">
      <div className="services-strip-track">
        {/* First set of services */}
        {services.map((service) => renderServiceItem(service, 'set1'))}
        {/* Duplicate for seamless loop */}
        {services.map((service) => renderServiceItem(service, 'set2'))}
      </div>
    </div>
  )
}

export default ServicesStrip

