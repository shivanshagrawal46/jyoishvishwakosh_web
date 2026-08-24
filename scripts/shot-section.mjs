/**
 * Screenshot single sections: node scripts/shot-section.mjs <port> <label> <selector...>
 */
import { mkdirSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const [port = '4321', label = 'sec', ...selectors] = process.argv.slice(2)
mkdirSync('.shots', { recursive: true })

const browser = await puppeteer.launch({
  channel: 'chrome',
  headless: 'shell',
  args: ['--hide-scrollbars'],
})

for (const view of [{ n: 'desktop', w: 1440, h: 900 }, { n: 'mobile', w: 390, h: 844 }]) {
  const page = await browser.newPage()
  await page.setViewport({ width: view.w, height: view.h, isMobile: view.n === 'mobile' })
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle2', timeout: 60000 })
  await new Promise(r => setTimeout(r, 3500))

  for (const sel of selectors) {
    const el = await page.$(sel)
    if (!el) { console.log(`missing ${sel}`); continue }
    await el.scrollIntoView()
    await new Promise(r => setTimeout(r, 1200))
    const name = sel.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')
    await el.screenshot({ path: `.shots/${label}-${view.n}-${name}.png` })
    console.log(`captured ${view.n} ${sel}`)
  }
  await page.close()
}

await browser.close()
