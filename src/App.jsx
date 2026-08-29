import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import useLanguage from './hooks/useLanguage'
import useTheme from './hooks/useTheme'
import useContentGuard from './hooks/useContentGuard'
import { ChromeProvider } from './contexts/ChromeContext'
import ToastProvider from './components/ui/Toast'
import AppPromptDialog from './components/ui/AppPromptDialog'
import ScrollManager from './components/ScrollManager'
import CommandSearch from './components/CommandSearch'
import Splash from './components/Splash'

import Header from './components/Header'
import Hero from './components/Hero'
import Services from './components/Services'
import AstrologerBanner from './components/AstrologerBanner'
import AIJyotishSection from './components/AIJyotishSection'
import CalculationSection from './components/CalculationSection'
import Rashifal from './components/Rashifal'
import EPooja from './components/EPooja'
import AstroShop from './components/AstroShop'
import AboutTeam from './components/AboutTeam'
import AppDownloadBanner from './components/AppDownloadBanner'
import Footer from './components/Footer'
import { Flourish } from './components/ui'
import { Mandala } from './components/ui/Icons'

import KoshPage from './pages/KoshPage'
import HasthRekhaPage from './pages/HasthRekhaPage'
import VastuPage from './pages/VastuPage'
import AnkJyotishPage from './pages/AnkJyotishPage'
import ChalisaAartiPage from './pages/ChalisaAartiPage'
import MantraTantraPage from './pages/MantraTantraPage'
import DharmaShastraPage from './pages/DharmaShastraPage'
import KarmkandPage from './pages/KarmkandPage'
import EPoojaPage from './pages/EPoojaPage'
import EPoojaDetailPage from './pages/EPoojaDetailPage'
import AstroShopPage from './pages/AstroShopPage'
import AstroShopDetailPage from './pages/AstroShopDetailPage'
import JyotishReportPage from './pages/JyotishReportPage'
import MulankPage from './pages/MulankPage'
import BhagyankPage from './pages/BhagyankPage'
import LoShuPage from './pages/LoShuPage'
import AiAnkPage from './pages/AiAnkPage'
import NumerologyReportPage from './pages/NumerologyReportPage'
import RashiPage from './pages/RashiPage'
import NakshatraPage from './pages/NakshatraPage'
import DashaPage from './pages/DashaPage'
import OrderPage from './pages/OrderPage'
import RashiFalPage from './pages/RashiFalPage'
import AnkFalPage from './pages/AnkFalPage'
import PanchangPage from './pages/PanchangPage'
import DainikMuhuratPage from './pages/DainikMuhuratPage'
import BookPage from './pages/BookPage'
import BookDetailPage from './pages/BookDetailPage'
import BookReaderPage from './pages/BookReaderPage'
import EMagazinePage from './pages/EMagazinePage'
import EMagazineDetailPage from './pages/EMagazineDetailPage'
import VideosPage from './pages/VideosPage'
import DivineQuotesPage from './pages/DivineQuotesPage'
import PrashanYantraPage from './pages/PrashanYantraPage'
import QuizPage from './pages/QuizPage'
import QuizSetsPage from './pages/QuizSetsPage'
import QuizPlayPage from './pages/QuizPlayPage'
import QuizReviewPage from './pages/QuizReviewPage'
import QuizBookmarksPage from './pages/QuizBookmarksPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'
import CsuPrintingPage from './pages/CsuPrintingPage'
import CsuPrinting2Page from './pages/CsuPrinting2Page'
import CsuPrinting3Page from './pages/CsuPrinting3Page'

const EASE = [0.22, 1, 0.36, 1]

/**
 * TEMPORARY — landing sections switched off for now, to be restored unchanged.
 * The components, their styles and their data fetching are all untouched; set
 * a flag back to true and that section returns exactly as it was. The /e-pooja
 * and /astroshop pages themselves are unaffected and still linked everywhere.
 */
const SHOW_ON_HOME = {
  epooja: false,
  astroshop: false,
  consultBanner: false,
}

