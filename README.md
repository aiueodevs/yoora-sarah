# Yoora Sarah Platform Monorepo

This workspace now contains:

- execution and governance artifacts in [`sdlc/`](./sdlc)
- implementation scaffold for the internal portal and Python services
- executable PostgreSQL migrations and seed data
- a Sprint 0 auth skeleton with protected-route strategy for the portal

## Stack Baseline

The scaffold follows the accepted ADR:

- Next.js + TypeScript for the internal portal
- Python services for API, workers, and AI workloads
- Supabase PostgreSQL as the system-of-record database
- Redis as queue and cache baseline
- Cloudflare R2 for object storage

## Repository Layout

```text
apps/
  portal/        Next.js internal portal scaffold
services/
  api/           FastAPI internal API scaffold
  workers/       background worker scaffold
  ai/            AI service scaffold
db/
  migrations/    executable domain migrations
  seeds/         executable baseline seed SQL
tools/
  db/            migration and seed runner
sdlc/
  ...            strategy, architecture, QA, and backlog artifacts
```

## Cloud Configuration

Set environment variables before running the portal or API:

- `DATABASE_URL` should point to the Supabase Postgres connection string
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY` should point to the Supabase project used by the Sprint 1 portal and API
- `YOORA_INTERNAL_API_BASE_URL` should point to the FastAPI base path used by the portal, for example `http://127.0.0.1:8000/api/v1`
- `YOORA_INTERNAL_API_SHARED_SECRET` should match between portal and API if you want the internal API role gate enforced outside open mode
- `OBJECT_STORAGE_BUCKET`, `OBJECT_STORAGE_ENDPOINT`, `R2_ENDPOINT`, `R2_PUBLIC_URL`, `R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY` should point to the Cloudflare R2 bucket

## FastAPI Production Path

The repo now includes a separate production deployment template for the internal FastAPI service:

- Docker image definition in [`services/api/Dockerfile`](./services/api/Dockerfile)
- Render blueprint in [`render.yaml`](./render.yaml)
- readiness probe at `/api/v1/ready`

Use [`sdlc/runbooks/fastapi-production-deployment.md`](./sdlc/runbooks/fastapi-production-deployment.md) to provision the service, then wire the portal with:

- `YOORA_INTERNAL_API_BASE_URL=https://<fastapi-host>/api/v1`
- `YOORA_INTERNAL_API_SHARED_SECRET=<same-secret-as-api>`

## First Commands

### Portal

```bash
npm --prefix apps/portal install --no-package-lock
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

## Sprint 0 Baseline

Sprint 0 is considered complete only when the following foundations exist together:

- repo structure for portal, API, workers, AI service, DB tools, and SDLC docs
- local command baseline for portal and Python services
- protected route strategy for the internal portal
- environment contract for local and staging usage
- Vercel Git deployment path working end to end

See [`sdlc/sprint-0-foundation-baseline.md`](./sdlc/sprint-0-foundation-baseline.md) for the execution checklist and environment baseline.

### Portal Auth Skeleton

The portal now supports a Sprint 0 internal auth baseline:

- signed session cookie named `yoora_portal_session`
- login page at `/login`
- middleware-based route protection when auth env vars are configured
- seeded internal emails from `public.users`
- role-aware server-side checks for settings and approvals surfaces

Required env vars:

- `YOORA_PORTAL_AUTH_SECRET`
- `YOORA_PORTAL_BOOTSTRAP_PASSWORD`

If those variables are not configured, the auth middleware stays in open mode so existing production pages are not blocked unintentionally.

## Sprint 1 Integration Notes

- The portal prefers the FastAPI integration layer for settings and approvals reads when `YOORA_INTERNAL_API_BASE_URL` is configured.
- If `YOORA_INTERNAL_API_SHARED_SECRET` is configured in the API, master data endpoints require both `x-yoora-internal-key` and a known internal actor email via `x-yoora-actor-email`.
- If the shared secret is left empty, the API stays in open mode to preserve the existing baseline while environments are still being wired.

## Delivery Notes

- The squad breakdown lives in [`sdlc/tickets/engineering-ticket-breakdown-by-squad.md`](./sdlc/tickets/engineering-ticket-breakdown-by-squad.md).
- The migration files under `db/migrations/` are executable copies of the approved SDLC split migrations.
- Seed files are idempotent and intended for non-production bootstrap against Supabase environments.
- The canonical API contract source remains [`sdlc/api/openapi-internal-v1.yaml`](./sdlc/api/openapi-internal-v1.yaml).
