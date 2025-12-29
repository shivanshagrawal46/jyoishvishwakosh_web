import React, { useState, useEffect } from 'react'

const FloatingBooks = () => {
  const books = [
    'बृहत्पाराशरहोरा',
    'बृहज्जातकम्',
    'सारावली',
    'जातकपारिजात',
    'फलदीपिका',
    'सर्वार्थचिंतामणि',
    'भृगुसूत्र',
    'भावप्रकाश',
    'जातकालंकार',
    'गर्गजातक',
    'लघुपाराशरी',
    'गोलपरिभाषा',
    'बृहद्वास्तुमाला',
    'जातकाभरण',
    'खेटकौतुकम्',
    'लघुजातक',
    'मानसागरी',
    'षट्पंचाशिका',
    'सूर्य सिद्धांत',
    'मुहूर्तचिंतामणि',
  ]

  const [visibleBubbles, setVisibleBubbles] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const BUBBLE_DURATION = 8000 // 8 seconds for bubble to travel
  const BUBBLE_INTERVAL = 1100 // 1.1 seconds gap between new bubbles (closer together)
  const MAX_VISIBLE = 7 // Maximum bubbles visible at once

  useEffect(() => {
    const addBubble = () => {
      setVisibleBubbles(prev => {
        // Remove oldest if we have too many
        const updated = prev.length >= MAX_VISIBLE ? prev.slice(1) : prev
        return [...updated, { id: Date.now(), text: books[currentIndex] }]
      })
      
      setCurrentIndex(prev => (prev + 1) % books.length)
    }

    // Add first bubble immediately
    if (visibleBubbles.length === 0) {
      addBubble()
    }

    // Add new bubbles at interval
    const intervalId = setInterval(addBubble, BUBBLE_INTERVAL)

    return () => clearInterval(intervalId)
  }, [currentIndex, books.length])

  // Remove bubble after animation completes
  useEffect(() => {
    if (visibleBubbles.length > 0) {
      const timeoutId = setTimeout(() => {
        setVisibleBubbles(prev => prev.slice(1))
      }, BUBBLE_DURATION)

      return () => clearTimeout(timeoutId)
    }
  }, [visibleBubbles.length])

  return (
    <div className="floating-bubbles-container">
      {visibleBubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="floating-bubble hindi"
        >
          {bubble.text}
        </div>
      ))}
    </div>
  )
}

export default FloatingBooks
