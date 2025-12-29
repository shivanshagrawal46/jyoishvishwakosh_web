/**
 * Authentication utility functions
 */

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

/**
 * Save authentication data to localStorage
 */
export const saveAuthData = (token, user) => {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    return true
  } catch (error) {
    console.error('Error saving auth data:', error)
    return false
  }
}

/**
 * Get authentication token from localStorage
 */
export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch (error) {
    console.error('Error getting token:', error)
    return null
  }
}

/**
 * Get user data from localStorage
 */
export const getUser = () => {
  try {
    const userStr = localStorage.getItem(USER_KEY)
    if (!userStr) return null
    return JSON.parse(userStr)
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken()
}

/**
 * Clear authentication data from localStorage
 */
export const clearAuthData = () => {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    return true
  } catch (error) {
    console.error('Error clearing auth data:', error)
    return false
  }
}

/**
 * Get authorization header for API requests
 */
export const getAuthHeader = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

