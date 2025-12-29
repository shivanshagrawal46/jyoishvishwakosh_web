const API_BASE_URL = '/api'
const PANCHANG_API_BASE_URL = 'https://kapi.jyotishvishwakosh.com/api'
const BOOK_API_BASE_URL = '/api'
const AUTH_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://www.jyotishvishwakosh.shop'
// E-Magazine uses the same /api proxy as other APIs

export const fetchKoshCategories = async (categoryId = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/kosh-category/${categoryId}`)
    if (!response.ok) throw new Error('Failed to fetch categories')
    return await response.json()
  } catch (error) {
    console.error('Error fetching kosh categories:', error)
    throw error
  }
}

export const fetchKoshContents = async (categoryId = 1, subcategoryId, page = 1) => {
  try {
    const url = `${API_BASE_URL}/kosh-category/${categoryId}/${subcategoryId}?page=${page}`
    console.log('Fetching from URL:', url)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors'
    })
    
    console.log('Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Response error:', errorText)
      throw new Error(`Failed to fetch contents: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('Fetched data:', data)
    return data
  } catch (error) {
    console.error('Error fetching kosh contents:', error)
    throw error
  }
}

// Karmkand API functions
export const fetchKarmkandCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/karmkand/category`)
    if (!response.ok) throw new Error('Failed to fetch karmkand categories')
    const result = await response.json()
    return result.success ? result.data : (result.data || result)
  } catch (error) {
    console.error('Error fetching karmkand categories:', error)
    throw error
  }
}

export const fetchKarmkandSubcategories = async (categoryId = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/karmkand/category/${categoryId}`)
    if (!response.ok) throw new Error('Failed to fetch karmkand subcategories')
    const result = await response.json()
    return result.success ? result.data : (result.data || result)
  } catch (error) {
    console.error('Error fetching karmkand subcategories:', error)
    throw error
  }
}

export const fetchKarmkandContents = async (categoryId = 1, subcategoryId, page = 1) => {
  try {
    const url = `${API_BASE_URL}/karmkand/category/${categoryId}/${subcategoryId}?page=${page}`
    console.log('Fetching karmkand from URL:', url)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors'
    })
    
    console.log('Karmkand response status:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Karmkand response error:', errorText)
      throw new Error(`Failed to fetch karmkand contents: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    const data = result.success ? result.data : result
    
    // Transform to match kosh format
    return {
      contents: data.contents || [],
      vishesh_suchi: data.vishesh_suchi || [],
      totalPages: data.pagination?.totalPages || 1,
      currentPage: data.pagination?.currentPage || 1,
      totalItems: data.pagination?.totalItems || 0
    }
  } catch (error) {
    console.error('Error fetching karmkand contents:', error)
    throw error
  }
}

// E-Pooja API functions
export const fetchPoojas = async (page = 1) => {
  try {
    const url = `${API_BASE_URL}/puja/poojas${page > 1 ? `?page=${page}` : ''}`
    console.log('Fetching poojas from URL:', url)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors'
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Pooja response error:', errorText)
      throw new Error(`Failed to fetch poojas: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    return {
      poojas: result.success ? result.data : result.data || [],
      pagination: result.pagination || {
        total: 0,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false
      }
    }
  } catch (error) {
    console.error('Error fetching poojas:', error)
    throw error
  }
}

export const fetchPoojaBySlug = async (slug) => {
  try {
    // First fetch all poojas and find by slug
    // In future, if there's a direct endpoint, use: `${API_BASE_URL}/puja/poojas/${slug}`
    const result = await fetchPoojas(1)
    const pooja = result.poojas.find(p => p.slug === slug)
    
    if (!pooja) {
      // Try fetching more pages if not found on first page
      let currentPage = 2
      while (currentPage <= result.pagination.totalPages) {
        const nextResult = await fetchPoojas(currentPage)
        const found = nextResult.poojas.find(p => p.slug === slug)
        if (found) return found
        currentPage++
      }
      throw new Error('Pooja not found')
    }
    
    return pooja
  } catch (error) {
    console.error('Error fetching pooja by slug:', error)
    throw error
  }
}

