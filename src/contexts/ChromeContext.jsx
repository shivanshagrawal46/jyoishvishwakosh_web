import React, { createContext, useContext } from 'react'

/**
 * Chrome-level concerns (theme, command search) that the Header needs on every
 * page. Kept in context so the 36 page components don't have to forward props
 * they otherwise have no interest in.
 */
const ChromeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  openSearch: () => {},
})

export const ChromeProvider = ({ value, children }) => (
  <ChromeContext.Provider value={value}>{children}</ChromeContext.Provider>
)

export const useChrome = () => useContext(ChromeContext)

export default ChromeContext
