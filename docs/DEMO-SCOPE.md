# Jayson Tech — Customer demo scope

## Accepted design
- Desktop: blue-and-white Gadget Marketplace with orange search action, category navigation, promotional sections and product grid.
- Mobile: responsive browsing, product preview, category search, cart and navigation.
- Samsung is **mock demonstration branding only**; actual retail brand is unconfirmed.

## Implemented in this branch
- TanStack Start storefront in a pnpm/Turborepo workspace.
- Responsive homepage, category selection, product search, demo product previews and Zustand cart.
- Clear preview disclaimer. No payments, live inventory, checkout or customer accounts.

## Not yet implemented
- Real product imagery and the full 12-screen mobile journey.
- Product variants, account and guest checkout flows, delivery address, order review, order history.
- NestJS, Drizzle/Postgres, Redis/BullMQ, NEN Payment/Paystack and AmaraiiOS POS integration.

## Business constraints
- Source of truth: NEN Context OS, Phone Accessories Retailer — Customer #001.
- Expected catalogue 500+ SKUs; variants, discounts, bulk import.
- Shared authoritative catalogue and inventory between ecommerce and physical POS.
- Public availability, not exact inventory counts.
- Abuja initial market; delivery rates and nationwide availability are unconfirmed.

## Run locally
```sh
pnpm install
pnpm dev
```

This is a reviewable UI implementation, not a verified production deployment. Test build and responsive behavior before showing it as a working site.
