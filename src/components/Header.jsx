import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../contexts/AuthContext'
import { googleLogin } from '../services/api'
import logoImg from '../assets/icons/logo_new.png'

const Header = ({ language, setLanguage }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, login, logout } = useAuth()
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const navLinks = [
    { name: 'Home', nameHi: 'होम', path: '/' },
    { name: 'Kundli', nameHi: 'कुंडली', path: '/#app-download' },
    { name: 'Horoscope', nameHi: 'राशिफल', path: '/rashi-fal' },
    { name: 'Panchang', nameHi: 'पंचांग', path: '/panchang' },
    { name: 'Shop', nameHi: 'शॉप', path: '/astroshop' },
    { name: 'E-Pooja', nameHi: 'ई-पूजा', path: '/e-pooja' },
    { name: 'Contact', nameHi: 'संपर्क', path: '/contact' },
  ]

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setIsLoggingIn(true)
    try {
      const response = await googleLogin(credentialResponse.credential)
      if (response.token && response.user) {
        login(response.token, response.user)
      }
    } catch (error) {
      console.error('Google login failed:', error)
      alert(language === 'hindi' ? 'लॉगिन विफल: ' + (error.message || 'अज्ञात त्रुटि') : 'Login failed: ' + (error.message || 'Unknown error'))
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleGoogleLoginError = () => {
    console.error('Google login error')
    setIsLoggingIn(false)
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <motion.header 
      className="header"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="container">
        <div className="header-inner">
          <Link to="/" className="logo">
            <img src={logoImg} alt="Jyotish Vishwakosh" className="logo-img" />
          </Link>

          <nav className="nav-desktop">
            {navLinks.map((link, index) => {
              // Handle hash links (like /#services) - use regular anchor
              if (link.path.startsWith('/#')) {
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <a
                      href={link.path}
                      className="nav-link"
                    >
                      {language === 'hindi' ? link.nameHi : link.name}
                    </a>
                  </motion.div>
                )
              }
              // Use Link for regular routes
              return (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className="nav-link"
                  >
                    {language === 'hindi' ? link.nameHi : link.name}
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          <div className="header-actions">
            {/* Language Switcher */}
            <div className="lang-switcher">
              <button
                className={`lang-btn ${language === 'hindi' ? 'active' : ''}`}
                onClick={() => setLanguage('hindi')}
              >
                हिं
              </button>
              <button
                className={`lang-btn ${language === 'english' ? 'active' : ''}`}
                onClick={() => setLanguage('english')}
              >
                EN
              </button>
            </div>

            {user ? (
              <motion.div
                className="user-profile"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="user-profile-dropdown">
                  <button className="user-profile-btn">
                    {user.picture && (
                      <img src={user.picture} alt={user.firstName || 'User'} className="user-avatar" />
                    )}
                    <span className="user-name">
                      {user.firstName} {user.lastName}
                    </span>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="user-profile-menu">
                    <div className="user-profile-info">
                      <div className="user-profile-name">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="user-profile-email">{user.email}</div>
                    </div>
                    <button className="user-profile-logout" onClick={handleLogout}>
                      {language === 'hindi' ? 'लॉगआउट' : 'Logout'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="google-login-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                  theme="outline"
                  size="medium"
                  text="signin_with"
                  shape="rectangular"
                  locale={language === 'hindi' ? 'hi' : 'en'}
                  useOneTap={false}
                />
              </div>
            )}

            <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              background: 'white',
              borderBottom: '1px solid var(--border)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '16px 24px' }}>
              {navLinks.map((link, index) => {
                // Handle hash links (like /#services) - use regular anchor
                if (link.path.startsWith('/#')) {
                  return (
                    <motion.a
                      key={link.name}
                      href={link.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={{
                        display: 'block',
                        padding: '12px',
                        color: 'var(--text-secondary)',
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        textDecoration: 'none'
                      }}
                      onClick={() => setMenuOpen(false)}
                    >
                      {language === 'hindi' ? link.nameHi : link.name}
                    </motion.a>
                  )
                }
                // Use Link for regular routes
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      style={{
                        display: 'block',
                        padding: '12px',
                        color: 'var(--text-secondary)',
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        textDecoration: 'none'
                      }}
                      onClick={() => setMenuOpen(false)}
                    >
                      {language === 'hindi' ? link.nameHi : link.name}
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

export default Header
