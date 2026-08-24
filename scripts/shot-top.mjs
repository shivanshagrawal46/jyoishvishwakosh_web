/**
 * Capture just the top band of the page (fixed header) at both widths:
 * node scripts/shot-top.mjs <port> <label>
 */
import { mkdirSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const [port = '4321', label = 'top'] = process.argv.slice(2)
mkdirSync('.shots', { recursive: true })

const browser = await puppeteer.launch({ channel: 'chrome', headless: 'shell', args: ['--hide-scrollbars'] })

for (const view of [{ n: 'desktop', w: 1440, h: 260 }, { n: 'mobile', w: 390, h: 220 }]) {
  const page = await browser.newPage()
  await page.setViewport({ width: view.w, height: view.h, isMobile: view.n === 'mobile' })
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle2', timeout: 60000 })
  await new Promise(r => setTimeout(r, 4000))
  await page.screenshot({ path: `.shots/${label}-${view.n}.png` })
  await page.close()
  console.log(`captured ${view.n}`)
}

await browser.close()