// AstroShop API functions
export const fetchAstroShopProducts = async (page = 1, categoryId = null) => {
  try {
    let url = `${API_BASE_URL}/astro-shop/products`
    const params = []
    if (page > 1) params.push(`page=${page}`)
    if (categoryId) params.push(`category=${categoryId}`)
    if (params.length > 0) url += `?${params.join('&')}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors'
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('AstroShop products response error:', errorText)
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    return {
      products: result.success ? result.data : result.data || [],
      pagination: result.pagination || {
        total: 0,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false
      }
    }
  } catch (error) {
    console.error('Error fetching astroshop products:', error)
    throw error
  }
}

export const fetchAstroShopCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/astro-shop/categories`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors'
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('AstroShop categories response error:', errorText)
      throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    return result.success ? result.data : result.data || []
  } catch (error) {
    console.error('Error fetching astroshop categories:', error)
    throw error
  }
}

export const fetchAstroShopProductBySlug = async (slug) => {
  try {
    // Fetch all products and find by slug
    const result = await fetchAstroShopProducts(1)
    const product = result.products.find(p => p.slug === slug)
    
    if (!product) {
      // Try fetching more pages if not found on first page
      let currentPage = 2
      while (currentPage <= result.pagination.totalPages) {
        const nextResult = await fetchAstroShopProducts(currentPage)
        const found = nextResult.products.find(p => p.slug === slug)
        if (found) return found
        currentPage++
      }
      throw new Error('Product not found')
    }
    
    return product
  } catch (error) {
    console.error('Error fetching product by slug:', error)
    throw error
  }
}

/**
 * -------------------------------------------------------------
 * Calculator & Jyotish APIs
 * -------------------------------------------------------------
 */

// Location search (Jyotish)
export const searchCities = async (query, limit = 10) => {
  if (!query || query.trim().length < 2) return []
  try {
    const response = await fetch(`${API_BASE_URL}/locations/search?query=${encodeURIComponent(query)}&limit=${limit}`, {
      headers: { Accept: 'application/json' },
      mode: 'cors'
    })
    if (!response.ok) throw new Error('Failed to search cities')
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error searching cities:', error)
    return []
  }
}

export const fetchPopularCities = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/locations/popular`, {
      headers: { Accept: 'application/json' },
      mode: 'cors'
    })
    if (!response.ok) throw new Error('Failed to fetch popular cities')
    const data = await response.json()
    // API returns { cities: [...] } per docs
    return data.cities || data.results || []
  } catch (error) {
    console.error('Error fetching popular cities:', error)
    return []
  }
}

// Jyotish comprehensive chart
export const fetchJyotishChart = async ({ fullName, dateOfBirth, timeOfBirth, locationId }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calculators/jyotish/comprehensive-chart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify({
        fullName: fullName || '',
        dateOfBirth,
        timeOfBirth,
        locationId
      })
    })
    if (!response.ok) {
      const errText = await response.text()
      throw new Error(errText || 'Failed to fetch chart')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching jyotish chart:', error)
    throw error
  }
}

// Numerology calculators
export const calculateBhagyank = async (dateOfBirth) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calculators/numerology/bhagyank`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify({ dateOfBirth })
    })
    if (!response.ok) throw new Error('Failed to calculate bhagyank')
    return await response.json()
  } catch (error) {
    console.error('Error calculating bhagyank:', error)
    throw error
  }
}

