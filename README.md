# YOORA-SARAH — Single Source of Truth (SSOT)

This document serves as the sole source of truth for the **Yoora Sarah Platform Monorepo**. It replaces all previous historical design specs, planning documents, and references.

## 🏗️ Architecture & Monorepo Structure

The project uses a Turborepo-orchestrated monorepo structure with `npm` (v10+) as the root package manager and `uv` for Python environments.

```text
apps/
  web/           Next.js customer storefront & AI Stylist
  portal/        Next.js internal portal for staff
services/
  api/           FastAPI backend (powers AI logic & commerce)
  workers/       Background worker scaffold
  ai/            AI service scaffold
packages/
  database/      Shared database logic & types
  ui/            Shared UI components (shadcn/radix)
db/
  migrations/    SQL migrations
  seeds/         SQL seed data
tools/
  db/            Migration and seed runner
e2e/             Playwright E2E smoke tests
```

## 🛠️ Tech Stack & Versions

### Frontend (Apps & Packages)
- **Framework:** Next.js `16.1.0` (App Router) on both `apps/web` and `apps/portal`
- **UI/Components:** React `^19.0.0`, Tailwind CSS, Radix UI Primitives, Framer Motion
- **Tooling:** TypeScript `^5.7.2`, ESLint (flat config), Prettier
- **Testing:** Vitest (with `@testing-library/react` and `v8` coverage provider)
- **E2E:** Playwright (Chromium test suite)

### Backend (Services)
- **Framework:** FastAPI `^0.115.0`, Uvicorn
- **Language:** Python `3.12+` (managed via `uv`)
- **Data/Validation:** Pydantic & Pydantic-Settings `^2.14.0`
- **Database Driver:** Psycopg 3
- **Tooling:** Ruff (linter/formatter), Pytest (testing framework)

### External Integrations
- **AI Models:** Groq (Llama 3.3 Versatile) for speed, Google Gemini 2.5 Flash for multimodal vision
- **Database:** Supabase (PostgreSQL)
- **Asset Storage:** Tigris Object Storage (used via URLs for products, though currently synchronized via `apps/web/public/products` fallback)

---

## 🌟 Core Features & Implementation State

### 1. AI Buyer Premium Concierge
- **Entry Point:** The primary floating action button on the storefront. The old global standalone WhatsApp button has been **removed**.
- **Capabilities:** Handles product discovery, sizing queries, order status, policies, and styling.
- **Handoff Mechanism:** If a user query is flagged as *sensitive* (e.g., complaints, refunds) or if *size ambiguity* triggers a handoff, the AI gracefully generates an `AIAssistantAction`.
- **UI:** The frontend parses this action and renders a sleek, in-chat **"Chat CS via WhatsApp"** CTA button (a deep-link to WhatsApp with pre-filled context).

### 2. AI Stylist Studio (`/stylist`)
- A full-viewport, scrolling-locked, rich UI experience.
- Uses `OutfitComposer`, `StylistProductRail`, and `ProductToModelStudio`.
- Contains hybrid AI routing in `route.ts`: uses Gemini for image + text understanding, and Groq for text-only workflows.

### 3. Internal Portal (`apps/portal`)
- A dashboard for staff handling briefs, forecasts, design jobs, pattern jobs, and AI tools.
- API Client is consolidated into a single transport layer (`lib/api-client.ts`) handling the base URL, internal shared secrets, and error extraction.

### 4. Auth & Security Hardening
- **Backend Internal API:** Operates on a **fail-closed** default. If `INTERNAL_API_SHARED_SECRET` is missing, requests reject with 503 unless explicitly bypassed with `ALLOW_INSECURE_AUTH=true`.
- **Demo Identities:** Demo actors (e.g., `owner@yoora.local`) have been isolated to prevent production path leakage.

---

## 🚀 Development Workflow

### Prerequisites
- Node.js 20+ & npm 10+
- Python 3.12+ & `uv` package manager

### Environment Setup
Create local `.env` files based on `.env.example`.
Key variables needed:
- `DATABASE_URL`
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`
- `YOORA_INTERNAL_API_BASE_URL` (typically `http://127.0.0.1:8000/api/v1`)
- `YOORA_INTERNAL_API_SHARED_SECRET`
- `GROQ_API_KEY`, `GEMINI_API_KEY` (for AI features)

### Main Commands

Run from the root directory:

**Running the Apps**
```bash
npm run dev        # Starts Turbo dev server (both web & portal)
npm run api:dev    # Starts FastAPI backend on port 8000
```

**Quality & Testing**
```bash
npm run lint         # Runs ESLint across JS/TS workspaces
npm run typecheck    # Runs tsc --noEmit
npm run test         # Runs Vitest (frontend) & Pytest (backend via Turbo if mapped)
npm run test:e2e     # Runs Playwright smoke tests
npm run test:coverage # Runs Vitest with coverage report
npm run format:check # Checks Prettier formatting
```

**Database Tooling**
```bash
npm run db:status
npm run db:migrate
npm run db:seed
```

---

## 🚦 Deployment & CI/CD
- **GitHub Actions (`.github/workflows/ci.yml`):** Runs on push to `main` and Pull Requests.
  - *Frontend Job:* Node setup, `npm ci`, Turbo lint, typecheck, build, Prettier check.
  - *Backend Job:* UV setup, Python setup, Ruff check, Pytest.
- **Rules:** The repo follows standard PR templates and `CODEOWNERS` policies. Commits modifying product images or tracked YAMLs are handled via strict `.gitignore` exceptions.

## 🤝 Contributing
For detailed guidelines, please refer to the `CONTRIBUTING.md` document at the root of the repository.
