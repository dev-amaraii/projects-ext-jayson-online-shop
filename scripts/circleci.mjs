#!/usr/bin/env node
// Minimal CircleCI API v2 client. No third-party dependencies.
const env = process.env;
const command = process.argv[2];
const branch = process.argv[3] || 'feat/storefront-demo';
const token = env.CIRCLE_TOKEN;
const slug = env.CIRCLE_PROJECT_SLUG;
const definitionId = env.CIRCLE_DEFINITION_ID;
const allowed = (env.CIRCLE_ALLOWED_BRANCHES || 'feat/storefront-demo,main').split(',').map(x => x.trim());
const base = 'https://circleci.com/api/v2';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function fail(message) { console.error(message); process.exit(1); }
if (!['trigger', 'status'].includes(command)) fail('Usage: node scripts/circleci.mjs trigger [branch] [--execute] | status <pipeline-uuid>');
if (!slug || !/^(circleci|gh|github)\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+$/.test(slug)) fail('Set CIRCLE_PROJECT_SLUG from CircleCI Project Settings > Overview');
if (command === 'trigger') {
  if (!allowed.includes(branch)) fail('Branch not allowed: ' + branch);
  if (!definitionId || !uuid.test(definitionId)) fail('Set CIRCLE_DEFINITION_ID from CircleCI Project Settings > Pipelines');
}
if (command === 'status' && !uuid.test(branch)) fail('Provide a valid pipeline UUID');
const path = command === 'trigger' ? '/project/' + slug + '/pipeline/run' : '/pipeline/' + branch;
const body = command === 'trigger' ? { definition_id: definitionId, config: { branch }, checkout: { branch }, parameters: { run_validation: true } } : undefined;
if (command === 'trigger' && !process.argv.includes('--execute')) {
  console.log(JSON.stringify({ dry_run: true, method: 'POST', path, body }, null, 2));
  console.log('No pipeline started. Add --execute to authorize one run.');
  process.exit(0);
}
if (!token) fail('CIRCLE_TOKEN is required; never commit or paste it into chat.');
const response = await fetch(base + path, {
  method: body ? 'POST' : 'GET',
  headers: { 'Circle-Token': token, 'Accept': 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
  ...(body ? { body: JSON.stringify(body) } : {}),
});
const payload = await response.text();
if (!response.ok) fail('CircleCI API HTTP ' + response.status + ': ' + payload.slice(0, 1000));
try { console.log(JSON.stringify(JSON.parse(payload), null, 2)); } catch { console.log(payload); }
