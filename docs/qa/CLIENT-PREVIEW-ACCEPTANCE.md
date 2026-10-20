# Jayson Tech — client preview QA Intel acceptance contract

Status: **proposed acceptance contract; execution pending**. The QA Intel browser job is configured in CircleCI but has not yet been executed or verified. Do not report this document as a successful QA Intel run.

## Release intent
Publish a shareable **client preview**, not a production commerce application. Real checkout, account creation, inventory, delivery quotes and payments are out of scope. Do not collect money or claim that placeholder prices/stock are real.

## Automated validation (CircleCI, on demand)
Run `corepack pnpm install --frozen-lockfile`, `corepack pnpm build`, `corepack pnpm test`, and `corepack pnpm typecheck` on the exact proposed preview commit. Fail preview promotion on any failure. CircleCI is manually requested using `run_validation=true`; avoid per-push credit consumption.

## QA Intel test scenarios
| ID | Scenario | Expected result | Priority |
| --- | --- | --- | --- |
| QA-01 | Desktop initial load at 1440px | Header, hero, categories, catalogue and preview notice visible; no horizontal overflow | P0 |
| QA-02 | Mobile initial load at 390px and 320px | Search, navigation, cards and bottom bar usable; no horizontal overflow | P0 |
| QA-03 | Search name, description and category, mixed case and whitespace | Matching items only; clearing restores catalogue | P0 |
| QA-04 | Search nonexistent term | Helpful empty state and working Clear filters action | P1 |
| QA-05 | Category filter and reset | Correct subset and all-products reset | P0 |
| QA-06 | Add item, increase/decrease quantity, clear cart | Count and subtotal reflect quantity; no negative quantity | P0 |
| QA-07 | Reload page with populated cart | Valid quantities restored from localStorage after hydration | P0 |
| QA-08 | Corrupted localStorage and blocked storage | Page renders and cart remains usable without crashing | P0 |
| QA-09 | Open and close product detail, cart, mobile menu | Controls work; labels understandable to assistive technology | P1 |
| QA-10 | Checkout and account | Checkout disabled, no real payment, account clearly marked unavailable | P0 |
| QA-11 | Light/dark/system theme | Readable surfaces and controls in both themes, persists on reload | P1 |
| QA-12 | Browser console and network | No uncaught runtime errors or broken essential assets | P0 |
| QA-13 | Preview security | No credentials, tokens, payment forms or customer personal-data collection | P0 |

## QA Intel integration boundary
- If the existing NEN QA Intel runner is accessible, import/translate these cases into its **actual schema** after inspecting that repository. Do not invent an integration or claim agent execution.
- Preserve evidence per scenario: commit SHA, URL/build, viewport, screenshot or log, pass/fail, and defect reference.
- Promotion gate: all P0 scenarios pass, no blocking defects, build/test/typecheck pass. P1 defects must be disclosed to the client if unresolved.
- Never deploy a production site by interpreting a preview pass as commerce readiness.

## Cloudflare Pages preview
Cloudflare Pages is an approved hosting target for the client preview **after validation**. Confirm the correct TanStack Start SSR/static adapter and Cloudflare build configuration before deployment; do not assume a Vite build output is directly Pages-compatible. Keep production domains and real checkout disabled. Record the resulting preview URL only after deployment succeeds.

## Implemented QA Intel wiring (2026-10-20)
- Source: [CodieCoder/qa-intel](https://github.com/CodieCoder/qa-intel), npm package `@qutecoder/qa-intel` version 0.2.0 (repository manifest). Package registry installation remains unverified.
- Gherkin smoke scenarios: `tests/features/storefront-preview.feature`.
- On-demand CircleCI workflow: `manually-requested-preview-qa`, parameter `run_preview_qa=true` on `feat/storefront-demo` or `main`.
- Isolated QA runner install avoids modifying the application's pnpm lockfile; QA artifacts are stored under `.qa-results` in CircleCI.
- **Not yet verified:** CircleCI configuration acceptance, QA Intel package installation, Playwright browser availability, Gherkin compilation, actual browser execution, all P0/P1 acceptance cases, and Cloudflare Pages compatibility. These must not be reported as passed.
- The smoke file covers only an initial subset of the 13 acceptance scenarios; expand after the first real run and fix failures using captured evidence.
- Manual pipeline triggering requires explicit approval and CircleCI access. Do not configure automatic triggers.

## How to request the browser QA workflow

First pull the latest feature-branch commits and inspect a dry run:

```bash
git checkout feat/storefront-demo
git pull --ff-only
node scripts/circleci.mjs trigger feat/storefront-demo --preview-qa
```

The dry-run JSON must contain `"run_preview_qa": true`. Only then execute the approved pipeline:

```bash
node scripts/circleci.mjs trigger feat/storefront-demo --preview-qa --execute
```

Do **not** omit `--preview-qa`: the default trigger continues to run only build/unit/typecheck validation. After the run, inspect `manually-requested-preview-qa`, and download the QA Intel JSON/SQLite/artifacts. The browser suite requires a running storefront server; CircleCI runs a preview development server for the test job, not a public deployment. Do not record the QA gate as passed until the workflow completes successfully.

## First QA Intel execution — CircleCI pipeline #5 (2026-10-20)
- Source commit: `3287dc7` on `feat/storefront-demo`.
- QA Intel package installation, application build, local server startup and runner invocation **succeeded**.
- QA Intel summary: **four contracts, two passed, two failed**.
- Passed: product discovery/search scenario (did not exclude unrelated products), category browsing.
- Failed: cart action selected the ambiguous `Add to Cart` accessible name (12 matches); empty-search recovery timed out waiting for `Clear filters` (0 matches).
- The original feature mistakenly combined intermediate assertions with later state-changing steps. QA Intel's compiled contracts run steps first, then assertions, so intermediate states require separate scenarios.
- Follow-up fixes: product-specific accessible add-to-cart labels, explicit post-hydration marker, QA Intel wait for `testid:storefront-hydrated`, separate cart-add/clear and empty-state/recovery scenarios, and negative search assertions to avoid false passes.
- **Current status: post-fix results unverified.** The new six-scenario smoke suite has not yet been executed in CircleCI. Do not deploy based on the passing previous validation job or partially passing pipeline #5.
