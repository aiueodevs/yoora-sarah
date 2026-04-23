# Yoora Sarah Commerce Schema Foundation

## Phase 1 Database Readiness Note

| Field | Value |
| --- | --- |
| Date | 2026-04-22 |
| Status | Implemented |
| Scope | Storefront catalog and commerce schema foundation for customer, order, wishlist, and support contracts |

## What changed

- Added `db/migrations/012_storefront_commerce_foundation.sql` for the missing customer-facing schema slice.
- Added `db/seeds/004_storefront_commerce_demo.sql` so the new schema has deterministic storefront demo data.
- Added `db/migrations/013_storefront_cart_persistence.sql` for persistent active-cart state.
- Added `db/seeds/005_storefront_catalog_cart_expansion.sql` so every approved storefront category and the buyer cart path have deterministic demo truth.
- Added Postgres-backed storefront service resolution in `services/api` with safe fallback to fixture stores.
- Updated shared Supabase type definitions so `packages/database` reflects the new public tables.

## New tables

- `categories`
- `products`
- `product_variants`
- `customers`
- `customer_addresses`
- `orders`
- `order_items`
- `wishlists`
- `carts`
- `cart_items`
- `support_policy_articles`
- `support_handoffs`

## Design intent

- Keep the current approved UI intact while moving business truth into database-backed structures.
- Support profile, wishlist, checkout, order visibility, and support-policy retrieval with typed data that can later be reused by buyer AI.
- Support persistent cart review and quantity changes without forcing a new storefront UI flow.
- Preserve the repo security posture by enabling RLS and deny policies on every new public table.

## Current status

- Approved storefront categories now have seeded persistent product truth, and the demo buyer cart can resolve from Postgres through `carts` and `cart_items`.
- Checkout, wishlist, order, and support-policy data can now resolve from Postgres with a shared customer-facing schema slice.
- Fallback still exists deliberately when DB connectivity is unavailable so imports and local sandbox sessions do not fail hard.

## Immediate next step

- Continue enriching product attributes and AI-ready metadata so recommendation, size guidance, and buyer AI retrieval can rely on the same persistent commerce truth.
