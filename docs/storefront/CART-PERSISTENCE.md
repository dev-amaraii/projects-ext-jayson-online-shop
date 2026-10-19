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

## Status
Specification only; implementation and tests pending.
