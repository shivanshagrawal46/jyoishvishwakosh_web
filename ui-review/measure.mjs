import puppeteer from 'puppeteer-core'

const PORT = process.argv[2] || '3000'
const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
})
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 2500))

const info = await page.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
      sel,
      top: Math.round(r.top),
      height: Math.round(r.height),
      paddingTop: cs.paddingTop,
      marginTop: cs.marginTop,
    }
  }
  return {
    headerH: getComputedStyle(document.documentElement).getPropertyValue('--header-h'),
    nodes: ['main', '.lead', '.hero__inner', '.hero__copy', '.hero__title', '.services', '.svc-grid']
      .map(pick).filter(Boolean),
  }
})

console.log(JSON.stringify(info, null, 2))
await browser.close()
