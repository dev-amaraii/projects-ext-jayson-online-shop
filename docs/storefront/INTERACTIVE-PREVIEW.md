# Jayson Tech — interactive client preview v2

Status: **implementation committed, QA and deployment pending**.
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

**None of these commands has been executed against this v2 change set in this session.** Do not mark the updated app green based on the earlier pipeline #6.

After review and authorization, request a fresh pipeline manually:

```bash
git checkout feat/storefront-demo
git pull --ff-only
node scripts/circleci.mjs trigger feat/storefront-demo --preview-qa
node scripts/circleci.mjs trigger feat/storefront-demo --preview-qa --execute
```

If it passes, build and manually deploy from inside `apps/storefront`:

```bash
corepack pnpm build:pages
npx wrangler pages deploy dist/pages --project-name jayson-tech-client-preview --branch feat/storefront-demo
```

Check the actual live URL on desktop and at 390px/320px mobile sizes. Check the console and test direct-link refresh, demo order persistence, blocked-storage fallback and reduced motion. The live Cloudflare Pages deployment continues to serve the earlier version until a new deploy is explicitly made.

## Production implementation boundaries

This preview intentionally **does not** create actual orders, accept money or provide authenticated accounts. Production work will require client-approved branding, real products/media, pricing/stock policy, sales and tax rules, shipping providers, inventory/POS integration, server-side order and payment lifecycle, customer privacy, authorization, audit and operations. Do not reuse browser-only mock orders or payment selectors as production business logic.
