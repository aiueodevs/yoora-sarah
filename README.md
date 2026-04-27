# YOORA-SARAH

YOORA-SARAH is a monorepo for the Yoora Sarah platform. It contains the customer storefront, the internal portal, the FastAPI backend, shared packages, and the database tooling that support product, merchandising, and operations workflows.

## Monorepo structure

```text
apps/
  web/           Next.js customer storefront and stylist experience
  portal/        Next.js internal portal
services/
  api/           FastAPI backend
  workers/       background worker scaffold
  ai/            AI service scaffold
packages/
  database/      shared database package
  ui/            shared UI package
scripts/         local maintenance scripts
db/
  migrations/    SQL migrations
  seeds/         SQL seed data
tools/
  db/            migration and seed runner
```

## Prerequisites

- Node.js 20+
- npm 10+
- Python 3.11+
- `uv` for Python environment and command execution
- Access to the required Supabase project and environment variables

## Setup

Install workspace dependencies from the repository root:

```bash
npm install
```

If you need a portal-only install:

```bash
npm run portal:install
```

## Environment setup

Create local environment files from the provided examples where available, then supply the values required for your target surface.

Common variables used across the repo:

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `YOORA_INTERNAL_API_BASE_URL` (for example `http://127.0.0.1:8000/api/v1`)
- `YOORA_INTERNAL_API_SHARED_SECRET`

Recommended flow:

1. Copy `.env.example` to a local `.env` file if your workflow uses the root environment file.
2. Add service-specific variables required by `apps/web`, `apps/portal`, and `services/api`.
3. Keep frontend and backend internal API settings aligned when shared-secret protection is enabled.

## Main development commands

Run these from the repository root unless noted otherwise.

```bash
npm run dev              # turbo dev for workspace apps
npm run portal:dev       # portal only
npm run api:dev          # FastAPI service
npm run db:status        # migration status
npm run db:migrate       # apply migrations
npm run db:seed          # run seed data
```

## Quality checks

```bash
npm run lint
npm run typecheck
npm run test
npm run format:check
```

Surface-specific commands are also available, including `npm run portal:build`, `npm run portal:lint`, and `npm run portal:typecheck`.

## Deployment and CI

Deployments depend on the target surface and environment configuration. Before shipping changes, make sure linting, typechecking, tests, and any relevant database migrations pass locally or in CI. Treat environment configuration and secrets as deployment prerequisites, not code defaults.

## Contributing

- Keep changes scoped and avoid unrelated refactors.
- Prefer updating existing modules over introducing parallel implementations.
- Validate the affected app or service with the relevant lint, typecheck, and test commands before opening a PR.
- Do not commit secrets, local env files, or generated machine-specific artifacts.