export const calculateMulank = async (dateOfBirth) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calculators/numerology/mulank`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify({ dateOfBirth })
    })
    if (!response.ok) throw new Error('Failed to calculate mulank')
    return await response.json()
  } catch (error) {
    console.error('Error calculating mulank:', error)
    throw error
  }
}

export const calculateLoShu = async (dateOfBirth) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calculators/numerology/loshu-grid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify({ dateOfBirth })
    })
    if (!response.ok) throw new Error('Failed to calculate Lo Shu grid')
    return await response.json()
  } catch (error) {
    console.error('Error calculating Lo Shu:', error)
    throw error
  }
}

export const calculateCompleteNumerology = async ({ fullName, dateOfBirth }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calculators/numerology/complete-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify({ fullName, dateOfBirth })
    })
    if (!response.ok) {
      const txt = await response.text()
      throw new Error(txt || 'Failed to fetch complete numerology report')
    }
    const data = await response.json()
    if (data.success === false) {
      throw new Error(data.error || 'Failed to fetch complete numerology report')
    }
    return data
  } catch (error) {
    console.error('Error fetching complete numerology report:', error)
    throw error
  }
}

// Jyotish: Rashi
export const fetchRashi = async (dateOfBirth) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calculators/jyotish/rashi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify({ dateOfBirth })
    })
    if (!response.ok) {
      const txt = await response.text()
      throw new Error(txt || 'Failed to fetch rashi')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching rashi:', error)
    throw error
  }
}

// Jyotish: Nakshatra
export const fetchNakshatra = async (dateOfBirth) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calculators/jyotish/nakshatra`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify({ dateOfBirth })
    })
    if (!response.ok) {
      const txt = await response.text()
      throw new Error(txt || 'Failed to fetch nakshatra')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching nakshatra:', error)
    throw error
  }
}

// Jyotish: Dasha periods
export const fetchDashaPeriods = async (dateOfBirth) => {
  try {
    const response = await fetch(`${API_BASE_URL}/calculators/jyotish/dasha-periods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify({ dateOfBirth })
    })
    if (!response.ok) {
      const txt = await response.text()
      throw new Error(txt || 'Failed to fetch dasha periods')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching dasha periods:', error)
    throw error
  }
}

// Orders
export const createOrder = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/order/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      const txt = await response.text()
      throw new Error(txt || 'Failed to create order')
    }
    const data = await response.json()
    if (data.success === false) {
      throw new Error(data.message || 'Failed to create order')
    }
    return data
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

/**
 * Rashifal APIs
 */
export const fetchRashifalDates = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/rashifal/daily`, {
      headers: { Accept: 'application/json' },
      mode: 'cors'
    })
    if (!response.ok) throw new Error('Failed to fetch rashifal dates')
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching rashifal dates:', error)
    throw error
  }
}

export const fetchRashifalByDate = async (dateId) => {
  if (!dateId) throw new Error('dateId is required')
  try {
    const response = await fetch(`${API_BASE_URL}/rashifal/daily/${dateId}`, {
      headers: { Accept: 'application/json' },
      mode: 'cors'
    })
    if (!response.ok) throw new Error('Failed to fetch rashifal for date')
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching rashifal by date:', error)
    throw error
  }
}

export const fetchRashifalYearsMonthly = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/rashifal/months`, {
      headers: { Accept: 'application/json' },
      mode: 'cors'
    })
    if (!response.ok) throw new Error('Failed to fetch rashifal years (monthly)')
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching rashifal months years:', error)
    throw error
  }
}

export const fetchRashifalMonthsByYear = async (yearId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rashifal/months/${yearId}`, {
      headers: { Accept: 'application/json' },
      mode: 'cors'
    })
    if (!response.ok) throw new Error('Failed to fetch rashifal months')
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching rashifal months by year:', error)
    throw error
  }
}

export const fetchRashifalMonthContent = async (yearId, month) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rashifal/months/${yearId}/${month}`, {
      headers: { Accept: 'application/json' },
      mode: 'cors'
    })
    if (!response.ok) throw new Error('Failed to fetch rashifal month content')
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching rashifal month content:', error)
    throw error
  }
}

export const fetchRashifalYearsYearly = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/rashifal/yearly`, {
      headers: { Accept: 'application/json' },
      mode: 'cors'
    })
    if (!response.ok) throw new Error('Failed to fetch rashifal yearly list')
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching rashifal yearly list:', error)
    throw error
  }
}

export const fetchRashifalYearContent = async (yearId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rashifal/yearly/${yearId}`, {
      headers: { Accept: 'application/json' },
      mode: 'cors'
    })
    if (!response.ok) throw new Error('Failed to fetch rashifal yearly content')
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching rashifal yearly content:', error)
    throw error
  }
}

/**
 * Numerology/Ank Fal APIs
 */
export const fetchNumerologyDates = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/numerology/daily`, {
      headers: { Accept: 'application/json' },
      mode: 'cors'
    })
    if (!response.ok) throw new Error('Failed to fetch numerology dates')
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching numerology dates:', error)
    throw error
  }
}

