import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import TodayMuhurat from './TodayMuhurat'
import PrashanYantra from './PrashanYantra'
import useMediaQuery from '../hooks/useMediaQuery'
import { Button, SectionHeader } from './ui'
import { IconCalendar, IconClock, IconPin, IconUser } from './ui/Icons'
import {
  fetchJyotishChart,
  fetchPopularCities,
  searchCities
} from '../services/api'

const EASE = [0.22, 1, 0.36, 1]

const column = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: .42, ease: EASE } },
}

const AIJyotishSection = ({ language }) => {
  const hi = language === 'hindi'
  // The yantra is a full-screen ritual, not a preview. Stacked on a phone it was
  // a third long scroll before the next section, so it stays on its own page.
  const phone = useMediaQuery('(max-width: 720px)')

  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    birthDate: '',
    birthTime: '',
    timePeriod: 'AM',
    birthPlace: ''
  })

  const navigate = useNavigate()
  const [cityResults, setCityResults] = useState([])
  const [selectedCity, setSelectedCity] = useState(null)
  const [cityLoading, setCityLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const searchTimerRef = useRef(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'birthPlace') handleCitySearch(value)
  }

  useEffect(() => {
    // Warms the API's city cache so the first keystroke resolves instantly.
    fetchPopularCities().catch(() => {})
  }, [])

  const handleCitySearch = (value) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    if (!value || value.length < 2) {
      setCityResults([])
      return
    }
    searchTimerRef.current = setTimeout(async () => {
      setCityLoading(true)
      const cities = await searchCities(value, 8)
      setCityResults(cities || [])
      setCityLoading(false)
    }, 300)
  }

  const handleCitySelect = (city) => {
    setSelectedCity(city)
    setFormData(prev => ({ ...prev, birthPlace: city.displayName || city.name || '' }))
    setCityResults([])
  }

  const formatTime24 = useMemo(() => {
    return (timeStr, period) => {
      if (!timeStr) return ''
      const [rawH, rawM] = timeStr.split(':')
      let h = parseInt(rawH || '0', 10)
      const m = rawM || '00'
      if (period === 'PM' && h < 12) h += 12
      if (period === 'AM' && h === 12) h = 0
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.birthDate || !formData.birthTime || !selectedCity) {
      setError(hi ? 'कृपया सभी अनिवार्य विवरण भरें' : 'Please fill all required details.')
      return
    }

    try {
      setSubmitLoading(true)
      const payload = {
        fullName: formData.name,
        dateOfBirth: formData.birthDate,
        timeOfBirth: formatTime24(formData.birthTime, formData.timePeriod),
        locationId: selectedCity.id || selectedCity._id
      }
      const result = await fetchJyotishChart(payload)
      sessionStorage.setItem('jyotish_report', JSON.stringify(result))
      navigate('/jyotish-report', { state: { report: result } })
    } catch (err) {
      setError(err.message || (hi ? 'कुछ गड़बड़ हो गई' : 'Something went wrong'))
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <section id="ai-jyotish" className="u-section u-section--tight">
      <div className="u-shell">
        <SectionHeader
          language={language}
          eyebrow={hi ? 'एआई ज्योतिष' : 'AI Jyotish'}
          title={hi ? 'अपनी कुंडली, अपना मुहूर्त, अपना उत्तर' : 'Your chart, your muhurat, your answer'}
          subtitle={hi
            ? 'पारंपरिक गणना, तुरंत परिणाम — जन्म विवरण भरें और निःशुल्क पढ़ें।'
            : 'Classical calculation, computed in seconds — enter your birth details and read it free.'}
        />

        <div className="aj-grid">
          <motion.form
            className="aj"
            onSubmit={handleSubmit}
            variants={column}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            <div className="aj__head">
              <h3 className="aj__title">{hi ? 'निःशुल्क भविष्यवाणी' : 'Free prediction'}</h3>
              <p className="aj__note">
                {hi ? 'जन्म विवरण भरें — रिपोर्ट तुरंत खुलेगी।' : 'Fill your birth details — the report opens right away.'}
              </p>
            </div>

            <div className="aj__body">
              <label className="aj-fld">
                <span className="aj-fld__label">{hi ? 'नाम' : 'Name'}</span>
                <span className="aj-fld__box">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={hi ? 'अपना नाम' : 'Your name'}
                    required
                  />
                  <IconUser s={17} className="aj-fld__icon" />
                </span>
              </label>

              <div className="aj-fld">
                <span className="aj-fld__label">{hi ? 'लिंग' : 'Gender'}</span>
                <div className="aj-seg">
                  {[
                    ['male', hi ? 'पुरुष' : 'Male'],
                    ['female', hi ? 'महिला' : 'Female'],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={formData.gender === value}
                      onClick={() => setFormData(prev => ({ ...prev, gender: value }))}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="aj-fld">
                <span className="aj-fld__label">{hi ? 'जन्म तिथि' : 'Date of birth'}</span>
                <span className="aj-fld__box">
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    required
                  />
                  <IconCalendar s={17} className="aj-fld__icon" />
                </span>
              </label>

              <div className="aj-row">
                <label className="aj-fld">
                  <span className="aj-fld__label">{hi ? 'जन्म समय' : 'Time of birth'}</span>
                  <span className="aj-fld__box">
                    <input
                      type="time"
                      name="birthTime"
                      value={formData.birthTime}
                      onChange={handleInputChange}
                      required
                    />
                    <IconClock s={17} className="aj-fld__icon" />
                  </span>
                </label>
                <div className="aj-seg">
                  {['AM', 'PM'].map((period) => (
                    <button
                      key={period}
                      type="button"
                      aria-pressed={formData.timePeriod === period}
                      onClick={() => setFormData(prev => ({ ...prev, timePeriod: period }))}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              <div className="aj-fld">
                <label className="aj-fld__label" htmlFor="aj-birthplace">
                  {hi ? 'जन्म स्थान' : 'Place of birth'}
                </label>
                <span className="aj-fld__box">
                  <input
                    id="aj-birthplace"
                    type="text"
                    name="birthPlace"
                    value={formData.birthPlace}
                    onChange={handleInputChange}
                    placeholder={hi ? 'शहर लिखें, सूची से चुनें' : 'Type a city, pick from the list'}
                    autoComplete="off"
                    required
                  />
                  <IconPin s={17} className="aj-fld__icon" />
                </span>
                {cityLoading && <span className="aj-hint">{hi ? 'खोज हो रही है…' : 'Searching…'}</span>}
                {cityResults.length > 0 && (
                  <div className="aj-drop">
                    {cityResults.map(city => (
                      <button
                        key={city.id || city._id}
                        type="button"
                        onClick={() => handleCitySelect(city)}
                      >
                        {city.displayName || city.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {error && <p className="aj-err" role="alert">{error}</p>}
            </div>

            <div className="aj__foot">
              <Button type="submit" block disabled={submitLoading}>
                {submitLoading
                  ? (hi ? 'गणना हो रही है…' : 'Calculating…')
                  : (hi ? 'निःशुल्क भविष्यवाणी देखें' : 'Get my free prediction')}
              </Button>
            </div>
          </motion.form>

          <motion.div variants={column} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
            <TodayMuhurat language={language} />
          </motion.div>

            {!phone && (
              <motion.div variants={column} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
                <PrashanYantra language={language} />
              </motion.div>
            )}
        </div>
      </div>
    </section>
  )
}

export default AIJyotishSection
