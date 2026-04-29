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

## 🚀 Quickstart for Developers

### Official package manager
- Use `npm` for JavaScript projects and `uv` for Python services.
- The root `package-lock.json` covers root tooling; `web`, `portal`, and retained shared packages keep their own lockfiles for independent deployment/install flows.

### Install
```bash
npm install
npm install --prefix web
npm install --prefix portal
```

### Run the apps
```bash
npm run dev:web      # Customer storefront
npm run dev:portal   # Internal portal
npm run api:dev      # FastAPI backend
```

### Database setup
```bash
npm run db:migrate
npm run db:seed
```

### Quality checks
```bash
npm run lint:web
npm run lint:portal
npm run typecheck:web
npm run typecheck:portal
npm run test:web
npm run test:e2e
npm run format:check
```

### Local service expectations
- `api` is the core backend service for API-backed local development.
- `ai` and `workers` are scaffold/optional services and are not required for the main local flow.
- `web` and `portal` can still expose fixture, fallback, or reduced-capability behavior depending on configured environment variables.
- Main deployment units are `web`, `portal`, and `api`; the database remains centralized via `db/` and `tools/db/`.

---

# PART A — CURRENT STATE (FACTUAL)

*This section describes what is actually implemented, tested, and running in the codebase today.*

---

## 🏗️ 1. Executive Summary

**YOORA-SARAH** is a premium modest fashion e-commerce ecosystem organized as a single repository with top-level deployable projects. It currently integrates three core surfaces:

- **Customer Storefront (`web`)** — AI-powered shopping experience with styling studio.
- **Internal Portal (`portal`)** — Production intelligence dashboard for staff operations.
- **FastAPI Backend (`api`)** — Commerce engine, AI orchestration, and workflow services.

The platform uses a *dual-mode architecture*: all commerce and AI features query PostgreSQL first, and gracefully fall back to in-memory fixtures when the database is not yet configured.

---

## 📂 2. Repository Structure

