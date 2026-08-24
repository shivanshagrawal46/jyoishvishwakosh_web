import puppeteer from 'puppeteer-core'

const PORT = process.argv[2] || '3000'
const WIDTH = Number(process.argv[3] || 1440)
const HEIGHT = Number(process.argv[4] || 900)
const TAG = process.argv[5] || 'd'

const FRAMES = [400, 700, 1000, 1300, 1600, 1900, 2200, 2600, 3000]

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
})
const page = await browser.newPage()
// Scale 1 keeps each capture cheap so it doesn't skew the timeline it measures.
await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, isMobile: WIDTH < 700 })

await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 60000 })
const t0 = Date.now()

for (const at of FRAMES) {
  const wait = at - (Date.now() - t0)
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))
  const real = Date.now() - t0
  await page.screenshot({ path: `ui-review/shots/splash-${TAG}-${at}.png` })
  console.log(`target ${at}ms -> actual ${real}ms`)
}

await browser.close()
