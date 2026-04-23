# Yoora Sarah Storefront Contract Foundation

## Phase 1 Step 1 Alignment Note

| Field | Value |
| --- | --- |
| Date | 2026-04-22 |
| Status | Extended implementation |
| Scope | Shared storefront and commerce contracts, public API foundation, auth/typing cleanup linked to Phase 1 |

## What changed

- `packages/database/src/catalog.ts` is now the shared TypeScript source for storefront contract types.
- `packages/database/src/commerce.ts` now defines the shared TypeScript contract for customer profile, wishlist, checkout summary, order state, and support handoff payloads.
- `apps/web/app/lib/storefront-data.ts` now imports those shared types instead of owning separate product and category interfaces.
- `services/api` now exposes a public `catalog` route family under `/api/v1/catalog`.
- `services/api` now also exposes fixture-backed `customers`, `orders`, and `support` route families needed for profile, wishlist, checkout, and human-handoff readiness.
- `services/api` now resolves catalog and commerce storefront data from Postgres first when the new storefront schema is present, then falls back to fixture stores if a table slice is still missing.
- `apps/web` now reads storefront shell, profile, wishlist, checkout, and WhatsApp support contact through server-side API fetch with local fixture fallback, so the current UI can stay intact while contract ownership moves out of page-local mocks.
- `services/api` now exposes persistent cart read and mutation endpoints so the existing cart page can keep its current UI while syncing quantity and removal state through the API.
- `apps/web` cart page now reads from the commerce contract instead of static catalog helpers, then persists quantity and removal actions through server actions without introducing a new UI.
- `apps/web` product detail page now sends its existing add-to-cart CTA through the same commerce contract, so buyer intent from PDP reaches the persistent cart without changing the approved layout.

## Contract surfaces

### Shared TypeScript contract

- categories
- featured stories
- product summary and detail
- footer links
- quick links, account highlights, checkout steps, trust signals
- customer addresses, wishlist preview, order summary, checkout payment and recipient data
- support contact, support policy article, and support handoff preview payload

### API endpoints

- `GET /api/v1/catalog/storefront`
- `GET /api/v1/catalog/categories`
- `GET /api/v1/catalog/products`
- `GET /api/v1/catalog/products/{categorySlug}/{productSlug}`
- `GET /api/v1/customers/me/profile`
- `GET /api/v1/customers/me/wishlist`
- `GET /api/v1/orders/me`
- `GET /api/v1/orders/me/cart`
- `POST /api/v1/orders/me/cart/items`
- `PATCH /api/v1/orders/me/cart/items/{itemId}`
- `DELETE /api/v1/orders/me/cart/items/{itemId}`
- `GET /api/v1/orders/me/checkout-summary`
- `GET /api/v1/support/contact`
- `GET /api/v1/support/policies`
- `POST /api/v1/support/handoffs/preview`

## Current limitation

These contracts are aligned structurally, and the API can now resolve categories, cross-category catalog products, customer profile, wishlist, persistent cart state, add-to-cart mutations, checkout summary, and support-policy articles from shared persistent tables when migration `013_storefront_cart_persistence.sql` and seed `005_storefront_catalog_cart_expansion.sql` are applied on top of the existing storefront foundation.

Fallback remains active when database access or a required table slice is unavailable, so sandbox or offline import behavior stays clean.

## Immediate next step

Use the now-persistent cart and full category catalog as the buyer-facing source of truth, then continue with buyer AI retrieval tools and event logging for Phase 2.
