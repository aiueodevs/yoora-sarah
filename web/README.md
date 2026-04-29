# YOORA-SARAH Web

Customer-facing storefront for Yoora Sarah.

## Role

- Product catalog, product detail, cart, checkout, wishlist, profile, and customer-facing AI styling surfaces.
- Primary public frontend deployment unit.
- Uses the centralized backend/API and shared database-backed commerce flows when configured, with fixture/fallback behavior where supported.

## Local development

From the repository root:

```bash
npm install --prefix web
npm run dev:web
```

Useful checks:

```bash
npm run lint:web
npm run typecheck:web
npm run build:web
npm run test:web
```

## Deployment

Deploy this folder as the customer storefront project, typically on Vercel.

Required production configuration depends on which flows are enabled. See the root [README](../README.md) for environment variables and deployment checklist.
