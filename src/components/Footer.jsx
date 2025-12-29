import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import logoImg from '../assets/icons/logo_new.png'
import youtubeIcon from '../assets/icons/youtube.png'
import whatsappIcon from '../assets/icons/whatsapp.png'
import googleIcon from '../assets/icons/google.png'

const Footer = ({ language }) => {
  const links = {
    services: [
      { name: 'Kundli', nameHi: 'कुंडली' },
      { name: 'Rashifal', nameHi: 'राशिफल' },
      { name: 'Panchang', nameHi: 'पंचांग' },
      { name: 'Matching', nameHi: 'मिलान' },
      { name: 'Vastu', nameHi: 'वास्तु' },
    ],
    shop: [
      { name: 'Gemstones', nameHi: 'रत्न' },
      { name: 'Rudraksha', nameHi: 'रुद्राक्ष' },
      { name: 'Yantra', nameHi: 'यंत्र' },
      { name: 'Mala', nameHi: 'माला' },
    ],
    support: [
      { name: 'Help', nameHi: 'सहायता' },
      { name: 'Contact', nameHi: 'संपर्क' },
      { name: 'FAQ', nameHi: 'FAQ' },
      { name: 'Privacy', nameHi: 'गोपनीयता' },
    ],
  }

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

  const linkVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 120, damping: 12 }
    }
  }

  return (
    <motion.footer 
      className="footer"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <div className="container">
        <div className="footer-grid">
          <motion.div variants={itemVariants}>
            <motion.div 
              className="logo" 
              style={{ marginBottom: '16px' }}
              whileHover={{ scale: 1.02 }}
            >
              <img src={logoImg} alt="Jyotish Vishwakosh" className="logo-img" />
              <span className="logo-text">ज्योतिष विश्वकोष</span>
            </motion.div>
            <p className="footer-brand-text">
              {language === 'hindi'
                ? 'भारत का सबसे विश्वसनीय ज्योतिष पोर्टल। वैदिक ज्ञान और आधुनिक तकनीक का संगम।'
                : "India's Most Trusted Astrology Portal. Blend of Vedic Wisdom and Modern Technology."}
            </p>
            <motion.div 
              className="footer-social"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
            >
              {/* YouTube */}
              <motion.a 
                href="https://www.youtube.com/@jyotishvishwakoshapp"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                variants={linkVariants}
                whileHover={{ 
                  scale: 1.15, 
                  y: -3,
                  boxShadow: "0 6px 20px rgba(255, 107, 53, 0.3)"
                }}
                whileTap={{ scale: 0.9 }}
              >
                <img src={youtubeIcon} alt="YouTube" />
              </motion.a>
              
              {/* WhatsApp */}
              <motion.a 
                href="https://wa.me/919754648985"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                variants={linkVariants}
                whileHover={{ 
                  scale: 1.15, 
                  y: -3,
                  boxShadow: "0 6px 20px rgba(255, 107, 53, 0.3)"
                }}
                whileTap={{ scale: 0.9 }}
              >
                <img src={whatsappIcon} alt="WhatsApp" />
              </motion.a>
              
              {/* Google Play Store */}
              <motion.a 
                href="https://play.google.com/store/apps/details?id=jyotishvivkosh.mobileapplication"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                variants={linkVariants}
                whileHover={{ 
                  scale: 1.15, 
                  y: -3,
                  boxShadow: "0 6px 20px rgba(255, 107, 53, 0.3)"
                }}
                whileTap={{ scale: 0.9 }}
              >
                <img src={googleIcon} alt="Google Play Store" />
              </motion.a>
              
              {/* Facebook */}
              <motion.a 
                href="https://www.facebook.com/jyotishvishwakosh"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                variants={linkVariants}
                whileHover={{ 
                  scale: 1.15, 
                  y: -3,
                  boxShadow: "0 6px 20px rgba(255, 107, 53, 0.3)"
                }}
                whileTap={{ scale: 0.9 }}
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </motion.a>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="footer-title">{language === 'hindi' ? 'सेवाएं' : 'Services'}</h4>
            <motion.ul 
              className="footer-links"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {links.services.map((link) => (
                <motion.li key={link.name} variants={linkVariants}>
                  <motion.a 
                    href="#" 
                    className={`footer-link ${language === 'hindi' ? 'hindi' : ''}`}
                    whileHover={{ x: 5, color: "#FF6B35" }}
                  >
                    {language === 'hindi' ? link.nameHi : link.name}
                  </motion.a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="footer-title">{language === 'hindi' ? 'शॉप' : 'Shop'}</h4>
            <motion.ul 
              className="footer-links"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {links.shop.map((link) => (
                <motion.li key={link.name} variants={linkVariants}>
                  <motion.a 
                    href="#" 
                    className={`footer-link ${language === 'hindi' ? 'hindi' : ''}`}
                    whileHover={{ x: 5, color: "#FF6B35" }}
                  >
                    {language === 'hindi' ? link.nameHi : link.name}
                  </motion.a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="footer-title">{language === 'hindi' ? 'सहायता' : 'Support'}</h4>
            <motion.ul 
              className="footer-links"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {links.support.map((link) => (
                <motion.li key={link.name} variants={linkVariants}>
                  {link.name === 'Contact' ? (
                    <Link 
                      to="/contact"
                      className={`footer-link ${language === 'hindi' ? 'hindi' : ''}`}
                    >
                      {language === 'hindi' ? link.nameHi : link.name}
                    </Link>
                  ) : (
                    <motion.a 
                      href="#" 
                      className={`footer-link ${language === 'hindi' ? 'hindi' : ''}`}
                      whileHover={{ x: 5, color: "#FF6B35" }}
                    >
                      {language === 'hindi' ? link.nameHi : link.name}
                    </motion.a>
                  )}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>

        <motion.div 
          className="footer-bottom"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="footer-copyright">
            © {new Date().getFullYear()} PANDIT AWADHNARESH PANDEY SHIKSHA SAMITI BHOPAL. All Rights Reserved. Made with ❤️ in India
          </p>
        </motion.div>
      </div>
    </motion.footer>
  )
}

export default Footer
