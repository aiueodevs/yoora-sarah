# YOORA-SARAH — Single Source of Truth (SSOT) v2.0

> **SDLC Framework Alignment:** This project follows the [Professional Fullstack Development Lifecycle v2.0](https://sdlc-framework.vercel.app/) (23-Step Methodology).

---

## 📑 Table of Contents

1. [Executive Summary](#-1-executive-summary)
2. [Monorepo Structure](#-2-monorepo-structure)
3. [Master Tech Stack](#-3-master-tech-stack)
4. [Development Lifecycle Status (23 Steps)](#-4-development-lifecycle-status-23-steps)
5. [Core Features Implementation](#-5-core-features-implementation)
6. [Environment Variables](#-6-environment-variables)
7. [Development Commands](#-7-development-commands)
8. [Pre-Production Checklist](#-8-pre-production-checklist)
9. [Governance & Responsibility (RACI)](#-9-governance--responsibility-raci)
10. [Roadmap](#-10-roadmap)

---

## 🏗️ 1. Executive Summary

**YOORA-SARAH** is a premium modest fashion e-commerce ecosystem built as a modern Turborepo monorepo. It integrates three core surfaces:

- **Customer Storefront** — AI-powered shopping experience with styling studio.
- **Internal Portal** — Production intelligence dashboard for staff operations.
- **FastAPI Backend** — Commerce engine, AI orchestration, and workflow services.

The platform is designed with a *dual-mode architecture*: all commerce and AI features query PostgreSQL first, and gracefully fall back to in-memory fixtures when the database is not yet configured. This ensures the system is always runnable locally without external dependencies.

---

## 📂 2. Monorepo Structure

```text
YOORA-SARAH/
├── apps/
│   ├── web/              → Next.js 16 · Customer Storefront & AI Stylist Studio
│   └── portal/           → Next.js 16 · Internal Portal for staff/operations
├── services/
│   ├── api/              → FastAPI · Commerce, AI, & workflow backend
│   ├── workers/          → Background worker scaffold
│   └── ai/               → Standalone AI micro-service scaffold
├── packages/
│   ├── database/         → Shared TypeScript types & Supabase clients
│   └── ui/               → Shared UI primitives (Button, Input, cn())
├── db/
│   ├── migrations/       → 14 raw SQL schema migrations
│   └── seeds/            → 5 SQL seed files (roles → commerce demo)
├── tools/
│   └── db/               → Python migration runner (psycopg)
├── e2e/                  → Playwright E2E smoke tests
├── .github/
│   ├── workflows/ci.yml  → GitHub Actions CI pipeline
│   ├── CODEOWNERS        → Code ownership rules
│   └── PULL_REQUEST_TEMPLATE.md
├── CONTRIBUTING.md
├── README.md             → This document (SSOT)
├── render.yaml           → Backend deployment config (Render)
├── turbo.json            → Turborepo pipeline definition
└── playwright.config.ts  → E2E test configuration
```

---

## ⚙️ 3. Master Tech Stack

| Layer | Technology | Application |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16.1 (App Router), TypeScript 5.7 | Customer Storefront & Staff Portal |
| **State & Data** | TanStack Query v5 | Client-side caching (60s stale time) |
| **Styling** | Tailwind CSS 3.4+, Framer Motion | "Luxury & Warm" Design System |
| **Backend** | FastAPI 0.115+, Python 3.12 | API services managed via `uv` |
| **Database** | Supabase (PostgreSQL 16) | Standard Pooling & REST API |
| **Validation** | Pydantic v2.14 | Strict type enforcement |
| **AI / ML** | Groq (Llama 3.3 70B), Google Gemini 2.5 Flash | Hybrid routing: Text → Groq, Vision → Gemini |
| **Asset Storage** | Tigris Object Storage | 1,196 product images cached in `public/products/` |
| **Testing** | Vitest, Pytest, Playwright | Unit, Integration, & E2E |
| **Monorepo** | Turborepo, pnpm workspaces | Optimized build & execution pipeline |
| **CI / CD** | GitHub Actions | Automated lint, typecheck, build, & test |
| **Deployment** | Render (Backend), Vercel (Frontend — pending) | Cloud hosting targets |

---

## ◈ 4. Development Lifecycle Status (23 Steps)

| Step | Phase | Status | Details |
| :---: | :--- | :---: | :--- |
| 0 | PRD | ✅ | Product vision and concierge scope defined |
| 1 | BRD | ✅ | Monorepo business logic mapped |
| 2 | UI/UX Design | ✅ | High-res video hero & Premium Stylist UI implemented |
| 3 | Technical Design | ✅ | Data architecture & Internal API consolidated |
| 4 | Software Architecture | ✅ | Turborepo orchestration & fail-closed backend |
| 5 | API Specification | ✅ | FastAPI domain endpoints defined |
| 6 | Development | 🟡 | Core surfaces active; iterative refinement ongoing |
| 7 | Non-Prod Deployment | 🟡 | Local parity confirmed; staging pending |
| 8 | Testing & QA | ✅ | Vitest, Pytest, Playwright smoke tests active |
| 9 | Prod Deployment | ❌ | Infrastructure configured; deployment pending |
| 10 | Maintenance & CI | ✅ | GitHub Actions CI workflow established |
| 11 | Operational Readiness | 🟡 | Startup scripts available; runbooks pending |
| 12 | Data Governance | 🟡 | PII removed from git history; **secret rotation required** |
| 13 | Advanced Security | ✅ | Internal API fail-closed protection enabled |
| 14 | Release Engineering | ✅ | PR templates & CODEOWNERS implemented |
| 15–22 | Platform / AIOps / Green IT | ⚪ | Future expansion targets |

**Legend:** ✅ Complete · 🟡 In Progress / Partial · ❌ Not Started · ⚪ Planned

---

## 🌟 5. Core Features Implementation

### 5.1 Customer Storefront (`apps/web`)

| Feature | Description | Dependency |
| :--- | :--- | :--- |
| **AI Buyer Premium Concierge** | Single floating entry point for product discovery, sizing, order tracking, and policy inquiries. | `GROQ_API_KEY` for LLM; grounded fallback without it |
| **WhatsApp Handoff** | Contextual CS escalation rendered as in-chat CTA button for sensitive queries. | Integrated into AI Buyer; no separate button |
| **AI Stylist Studio** (`/stylist`) | Full-viewport interactive studio: OutfitComposer + ProductToModelStudio + StylistProductRail. | `GROQ_API_KEY`, `GEMINI_API_KEY`; image gen requires Replicate/OpenAI keys |
| **Hero Experience** | 1080p looping video (MP4+WebM) with cross-fade transitions and reduced-motion support. | Local assets in `public/hero-video/` |

### 5.2 Internal Portal (`apps/portal`)

| Feature | Description | Mode |
| :--- | :--- | :--- |
| **Briefs** | Create and review design briefs | Demo fixtures |
| **Design Gallery** | Visual review of design job outputs | Demo fixtures |
| **Patterns** | Pattern work tracking and production handoff | Demo fixtures |
| **Forecast** | Demand planning and forecast runs | Demo fixtures |
| **Production Plans** | Plan management with approval queues | Demo fixtures |
| **Approvals** | Centralized approval queue across workflows | Demo fixtures |
| **Dashboard** | Aggregated active queues, risk signals, daily decisions | Demo fixtures |
| **Settings** | Master data management | Demo fixtures |
| **Unified Transport** | Consolidated API client with internal key + actor email headers | `api-client.ts` |

> *Portal workflows currently use demo/in-memory data fixtures. Full persistence activates when database migrations are applied.*

### 5.3 Backend Infrastructure (`services/api`)

| Component | Description | Mode |
| :--- | :--- | :--- |
| **Commerce Engine** | Cart, orders, checkout, wishlist, profile via `storefront_postgres_store.py` | **Dual-mode:** DB-first → in-memory fallback |
| **AI Tools Service** | Multi-turn conversational AI with intent routing, grounded search, and confidence scoring | Requires `GROQ_API_KEY` |
| **Catalog Store** | 10-category product catalog with live sync from `api.yoorasarah.com` and Tigris assets | Auto-fallback to fixtures |
| **Auth System** | Fail-closed internal API auth with RBAC (`require_roles`) | `ALLOW_INSECURE_AUTH=true` for dev |
| **Migration Runner** | Custom Python tool for SQL schema migrations and seed data (`tools/db/`) | `DATABASE_URL` required |

---

## 🔐 6. Environment Variables

Create `.env` files based on `.env.example`. Key variables:

| Variable | Required | Purpose |
| :--- | :---: | :--- |
| `DATABASE_URL` | ✅ | PostgreSQL connection (Supabase pooler) |
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | ✅ | Supabase public/anon key |
| `SUPABASE_SECRET_KEY` | ✅ | Supabase service role key |
| `YOORA_INTERNAL_API_BASE_URL` | ✅ | FastAPI URL (e.g. `http://127.0.0.1:8000/api/v1`) |
| `YOORA_INTERNAL_API_SHARED_SECRET` | ✅ | Shared secret for internal API auth |
| `YOORA_PORTAL_AUTH_SECRET` | Portal | JWT signing secret for portal sessions |
| `YOORA_PORTAL_BOOTSTRAP_PASSWORD` | Portal | Shared bootstrap password for portal login |
| `GROQ_API_KEY` | AI | Groq LLM for AI Buyer & AI Stylist chat |
| `GEMINI_API_KEY` | AI | Google Gemini for vision/image analysis |
| `REPLICATE_API_TOKEN` | AI | Replicate for product-to-model image generation |
| `OPENAI_API_KEY` | AI | OpenAI for product-to-model (alternative provider) |

---

## 🚀 7. Development Commands

Execute from the repository root:

### Running Servers
```bash
npm run dev              # Start Web & Portal (ports 3000, 3001)
npm run api:dev          # Start FastAPI backend (port 8000)
```

### Quality & Testing
```bash
npm run lint             # ESLint across all JS/TS workspaces
npm run typecheck        # TypeScript type checking (tsc --noEmit)
npm run test             # Vitest (frontend) + Pytest (backend)
npm run test:e2e         # Playwright browser smoke tests
npm run format:check     # Prettier formatting check
```

### Database
```bash
npm run db:status        # Check migration status
npm run db:migrate       # Apply pending schema migrations
npm run db:seed          # Populate with master/demo seed data
```

---

## ⚠️ 8. Pre-Production Checklist

> These items **must** be addressed before any production deployment:

- [ ] **Rotate Secrets:** Regenerate all API keys previously exposed in git history (Supabase, Groq, Cloudflare).
- [ ] **Run Database Migrations:** Execute `npm run db:migrate && npm run db:seed` against the production Supabase instance.
- [ ] **Configure AI Keys:** Set `GROQ_API_KEY` and `GEMINI_API_KEY` in the production environment.
- [ ] **Deploy Frontend:** Set up Vercel projects for `apps/web` and `apps/portal`.
- [ ] **Deploy Backend:** Verify Render deployment of `services/api` with correct `DATABASE_URL`.
- [ ] **Revoke GitHub PATs:** Delete all Personal Access Tokens used during initial setup.

> **💡 Developer Note:** Kodenya sudah jadi semua. Jalankan `npm run db:migrate` dan pasang API Keys agar fiturnya benar-benar hidup penuh. Dokumen ini dirancang untuk menceritakan secara transparan apa yang sudah ada, apa yang sudah siap secara arsitektural, dan apa yang wajib dilakukan sebelum sistem dinyatakan "Live".

---

## 🤝 9. Governance & Responsibility (RACI)

*R = Responsible · A = Accountable · C = Consulted · I = Informed*

| Activity | PM | Tech Lead | Developer | QA | DevOps | Security |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Implementation** | I | A | **R** | C | I | I |
| **Code Review** | I | **A** | **R** | I | I | I |
| **Testing** | C | C | R | **A/R** | I | I |
| **Security Review** | I | C | I | C | C | **A/R** |
| **Deployment** | I | **A** | C | C | **R** | C |
| **Incident Response** | I | C | R | I | **A/R** | C |

---

## 📈 10. Roadmap

- [ ] Finalize Vercel production deployment for Frontend surfaces.
- [ ] Expand AI Stylist Studio with specialized vision models.
- [ ] Implement Step 15 (FinOps): API credit & cost monitoring for AI operations.
- [ ] Implement Step 18 (AIOps): Tracking metrics for AI assistant accuracy and conversion rates.
- [ ] Activate persistent commerce by running migrations against production Supabase.
- [ ] Implement Step 11: Operational runbooks and disaster recovery procedures.

---

<p align="center"><sub><em>End of SSOT · Last Updated: 2026-04-29</em></sub></p>

> *Standar profesional sejati bukan tentang mengklaim kesempurnaan — melainkan menceritakan dengan jujur apa yang ada, apa yang sudah siap, dan apa yang harus dilakukan sebelum production. Pola dual-mode dan graceful fallback memastikan sistem tetap stabil selama masa transisi ini.*
