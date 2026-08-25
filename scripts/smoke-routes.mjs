/**
 * Visits every public route and reports blank renders or runtime errors.
 */
import puppeteer from 'puppeteer-core'

const port = process.argv[2] || '4324'

const ROUTES = [
  '/', '/kosh', '/hasth-rekha', '/vastu', '/ank-jyotish', '/chalisa-aarti',
  '/mantra-tantra', '/dharma-shastra', '/karmkand', '/divine-quotes',
  '/e-pooja', '/astroshop', '/emagazine', '/videos',
  '/jyotish-report', '/numerology-report',
  '/mulank', '/bhagyank', '/loshu', '/ai-ank', '/rashi', '/nakshatra', '/dasha',
  '/order', '/rashi-fal', '/ank-fal', '/panchang', '/dainik-muhurat',
  '/prashan-yantra', '/contact', '/books', '/nope-404',
]

const browser = await puppeteer.launch({ channel: 'chrome', headless: 'shell' })
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, isMobile: true })

let bad = 0
for (const route of ROUTES) {
  const errors = []
  const onError = (e) => errors.push(String(e).split('\n')[0])
  page.on('pageerror', onError)

  try {
    await page.goto(`http://localhost:${port}${route}`, { waitUntil: 'networkidle2', timeout: 40000 })
  } catch {
    errors.push('navigation timeout')
  }
  await new Promise((r) => setTimeout(r, 1200))

  const len = await page.evaluate(() => document.getElementById('root')?.innerHTML.length ?? 0)
  page.off('pageerror', onError)

  const ok = len > 500 && errors.length === 0
  if (!ok) bad++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${route.padEnd(20)} html=${len} ${errors.join(' | ')}`)
}

console.log(bad ? `\n${bad} routes need attention` : '\nall routes render')
await browser.close()
