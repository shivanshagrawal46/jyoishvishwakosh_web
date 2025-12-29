import React from 'react'
import { Link } from 'react-router-dom'
import numerologyIcon from '../assets/icons/numerology.png'
import numerologyCalcIcon from '../assets/icons/numerology_calculator.png'
import rashiIcon from '../assets/icons/rashi.png'
import nakshatraIcon from '../assets/icons/nakshatra.png'
import dashaIcon from '../assets/icons/dasha.png'
import loshuIcon from '../assets/icons/loshoreal.jpg'
import jyotishCalcIcon from '../assets/icons/jyotish_calculator.jpg'

const CalculationSection = ({ language }) => {
  const calculations = [
    { id: 'mulank', label: 'Mulank', labelHi: 'मूलांक', icon: numerologyCalcIcon, color: '#FF6B35', path: '/mulank' },
    { id: 'bhagyank', label: 'Bhagyank', labelHi: 'भाग्यांक', icon: numerologyIcon, color: '#667eea', path: '/bhagyank' },
    { id: 'loshu', label: 'Lo Shu', labelHi: 'लो शू', icon: loshuIcon, color: '#f093fb', path: '/loshu' },
    { id: 'rashi', label: 'Rashi', labelHi: 'राशि', icon: rashiIcon, color: '#11998e', path: '/rashi' },
    { id: 'nakshatra', label: 'Nakshatra', labelHi: 'नक्षत्र', icon: nakshatraIcon, color: '#f5576c', path: '/nakshatra' },
    { id: 'dasha', label: 'Dasha', labelHi: 'दशा', icon: dashaIcon, color: '#FF9A56', path: '/dasha' },
    { id: 'ai-ank', label: 'AI Ank', labelHi: 'AI अंक', icon: jyotishCalcIcon, color: '#764ba2', featured: true, path: '/ai-ank' }
  ]

  return (
    <section id="calculations" className="calc-section">
      <div className="container">
        <div className="calc-header">
          <h2 className={`calc-title ${language === 'hindi' ? 'hindi' : ''}`}>
            {language === 'hindi' ? '🔢 गणना उपकरण' : '🔢 Calculation Tools'}
          </h2>
        </div>

        <div className="calc-row">
          {calculations.map((calc) => (
            <Link
              key={calc.id}
              className={`calc-card ${calc.featured ? 'featured' : ''}`}
              to={calc.path || '#'}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div 
                className="calc-icon-box"
                style={{ 
                  background: `linear-gradient(135deg, ${calc.color}20 0%, ${calc.color}08 100%)`,
                  borderColor: `${calc.color}40`
                }}
              >
                <img src={calc.icon} alt={calc.label} className="calc-icon" />
              </div>
              <span className={`calc-name ${language === 'hindi' ? 'hindi' : ''}`}>
                {language === 'hindi' ? calc.labelHi : calc.label}
              </span>
              {calc.featured && <span className="calc-star">⭐</span>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CalculationSection

