import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'

import homeIcon from '../assets/icons/home_icon.png'
import homeIconSelected from '../assets/icons/home_icon_selected.png'
import chatIcon from '../assets/icons/chat_icon.png'
import chatIconSelected from '../assets/icons/chat_icon_selected.png'
import astroshopIcon from '../assets/icons/astroshop_icon.png'
import astroshopIconSelected from '../assets/icons/astroshop_icon_selected.png'
import poojaIcon from '../assets/icons/pooja_icon.png'
import poojaIconSelected from '../assets/icons/pooja_icon_selected.png'
import quizIcon from '../assets/icons/quiz_icon.png'
import quizIconSelected from '../assets/icons/quiz_icon_selected.png'
import aboutIcon from '../assets/icons/about.png'
import aboutIconSelected from '../assets/icons/about_selected.png'

const BottomNav = ({ language }) => {
  const location = useLocation()
  
  const navItems = [
    { id: 'home', name: 'Home', nameHi: 'होम', icon: homeIcon, iconActive: homeIconSelected, path: '/' },
    { id: 'chat', name: 'Chat', nameHi: 'चैट', icon: chatIcon, iconActive: chatIconSelected, path: '/#chat' },
    { id: 'shop', name: 'Shop', nameHi: 'शॉप', icon: astroshopIcon, iconActive: astroshopIconSelected, path: '/astroshop' },
    { id: 'pooja', name: 'Pooja', nameHi: 'पूजा', icon: poojaIcon, iconActive: poojaIconSelected, path: '/e-pooja' },
    { id: 'quiz', name: 'Quiz', nameHi: 'क्विज', icon: quizIcon, iconActive: quizIconSelected, path: '/#quiz' },
    { id: 'about', name: 'About', nameHi: 'About', icon: aboutIcon, iconActive: aboutIconSelected, path: '/#about' },
  ]
  
  // Determine active item based on current route
  const getActiveId = () => {
    if (location.pathname === '/') return 'home'
    if (location.pathname === '/astroshop') return 'shop'
    if (location.pathname === '/e-pooja' || location.pathname.startsWith('/e-pooja/')) return 'pooja'
    return null
  }
  
  const active = getActiveId()

  return (
    <motion.nav
      className="bottom-nav"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="bottom-nav-inner">
        {navItems.map((item) => {
          const isActive = active === item.id
          // Handle hash links (like /#chat) - use regular anchor
          if (item.path.startsWith('/#')) {
            return (
              <motion.a
                key={item.id}
                href={item.path}
                className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                whileTap={{ scale: 0.95 }}
              >
                <img src={isActive ? item.iconActive : item.icon} alt={item.name} />
                <span>{language === 'hindi' ? item.nameHi : item.name}</span>
              </motion.a>
            )
          }
          // Use Link for regular routes
          return (
            <motion.div
              key={item.id}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={item.path}
                className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              >
                <img src={isActive ? item.iconActive : item.icon} alt={item.name} />
                <span>{language === 'hindi' ? item.nameHi : item.name}</span>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </motion.nav>
  )
}

export default BottomNav







