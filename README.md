# Jayson Tech Online Shop

Customer-facing ecommerce experience for a NEN International retail client.

## Current release: interactive **mock** client preview

Branch: `feat/storefront-demo`. The storefront now provides a complete example browsing-to-order flow with React and browser-only state:

- Landing page, catalogue, category filters, sorting, search and product details
- Responsive navigation, saved products, shopping cart with quantity edits
- Demo promo `JAYSON10` and illustrative delivery estimates
- Sample guest checkout, simulated payment choice, review and order confirmation
- Browser-only example order history, receipt and interactive delivery status preview
- Example account, help/FAQ, micro-interactions and accessible reduced-motion styling
- Direct-link-safe hash navigation for a separately built Cloudflare Pages preview

**Safety boundary:** All catalogue prices, stock, orders, delivery fees, checkout options and account identities are fictional. No actual purchases or payments can occur; no payment details are collected. No backend receives customer data. The checkout form is not persisted.

## Commands

From the repository root:

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm build
corepack pnpm test
corepack pnpm typecheck
corepack pnpm --filter @jayson/storefront build:pages
```

The existing TanStack Start application and the static Pages preview share the same React UI. The latter is a deliberately isolated demonstration build.

For feature contracts, browser QA and release instructions see [Interactive Preview](docs/storefront/INTERACTIVE-PREVIEW.md) and [Client Preview Acceptance](docs/qa/CLIENT-PREVIEW-ACCEPTANCE.md).

**QA status:** Interactive v2 passed CircleCI pipeline #8 (QA Intel and mobile/desktop browser checks). The Pages site still serves the earlier version. A new, separate QA-gated release workflow is committed but not yet run and requires a restricted CircleCI deployment context.

## Planned production system

- React/TanStack frontend with backend services in NestJS/PostgreSQL/Drizzle/Redis/BullMQ
- Real merchant-approved catalogue, stock and delivery terms
- Payment integration through approved NEN/Paystack mechanisms
- Integration into the relevant AmaraiiOS commerce, POS and inventory capabilities
- Customer authentication and secure server-side order processing

The real business model and production infrastructure remain subject to client discovery and approval.