```text
YOORA-SARAH/
├── web/                  → Next.js 16 · Customer Storefront & AI Stylist Studio
├── portal/               → Next.js 16 · Internal Portal for staff/operations
├── api/                  → FastAPI · Commerce, AI, & workflow backend
├── workers/              → Background worker scaffold (optional)
├── ai/                   → Standalone AI micro-service scaffold (optional)
├── packages/
│   ├── database/         → Shared TypeScript types & Supabase clients retained where needed
│   └── ui/               → Shared UI primitives retained where needed
├── db/
│   ├── migrations/       → 14 raw SQL schema migrations for the single database
│   └── seeds/            → 5 SQL seed files (roles → commerce demo)
├── tools/
│   └── db/               → Python migration runner (psycopg)
├── e2e/                  → Playwright E2E smoke tests
├── .github/              → CI workflow, CODEOWNERS, PR template
├── CONTRIBUTING.md
├── README.md             → This document (SSOT)
├── render.yaml           → Backend deployment config (Render)
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
| **Repository Layout** | Single repo, top-level app/service projects | Simpler deployment mental model with centralized database tooling |
| **CI / CD** | GitHub Actions | Automated lint, typecheck, build, & test |

---

## ◈ 4. SDLC Lifecycle Status (23 Steps)

| Step | Phase | Status | Details |
| :---: | :--- | :---: | :--- |
| 0 | PRD | ✅ | Product vision defined |
| 1 | BRD | ✅ | Business logic mapped |
| 2 | UI/UX Design | ✅ | Hero video & Premium Stylist UI |
| 3 | Technical Design | ✅ | API consolidated |
| 4 | Software Architecture | ✅ | Top-level app/service layout & fail-closed auth |
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

### 5.1 Customer Storefront (`web`)

| Feature | Status | Dependency |
| :--- | :---: | :--- |
| AI Buyer Premium Concierge | ✅ | `GROQ_API_KEY`; grounded fallback without it |
| WhatsApp Handoff (in-chat CTA) | ✅ | Integrated into AI Buyer |
| AI Stylist Studio (`/stylist`) | ✅ | `GROQ_API_KEY` + `GEMINI_API_KEY` |
| Hero Experience (1080p video) | ✅ | Local assets |
| Product Catalog & Detail Pages | ✅ | Tigris + fixture fallback |
| Cart, Checkout, Wishlist, Profile | ✅ | Dual-mode (DB-first → in-memory) |

### 5.2 Internal Portal (`portal`)

| Feature | Status | Mode |
| :--- | :---: | :--- |
| Briefs, Design, Patterns, Forecast | ✅ | Demo fixtures |
| Production Plans & Approvals | ✅ | Demo fixtures |
| Dashboard (KPI overview) | ✅ | Demo fixtures |
| Consolidated API Client | ✅ | `api-client.ts` |
| Auth (JWT + Role-based) | ✅ | Middleware + Supabase |

### 5.3 Backend (`api`)

| Component | Status | Mode |
| :--- | :---: | :--- |
| Commerce Engine (Cart/Order/Checkout) | ✅ | Dual-mode: DB → fallback |
| AI Tools Service (Buyer Concierge) | ✅ | Groq LLM + grounded |
| Catalog Store (10 categories) | ✅ | Live sync + fixture |
| Auth (fail-closed + RBAC) | ✅ | `ALLOW_INSECURE_AUTH` for dev |
| Migration Runner | ✅ | `tools/db/` |

---

## 🔐 6. Environment Variables

If these variables are not fully configured, several surfaces continue to run in fixture, fallback, or reduced-capability mode instead of failing for every user-facing flow.

### web

| Variable | Required For | Purpose |
| :--- | :--- | :--- |
| `YOORA_STOREFRONT_API_BASE_URL` | API-backed storefront flows | Storefront API base URL for server-side web requests |
| `YOORA_INTERNAL_API_BASE_URL` | Internal API proxying and fallback API access | FastAPI base URL for server-side routes and commerce helpers |
| `YOORA_INTERNAL_API_SHARED_SECRET` | Protected internal API proxy routes | Shared secret for internal API requests from Next.js routes |
| `NEXT_PUBLIC_YOORA_STOREFRONT_API_URL` | Browser-facing storefront API access | Public storefront API URL for buyer assistant requests |
| `GROQ_API_KEY` | Full AI concierge and stylist behavior | Groq text generation |
| `GEMINI_API_KEY` | Full stylist vision behavior | Gemini multimodal generation |

### portal

| Variable | Required For | Purpose |
| :--- | :--- | :--- |
| `YOORA_INTERNAL_API_BASE_URL` | Portal API access | FastAPI base URL for portal server-side requests |
| `YOORA_INTERNAL_API_SHARED_SECRET` | Internal API authentication | Shared secret for protected server-side API calls |
| `YOORA_PORTAL_AUTH_SECRET` | Local portal auth | JWT signing and verification secret |
| `YOORA_PORTAL_BOOTSTRAP_PASSWORD` | Local portal login | Shared bootstrap password |
| `SUPABASE_URL` | Portal user lookups and internal data access | Supabase project URL |
| `SUPABASE_SECRET_KEY` | Portal server-side Supabase access | Supabase service-role key |

### api

| Variable | Required For | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | Database-backed API mode | PostgreSQL connection |
| `YOORA_INTERNAL_API_SHARED_SECRET` | Protected internal API requests | Internal API auth secret |
| `ALLOW_INSECURE_AUTH` | Dev-only fallback auth | Allows insecure development auth when explicitly enabled |

### Shared Supabase client usage

| Variable | Required For | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Shared browser/server Supabase client usage | Public Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Shared browser/server Supabase client usage | Public Supabase anon key |

### Optional AI and scaffold services

| Variable | Required For | Purpose |
| :--- | :--- | :--- |
| `REPLICATE_API_TOKEN` | Optional image generation flows | Replicate integration |
| `YOORA_PROMPT_VERSION` | `ai` scaffold | Prompt version selector |
| `YOORA_QUEUE_NAME` | `workers` scaffold | Queue name selector |

---

## 📊 7. Data Source & Runtime Status

| Module | Primary Mode | Fallback / Current Status |
| :--- | :--- | :--- |
| Web catalog | API / synced catalog | Fixture fallback remains available |
| Cart & checkout | PostgreSQL-backed commerce | In-memory fallback when the database is not configured |
| Buyer AI concierge | Groq-backed responses | Grounded fallback when AI keys are missing |
| AI Stylist Studio | Groq + Gemini | Reduced capability without full AI keys |
| Portal dashboard | Demo fixture data | Not yet production KPI data |
| Portal briefs / design / patterns / forecast | Fixture and workflow surfaces | Mixed demo/API readiness depending on module |
| Production plans / approvals | Workflow surface | Demo/API-oriented current state |
| `api` | Core backend | Required for API-backed local development |
| `ai` | Scaffold service | Optional and not required for the main local flow |
| `workers` | Scaffold service | Optional and not required for the main local flow |

---

## 🚀 8. Development Commands

```bash
# Servers
npm run dev:web          # Web (port 3000)
npm run dev:portal       # Portal (port 3001)
npm run api:dev          # FastAPI backend (port 8000)