export const fetchNumerologyByDate = async (dateId) => {
  if (!dateId) throw new Error('dateId is required')
  try {
    const response = await fetch(`${API_BASE_URL}/numerology/daily/${dateId}`, {
      headers: { Accept: 'application/json' },
      mode: 'cors'
    })
    if (!response.ok) throw new Error('Failed to fetch numerology for date')
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching numerology by date:', error)
    throw error
  }
}

export const fetchNumerologyYearsMonthly = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/numerology/months`, {
      headers: { Accept: 'application/json' },
      mode: 'cors'
    })
    if (!response.ok) throw new Error('Failed to fetch numerology years (monthly)')
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching numerology months years:', error)
    throw error
  }
}

export const fetchNumerologyMonthsByYear = async (yearId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/numerology/months/${yearId}`, {
      headers: { Accept: 'application/json' },
      mode: 'cors'
    })
    if (!response.ok) throw new Error('Failed to fetch numerology months')
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching numerology months by year:', error)
    throw error
  }
}

export const fetchNumerologyMonthContent = async (yearId, month) => {
  try {
    const response = await fetch(`${API_BASE_URL}/numerology/months/${yearId}/${month}`, {
      headers: { Accept: 'application/json' },
      mode: 'cors'
    })
    if (!response.ok) throw new Error('Failed to fetch numerology month content')
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching numerology month content:', error)
    throw error
  }
}

export const fetchNumerologyYearsYearly = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/numerology/yearly`, {
      headers: { Accept: 'application/json' },
      mode: 'cors'
    })
    if (!response.ok) throw new Error('Failed to fetch numerology yearly list')
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching numerology yearly list:', error)
    throw error
  }
}

export const fetchNumerologyYearContent = async (yearId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/numerology/yearly/${yearId}`, {
      headers: { Accept: 'application/json' },
      mode: 'cors'
    })
    if (!response.ok) throw new Error('Failed to fetch numerology yearly content')
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching numerology yearly content:', error)
    throw error
  }
}

/**
 * Divine Quotes APIs
 */
export const fetchDivineQuotes = async (page = 1) => {
  try {
    const params = []
    if (page > 1) params.push(`page=${page}`)

    let url = `${API_BASE_URL}/divinequotes`
    if (params.length > 0) url += `?${params.join('&')}`

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      mode: 'cors'
    })
    if (!response.ok) throw new Error('Failed to fetch divine quotes')
    const data = await response.json()
    return {
      quotes: data.data || [],
      pagination: data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 }
    }
  } catch (error) {
    console.error('Error fetching divine quotes:', error)
    throw error
  }
}

/**
 * YouTube Videos APIs
 */
export const fetchYouTubeVideos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/youtube`, {
      headers: { Accept: 'application/json' },
      mode: 'cors'
    })
    if (!response.ok) throw new Error('Failed to fetch YouTube videos')
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching YouTube videos:', error)
    throw error
  }
}

/**
 * Panchang APIs
 */
export const fetchPanchangData = async ({ date, lat, lon, language = 'hindi' }) => {
  try {
    const selectedDate = date || new Date()
    const lang = language === 'english' || language === 'en' ? 'en' : 'Hi'
    
    const dateObj = {
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth() + 1,
      day: selectedDate.getDate(),
      hour: selectedDate.getHours(),
      minute: selectedDate.getMinutes(),
      second: selectedDate.getSeconds(),
    }

    const response = await fetch(`${PANCHANG_API_BASE_URL}/userSearcheds/panchang/date?q=${lang}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify({
        ...dateObj,
        lat,
        lon
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'Failed to fetch panchang data')
    }

    const data = await response.json()
    console.log('Panchang API raw response:', JSON.stringify(data, null, 2))
    
    // Return the most likely structure
    const result = data.response || data.data || data
    console.log('Panchang API normalized result:', JSON.stringify(result, null, 2))
    return result
  } catch (error) {
    console.error('Error fetching panchang data:', error)
    throw error
  }
}

