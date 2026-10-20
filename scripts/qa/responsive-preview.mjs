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
   await page.screenshot({ path: join(outDir, 'home-' + width + '.png'), fullPage: true })
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
   report.push({ width, passed: true, initialWidth, checkoutWidth })
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
