# Reusable storefront architecture — accepted direction (2026-10-19)

## Product line
Jayson Tech is the first customer implementation of a reusable ecommerce storefront foundation. Reuse should be achieved through theme/template configuration and infrastructure adapters, **not** by copying Jayson-specific content into the shared core.

## Feature-Sliced Design
- `app`: composition, providers, configuration, router.
- `pages`: route-level screen composition; TanStack file routes stay thin.
- `widgets`: storefront sections, header, footer, product grid (extract when needed).
- `features`: actions and user interactions (cart, search, theme, checkout).
- `entities`: business domain types and display models (product, category, order).
- `shared`: reusable UI primitives, utilities, and cross-cutting services.
- Dependency direction: app/pages → widgets → features → entities → shared; avoid upward imports and cross-feature coupling.

Current MVP: `pages/home/ui/home.tsx`, `features/cart/model/cart-store.ts`, `features/theme`, `entities/product/model/catalog.ts`. Subsequent refactors will extract widgets and generic components without introducing abstractions prematurely.

## Theming and templates
- Accepted: light, dark and system preference from day one.
- CSS variables in `packages/ui/src/styles/tokens.css` are the starting design tokens; theme preference stored locally and system preference observed.
- Keep **brand tokens** separate from **semantic tokens** and **template layout**. Template selection should not change commerce behavior.
- Planned configuration: `StorefrontConfig` for business identity, navigation, currency, enabled capabilities, and template key; no customer-specific constants in shared UI.
- Planned template contract: stable commerce slots (home, listing, details, cart, checkout), with independent layouts (e.g. marketplace, editorial, minimal). Implement only once a second template is required.

## Infrastructure boundaries
- Catalog, inventory, pricing, checkout, payment and fulfilment interfaces must not depend on a specific UI template.
- Authoritative product and stock domains will be shared with AmaraiiOS POS; never independently decrement inventory in the storefront.
- Payment integration via NEN Payment / Paystack behind a provider boundary; backend validates orders, amounts, and webhook events.
- Future deployment may vary by customer; avoid binding tenant isolation to UI templates.

## Quality gates
- Run `pnpm install`, `pnpm typecheck`, `pnpm build`, `pnpm dev` and inspect mobile + desktop in both modes.
- Check keyboard focus, contrast, mobile tap targets, dark-mode surfaces and SSR hydration.
- No live checkout, stock guarantees, delivery promises or production claims until backend integrations are verified.
