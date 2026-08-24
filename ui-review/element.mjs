import puppeteer from 'puppeteer-core'

const PORT = process.argv[2] || '3000'
const SELECTOR = process.argv[3] || '.hero__inner'
const OUT = process.argv[4] || 'ui-review/shots/element.png'
const WIDTH = Number(process.argv[5] || 1440)

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
})
const page = await browser.newPage()
await page.setViewport({ width: WIDTH, height: 900, deviceScaleFactor: 2 })
await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 2500))

const el = await page.$(SELECTOR)
if (!el) throw new Error(`not found: ${SELECTOR}`)
await el.screenshot({ path: OUT })
console.log('saved', OUT)
await browser.close()
