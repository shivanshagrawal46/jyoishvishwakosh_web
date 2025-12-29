import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import CelebrityStrip from './components/CelebrityStrip'
import Services from './components/Services'
import Rashifal from './components/Rashifal'
import AIJyotishSection from './components/AIJyotishSection'
import EPooja from './components/EPooja'
import CalculationSection from './components/CalculationSection'
import AstrologerBanner from './components/AstrologerBanner'
import Panchang from './components/Panchang'
import FloatingBooks from './components/FloatingBooks'
import Footer from './components/Footer'
import AppDownloadBanner from './components/AppDownloadBanner'
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
import AstroShop from './components/AstroShop'
import VisionarySection from './components/VisionarySection'
import AboutTeam from './components/AboutTeam'
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
import EMagazinePage from './pages/EMagazinePage'
import EMagazineDetailPage from './pages/EMagazineDetailPage'
import VideosPage from './pages/VideosPage'
import DivineQuotesPage from './pages/DivineQuotesPage'
import PrashanYantraPage from './pages/PrashanYantraPage'
import ContactPage from './pages/ContactPage'

function HomePage({ language, setLanguage }) {
  return (
    <>
      <Header language={language} setLanguage={setLanguage} />
      <CelebrityStrip language={language} />
      <main>
        <Services language={language} />
        <div className="main-content-grid">
          <div className="left-column">
            <AstrologerBanner language={language} />
            <Rashifal language={language} />
          </div>
          <div className="right-column">
            <Panchang language={language} />
          </div>
        </div>
        <AIJyotishSection language={language} />
        <EPooja language={language} />
        <CalculationSection language={language} />
        <AstroShop language={language} />
        <VisionarySection language={language} />
        <AboutTeam language={language} />
      </main>
      <AppDownloadBanner language={language} />
      <Footer language={language} />
      <FloatingBooks />
    </>
  )
}

function App() {
  const [language, setLanguage] = useState('hindi') // 'hindi' or 'english'

  // Disable right-click and developer tools shortcuts
  // TEMPORARILY DISABLED FOR DEBUGGING - Re-enable after fixing production issues
  // React.useEffect(() => {
  //   // Disable right-click context menu
  //   const handleContextMenu = (e) => {
  //     e.preventDefault()
  //     return false
  //   }

  //   // Disable common keyboard shortcuts
  //   const handleKeyDown = (e) => {
  //     // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S
  //     if (
  //       e.key === 'F12' ||
  //       (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
  //       (e.ctrlKey && (e.key === 'U' || e.key === 'S'))
  //     ) {
  //       e.preventDefault()
  //       return false
  //     }
  //   }

  //   document.addEventListener('contextmenu', handleContextMenu)
  //   document.addEventListener('keydown', handleKeyDown)

  //   return () => {
  //     document.removeEventListener('contextmenu', handleContextMenu)
  //     document.removeEventListener('keydown', handleKeyDown)
  //   }
  // }, [])

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route 
            path="/" 
            element={<HomePage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/kosh" 
            element={<KoshPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/hasth-rekha" 
            element={<HasthRekhaPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/vastu" 
            element={<VastuPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/ank-jyotish" 
            element={<AnkJyotishPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/chalisa-aarti" 
            element={<ChalisaAartiPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/mantra-tantra" 
            element={<MantraTantraPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/dharma-shastra" 
            element={<DharmaShastraPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/karmkand" 
            element={<KarmkandPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/e-pooja" 
            element={<EPoojaPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/e-pooja/:slug" 
            element={<EPoojaDetailPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/astroshop" 
            element={<AstroShopPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/astroshop/:slug" 
            element={<AstroShopDetailPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/jyotish-report" 
            element={<JyotishReportPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/mulank" 
            element={<MulankPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/bhagyank" 
            element={<BhagyankPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/loshu" 
            element={<LoShuPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/ai-ank" 
            element={<AiAnkPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/numerology-report" 
            element={<NumerologyReportPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/rashi" 
            element={<RashiPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/nakshatra" 
            element={<NakshatraPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/dasha" 
            element={<DashaPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/order" 
            element={<OrderPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/rashi-fal" 
            element={<RashiFalPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/ank-fal" 
            element={<AnkFalPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/panchang" 
            element={<PanchangPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/dainik-muhurat" 
            element={<DainikMuhuratPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/books" 
            element={<BookPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/books/:categoryId" 
            element={<BookPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/books/:categoryId/:bookId" 
            element={<BookPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/books/:categoryId/:bookId/:chapterId" 
            element={<BookPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/emagazine" 
            element={<EMagazinePage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/emagazine/:id" 
            element={<EMagazineDetailPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/videos" 
            element={<VideosPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/divine-quotes" 
            element={<DivineQuotesPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/prashan-yantra" 
            element={<PrashanYantraPage language={language} setLanguage={setLanguage} />} 
          />
          <Route 
            path="/contact" 
            element={<ContactPage language={language} setLanguage={setLanguage} />} 
          />
        </Routes>
    </div>
    </Router>
  )
}

export default App
