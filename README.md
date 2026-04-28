# YOORA-SARAH — Single Source of Truth (SSOT)

This document serves as the sole source of truth for the **Yoora Sarah Platform Monorepo**. It contains the comprehensive, actual state of the architecture, tech stack, core features, and deployment model.

---

## 🏗️ Architecture & Monorepo Structure

The project uses a Turborepo-orchestrated monorepo structure with `npm` (v10+) as the root package manager (utilizing `pnpm-workspace.yaml` conventions) and `uv` for Python environments.

```text
YOORA-SARAH/
├── apps/
│   ├── web/           Next.js 16 Customer Storefront & AI Stylist Studio
│   └── portal/        Next.js 16 Internal Portal for staff/operations
├── services/
│   ├── api/           FastAPI backend (powers AI logic, commerce, & portal workflows)
│   ├── workers/       Background worker scaffold
│   └── ai/            Standalone AI micro-service scaffold
├── packages/
│   ├── database/      Shared TypeScript types & Supabase clients
│   └── ui/            Shared UI components (shadcn/Radix UI)
├── db/
│   ├── migrations/    Raw SQL schema migrations
│   └── seeds/         Raw SQL seed data
├── tools/
│   └── db/            Custom Python migration and seed runner (psycopg)
├── e2e/               Playwright E2E smoke tests
└── scripts/           Utility scripts (e.g., portal-reset.ps1)
```

---

## 🛠️ Tech Stack & Versions

### Frontend (`apps/web`, `apps/portal`, `packages/ui`)
- **Framework:** Next.js `16.1.0` (App Router exclusively)
- **UI/Components:** React `^19.0.0`, Tailwind CSS, Radix UI Primitives, Framer Motion
- **State/Caching:** TanStack React Query (configured in `providers.tsx` with a 60s stale time)
- **Styling Tokens:** CSS Variables in `globals.css` (warm brand colors, custom font stacks like Gambetta/Sentient)
- **Tooling:** TypeScript `^5.7.2`, ESLint (flat config `.mjs`), Prettier
- **Testing:** Vitest (jsdom, `@testing-library/react`, `v8` coverage)
- **E2E:** Playwright (Chromium test suite running against `http://localhost:3000`)

### Backend (`services/api`)
- **Framework:** FastAPI `^0.115.0`, Uvicorn
- **Language:** Python `3.12+` (managed via `uv`)
- **Data/Validation:** Pydantic & Pydantic-Settings `^2.14.0`
- **Database Driver:** Psycopg 3 (`psycopg[binary]`)
- **Tooling:** Ruff (linter/formatter), Pytest (testing framework)

### External Integrations
- **AI Models:** 
  - Groq (`llama-3.3-70b-versatile`) for speed, text-only chat, and JSON structuring.
  - Google Gemini (`gemini-2.5-flash`) for multimodal vision/image understanding.
- **Database:** Supabase (PostgreSQL) — Backend connects via standard Postgres pooling; Frontend/Portal uses Supabase REST API for user/role lookups.
- **Asset Storage:** Tigris Object Storage (`yoorasarah-products.fly.storage.tigris.dev`) used via URLs. A complete fallback copy (1,196 images) is synchronized locally to `apps/web/public/products`.
- **Communications:** WhatsApp deep-links for seamless CS handoffs (`wa.me/6282315866088`).

---

## 🌟 Core Surfaces & Features

### 1. Customer Storefront (`apps/web`)

**Navigation & Layout:**
- Mega-menus for categories ("Perempuan", "Koleksi") with editorial cards.
- Promotional marquee, dynamic hero sequence (prioritizing high-res `1080p.mp4` with `webm` fallback and motion-safe handling).
- Animated product clearance rails.

**AI Buyer Premium Concierge:**
- **Entry Point:** The primary floating action button (Sparkles icon). The old global standalone WhatsApp button has been **removed**.
- **Capabilities:** Uses grounded internal tools to answer product discovery, sizing queries, order status, policies, and styling advice.
- **Handoff Mechanism:** If a query is flagged as *sensitive* (e.g., complaints) or if *size ambiguity* triggers a handoff, the FastAPI backend generates an `AIAssistantAction` of kind `whatsapp`.
- **UI:** The frontend parses this action and renders a sleek, in-chat **"Chat CS via WhatsApp"** CTA button inside the chat bubble.

**AI Stylist Studio (`/stylist`):**
- A full-viewport (`h-screen overflow-hidden`), scrolling-locked rich UI experience.
- Left Panel: `OutfitComposer` (template-based outfit generation) and `ProductToModelStudio` (AI image generation).
- Right Panel: `StylistProductRail` (scrolling marquee of catalog items), chat workspace, and visual Result Board for Look Utama & Alternatif.
- Uses a hybrid AI routing strategy (`route.ts`) to intelligently select Gemini or Groq based on the presence of user-uploaded images.

