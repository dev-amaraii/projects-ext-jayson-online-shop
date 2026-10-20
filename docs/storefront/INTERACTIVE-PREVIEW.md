# Jayson Tech — interactive client preview v2

Status: **v2 QA passed in CircleCI pipeline #8 (2026-10-20); the revised QA-gated remote release workflow is committed but unverified and not deployed**.
Branch: `feat/storefront-demo`. The production commerce system is **not** available.

## Why this preview exists

The customer should be able to navigate a credible online store, understand the user journey and give concrete feedback before live stock, payments, authentication, inventory, POS and backend integrations are built.

This preview shares one React storefront implementation between the existing TanStack Start app and the static Cloudflare Pages build. The Pages build remains a deliberately separate client demonstration, not an architectural migration or a production storefront.

## Experience and navigation

The site uses client-side hash routes so direct links and refreshes work on static Cloudflare Pages.

| Route | Experience |
| --- | --- |
| `#/home` | Hero, category discovery, promotions, curated products |
| `#/shop` | Search, category chips/sidebar, sorting by price and name |
| `#/product/{id}` | Product detail, quantity, price, related items, wishlist |
| `#/wishlist` | Saved items stored locally |
| `#/cart` | Quantity edits, remove, clear, promo and subtotal |
| `#/checkout` | Sample guest contact + mock delivery, mock payment, review |
| `#/order/{id}` | Simulated receipt and interactive example tracking stages |
| `#/orders` | Browser-only simulated order history |
| `#/account` | Example customer profile with links to history and saved items |
| `#/help` | FAQs describing what is and isn't live |

Desktop nav, mobile bottom nav, mobile drawer, return links, animated cards, toast messages and reduced-motion support are included.

## Fixed mock business rules

- All catalogue products and prices are illustrative. The 12 existing catalogue products are reused and no real stock exists.
- Demo promotion: `JAYSON10` reduces merchandise subtotal by 10%, capped at **₦50,000**.
- Pickup: ₦0 (example only). Standard delivery: Abuja ₦2,500; Lagos ₦4,000; Port Harcourt ₦5,000; other cities ₦6,500. Express is 2× the illustrative standard cost.
- Empty carts cannot proceed to checkout. Product quantities are bounded to 1–99.
- Checkout is a **simulation**: mocked transfer, card and pay-on-delivery options are selection controls only. No payment field, actual transaction or network submission is created.
- Prefilled demo contact data is intended for testing. The user is explicitly warned not to enter real details. Form data is held only in React memory and is **never stored in the mock order or transmitted**.
- Only mock item IDs/quantities, timestamp, city/mode/payment choice, calculated totals and generated `JT-...` order ID can persist in browser localStorage. Order history is bounded and validated. Wishlist data is separately bounded and validated.
- Example tracking progresses via user interaction and is not connected to any fulfilment service.
- The account screen is a **profile concept**. It does not sign in or provision a customer.
- Any failed or restricted localStorage access leaves the UI usable in memory when possible.

## Acceptance / regression

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm build
corepack pnpm test
corepack pnpm typecheck
corepack pnpm --filter @jayson/storefront build:pages
```

The on-demand CircleCI QA Intel workflow builds and tests the actual Pages artifact. The `tests/features/storefront-preview.feature` scenarios now cover discovery, filtering, details, wishlist, cart, promotional totals, guest checkout, order confirmation/history, validation, reload persistence and example tracking.

CircleCI also runs `scripts/qa/responsive-preview.mjs` against the same Pages preview server. This uses the Playwright installation supplied by QA Intel's isolated runner and checks the complete sample checkout journey at 320px, 390px and 1280px. It records before/after screenshots, overflow measurements, runtime errors and a structured summary under `.qa-results/responsive/`. The responsive browser gate ran successfully in CircleCI pipeline #8; screenshots for 320px, 390px and 1280px were uploaded.

**Pipeline #8 passed** the v2 build, unit/type checks, QA Intel and responsive browser tests. The new CircleCI release workflow modifies CI configuration and therefore requires its own successful validation before shipping.

After review and authorization, request a fresh pipeline manually:

```bash
git checkout feat/storefront-demo
git pull --ff-only
node scripts/circleci.mjs trigger feat/storefront-demo --preview-qa
node scripts/circleci.mjs trigger feat/storefront-demo --preview-qa --execute
```

The separate release workflow uses a *pinned full commit SHA* and publishes the exact artifact tested by QA; there is no longer a requirement to run Wrangler on a local Mac. The preview site stays unchanged unless a separately authorized release pipeline passes all gates.

A one-time CircleCI context named `jayson-pages-preview` must be created and restricted to the Jayson project and authorized operators. Store the encrypted `CLOUDFLARE_API_TOKEN` there, using a least-privilege Cloudflare API token with Pages Edit permission on the NEN DevOps account. Do not paste the token into chat or GitHub. The QA job has no access to that context; only the deployment job does.

The deployment job checks the pinned commit, project/branch, built asset and noindex header, uploads the QA workspace artifact, checks Cloudflare's deployment metadata and HTTP response, and stores a verification record. The client preview must still be manually reviewed on mobile and desktop before sharing.


## Production implementation boundaries

This preview intentionally **does not** create actual orders, accept money or provide authenticated accounts. Production work will require client-approved branding, real products/media, pricing/stock policy, sales and tax rules, shipping providers, inventory/POS integration, server-side order and payment lifecycle, customer privacy, authorization, audit and operations. Do not reuse browser-only mock orders or payment selectors as production business logic.

## CI deployment and provenance record

- QA pipeline #8: `69ae77a7-cd37-486b-a671-45c73efa2637`, successful workflow/job. It validated interactive v2 before the latest CI release configuration was committed.
- Release condition: only CircleCI's `run_preview_release=true` parameter plus an approved full `release_sha` enables `manually-requested-preview-release`. This workflow re-runs QA, gates deployment behind QA success, and fails closed if the checked-out commit differs from that SHA.
- The deployment job attaches the original QA workspace artifact and uses CircleCI context `jayson-pages-preview` exclusively in the deployment stage. The Cloudflare project is locked to `jayson-tech-client-preview`, its production branch is `feat/storefront-demo`, and the Worker never accepts an arbitrary destination.
- Post-deployment validation checks the latest Cloudflare Pages deployment's project, branch, exact commit, completed status and live entry page. Failed verification blocks the release outcome but does not automatically roll back uploaded assets; operators must investigate before sharing the URL.
- No auto-on-push release, no real checkout, and no production commerce launch.
