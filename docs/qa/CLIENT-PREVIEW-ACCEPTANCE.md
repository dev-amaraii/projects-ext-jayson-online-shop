# Jayson Tech — QA Intel client-preview acceptance contract

Status (2026-10-20): **v1 client preview deployed; v2 interactive flow implemented in branch; updated QA not yet run**.

The Cloudflare Pages project `jayson-tech-client-preview` was created and a prior, more limited frontend preview was deployed successfully. CircleCI pipeline #6 passed the preceding QA Intel smoke suite against the earlier development-server configuration. **Neither result validates the new v2 flow.** Do not announce v2 as ready until the new tests pass and its static artifact is deployed.

## Release intent

Give the client a genuinely navigable full shopping **simulation**, not a live commerce launch. Users can interact with product discovery, saved items, cart, voucher, example delivery/payment options, guest checkout form, mock confirmation, example tracking and browser-only order history. The interface must clearly disclose that data, prices, stock, accounts, delivery and payment are fictional.

The preview **must not** create real orders, submit contacts to a backend, collect card/bank credentials, process payments, or imply that an example tracking status is an actual shipment.

## Acceptance scenarios

| ID | Journey | Required result | Priority |
| --- | --- | --- | --- |
| QA-01 | Desktop initial load | Hero, navigation, category tiles, product cards and demo banner render | P0 |
| QA-02 | Mobile widths 320/390 | No horizontal overflow; menu, search, sticky bottom navigation and cards usable | P0 |
| QA-03 | Search/category | Name/description/category search, filter and clear action correctly narrow/reset products | P0 |
| QA-04 | Sorting | Price and name ordering behave deterministically | P1 |
| QA-05 | Product details | Direct links and refresh work; product info, quantity and related products visible | P0 |
| QA-06 | Wishlist | Add/remove, aria labels and reload persistence work | P1 |
| QA-07 | Cart | Add/increase/decrease/remove/clear, totals and persistence work | P0 |
| QA-08 | Mock promotion | `JAYSON10` gives 10% up to ₦50,000, bad codes give 0% | P0 |
| QA-09 | Checkout contact | Sample contact form validates, users warned not to enter personal data | P0 |
| QA-10 | Delivery calculation | Pickup free, city and express fee rules match documented demo rates | P0 |
| QA-11 | Payment selection | Mock card/transfer/delivery UI never requests credentials or charges money | P0 |
| QA-12 | Confirmation | Creates a browser-only demo order and clears the cart | P0 |
| QA-13 | Orders/history | Mock reference, timestamp, items and totals persist safely on reload | P0 |
| QA-14 | Tracking | User advances example statuses only; no live delivery claim | P1 |
| QA-15 | Account/help | Profile explicitly fake; FAQs and navigation accessible | P1 |
| QA-16 | Browser errors | No uncaught errors, broken core assets, secrets, API submissions or real transactions | P0 |
| QA-17 | Resilience | Invalid IDs, corrupted localStorage, unavailable storage and bad checkout fields don't crash app | P0 |
| QA-18 | Motion/theme | Dark/light/system legible, reduced-motion honored, controls keyboard accessible | P1 |

## Checks and evidence

- From repo root: `corepack pnpm build && corepack pnpm test && corepack pnpm typecheck && corepack pnpm --filter @jayson/storefront build:pages`.
- On-demand CircleCI workflow: `manually-requested-preview-qa` with parameter `run_preview_qa=true`. It validates the static Pages build, unit tests, typecheck and QA Intel Gherkin scenarios.
- Gherkin: `tests/features/storefront-preview.feature` (17 end-to-end scenarios including checkout, order history, persistence and errors).
- Responsive Playwright: `scripts/qa/responsive-preview.mjs`, 320px/390px/1280px, screenshots plus no-overflow/checkout assertions.
- Capture QA Intel JSON, SQLite history, desktop/mobile screenshots and browser/console errors. All P0 must pass. P1 issues must be reviewed and disclosed.

## Manual trigger — no automatic CI credits

```bash
git checkout feat/storefront-demo
git pull --ff-only
node scripts/circleci.mjs trigger feat/storefront-demo --preview-qa
node scripts/circleci.mjs trigger feat/storefront-demo --preview-qa --execute
```

The first trigger command is **dry-run only**. Confirm it shows `"run_preview_qa": true`. The second launches the pipeline. Do not substitute the standard validation trigger. The CI workflow must remain explicitly requested, not automatically run per Git push.

## Pages rollout only after validation

Pages project: `jayson-tech-client-preview`; manual deployment, Git connection disabled.

From **inside** `apps/storefront` after updating and validating the exact branch:

```bash
corepack pnpm build:pages
npx wrangler pages deploy dist/pages --project-name jayson-tech-client-preview --branch feat/storefront-demo
```

Check the returned URL, response, desktop and mobile experience, demo banner, mock order/receipt, and absent real payment fields before sending to the client. Only then record the new version as deployed.

Production integration remains out of scope: merchant catalogue, actual inventory and POS, server-side orders, customer authentication, privacy controls, fulfillment, payment gateway and real cash flow require separate approval and implementation.
