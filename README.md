# Yoora Sarah Platform Monorepo

This workspace contains the live Yoora Sarah customer storefront, the internal portal, the FastAPI backend, and the database migrations and seeds that support both surfaces.

## Active surfaces

- `apps/web` — customer-facing storefront and AI Stylist studio
- `apps/portal` — internal portal
- `services/api` — FastAPI application backing internal and storefront workflows
- `db/migrations` — executable database migrations
- `db/seeds` — executable seed SQL
- `tools/db` — migration and seed runners

## Repository layout

```text
apps/
  web/           Next.js storefront and AI Stylist studio
  portal/        Next.js internal portal
services/
  api/           FastAPI API
  workers/       background worker scaffold
  ai/            AI service scaffold
packages/
  ...            shared packages
db/
  migrations/    executable migrations
  seeds/         executable seeds
tools/
  db/            migration and seed runner
```

## Cloud configuration

Set environment variables before running the storefront, portal, or API:

- `DATABASE_URL` should point to the Supabase Postgres connection string
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY` should point to the active Supabase project
- `YOORA_INTERNAL_API_BASE_URL` should point to the FastAPI base path used by the frontend, for example `http://127.0.0.1:8000/api/v1`
- `YOORA_INTERNAL_API_SHARED_SECRET` should match between frontend and API if the internal API role gate is enforced

## Storefront

The customer storefront lives in `apps/web`.

Notable customer-facing surfaces:
- `/` — single-scene homepage hero with embedded clearance rail
- `/stylist` — private AI Stylist studio
- category and product routes under `apps/web/app`

## AI Stylist

The active AI Stylist experience is centered on `/stylist` and currently includes:
- chat-based styling guidance
- outfit seed templates
- image-aware item matching
- product-to-model generation

The homepage should remain a one-page hero experience. Advanced stylist workflows belong inside `/stylist`, not as added homepage sections.

## First commands

### Storefront

```bash
npm --prefix apps/web install
npm --prefix apps/web run dev
```

### Portal

```bash
npm --prefix apps/portal install
npm --prefix apps/portal run dev
```

### API

```bash
uv run --directory services/api uvicorn app.main:app --reload --port 8000
```

### Database

```bash
uv run --directory tools/db python run_migrations.py status
uv run --directory tools/db python run_migrations.py migrate
```