export const fetchDailyMuhuratData = async ({ date, lat, lon, language = 'hindi' }) => {
  try {
    const selectedDate = date || new Date()
    const lang = language === 'english' || language === 'en' ? 'en' : 'Hi'
    
    const dateObj = {
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth() + 1,
      day: selectedDate.getDate(),
      hour: selectedDate.getHours(),
      minute: selectedDate.getMinutes(),
      second: selectedDate.getSeconds(),
    }

    const response = await fetch(`${PANCHANG_API_BASE_URL}/userSearcheds/dailyMahurat?q=${lang}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify({
        ...dateObj,
        lat,
        lon
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'Failed to fetch daily muhurat data')
    }

    const data = await response.json()
    console.log('Daily Muhurat API raw response:', JSON.stringify(data, null, 2))
    
    // Return the response data
    const result = data.response || data.data || data
    console.log('Daily Muhurat API normalized result:', JSON.stringify(result, null, 2))
    return result
  } catch (error) {
    console.error('Error fetching daily muhurat data:', error)
    throw error
  }
}

// Book API functions
export const fetchBookCategories = async () => {
  try {
    const response = await fetch(`${BOOK_API_BASE_URL}/book/category`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors'
    })
    if (!response.ok) throw new Error('Failed to fetch book categories')
    const data = await response.json()
    return data.success ? data.data : (data.data || data)
  } catch (error) {
    console.error('Error fetching book categories:', error)
    throw error
  }
}

export const fetchBooksByCategory = async (categoryId, page = 1) => {
  try {
    const response = await fetch(`${BOOK_API_BASE_URL}/book/category/${categoryId}?page=${page}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors'
    })
    if (!response.ok) throw new Error('Failed to fetch books')
    const data = await response.json()
    return data.success ? data.data : (data.data || data)
  } catch (error) {
    console.error('Error fetching books:', error)
    throw error
  }
}

export const fetchChaptersByBook = async (categoryId, bookId, page = 1) => {
  try {
    const response = await fetch(`${BOOK_API_BASE_URL}/book/category/${categoryId}/${bookId}?page=${page}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors'
    })
    if (!response.ok) throw new Error('Failed to fetch chapters')
    const data = await response.json()
    return data.success ? data.data : (data.data || data)
  } catch (error) {
    console.error('Error fetching chapters:', error)
    throw error
  }
}

export const fetchChapterContent = async (categoryId, bookId, chapterId, page = 1) => {
  try {
    const response = await fetch(`${BOOK_API_BASE_URL}/book/category/${categoryId}/${bookId}/${chapterId}?page=${page}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors'
    })
    if (!response.ok) throw new Error('Failed to fetch chapter content')
    const data = await response.json()
    return data.success ? data.data : (data.data || data)
  } catch (error) {
    console.error('Error fetching chapter content:', error)
    throw error
  }
}

/**
 * Auth API functions
 */
export const googleLogin = async (idToken) => {
  console.log('🔐 Starting Google login process...')
  console.log('📍 Current origin:', window.location.origin)
  console.log('🔑 idToken present:', idToken ? 'Yes' : 'No')
  
  try {
    // Check if we're in development (localhost) - use proxy to avoid CORS
    // In production, use direct URL
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    
    let url
    if (isDevelopment) {
      // Use proxy in development (same pattern as other APIs)
      url = '/auth-api/auth/google'
      console.log('🔧 Development mode: Using proxy:', url)
      console.log('   → Will proxy to: https://www.jyotishvishwakosh.shop/api/auth/google')
    } else {
      // Use direct URL in production
      url = `${AUTH_API_BASE_URL}/api/auth/google`
      console.log('🌐 Production mode: Using direct URL:', url)
    }
    
    const requestBody = {
      idToken: idToken
    }
    
    console.log('📤 Sending POST request to:', url)
    console.log('📦 Request body:', { idToken: idToken ? `${idToken.substring(0, 20)}...` : 'missing' })
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: isDevelopment ? 'cors' : 'cors',
      credentials: 'include',
      body: JSON.stringify(requestBody)
    })

    console.log('📥 Response received')
    console.log('   Status:', response.status, response.statusText)
    console.log('   OK:', response.ok)
    console.log('   Headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      console.error('❌ Response not OK')
      let errorData
      try {
        const responseText = await response.text()
        console.log('📄 Response text:', responseText)
        errorData = JSON.parse(responseText)
        console.log('📋 Parsed error data:', errorData)
      } catch (e) {
        console.error('⚠️ Failed to parse error response:', e)
        throw new Error(`Login failed: ${response.status} ${response.statusText}`)
      }
      const errorMessage = errorData.error || errorData.details || 'Login failed'
      console.error('❌ Error message:', errorMessage)
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('✅ Google login successful!')
    console.log('📋 Response data:', {
      hasToken: !!data.token,
      hasUser: !!data.user,
      userId: data.user?._id,
      userEmail: data.user?.email
    })
    return data
  } catch (error) {
    console.error('💥 Error during Google login:', error)
    console.error('   Error type:', error.constructor.name)
    console.error('   Error message:', error.message)
    console.error('   Error stack:', error.stack)
    
    // Provide more specific error messages
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'TypeError') {
      console.error('🔴 Network/CORS Error detected')
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.error('💡 Suggestion: Make sure vite dev server proxy is working')
        console.error('   Check vite.config.js proxy configuration for /auth-api')
      }
      throw new Error('Network error: Please check your internet connection or the server may be down')
    }
    throw error
  }
}