/** Every route that takes the shared language/theme/search props. */
const PAGES = [
  ['/kosh', KoshPage],
  ['/hasth-rekha', HasthRekhaPage],
  ['/vastu', VastuPage],
  ['/ank-jyotish', AnkJyotishPage],
  ['/chalisa-aarti', ChalisaAartiPage],
  ['/mantra-tantra', MantraTantraPage],
  ['/dharma-shastra', DharmaShastraPage],
  ['/karmkand', KarmkandPage],
  ['/e-pooja', EPoojaPage],
  ['/e-pooja/:slug', EPoojaDetailPage],
  ['/astroshop', AstroShopPage],
  ['/astroshop/:slug', AstroShopDetailPage],
  ['/jyotish-report', JyotishReportPage],
  ['/mulank', MulankPage],
  ['/bhagyank', BhagyankPage],
  ['/loshu', LoShuPage],
  ['/ai-ank', AiAnkPage],
  ['/numerology-report', NumerologyReportPage],
  ['/rashi', RashiPage],
  ['/nakshatra', NakshatraPage],
  ['/dasha', DashaPage],
  ['/order', OrderPage],
  ['/rashi-fal', RashiFalPage],
  ['/ank-fal', AnkFalPage],
  ['/panchang', PanchangPage],
  ['/dainik-muhurat', DainikMuhuratPage],
  ['/books', BookPage],
  ['/books/:categoryId', BookPage],
  ['/books/:categoryId/:bookId', BookDetailPage],
  ['/books/:categoryId/:bookId/:chapterId', BookReaderPage],
  ['/emagazine', EMagazinePage],
  ['/emagazine/:id', EMagazineDetailPage],
  ['/videos', VideosPage],
  ['/divine-quotes', DivineQuotesPage],
  ['/prashan-yantra', PrashanYantraPage],
  ['/contact', ContactPage],

  // Static segments outrank `:categoryId` in the router's own ranking, so the
  // order here is for the reader's benefit rather than the matcher's.
  ['/quiz', QuizPage],
  ['/quiz/play', QuizPlayPage],
  ['/quiz/bookmarks', QuizBookmarksPage],
  ['/quiz/review/:attemptId', QuizReviewPage],
  ['/quiz/:categoryId', QuizSetsPage],
]

function HomePage({ language, setLanguage }) {
  return (
    <>
      <Header language={language} setLanguage={setLanguage} />
      <main id="main">
        {/* One continuous first view: the pitch and the full service grid. */}
        <section className="lead">
          <Mandala className="lead__mandala" aria-hidden="true" />
          <Hero language={language} />
          <Services language={language} />
        </section>
        <Rashifal language={language} />
        <AIJyotishSection language={language} />
        {SHOW_ON_HOME.epooja && <EPooja language={language} />}
        {SHOW_ON_HOME.astroshop && <AstroShop language={language} />}
        <Flourish />
        {SHOW_ON_HOME.consultBanner && <AstrologerBanner language={language} />}
        <CalculationSection language={language} />
        <AboutTeam language={language} />
        <AppDownloadBanner language={language} />
      </main>
      <Footer language={language} />
    </>
  )
}

/** Crossfade between routes — short enough to feel instant, long enough to soften. */
function RouteFade({ children }) {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: EASE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

function AppRoutes({ language, setLanguage, searchOpen, setSearchOpen }) {
  const location = useLocation()
  const props = { language, setLanguage }

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSearchOpen])

  return (
    <>
      <ScrollManager />
      <a className="skip-link" href="#main">
        {language === 'hindi' ? 'मुख्य सामग्री पर जाएं' : 'Skip to content'}
      </a>

      <RouteFade>
        <Routes location={location}>
          <Route path="/" element={<HomePage {...props} />} />
          {PAGES.map(([path, Page]) => (
            <Route key={path} path={path} element={<Page {...props} />} />
          ))}
          <Route path="/csu/printing/guruji/a6" element={<CsuPrintingPage />} />
          <Route path="/csu/printing/guruji/a6/excel2" element={<CsuPrinting2Page />} />
          <Route path="/csu/printing/guruji/a6/3" element={<CsuPrinting3Page />} />
          <Route path="*" element={<NotFoundPage {...props} />} />
        </Routes>
      </RouteFade>

      <CommandSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        language={language}
      />
    </>
  )
}

function App() {
  const [language, setLanguage] = useLanguage()
  const { theme, toggle: toggleTheme } = useTheme()
  useContentGuard()
  const [searchOpen, setSearchOpen] = useState(false)
  const [appPrompt, setAppPrompt] = useState(null)

  const openSearch = useCallback(() => setSearchOpen(true), [])
  const openAppPrompt = useCallback((feature) => setAppPrompt(feature || ''), [])
  const closeAppPrompt = useCallback(() => setAppPrompt(null), [])

  const chrome = useMemo(
    () => ({ theme, toggleTheme, openSearch, openAppPrompt }),
    [theme, toggleTheme, openSearch, openAppPrompt]
  )

  return (
    <ChromeProvider value={chrome}>
      <ToastProvider>
        <Splash />
        <Router>
          <div className="app">
            <AppRoutes
              language={language}
              setLanguage={setLanguage}
              searchOpen={searchOpen}
              setSearchOpen={setSearchOpen}
            />
          </div>
        </Router>
        <AppPromptDialog
          open={appPrompt !== null}
          feature={appPrompt}
          language={language}
          onClose={closeAppPrompt}
        />
      </ToastProvider>
    </ChromeProvider>
  )
}

export default App
