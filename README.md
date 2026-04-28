# YOORA-SARAH — Single Source of Truth (SSOT) v2.0

> **SDLC Framework Alignment:** This project follows the [Professional Fullstack Development Lifecycle v2.0](https://sdlc-framework.vercel.app/) (23-Step Methodology).

---

## 📑 Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Master Tech Stack Reference](#2-master-tech-stack-reference)
3. [Development Lifecycle Status](#3-development-lifecycle-status-23-steps)
4. [Core Features Implementation](#4-core-features-implementation)
5. [Development Commands](#5-development-commands)
6. [Governance & Responsibility (RACI)](#6-governance--responsibility-raci)
7. [Current Project Roadmap](#7-current-project-roadmap)

---

## 🏗️ 1. Executive Summary
**YOORA-SARAH** is a premium modest fashion e-commerce ecosystem. It seamlessly integrates a high-conversion customer storefront, an AI-powered styling studio, and a sophisticated production intelligence portal for internal operations. Designed for scalability and elegance, the platform operates as a modern monorepo.

---

## ⚙️ 2. Master Tech Stack Reference

| Layer | Technology | Application |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16.1 (App Router), TS 5.7 | Customer Storefront & Staff Portal |
| **State & Data** | TanStack Query v5 | Client caching (60s stale time baseline) |
| **Styling** | Tailwind CSS 3.4+, Framer Motion | "Luxury & Warm" Design System |
| **Backend** | FastAPI 0.115+, Python 3.12 | Microservices managed via `uv` |
| **Database** | Supabase (PostgreSQL) | Standard Pooling & REST API |
| **ORM / Validation** | Pydantic v2.14 | Strict type enforcement |
| **AI / ML** | Groq (Llama 3.3), Google Gemini 2.5 | Hybrid routing (Text/Vision) |
| **Asset Storage** | Tigris Object Storage | Cached locally in `public/products` |
| **Testing** | Vitest, Pytest, Playwright | Unit, Integration, & E2E Smoke Tests |
| **Monorepo** | Turborepo, pnpm workspaces | Optimized build & execution pipeline |
| **CI / CD** | GitHub Actions | Automated lint, typecheck, & testing |

---

## ◈ 3. Development Lifecycle Status (23 Steps)

| Step | Phase | Status | Implementation Details |
| :--- | :--- | :--- | :--- |
| **0** | **PRD** | ✅ | Product vision and concierge scope defined |
| **1** | **BRD** | ✅ | Monorepo business logic mapped |
| **2** | **UI/UX Design** | ✅ | High-res video hero & Premium Stylist UI implemented |
| **3** | **Technical Design** | ✅ | Data architecture & Internal API consolidated |
| **4** | **Software Architecture** | ✅ | Turborepo orchestration & fail-closed backend logic |
| **5** | **API Specification** | ✅ | FastAPI domain endpoints defined |
| **6** | **Development** | 🟡 | Core surfaces active; undergoing constant iterative refinement |
| **7** | **Non-Prod Deployment** | 🟡 | Local parity confirmed; staging environment pending |
| **8** | **Testing & QA** | ✅ | Vitest, Pytest, and Playwright smoke active |
| **9** | **Prod Deployment** | ❌ | Infrastructure configured; production deployment pending |
| **10** | **Maintenance & CI** | ✅ | GitHub Actions workflow established |
| **11** | **Operational Readiness** | 🟡 | Basic startup scripts available |
| **12** | **Data Governance** | 🟡 | PII/Secret removal from git history completed; **Action Required:** Rotate old secrets |
| **13** | **Advanced Security** | ✅ | Internal API fail-closed protection enabled |
| **14** | **Release Engineering** | ✅ | Clean PR templates & CODEOWNERS implemented |
| **15-22** | **Platform / AIOps / Green IT** | ⚪ | Future expansion targets |

---

## 🌟 4. Core Features Implementation

### Customer Storefront (`apps/web`)
- **AI Buyer Premium Concierge:** The single floating entry point. Capable of handling product discovery, sizing, order status tracking, and policy inquiries. *(Note: Requires active Groq API key for conversational features; falls back to grounded data otherwise).*
- **WhatsApp Handoff:** Contextual support escalation built seamlessly into the AI chat interface for sensitive queries.
- **AI Stylist Studio (`/stylist`):** A full-viewport, interactive studio for outfit matching and generating product-to-model visual previews. *(Note: Image generation requires active Replicate/OpenAI keys).*
- **Hero Experience:** High-resolution (1080p) looping video background with fluid cross-fade transitions.

### Internal Portal (`apps/portal`)
- **Workflow Modules:** End-to-end intelligence tracking for Design Briefs, Design Reviews, Pattern Tracking, and Forecast Planning. *(Note: Currently utilizing demo/in-memory data fixtures).*
- **Unified Transport:** A consolidated API client (`lib/api-client.ts`) handles secure backend communication and authorization context.

### Backend Infrastructure (`services/api`)
- **Commerce Engine:** Dual-mode architecture — queries PostgreSQL first via `storefront_postgres_store.py` (cart, orders, checkout, wishlist, profile); automatically falls back to in-memory fixtures if database tables are not yet migrated. *(Production activation requires running `npm run db:migrate && npm run db:seed`).*
- **AI Tools Service:** Handles multi-turn conversational logic, grounded in actual product data and predefined fallback responses. *(Requires `GROQ_API_KEY` for LLM synthesis; falls back to grounded-only responses without it).*
- **Database Tooling:** Custom Python migration runner for schema execution and seed data management.

---

## ⚠️ Action Items (Pre-Production Checklist)

> These items must be addressed before any production deployment:

- [ ] **Rotate Secrets:** All API keys previously exposed in git history (Supabase, Groq, Cloudflare) must be regenerated.
- [ ] **Run Database Migrations:** Execute `npm run db:migrate && npm run db:seed` against the production Supabase instance to activate persistent commerce.
- [ ] **Configure AI Keys:** Set `GROQ_API_KEY` and `GEMINI_API_KEY` in production environment for full AI Concierge functionality.
- [ ] **Deploy Frontend:** Set up Vercel project for `apps/web` and `apps/portal`.
- [ ] **Deploy Backend:** Verify Render deployment of `services/api` with correct `DATABASE_URL`.
- [ ] **Revoke GitHub PATs:** Delete all Personal Access Tokens used during initial setup.

---

## 🚀 5. Development Commands

Execute these commands from the repository root:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start Web & Portal development servers (Ports 3000, 3001) |
| `npm run api:dev` | Start FastAPI backend server (Port 8000) |
| `npm run test` | Run frontend & backend unit/integration tests |
| `npm run test:e2e` | Run Playwright browser smoke tests |
| `npm run db:migrate` | Apply pending database schema migrations |
| `npm run db:seed` | Populate database with master/demo seed data |

---

## 🤝 6. Governance & Responsibility (RACI)

*R = Responsible, A = Accountable, C = Consulted, I = Informed*

| Activity | PM | Tech Lead | Developer | QA | DevOps | Security |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Implementation** | I | A | **R** | C | I | I |
| **Code Review** | I | **A** | **R** | I | I | I |
| **Testing** | C | C | R | **A/R** | I | I |
| **Security Review**| I | C | I | C | C | **A/R** |

---

## 📈 7. Current Project Roadmap

- [ ] **Deployment:** Finalize Vercel Production deployment for Frontend surfaces.
- [ ] **AI Expansion:** Expand AI Stylist Studio with specialized vision models.
- [ ] **Step 15 (FinOps):** Implement API credit & cost monitoring for AI operations.
- [ ] **Step 18 (AIOps):** Implement tracking metrics for AI assistant accuracy and conversion rates.

*(End of SSOT — Last Updated: 2026-04-29)*