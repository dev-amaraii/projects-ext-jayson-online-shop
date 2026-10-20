#!/usr/bin/env node
// Browser-only responsive acceptance checks against the exact Pages preview build.
// Reuses the Playwright dependency installed alongside QA Intel by CircleCI.
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const baseUrl = process.env.PREVIEW_BASE_URL || 'http://127.0.0.1:3000'
const modulesDir = process.env.QA_INTEL_MODULES || '/tmp/jayson-qa-runner/node_modules'
const outDir = '.qa-results/responsive'
const { chromium } = await import(pathToFileURL(join(modulesDir, 'playwright/index.mjs')).href)

await mkdir(outDir, { recursive: true })
const browser = await chromium.launch({ headless: true })
const report = []
let failed = false
try {
 for (const width of [320, 390, 1280]) {
  const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: 'reduce' })
  const pageErrors = []
  page.on('pageerror', error => pageErrors.push(String(error)))
  try {
   const response = await page.goto(baseUrl, { waitUntil: 'networkidle' })
   assert.equal(response?.status(), 200, 'Page should load with HTTP 200')
   await page.getByTestId('storefront-hydrated').waitFor()
   const initialWidth = await page.evaluate(() => ({ actual: document.documentElement.scrollWidth, expected: window.innerWidth }))
   assert.ok(initialWidth.actual <= initialWidth.expected + 2, 'Homepage horizontal overflow')
   assert.equal(await page.locator('.j-preview-banner').count(), 0, 'Top client-preview banner must be removed')
   await page.screenshot({ path: join(outDir, 'home-' + width + '.png'), fullPage: true })

   // Previously mobile cards extended outside the viewport while .j-site
   // clipped scrolling. Checking document.scrollWidth alone did NOT catch it.
   await page.goto(baseUrl + '/#/shop', { waitUntil: 'networkidle' })
   await page.getByTestId('storefront-hydrated').waitFor()
   await page.locator('.j-shop-results .j-product-card').first().waitFor()
   const shop = await page.evaluate(() => {
    const grid = document.querySelector('.j-shop-results .j-product-grid')
    const results = document.querySelector('.j-shop-results')
    const filters = document.querySelector('.j-filter-scroll')
    if (!grid || !results || !filters) throw new Error('Catalogue layout missing')
    const cards = [...grid.querySelectorAll('.j-product-card')].map(card => {
     const rect = card.getBoundingClientRect()
     return { left: rect.left, right: rect.right, width: rect.width }
    })
    const resultsRect = results.getBoundingClientRect()
    const gridRect = grid.getBoundingClientRect()
    return {
     viewport: window.innerWidth,
     documentWidth: document.documentElement.scrollWidth,
     resultsLeft: resultsRect.left,
     resultsRight: resultsRect.right,
     gridLeft: gridRect.left,
     gridRight: gridRect.right,
     columns: getComputedStyle(grid).gridTemplateColumns.split(/\\s+/).length,
     categoryChipsScroll: filters.scrollWidth > filters.clientWidth + 1,
     cards,
    }
   })
   assert.equal(shop.cards.length, 12, 'All illustrative catalogue cards should render')
   assert.ok(shop.documentWidth <= shop.viewport + 2, 'Catalogue document has horizontal overflow')
   assert.ok(shop.resultsLeft >= -1 && shop.resultsRight <= shop.viewport + 1, 'Catalogue results panel exceeds viewport')
   assert.ok(shop.gridLeft >= -1 && shop.gridRight <= shop.viewport + 1, 'Catalogue grid exceeds viewport')
   for (const card of shop.cards) {
    assert.ok(card.width > 0 && card.left >= -1 && card.right <= shop.viewport + 1,
     'A product card is clipped offscreen (left=' + card.left + ', right=' + card.right + ', viewport=' + shop.viewport + ')')
   }
   if (width <= 370) assert.equal(shop.columns, 1, 'Narrow phones should use one readable card per row')
   else if (width <= 650) assert.equal(shop.columns, 2, 'Mobile catalogue should fit two cards per row')
   else assert.equal(shop.columns, 3, 'Desktop catalogue should use three cards per row')
   if (width <= 650) assert.ok(shop.categoryChipsScroll, 'Mobile category chips must scroll independently')
   await page.screenshot({ path: join(outDir, 'shop-' + width + '.png'), fullPage: true })

   await page.getByRole('button', { name: 'Add Wireless Headphones to cart' }).click()
   await page.getByRole('heading', { name: 'Your Cart (1)' }).waitFor()
   await page.getByRole('button', { name: 'Continue to demo checkout' }).click()
   await page.getByRole('heading', { name: 'Checkout experience' }).waitFor()
   const checkoutWidth = await page.evaluate(() => ({ actual: document.documentElement.scrollWidth, expected: window.innerWidth }))
   assert.ok(checkoutWidth.actual <= checkoutWidth.expected + 2, 'Checkout horizontal overflow')
   await page.screenshot({ path: join(outDir, 'checkout-' + width + '.png'), fullPage: true })
   await page.getByRole('button', { name: 'Review demo order' }).click()
   await page.getByRole('button', { name: 'Place demo order (no payment)' }).click()
   await page.getByRole('heading', { name: 'Demo order confirmed!' }).waitFor()
   assert.deepEqual(pageErrors, [], 'No uncaught page errors should occur')
   report.push({ width, passed: true, initialWidth, shop: { ...shop, cards: shop.cards.slice(0, 3) }, checkoutWidth })
   process.stdout.write('PASS viewport ' + width + 'px and full mock order journey\n')
  } catch (error) {
   failed = true
   report.push({ width, passed: false, error: String(error), pageErrors })
   await page.screenshot({ path: join(outDir, 'failure-' + width + '.png'), fullPage: true }).catch(() => {})
   process.stderr.write('FAIL viewport ' + width + 'px: ' + String(error) + '\n')
  } finally {
   await page.close()
  }
 }
} finally {
 await browser.close()
 await writeFile(join(outDir, 'summary.json'), JSON.stringify({ baseUrl, report }, null, 2) + '\n')
}
if (failed) process.exitCode = 1
