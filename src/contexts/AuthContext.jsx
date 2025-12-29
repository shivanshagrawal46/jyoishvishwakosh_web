import React, { createContext, useContext, useState, useEffect } from 'react'
import { getUser, saveAuthData, clearAuthData, isAuthenticated } from '../utils/auth'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user from localStorage on mount
    const loadUser = () => {
      try {
        const savedUser = getUser()
        if (savedUser && isAuthenticated()) {
          setUser(savedUser)
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = (token, userData) => {
    if (saveAuthData(token, userData)) {
      setUser(userData)
      return true
    }
    return false
  }

  const logout = () => {
    if (clearAuthData()) {
      setUser(null)
      return true
    }
    return false
  }

  const value = {
    user,
    isAuthenticated: isAuthenticated(),
    login,
    logout,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

