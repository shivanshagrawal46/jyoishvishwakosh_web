import React, { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../contexts/AuthContext'
import { useChrome } from '../contexts/ChromeContext'
import useMediaQuery from '../hooks/useMediaQuery'
import { googleLogin } from '../services/api'
import { useToast } from './ui/Toast'
import {
  IconMenu, IconMoon, IconSearch, IconSun, IconX, IconChevronDown,
  IconHome, IconCalendar, IconZodiac, IconBook,
} from './ui/Icons'
import { NAV_LINKS } from '../data/site'
import logoImg from '../assets/icons/logo_new.png'

const EASE = [0.22, 1, 0.36, 1]

/* Four destinations plus More. Anything beyond five targets stops being a
   tab bar and starts being a menu. */
const TAB_LINKS = [
  { path: '/',          name: 'Home',      nameHi: 'होम',     Icon: IconHome },
  { path: '/panchang',  name: 'Panchang',  nameHi: 'पंचांग',   Icon: IconCalendar },
  { path: '/rashi-fal', name: 'Horoscope', nameHi: 'राशिफल',  Icon: IconZodiac },
  { path: '/books',     name: 'Granth',    nameHi: 'ग्रंथ',     Icon: IconBook },
]

/* These three live at module scope on purpose. Declared inside Header they
   would be a fresh component type on every render, so React would unmount and
   remount them — and Google's button rebuilds its iframe when it mounts, which
   read as a flicker in the header on every scroll or language change. */
const LangToggle = ({ hi, setLanguage, block = false }) => (
  <div className={`lang-pill${block ? ' lang-pill--block' : ''}`} role="group"
    aria-label={hi ? 'भाषा चुनें' : 'Choose language'}>
    <button
      type="button"
      className={`lang-pill__btn${hi ? ' is-active' : ''}`}
      aria-pressed={hi}
      onClick={() => setLanguage('hindi')}
    >
      हिं
    </button>
    <button
      type="button"
      className={`lang-pill__btn${!hi ? ' is-active' : ''}`}
      aria-pressed={!hi}
      onClick={() => setLanguage('english')}
    >
      EN
    </button>
  </div>
)

const SignIn = React.memo(function SignIn({ compact, inDrawer = false, onSuccess, onError }) {
  return (
    <GoogleLogin
      onSuccess={onSuccess}
      onError={onError}
      theme="outline"
      shape="pill"
      type="standard"
      size={inDrawer ? 'large' : 'medium'}
      // "Sign in with Google" needs width the phone header does not have, so
      // the label shortens rather than collapsing to an unlabelled G badge.
      text={compact && !inDrawer ? 'signin' : 'signin_with'}
      width={inDrawer ? '280' : undefined}
      useOneTap={false}
    />
  )
})

const UserMenu = ({ user, hi, logout }) => (
  <div className="usermenu">
    <button type="button" className="usermenu__btn">
      {user.picture
        ? <img src={user.picture} alt="" className="usermenu__avatar" />
        : <span className="usermenu__avatar usermenu__avatar--fallback">{(user.firstName || 'U')[0]}</span>}
      <span className="usermenu__name">{user.firstName}</span>
      <IconChevronDown s={14} />
    </button>
    <div className="usermenu__panel">
      <div className="usermenu__info">
        <p className="usermenu__fullname">{user.firstName} {user.lastName}</p>
        <p className="usermenu__email">{user.email}</p>
      </div>
      <button type="button" className="usermenu__logout" onClick={logout}>
        {hi ? 'लॉगआउट' : 'Log out'}
      </button>
    </div>
  </div>
)

const Header = ({ language, setLanguage }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, toggleTheme, openSearch } = useChrome()
  const { user, login, logout } = useAuth()
  const toast = useToast()
  const location = useLocation()
  const hi = language === 'hindi'
  // A full "Sign in with Google" pill will not fit beside the wordmark, the
  // language switch and search on a phone, so it collapses to the G badge.
  const compact = useMediaQuery('(max-width: 640px)')

  useEffect(() => setMenuOpen(false), [location.pathname])

  useEffect(() => {
    let frame = 0
    // Read once per frame, and keep a dead zone around the threshold: iOS
    // momentum and rubber-band scrolling cross a single pixel line repeatedly,
    // which flipped this state — and re-rendered the header — mid-gesture.
    const read = () => {
      frame = 0
      const y = window.scrollY
      setScrolled((was) => (was ? y > 4 : y > 16))
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(read) }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  // The drawer is a modal surface: lock the page and close on Escape.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const handleGoogleLoginSuccess = useCallback(async (credentialResponse) => {
    try {
      const response = await googleLogin(credentialResponse.credential)
      if (response.token && response.user) {
        login(response.token, response.user)
        toast.success(hi ? 'आपका स्वागत है' : 'Welcome back')
      }
    } catch (error) {
      toast.error(
        hi
          ? `लॉगिन विफल: ${error.message || 'अज्ञात त्रुटि'}`
          : `Login failed: ${error.message || 'Unknown error'}`
      )
    }
  }, [hi, login, toast])

  const handleGoogleLoginError = useCallback(
    () => toast.error(hi ? 'लॉगिन विफल रहा' : 'Sign in failed'),
    [hi, toast]
  )

  const label = (link) => (hi ? link.nameHi : link.name)

  return (
    <>
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="u-shell site-header__inner">
          {/* The logo already carries the wordmark — setting it again in text
              was the same name twice. */}
          <Link to="/" className="brand" aria-label="ज्योतिष विश्वकोष">
            <img src={logoImg} alt="ज्योतिष विश्वकोष" className="brand__mark" width="132" height="46" />
          </Link>

          <nav className="nav" aria-label={hi ? 'मुख्य नेविगेशन' : 'Main navigation'}>
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`}
              >
                {label(link)}
              </NavLink>
            ))}
          </nav>

          <div className="site-header__actions">
            <button
              type="button"
              className="searchtrigger"
              onClick={openSearch}
              aria-label={hi ? 'खोजें' : 'Search'}
            >
              <IconSearch s={17} />
              <span className="searchtrigger__label">{hi ? 'खोजें' : 'Search'}</span>
              <kbd className="searchtrigger__kbd">⌘K</kbd>
            </button>

            <LangToggle hi={hi} setLanguage={setLanguage} />

            {user
              ? <UserMenu user={user} hi={hi} logout={logout} />
              : <SignIn
                  compact={compact}
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                />}

            <button
              type="button"
              className="icon-btn menu-toggle"
              onClick={() => setMenuOpen(true)}
              aria-label={hi ? 'मेन्यू खोलें' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <IconMenu s={20} />
            </button>
          </div>
        </div>
      </header>

      {/* On a phone the primary routes belong under the thumb, not behind a
          hamburger at the top of the screen. */}
      <nav className="tabbar" aria-label={hi ? 'मुख्य नेविगेशन' : 'Main navigation'}>
        {TAB_LINKS.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.path === '/'}
            className={({ isActive }) => `tabbar__item${isActive ? ' is-active' : ''}`}
          >
            <tab.Icon s={21} />
            <span>{hi ? tab.nameHi : tab.name}</span>
          </NavLink>
        ))}
        <button
          type="button"
          className="tabbar__item"
          onClick={() => setMenuOpen(true)}
          aria-expanded={menuOpen}
        >
          <IconMenu s={21} />
          <span>{hi ? 'और' : 'More'}</span>
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="drawer__scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: .2 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="drawer"
              role="dialog"
              aria-modal="true"
              aria-label={hi ? 'मेन्यू' : 'Menu'}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: .3, ease: EASE }}
            >
              <div className="drawer__head">
                <span className="u-eyebrow" lang={hi ? 'hi' : undefined}>{hi ? 'मेन्यू' : 'Menu'}</span>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setMenuOpen(false)}
                  aria-label={hi ? 'बंद करें' : 'Close'}
                >
                  <IconX s={19} />
                </button>
              </div>

              <nav className="drawer__nav">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    end={link.path === '/'}
                    className={({ isActive }) => `drawer__link${isActive ? ' is-active' : ''}`}
                  >
                    {label(link)}
                  </NavLink>
                ))}
              </nav>

              <div className="drawer__foot">
                {/* The narrowest phones drop the header's search button, so the
                    drawer carries it too. */}
                <button
                  type="button"
                  className="u-btn u-btn--ghost u-btn--block"
                  onClick={() => { setMenuOpen(false); openSearch() }}
                >
                  <IconSearch s={17} />{hi ? 'खोजें' : 'Search'}
                </button>

                <LangToggle hi={hi} setLanguage={setLanguage} block />

                {/* Day/night lives here rather than in the header, where it was
                    competing with navigation for the same few pixels. */}
                <button type="button" className="u-btn u-btn--ghost u-btn--block" onClick={toggleTheme}>
                  {theme === 'dark' ? <IconSun s={17} /> : <IconMoon s={17} />}
                  {theme === 'dark'
                    ? (hi ? 'दिन मोड' : 'Day mode')
                    : (hi ? 'रात्रि मोड' : 'Night mode')}
                </button>

                {user ? (
                  <button type="button" className="u-btn u-btn--ghost u-btn--block" onClick={logout}>
                    {hi ? 'लॉगआउट' : 'Log out'}
                  </button>
                ) : (
                  <SignIn
                    inDrawer
                    compact={compact}
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginError}
                  />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Header
