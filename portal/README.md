# YOORA-SARAH Portal

Internal operations portal for Yoora Sarah staff.

## Role

- Dashboard, briefs, design gallery, pattern jobs, forecast, production plans, approvals, settings, and internal copilot surfaces.
- Primary internal frontend deployment unit.
- Talks to the centralized `api` service for protected internal workflows.

## Local development

From the repository root:

```bash
npm install --prefix portal
npm run dev:portal
```

Useful checks:

```bash
npm run lint:portal
npm run typecheck:portal
npm run build:portal
```

## Deployment

Deploy this folder as the internal portal project, typically on Vercel.

Keep auth and internal API environment variables configured before exposing the portal outside local development. See the root [README](../README.md) for the full checklist.
