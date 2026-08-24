/**
 * Screenshot helper: node scripts/shot.mjs <port> <label>
 * Captures desktop + mobile viewports of the landing page into .shots/.
 */
import { mkdirSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const port = process.argv[2] || '4321'
const label = process.argv[3] || 'shot'
const url = `http://localhost:${port}/`

mkdirSync('.shots', { recursive: true })

const browser = await puppeteer.launch({
  channel: 'chrome',
  headless: 'shell',
  args: ['--hide-scrollbars', '--force-device-scale-factor=1'],
})

const VIEWS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844, mobile: true },
]

for (const view of VIEWS) {
  const page = await browser.newPage()
  await page.setViewport({
    width: view.width,
    height: view.height,
    deviceScaleFactor: 1,
    isMobile: !!view.mobile,
    hasTouch: !!view.mobile,
  })
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
  // Skip the splash and settle any in-view animations.
  await page.evaluate(() => window.scrollTo(0, 0))
  await new Promise(r => setTimeout(r, 3500))
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight * 0.7) {
      window.scrollTo(0, y)
      await new Promise(r => setTimeout(r, 220))
    }
    window.scrollTo(0, 0)
  })
  await new Promise(r => setTimeout(r, 900))

  await page.screenshot({ path: `.shots/${label}-${view.name}-fold.png` })
  await page.screenshot({ path: `.shots/${label}-${view.name}-full.png`, fullPage: true })
  await page.close()
  console.log(`captured ${view.name}`)
}

await browser.close()
