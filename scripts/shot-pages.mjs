/**
 * Full-page screenshots of a route list: node scripts/shot-pages.mjs <port> <route...>
 */
import { mkdirSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const [port = '4324', mode = 'full', ...routes] = process.argv.slice(2)
const fullPage = mode === 'full'
mkdirSync('.shots', { recursive: true })

const browser = await puppeteer.launch({
  channel: 'chrome',
  headless: 'shell',
  args: ['--hide-scrollbars'],
})

for (const view of [{ n: 'd', w: 1440, h: 950 }, { n: 'm', w: 390, h: 844 }]) {
  const page = await browser.newPage()
  await page.setViewport({ width: view.w, height: view.h, isMobile: view.n === 'm' })

  for (const route of routes) {
    try {
      await page.goto(`http://localhost:${port}${route}`, {
        waitUntil: 'networkidle2',
        timeout: 45000,
      })
    } catch {
      console.log(`timeout ${route}`)
    }
    await new Promise((r) => setTimeout(r, 2500))
    const name = route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'
    await page.screenshot({ path: `.shots/${view.n}-${name}.png`, fullPage })
    console.log(`shot ${view.n} ${route}`)
  }

  await page.close()
}

await browser.close()
