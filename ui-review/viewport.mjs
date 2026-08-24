import puppeteer from 'puppeteer-core'

const PORT = process.argv[2] || '3000'
const OUT = process.argv[3] || 'ui-review/shots/viewport.png'
const WIDTH = Number(process.argv[4] || 390)
const HEIGHT = Number(process.argv[5] || 844)

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
})
const page = await browser.newPage()
await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 2, isMobile: WIDTH < 700 })
const SCROLL = Number(process.argv[6] || 0)

await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 2500))
if (SCROLL) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), SCROLL)
  await new Promise((r) => setTimeout(r, 900))
}
await page.screenshot({ path: OUT })
console.log('saved', OUT)
await browser.close()
