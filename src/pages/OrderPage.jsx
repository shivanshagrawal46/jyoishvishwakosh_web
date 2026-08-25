import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Header'
import ServicesStrip from '../components/ServicesStrip'
import Footer from '../components/Footer'
import { createOrder } from '../services/api'

const OrderPage = ({ language: initialLanguage, setLanguage: setLanguageProp }) => {
  const [language, setLanguage] = useState(initialLanguage || 'hindi')
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    category: 'astroshop',
    productName: '',
    totalAmount: '',
    notes: ''
  })

  // Prefill from navigation state
  useEffect(() => {
    if (location.state) {
      const { category, productName, totalAmount, address } = location.state
      setForm(prev => ({
        ...prev,
        category: category || prev.category,
        productName: productName || prev.productName,
        totalAmount: totalAmount || prev.totalAmount,
        address: address || prev.address
      }))
    }
  }, [location.state])

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    if (setLanguageProp) setLanguageProp(lang)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(null)

    if (!form.customerName || !form.email || !form.phoneNumber || !form.address || !form.city || !form.state || !form.pincode || !form.productName || !form.totalAmount) {
      setError(language === 'hindi' ? 'कृपया सभी आवश्यक फ़ील्ड भरें' : 'Please fill all required fields')
      return
    }

    try {
      setLoading(true)
      const payload = {
        ...form,
        totalAmount: Number(form.totalAmount),
        // Copy main address to shipping address if API requires it
        shippingAddress: {
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          country: 'India'
        }
      }
      const res = await createOrder(payload)
      setSuccess(res.data || res)
      setForm({
        customerName: '',
        email: '',
        phoneNumber: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        category: form.category,
        productName: '',
        totalAmount: '',
        notes: ''
      })
    } catch (err) {
      setError(err.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <Header language={language} setLanguage={handleLanguageChange} />
      <ServicesStrip language={language} activeService="astroshop" />

      <main className="calc-page-main">
        <div className="calc-page-container">
          <div className="calc-page-hero">
            <div className="calc-hero-badge">Order</div>
            <h1 className={`calc-page-title ${language === 'hindi' ? 'hindi' : ''}`}>
              {language === 'hindi' ? 'ऑर्डर बनाएँ' : 'Create Order'}
            </h1>
            <p className="calc-page-subtitle">
              {language === 'hindi'
                ? 'पूजा या एस्ट्रोशॉप के लिए ऑर्डर करें'
                : 'Place an order for Pooja or AstroShop'}
            </p>
          </div>

          <div className="calc-form-card">
            <form className="calc-form" onSubmit={handleSubmit}>
              <div className="order-inline-row">
                <div className="calc-form-group">
                  <label className="calc-form-label">{language === 'hindi' ? 'नाम' : 'Customer Name'}</label>
                  <input className="calc-form-input" name="customerName" value={form.customerName} onChange={handleChange} required />
                </div>
                <div className="calc-form-group">
                  <label className="calc-form-label">Email</label>
                  <input className="calc-form-input" name="email" value={form.email} onChange={handleChange} required />
                </div>
              </div>

              <div className="order-inline-row">
                <div className="calc-form-group">
                  <label className="calc-form-label">{language === 'hindi' ? 'फ़ोन' : 'Phone'}</label>
                  <input className="calc-form-input" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required />
                </div>
                <div className="calc-form-group">
                  <label className="calc-form-label">{language === 'hindi' ? 'श्रेणी' : 'Category'}</label>
                  <select className="calc-form-input" name="category" value={form.category} onChange={handleChange}>
                    <option value="astroshop">AstroShop</option>
                    <option value="pooja">Pooja</option>
                  </select>
                </div>
              </div>

              <div className="calc-form-group">
                <label className="calc-form-label">{language === 'hindi' ? 'पता' : 'Address'}</label>
                <input className="calc-form-input" name="address" value={form.address} onChange={handleChange} required />
              </div>

              <div className="order-inline-row">
                <div className="calc-form-group">
                  <label className="calc-form-label">{language === 'hindi' ? 'शहर' : 'City'}</label>
                  <input className="calc-form-input" name="city" value={form.city} onChange={handleChange} required />
                </div>
                <div className="calc-form-group">
                  <label className="calc-form-label">{language === 'hindi' ? 'राज्य' : 'State'}</label>
                  <input className="calc-form-input" name="state" value={form.state} onChange={handleChange} required />
                </div>
                <div className="calc-form-group">
                  <label className="calc-form-label">{language === 'hindi' ? 'पिनकोड' : 'Pincode'}</label>
                  <input className="calc-form-input" name="pincode" value={form.pincode} onChange={handleChange} required />
                </div>
              </div>

              <div className="order-inline-row">
                <div className="calc-form-group">
                  <label className="calc-form-label">{language === 'hindi' ? 'उत्पाद / पूजा' : 'Product / Pooja'}</label>
                  <input className="calc-form-input" name="productName" value={form.productName} onChange={handleChange} required />
                </div>
                <div className="calc-form-group">
                  <label className="calc-form-label">{language === 'hindi' ? 'राशि (₹)' : 'Amount (₹)'}</label>
                  <input type="number" className="calc-form-input" name="totalAmount" value={form.totalAmount} onChange={handleChange} required />
                </div>
              </div>

              <div className="calc-form-group">
                <label className="calc-form-label">{language === 'hindi' ? 'नोट्स' : 'Notes'}</label>
                <textarea className="calc-form-input" name="notes" value={form.notes} onChange={handleChange} rows={3} />
              </div>

              {error && (
                <div className="calc-error-message">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              <button type="submit" className="calc-form-submit" disabled={loading}>
                {loading ? (
                  <>
                    <svg className="calc-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="60 30">
                        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                    <span>{language === 'hindi' ? 'ऑर्डर पुष्टि हो रही है...' : 'Confirming order...'}</span>
                  </>
                ) : (
                  <span>{language === 'hindi' ? 'ऑर्डर कन्फर्म करें' : 'Confirm Order'}</span>
                )}
              </button>
            </form>
          </div>

          {success && (
            <div className="calc-result-card">
              <div className="calc-result-header">
                <div className="calc-result-badge">{language === 'hindi' ? 'ऑर्डर सफल' : 'Order Success'}</div>
                <h2 className="calc-result-title">
                  {language === 'hindi' ? 'धन्यवाद!' : 'Thank you!'}
                </h2>
              </div>
              <div className="calc-result-meaning">
                <h3 className="calc-result-meaning-title">
                  {language === 'hindi' ? 'ऑर्डर विवरण' : 'Order Details'}
                </h3>
                <p className="calc-result-meaning-text">
                  {language === 'hindi'
                    ? 'आपका ऑर्डर सफलतापूर्वक बनाया गया है।'
                    : 'Your order has been created successfully.'}
                </p>
                {success.orderId && (
                  <div className="calc-result-meta">
                    <span className="calc-meta-label">{language === 'hindi' ? 'ऑर्डर आईडी' : 'Order ID'}:</span>
                    <span className="calc-meta-value">{success.orderId}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}

export default OrderPage