/**
 * E-Magazine API functions
 */
export const fetchEMagazines = async (page = 1) => {
  try {
    const params = []
    if (page > 1) params.push(`page=${page}`)
    
    let url = `${API_BASE_URL}/emagazine/all`
    if (params.length > 0) url += `?${params.join('&')}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors'
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('EMagazine response error:', errorText)
      throw new Error(`Failed to fetch magazines: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    const magazines = result.success ? result.magazines : (result.magazines || [])
    
    return {
      magazines,
      pagination: result.pagination || {
        currentPage: page,
        totalPages: 1,
        totalMagazines: magazines.length,
        hasNextPage: false,
        hasPrevPage: false
      }
    }
  } catch (error) {
    console.error('Error fetching e-magazines:', error)
    throw error
  }
}

export const fetchEMagazineWriters = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/emagazine/writer`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors'
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('EMagazine writers response error:', errorText)
      throw new Error(`Failed to fetch writers: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    return result.success ? result.writers : (result.writers || [])
  } catch (error) {
    console.error('Error fetching e-magazine writers:', error)
    throw error
  }
}

export const fetchEMagazineByWriter = async (writerId, page = 1) => {
  try {
    const params = []
    if (page > 1) params.push(`page=${page}`)
    
    let url = `${API_BASE_URL}/emagazine/writer/${writerId}`
    if (params.length > 0) url += `?${params.join('&')}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors'
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('EMagazine by writer response error:', errorText)
      throw new Error(`Failed to fetch magazines by writer: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    return {
      magazines: result.success ? result.magazines : (result.magazines || []),
      pagination: result.pagination || {
        currentPage: page,
        totalPages: 1,
        totalMagazines: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    }
  } catch (error) {
    console.error('Error fetching e-magazines by writer:', error)
    throw error
  }
}

export const fetchEMagazineSubjects = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/emagazine/subject`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors'
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('EMagazine subjects response error:', errorText)
      throw new Error(`Failed to fetch subjects: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    return result.success ? result.subjects : (result.subjects || [])
  } catch (error) {
    console.error('Error fetching e-magazine subjects:', error)
    throw error
  }
}

export const fetchEMagazineBySubject = async (subjectId, page = 1) => {
  try {
    const params = []
    if (page > 1) params.push(`page=${page}`)
    
    let url = `${API_BASE_URL}/emagazine/subject/${subjectId}`
    if (params.length > 0) url += `?${params.join('&')}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors'
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('EMagazine by subject response error:', errorText)
      throw new Error(`Failed to fetch magazines by subject: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    return {
      magazines: result.success ? result.magazines : (result.magazines || []),
      pagination: result.pagination || {
        currentPage: page,
        totalPages: 1,
        totalMagazines: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    }
  } catch (error) {
    console.error('Error fetching e-magazines by subject:', error)
    throw error
  }
}

