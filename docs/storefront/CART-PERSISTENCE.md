# Cart persistence — demo specification

## Existing behavior
The storefront uses an in-memory Zustand cart with `items`, `add`, `change`, and `clear`. A reload loses selected items. The catalogue contains illustrative products and prices; checkout is not enabled.

## Proposed increment
Persist only product IDs and positive integer quantities in browser localStorage, using a versioned key. Hydrate after the client mounts to avoid server-side storage access and hydration mismatch. Reject malformed JSON, unknown product IDs, noninteger quantities, zero/negative quantities and excessively large quantities. Treat unavailable storage as an in-memory cart, not an application error. Clearing the cart removes persisted items. Keep all existing UI actions and demo-only checkout safeguards.

## Tests required before release
1. A fresh cart is empty.
2. Adding and decrementing products updates quantities.
3. Persisted valid items restore after client initialization.
4. Malformed data, unknown IDs and invalid quantities are ignored.
5. Storage exceptions do not crash the app.
6. No localStorage access occurs during server rendering.
7. Cart clear persists the empty state.
8. Build and typecheck pass.

## Out of scope
Real stock checks, product pricing guarantees, checkout, accounts, backend persistence and payment processing.

## Implementation status (2026-10-19)
- Implemented `cart-persistence.ts` with a versioned storage key and validated product IDs/quantities.
- Connected client-only hydration and Zustand state subscription from the homepage.
- Added Node-native cart tests (`cart-persistence.test.mjs`), `pnpm test` scripts, and a CircleCI test step.
- Nine isolated tests passed locally against a reconstructed copy of the persistence logic and catalogue IDs; **the actual repository test command and full build/typecheck have not been run or verified yet**.
- CircleCI status is not verified; the latest GitHub commit had no reported combined statuses.
- Pending: execute `corepack pnpm install --frozen-lockfile && corepack pnpm build && corepack pnpm test && corepack pnpm typecheck` in a checkout, inspect failures, and verify mobile/cart behavior.
