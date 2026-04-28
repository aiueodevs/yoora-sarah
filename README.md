# YOORA-SARAH — Single Source of Truth

> **Vision:** Transform Yoora Sarah from a conventional modest fashion brand into an **AI-driven fashion enterprise** — a Digital Operating System for the entire company.
>
> **SDLC Alignment:** [Professional Fullstack Development Lifecycle v2.0](https://sdlc-framework.vercel.app/) (23-Step Methodology).

---

## 📑 Table of Contents

### Part A — Current State (Factual)
1. [Executive Summary](#-1-executive-summary)
2. [Monorepo Structure](#-2-monorepo-structure)
3. [Tech Stack (Actual)](#-3-tech-stack-actual)
4. [SDLC Lifecycle Status](#-4-sdlc-lifecycle-status-23-steps)
5. [Implemented Features](#-5-implemented-features)
6. [Environment Variables](#-6-environment-variables)
7. [Development Commands](#-7-development-commands)
8. [Pre-Production Checklist](#-8-pre-production-checklist)

### Part B — Enterprise Blueprint (Vision)
9. [System Architecture (Target)](#-9-system-architecture-target)
10. [Customer Website Features (Full)](#-10-customer-website-features-full)
11. [Internal Dashboard (Full Enterprise)](#-11-internal-dashboard-full-enterprise)
12. [AI Multi-Agent Ecosystem](#-12-ai-multi-agent-ecosystem)
13. [AI Command Center & Auto-Execution](#-13-ai-command-center--auto-execution)
14. [Database Schema (Target ERD)](#-14-database-schema-target-erd)
15. [API Specifications (Target)](#-15-api-specifications-target)
16. [Infra Cost & Team Structure](#-16-infra-cost--team-structure)
17. [Implementation Roadmap (MVP)](#-17-implementation-roadmap-mvp)
18. [Governance (RACI)](#-18-governance-raci)

---

# PART A — CURRENT STATE (FACTUAL)

*This section describes what is actually implemented, tested, and running in the codebase today.*

---

## 🏗️ 1. Executive Summary

**YOORA-SARAH** is a premium modest fashion e-commerce ecosystem built as a modern Turborepo monorepo. It currently integrates three core surfaces:

- **Customer Storefront (`apps/web`)** — AI-powered shopping experience with styling studio.
- **Internal Portal (`apps/portal`)** — Production intelligence dashboard for staff operations.
- **FastAPI Backend (`services/api`)** — Commerce engine, AI orchestration, and workflow services.

The platform uses a *dual-mode architecture*: all commerce and AI features query PostgreSQL first, and gracefully fall back to in-memory fixtures when the database is not yet configured.

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
├── .github/              → CI workflow, CODEOWNERS, PR template
├── CONTRIBUTING.md
├── README.md             → This document (SSOT)
├── render.yaml           → Backend deployment config (Render)
├── turbo.json            → Turborepo pipeline definition
└── playwright.config.ts  → E2E test configuration
```

---

## ⚙️ 3. Tech Stack (Actual)

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

---

## ◈ 4. SDLC Lifecycle Status (23 Steps)

| Step | Phase | Status | Details |
| :---: | :--- | :---: | :--- |
| 0 | PRD | ✅ | Product vision defined |
| 1 | BRD | ✅ | Business logic mapped |
| 2 | UI/UX Design | ✅ | Hero video & Premium Stylist UI |
| 3 | Technical Design | ✅ | API consolidated |
| 4 | Software Architecture | ✅ | Turborepo & fail-closed auth |
| 5 | API Specification | ✅ | FastAPI endpoints defined |
| 6 | Development | 🟡 | Iterative refinement ongoing |
| 7 | Non-Prod Deployment | 🟡 | Local parity confirmed |
| 8 | Testing & QA | ✅ | Vitest, Pytest, Playwright |
| 9 | Prod Deployment | ❌ | Pending |
| 10 | Maintenance & CI | ✅ | GitHub Actions active |
| 11 | Operational Readiness | 🟡 | Startup scripts available |
| 12 | Data Governance | 🟡 | PII removed; **secret rotation required** |
| 13 | Advanced Security | ✅ | Fail-closed auth enabled |
| 14 | Release Engineering | ✅ | PR templates & CODEOWNERS |
| 15–22 | Platform / AIOps / Green IT | ⚪ | Future (see Blueprint below) |

**Legend:** ✅ Complete · 🟡 In Progress · ❌ Not Started · ⚪ Planned

---

## 🌟 5. Implemented Features

### 5.1 Customer Storefront (`apps/web`)

| Feature | Status | Dependency |
| :--- | :---: | :--- |
| AI Buyer Premium Concierge | ✅ | `GROQ_API_KEY`; grounded fallback without it |
| WhatsApp Handoff (in-chat CTA) | ✅ | Integrated into AI Buyer |
| AI Stylist Studio (`/stylist`) | ✅ | `GROQ_API_KEY` + `GEMINI_API_KEY` |
| Hero Experience (1080p video) | ✅ | Local assets |
| Product Catalog & Detail Pages | ✅ | Tigris + fixture fallback |
| Cart, Checkout, Wishlist, Profile | ✅ | Dual-mode (DB-first → in-memory) |

### 5.2 Internal Portal (`apps/portal`)

| Feature | Status | Mode |
| :--- | :---: | :--- |
| Briefs, Design, Patterns, Forecast | ✅ | Demo fixtures |
| Production Plans & Approvals | ✅ | Demo fixtures |
| Dashboard (KPI overview) | ✅ | Demo fixtures |
| Consolidated API Client | ✅ | `api-client.ts` |
| Auth (JWT + Role-based) | ✅ | Middleware + Supabase |

### 5.3 Backend (`services/api`)

| Component | Status | Mode |
| :--- | :---: | :--- |
| Commerce Engine (Cart/Order/Checkout) | ✅ | Dual-mode: DB → fallback |
| AI Tools Service (Buyer Concierge) | ✅ | Groq LLM + grounded |
| Catalog Store (10 categories) | ✅ | Live sync + fixture |
| Auth (fail-closed + RBAC) | ✅ | `ALLOW_INSECURE_AUTH` for dev |
| Migration Runner | ✅ | `tools/db/` |

---

## 🔐 6. Environment Variables

| Variable | Required | Purpose |
| :--- | :---: | :--- |
| `DATABASE_URL` | ✅ | PostgreSQL connection |
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SECRET_KEY` | ✅ | Supabase service role key |
| `YOORA_INTERNAL_API_BASE_URL` | ✅ | FastAPI URL |
| `YOORA_INTERNAL_API_SHARED_SECRET` | ✅ | Internal API auth |
| `YOORA_PORTAL_AUTH_SECRET` | Portal | JWT signing secret |
| `YOORA_PORTAL_BOOTSTRAP_PASSWORD` | Portal | Shared login password |
| `GROQ_API_KEY` | AI | Groq LLM |
| `GEMINI_API_KEY` | AI | Google Gemini |
| `REPLICATE_API_TOKEN` | AI | Image generation |

---

## 🚀 7. Development Commands

```bash
# Servers
npm run dev              # Web & Portal (ports 3000, 3001)
npm run api:dev          # FastAPI backend (port 8000)

# Quality
npm run lint             # ESLint
npm run typecheck        # TypeScript
npm run test             # Vitest + Pytest
npm run test:e2e         # Playwright
npm run format:check     # Prettier

# Database
npm run db:migrate       # Apply migrations
npm run db:seed          # Seed data
```

---

## ⚠️ 8. Pre-Production Checklist

- [ ] **Rotate Secrets:** Regenerate all keys exposed in git history.
- [ ] **Run Migrations:** `npm run db:migrate && npm run db:seed` on production Supabase.
- [ ] **Configure AI Keys:** Set `GROQ_API_KEY` and `GEMINI_API_KEY` in production.
- [ ] **Deploy Frontend:** Vercel for `apps/web` and `apps/portal`.
- [ ] **Deploy Backend:** Render for `services/api`.
- [ ] **Revoke GitHub PATs.**

> **💡 Developer Note:** Kodenya sudah jadi semua. Jalankan `npm run db:migrate` dan pasang API Keys agar fiturnya benar-benar hidup penuh.

---
---

# PART B — ENTERPRISE BLUEPRINT (VISION)

*This section describes the full target architecture. Features listed here are the north star for incremental implementation.*

---

## 🏛️ 9. System Architecture (Target)

### Three Decoupled Layers
1. **Website** → Customer Experience Layer (conversion engine)
2. **Dashboard** → Management & SDM Layer (decision engine)
3. **AI Brain** → Intelligence Layer (automation engine)

### Target Microservices
Auth · User/Profile · Product/Catalog · Order/Payment · Production · Inventory · AI Orchestrator · Notification

### Target Data Flow
`Client → CDN → API Gateway → Microservices → DB/Cache → Queue/Workers → AI Engine → Client`

---

## 🛍️ 10. Customer Website Features (Full)

| Feature | Description | Current Status |
| :--- | :--- | :---: |
| AI Stylist | Chat-based outfit recommendation | ✅ Implemented |
| Smart Recommendation | Behavior-based product suggestions | ⚪ Planned |
| Image-Based Recommendation | Upload foto → AI analisa → rekomendasi | 🟡 Partial (Gemini vision) |
| Size Recommendation AI | Height/weight → size + confidence | ✅ Implemented |
| AI Customer Support | Multi-channel auto-reply | ✅ Implemented (Web) |
| Personalized Homepage | Dynamic content per user | ⚪ Planned |

---

## 💼 11. Internal Dashboard (Full Enterprise)

| Module | Description | Current Status |
| :--- | :--- | :---: |
| **Design Assistant** | AI generate ide desain & variasi | ⚪ Planned |
| **Pattern Management** | Size grading, version control, export | ✅ Partial (Portal) |
| **Production Planner AI** | Prediksi demand, distribusi size | ⚪ Planned |
| **Inventory Intelligence** | Stock tracking, auto reorder | ⚪ Planned |
| **Production Tracking** | Cutting → Sewing → QC → Packaging | ⚪ Planned |
| **HR & SDM** | Employee DB, attendance, payroll, performance AI | ⚪ Planned |
| **Finance & Accounting** | Revenue, P&L, cashflow, AI pricing optimizer | ⚪ Planned |
| **Marketing AI** | Campaign, content generator, analytics | ⚪ Planned |
| **Sales & Omnichannel** | Unified orders (Shopee, TikTok, IG, Web) | ⚪ Planned |
| **Logistics** | Shipment tracking, route optimization | ⚪ Planned |
| **Dashboard per Role** | Owner KPI, Production Queue, CS Panel, Marketing | 🟡 Partial |

---

## 🤖 12. AI Multi-Agent Ecosystem

### The Agents

| Agent | Role | Status |
| :--- | :--- | :---: |
| **CEO Agent** | Strategic decisions, cross-division insight | ⚪ Planned |
| **Marketing Agent** | Campaign execution, ads optimization | ⚪ Planned |
| **Creative Agent** | Moodboard, script video, caption IG | ⚪ Planned |
| **Sales Agent** | Conversion optimization | ⚪ Planned |
| **CS Support Agent** | Auto-reply, complaint handling | ✅ Implemented |
| **Production Agent** | Capacity planning | ⚪ Planned |
| **Inventory Agent** | Restock logic | ⚪ Planned |
| **Finance Agent** | Margin control | ⚪ Planned |
| **HR Agent** | Performance tracking | ⚪ Planned |

### Multi-Agent Collaboration Flow
```text
TikTok Viral → Social Agent detect → Marketing Agent push ads
→ Production Agent check capacity → Inventory Agent check stock
→ Finance Agent validate budget → CEO AI approve decision
```

---

## 🧠 13. AI Command Center & Auto-Execution

### Command Center UI (Target)
```text
--------------------------------------------------
|                AI COMMAND CENTER                 |
--------------------------------------------------
|                 [ CEO AI CORE ]                  |
--------------------------------------------------
| SALES | MARKETING | CREATIVE | OPS | HR | FIN   |
--------------------------------------------------
| LIVE FEED:                                       |
| - TikTok spike detected                          |
| - Stock low on Bella Dress                       |
| - Campaign X performing well                     |
--------------------------------------------------
```

### Auto-Execution Levels
- **Level 1:** AI recommends → human decides.
- **Level 2:** AI recommends → human approves → system executes.
- **Level 3:** AI detects pattern → auto-executes → audit log.

---

## 📊 14. Database Schema (Target ERD)

```text
USERS (1) ──── (1) CUSTOMER_PROFILE
   │
   ├─── (1:N) ORDERS ──── (1:N) ORDER_ITEMS ──── (N:1) PRODUCT_VARIANTS ──── (N:1) PRODUCTS
   │
   └─── (1:N) AI_LOGS

PRODUCTS (1) ──── (1:N) PRODUCT_VARIANTS
PRODUCTS (1) ──── (1:N) PATTERNS
ORDERS   (1) ──── (1:1) PRODUCTION_JOBS
PRODUCT_VARIANTS (1) ──── (1:N) INVENTORY_LOGS
```

---

## 📡 15. API Specifications (Target)

| Domain | Method | Endpoint |
|---|---|---|
| Auth | POST | `/auth/login`, `/auth/register` |
| Products | GET/POST | `/products`, `/products/{id}` |
| AI Stylist | POST | `/ai/style-chat` |
| AI Vision | POST | `/ai/analyze-image` |
| Orders | GET/POST | `/orders`, `/orders/{id}` |
| Production | GET/POST | `/production/jobs`, `/production/assign` |
| Inventory | GET/POST | `/inventory`, `/inventory/update` |
| AI Design | POST | `/ai/design-generate` |

---

## 💰 16. Infra Cost & Team Structure

### Infra Cost (AWS/GCP)
- **Small (Start):** $100–250/month (~Rp1.5–4 juta)
- **Medium:** $400–900/month
- **High (Microservices):** $1000+/month

### Core Team (Minimum)
- Frontend (1-2), Backend (1-2), AI Engineer (1), UI/UX (1)
- *Estimated:* Rp40–80jt/bulan

---

## 🗺️ 17. Implementation Roadmap (MVP)

### Phase 1 — CORE (Week 1–4)
- Dashboard basic (KPI + Order + Inventory)
- AI Customer Service & AI Content Generator
*Impact: Langsung naik conversion + efisiensi.*

### Phase 2 — GROWTH (Week 5–8)
- AI Marketing Analyst & AI Recommendation
- Production Tracking & Dashboard Analytics
*Impact: Scale revenue + operasional rapi.*

### Phase 3 — ADVANCED (Week 9–12)
- CEO AI (Basic Insight) & Command Center UI
- Multi-Agent Ecosystem & Auto-Execution
*Impact: Automation tinggi + decision making kuat.*

---

## 🤝 18. Governance (RACI)

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

<p align="center"><sub><em>End of SSOT · Last Updated: 2026-04-29</em></sub></p>

> *Standar profesional sejati bukan tentang mengklaim kesempurnaan — melainkan menceritakan dengan jujur apa yang ada, apa yang sudah siap, dan apa yang harus dilakukan. Pola dual-mode dan graceful fallback memastikan sistem tetap stabil selama transformasi menuju AI-operated fashion enterprise.*
