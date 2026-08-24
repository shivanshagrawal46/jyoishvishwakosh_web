import puppeteer from 'puppeteer-core'

const PORT = process.argv[2] || '3000'
const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 3 })
await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 2000))

const grid = await page.$('.svc-grid')
await grid.screenshot({ path: 'ui-review/shots/glyphs.png' })
console.log('done')
await browser.close()
