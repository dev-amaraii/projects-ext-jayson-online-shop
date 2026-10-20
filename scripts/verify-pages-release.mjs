#!/usr/bin/env node
/**
 * Verify a narrowly scoped Pages client-preview release from CircleCI.
 * Reads Cloudflare deployment metadata, then checks the published preview.
 * Never prints the Cloudflare API token, response bodies or personal data.
 *
 * This runs only after a successful Pages deployment step in the
 * manually-requested-preview-release workflow.
 */
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

const PROJECT = 'jayson-tech-client-preview'
const BRANCH = 'feat/storefront-demo'
const ACCOUNT = '9483d072db9941b23fe0bcd92d76d0d6'
const SITE = 'https://jayson-tech-client-preview.pages.dev'
const API = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/pages/projects/${PROJECT}/deployments`
const sha = process.env.EXPECTED_RELEASE_SHA
const token = process.env.CLOUDFLARE_API_TOKEN
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID

assert.equal(accountId, ACCOUNT, 'Unexpected Cloudflare account')
assert.match(sha || '', /^[a-f0-9]{40}$/, 'Expected release SHA must be a full commit hash')
assert.ok(token, 'Deployment verifier requires the restricted Cloudflare API token')

function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }
async function checkCloudflare() {
 const response = await fetch(API + '?page=1&per_page=5', {
  headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  redirect: 'error',
  signal: AbortSignal.timeout(12000),
 })
 if (!response.ok) throw new Error('Cloudflare metadata request failed with HTTP ' + response.status)
 const payload = await response.json()
 if (payload.success !== true || !Array.isArray(payload.result)) {
  throw new Error('Cloudflare metadata response invalid')
 }
 const latest = payload.result[0]
 if (!latest || latest.project_name !== PROJECT ||
     latest.deployment_trigger?.metadata?.branch !== BRANCH) {
  throw new Error('Latest deployment targets an unexpected Pages project or branch')
 }
 const commit = latest.deployment_trigger?.metadata?.commit_hash
 if (commit !== sha) throw new Error('Latest Pages deployment does not match the QA-approved revision')
 if (latest.environment !== 'production') throw new Error('Expected Pages preview production-branch deployment')
 return latest
}

async function checkSite() {
 const response = await fetch(SITE, {
  headers: { 'Cache-Control': 'no-cache' },
  redirect: 'error',
  signal: AbortSignal.timeout(12000),
 })
 if (response.status !== 200) throw new Error('Published preview returned HTTP ' + response.status)
 const markup = await response.text()
 if (!markup.includes('Jayson Tech') || !markup.includes('root')) {
  throw new Error('Published HTML is not the expected storefront entry point')
 }
 const indexingProtection = response.headers.get('x-robots-tag') || ''
 if (!indexingProtection.toLowerCase().includes('noindex') && !markup.includes('noindex')) {
  throw new Error('Client preview lacks a noindex safeguard')
 }
 return { httpStatus: response.status, noindex: true }
}

let success
for (let attempt = 0; attempt < 12; attempt++) {
 try {
  const deployment = await checkCloudflare()
  if (deployment.latest_stage?.status !== 'success') {
   throw new Error('Pages release is not complete')
  }
  const site = await checkSite()
  success = {
   project: PROJECT,
   environment: 'client-preview',
   branch: BRANCH,
   revision: sha,
   deploymentId: deployment.id,
   deploymentUrl: deployment.url,
   alias: SITE,
   publishedStatus: deployment.latest_stage.status,
   ...site,
   checkedAt: new Date().toISOString(),
  }
  break
 } catch (error) {
  if (attempt === 11) {
   // Do not disclose Cloudflare payloads or bearer credentials.
   console.error('Pages post-deploy verification failed:', error instanceof Error ? error.message : 'unknown error')
   process.exitCode = 1
  } else {
   await wait(5000)
  }
 }
}

if (success) {
 await mkdir('.qa-release', { recursive: true })
 await writeFile('.qa-release/verified.json', JSON.stringify(success, null, 2) + '\n')
 console.log('Verified Pages preview deployment:', success.deploymentId, success.revision)
}