# Quality
npm run lint:web         # Web ESLint
npm run lint:portal      # Portal ESLint
npm run typecheck:web    # Web TypeScript
npm run typecheck:portal # Portal TypeScript
npm run test:web         # Web Vitest
npm run test:e2e         # Playwright
npm run format:check     # Prettier

# Database
npm run db:migrate       # Apply migrations
npm run db:seed          # Seed data
```

### Naming Conventions

- URL routes use kebab-case, for example `production-plans`.
- Python modules use snake_case, for example `pattern_jobs.py`.
- TypeScript and TSX files should follow the local area convention; for new app API or helper files, prefer kebab-case when adjacent files already use kebab-case.
- API resource naming should keep plural and singular usage consistent within the same resource family.

### Shared API boundaries

- App-specific fetchers stay inside the app that owns them.
- Shared cross-app types or clients should move into `packages/*` only when both web and portal actively use them.
- Do not create a new shared API package until a real cross-app contract needs it.

### E2E status

- `npm run test:e2e` is currently intended for local verification.
- Playwright E2E is not yet enforced in CI; the workflow job remains commented out until the suite is promoted to a stable CI gate.

### Follow-up maintainability candidates

The following files are worth revisiting if they continue to grow, but they are not being refactored in this batch:
- `web/components/buyer-assistant.tsx`
- `web/components/layout/header.tsx`
- `portal/components/portal-copilot.tsx`
- `web/app/lib/storefront-data.ts`

---

## ⚠️ 9. Pre-Production Checklist

- [ ] **Rotate Secrets:** Regenerate all keys exposed in git history.
- [ ] **Run Migrations:** `npm run db:migrate && npm run db:seed` on production Supabase.
- [ ] **Configure AI Keys:** Set `GROQ_API_KEY` and `GEMINI_API_KEY` in production.
- [ ] **Deploy Frontend:** Vercel for `web` and `portal`.
- [ ] **Deploy Backend:** Render for `api`.
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

| Feature | Description | Current Status | Priority |
| :--- | :--- | :---: | :---: |
| AI Stylist | Chat-based outfit recommendation | ✅ Implemented | — |
| AI Customer Support (Concierge) | Multi-channel auto-reply with WhatsApp handoff | ✅ Implemented (Web) | — |
| Size Recommendation AI | Height/weight → size + confidence | ✅ Implemented | — |
| Image-Based Recommendation | Upload foto → AI analisa → rekomendasi | 🟡 Partial (Gemini vision) | 🥈 |
| **AI Virtual Try-On** | Customer upload foto diri → AI preview "memakai" produk Yoora Sarah. Mengurangi retur, meningkatkan confidence beli. | ⚪ Planned | 🥉 |
| **AI Color Match** | Upload foto wajah/tangan → AI analisa undertone kulit → rekomendasikan warna produk paling cocok (Cappuccino, Camel, Hazelnut, dll). | ⚪ Planned | 🥈 |
| **AI Smart Size Predictor** | ML model yang belajar dari data retur untuk memperbaiki rekomendasi ukuran seiring waktu (feedback loop). | ⚪ Planned | 🥉 |
| **AI Cart Recovery** | Ketika customer tinggalkan cart, AI kirim pesan WhatsApp personal: "Clara Dress warna Cappuccino masih menunggu. Stok tinggal 3." | ⚪ Planned | 🥇 |
| **AI Personalized Homepage** | Homepage berbeda per pengunjung: new visitor → best seller; returning → "Cocok dengan pembelian terakhir Anda". | ⚪ Planned | 🥈 |
| **AI Omnichannel Inbox** | Semua pesan dari WhatsApp, IG DM, TikTok, dan web chat masuk ke satu inbox. AI jawab yang bisa, tandai yang perlu manusia. | ⚪ Planned | 🥇 |
| **AI Loyalty & Reorder Engine** | AI deteksi pola beli (misal: beli dress tiap 2 bulan) → proaktif kirim rekomendasi + promo personal sebelum customer cari sendiri. | ⚪ Planned | 🥈 |
| Smart Recommendation | Behavior-based product suggestions | ⚪ Planned | 🥈 |

---

## 💼 11. Internal Dashboard (Full Enterprise)

| Module | Description | Current Status | Priority |
| :--- | :--- | :---: | :---: |
| **Pattern Management** | Size grading, version control, export | ✅ Partial (Portal) | — |
| **Dashboard per Role** | Owner KPI, Production Queue, CS Panel, Marketing | 🟡 Partial | 🥇 |
| **AI CEO Dashboard** | Dashboard yang bukan hanya angka, tapi memberikan insight & rekomendasi proaktif: "Revenue turun 15% karena stok Bella Dress habis. Rekomendasi: restock 200 pcs." | ⚪ Planned | 🥇 |
| **AI Content Factory** | Auto-generate caption IG (tone Yoora Sarah), script TikTok (hook 3 detik), deskripsi Shopee (SEO), moodboard photoshoot. | ⚪ Planned | 🥇 |
| **AI Production Planner** | Baca data penjualan + trend TikTok/IG + musim → prediksi jumlah produksi per produk per minggu. | ⚪ Planned | 🥈 |
| **AI Inventory Auto-Reorder** | Stok mendekati threshold → AI buat PO draft ke supplier, lengkap distribusi ukuran & warna dari data penjualan. | ⚪ Planned | 🥈 |
| **AI Production Tracking** | Lacak batch dari Cutting → Sewing → QC → Packaging. AI deteksi bottleneck & alert keterlambatan. | ⚪ Planned | 🥈 |
| **AI Financial Analyst** | Hitung margin per produk (termasuk produksi + shipping + marketing), cashflow prediction 30 hari, alert pengeluaran abnormal. | ⚪ Planned | 🥈 |
| **AI HR Performance Tracker** | Lacak produktivitas tim (order/orang/hari, response time CS, output konten) dan rekomendasi penugasan optimal. | ⚪ Planned | 🥉 |
| **AI Marketplace Optimizer** | Otomatis optimasi listing Shopee: title SEO, deskripsi conversion-optimized, harga competitive. | ⚪ Planned | 🥈 |
| **Design Assistant** | AI generate ide desain & variasi koleksi | ⚪ Planned | 🥉 |
| **HR & SDM** | Employee DB, attendance, payroll, AI hiring assistant | ⚪ Planned | 🥉 |
| **Finance & Accounting** | Revenue, P&L, cashflow, AI pricing optimizer | ⚪ Planned | 🥈 |
| **Marketing AI** | Campaign analytics, trend analysis | ⚪ Planned | 🥈 |
| **Sales & Omnichannel** | Unified orders (Shopee, TikTok, IG, Web), Customer 360, AI churn prediction | ⚪ Planned | 🥈 |
| **Logistics** | Shipment tracking, courier integration, AI route optimization | ⚪ Planned | 🥉 |

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
- AI Content Factory (caption IG, script TikTok, deskripsi Shopee)
- AI Cart Recovery (WhatsApp abandoned cart)
- AI CEO Dashboard (real-time KPI + insight proaktif)
- Dashboard per Role (Owner, Production, CS)
*Impact: Langsung naik conversion + efisiensi operasional.*

### Phase 2 — GROWTH (Week 5–8)
- AI Color Match (analisa skin undertone → rekomendasi warna produk)
- AI Production Planner (prediksi demand dari data sales + trend sosmed)
- AI Omnichannel Inbox (WhatsApp + IG DM + TikTok → satu queue)
- AI Financial Analyst (margin per produk + cashflow 30 hari)
- AI Marketplace Optimizer (Shopee SEO title + deskripsi)
- Production Tracking (Cutting → Sewing → QC → Packaging)
*Impact: Scale revenue + operasional rapi + CS lebih cepat.*

### Phase 3 — ADVANCED (Week 9–12)
- AI Smart Size Predictor (ML feedback loop dari data retur)
- AI Inventory Auto-Reorder (auto PO draft ke supplier)
- AI Virtual Try-On (customer foto → preview pakai produk)
- AI Personalized Homepage (dynamic per visitor)
- AI Loyalty & Reorder Engine (proaktif kirim rekomendasi repeat)
- CEO AI Agent + Multi-Agent Ecosystem
- AI Command Center & Auto-Execution (Level 1–3)
*Impact: Automation tinggi + hyper-personalization + decision making kuat.*

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
