# YOORA-SARAH API

FastAPI backend for commerce, AI orchestration, workflow, and internal portal services.

## Role

- Main backend deployment unit.
- Owns API-backed storefront and portal workflows.
- Connects to the centralized PostgreSQL/Supabase database through environment configuration.

## Local development

From the repository root:

```bash
npm run api:dev
```

Backend-only checks:

```bash
uv run --directory api pytest tests/ -v
uv run --directory api ruff check .
```

## Deployment

Deploy this folder as the backend service, currently configured through the root [render.yaml](../render.yaml).

Required production configuration includes `DATABASE_URL` and `YOORA_INTERNAL_API_SHARED_SECRET`. See the root [README](../README.md) for the full environment and pre-production checklist.