### 2. Internal Portal (`apps/portal`)

**Purpose:**
A dashboard for staff to handle the end-to-end production intelligence workflow.

**Workflows:**
- `01` **Briefs:** Create and review design briefs.
- `02` **Design Gallery:** Visual review of design jobs.
- `03` **Patterns:** Pattern work tracking and production readiness.
- `04` **Forecast:** Demand planning and forecast run management.
- `05` **Production Plans:** Plan management with approval queues.
- **Approvals & Settings:** Centralized approval queues and master data configuration.

**API Architecture:**
- All internal API calls use a consolidated transport layer (`lib/api-client.ts`).
- Automatically injects the `x-yoora-internal-key` and `x-yoora-actor-email` headers.

### 3. FastAPI Backend (`services/api`)

**Routing (`app/api/v1/endpoints/`):**
Handles all domain logic: `catalog`, `customers`, `orders`, `support`, `master_data`, `briefs`, `design_jobs`, `pattern_jobs`, `forecast`, `approvals`, `audit`, `telemetry`, and the heavy-lifting `ai_tools` and `ai_stylist`.

**Services (`app/services/`):**
- `catalog_store.py`: Serves hardcoded 10-category catalogs, fallback fixtures, and live synchronization (`YooraAPISync`).
- `commerce_store.py`: In-memory cart management, customer profiles, policy articles, and support contact configurations.
- `ai_tools_service.py`: Orchestrates grounded search, multi-turn conversational AI context building, intent flags (`is_sensitive`, `is_size_query`), confidence scoring, and fallback/Groq response synthesis.
- Postgres / Workflow Stores: Persistent workflow state management.

**Auth & Security Hardening (`app/api/dependencies/auth.py`):**
- Operates on a **fail-closed** default. 
- If `INTERNAL_API_SHARED_SECRET` is missing, requests reject with 503 unless explicitly bypassed by setting `ALLOW_INSECURE_AUTH=true`.
- Demo identities (e.g., `owner@yoora.local`) have been isolated to prevent production path leakage.
- Enforces strict RBAC (`require_roles`).

---

## 🚀 Development Workflow

### Prerequisites
- **Node.js 20+** & **npm 10+**
- **Python 3.12+** & **uv** package manager

### Environment Setup
Create local `.env` files based on `.env.example`. Key variables needed:
- `DATABASE_URL` (Supabase Postgres connection pooler)
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`
- `YOORA_INTERNAL_API_BASE_URL` (typically `http://127.0.0.1:8000/api/v1`)
- `YOORA_INTERNAL_API_SHARED_SECRET`
- `YOORA_PORTAL_AUTH_SECRET`, `YOORA_PORTAL_BOOTSTRAP_PASSWORD`
- `GROQ_API_KEY`, `GEMINI_API_KEY`
- `REPLICATE_API_TOKEN` (for product-to-model image generation)

### Main Commands

Run from the repository root:

**Running the Servers:**
```bash
npm run dev              # Starts Turbo dev server (both web & portal on 3000 & 3001)
npm run api:dev          # Starts FastAPI backend via Uvicorn on port 8000
```

**Quality & Testing:**
```bash
npm run lint             # Runs ESLint (flat config) across JS/TS workspaces
npm run typecheck        # Runs tsc --noEmit globally
npm run test             # Runs Vitest (frontend) & Pytest (backend via Turbo)
npm run test:e2e         # Runs Playwright smoke tests
npm run test:coverage    # Runs Vitest with coverage report
npm run format:check     # Checks Prettier formatting across the monorepo
```

**Database Tooling:**
```bash
npm run db:status        # Checks migration status
npm run db:migrate       # Applies pending SQL migrations
npm run db:seed          # Runs SQL seed data sequentially
```

---

## 🚦 Deployment & CI/CD

### Deployments
- **Backend:** Configured for deployment to Render (`render.yaml`).
- **Frontend (Web/Portal):** Intended for deployment to Vercel or similar Next.js-native platforms.
- Treat environment configuration and secrets as absolute deployment prerequisites.

### GitHub Actions Pipeline
- **File:** `.github/workflows/ci.yml`
- **Triggers:** Push to `main` and Pull Requests targeting `main`.
- **Jobs:**
  1. `frontend`: Node setup, `npm ci`, Turbo lint, typecheck, build, Prettier check.
  2. `backend`: UV setup, Python setup, Ruff check, Pytest.
  3. `e2e`: Playwright E2E testing (currently configured/commented for future rollout).

## 🤝 Governance & Contributing
- The repository follows standard `.github/PULL_REQUEST_TEMPLATE.md`.
- Code ownership is enforced via `.github/CODEOWNERS` (defaulting to `@aiueodevs`).
- For detailed contribution guidelines, workflow rules, and commit message conventions, please refer strictly to the `CONTRIBUTING.md` document at the root of the repository.