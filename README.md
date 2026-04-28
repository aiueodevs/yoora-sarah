# YOORA-SARAH — Single Source of Truth (SSOT) v2.0

> **SDLC Framework Alignment:** This project follows the [Professional Fullstack Development Lifecycle v2.0](https://sdlc-framework.vercel.app/) (23-Step Methodology).

---

## 🏗️ 1. Executive Summary
YOORA-SARAH is a premium modest fashion e-commerce ecosystem. It integrates a high-conversion customer storefront, an AI-powered styling studio, and a sophisticated production intelligence portal for internal operations.

---

## ⚙️ 2. Master Tech Stack Reference

| Layer | Technology | Note |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16.1 (App Router), TS 5.7 | Storefront & Portal |
| **State/Query** | TanStack Query v5 | 60s stale time baseline |
| **Styling** | Tailwind CSS 3.4+, Framer Motion | "Luxury & Warm" Design System |
| **Backend** | FastAPI 0.115+, Python 3.12 | Managed via `uv` |
| **Database** | Supabase (PostgreSQL) | Standard Pooling & REST API |
| **ORM/Validation** | Pydantic v2.14 | Strict type enforcement |
| **AI/ML** | Groq (Llama 3.3), Google Gemini 2.5 | Hybrid routing (Text/Vision) |
| **Asset Storage** | Tigris Object Storage | Cached locally in `public/products` |
| **Testing** | Vitest, Pytest, Playwright | Unit, Integration, E2E |
| **Monorepo** | Turborepo, pnpm workspaces | Optimized build pipeline |
| **CI/CD** | GitHub Actions | Automated lint, typecheck, tests |

---

## ◈ 3. Development Lifecycle Status (23 Steps)

| Step | Milestone | Status | Details |
| :--- | :--- | :--- | :--- |
| **0** | **PRD** | ✅ | Product vision and concierge scope defined |
| **1** | **BRD** | ✅ | Monorepo business logic mapped |
| **2** | **UI/UX Design** | ✅ | High-res video hero & Premium Stylist UI implemented |
| **3** | **Technical Design** | ✅ | Data architecture & Internal API consolidated |
| **4** | **Software Architecture** | ✅ | Turborepo & fail-closed backend logic |
| **5** | **API Specification** | ✅ | FastAPI domain endpoints defined |
| **6** | **Development** | 🟡 | Core surfaces active; constant iterative refinement |
| **7** | **Non-Prod Deployment** | ✅ | Render (Backend) & local parity confirmed |
| **8** | **Testing & QA** | ✅ | Vitest, Pytest, and Playwright smoke active |
| **9** | **Prod Deployment** | 🟡 | Infrastructure ready; Vercel deployment pending |
| **10** | **Maintenance & CI** | ✅ | GitHub Actions workflow established |
| **11** | **Operational Readiness** | 🟡 | Basic startup scripts available |
| **12** | **Data Governance** | ✅ | PII/Secret removal from git history |
| **13** | **Advanced Security** | ✅ | Internal API fail-closed protection |
| **14** | **Release Engineering** | ✅ | Clean PR templates & CODEOWNERS |
| **15-22** | **Platform/AIOps/GreenIT** | ⚪ | Future expansion targets |

---

## 🌟 4. Core Features implementation

### Customer Storefront (`apps/web`)
- **AI Buyer Premium Concierge:** The single floating entry point. Handles discovery, sizing, and order status.
- **WhatsApp Handoff:** Contextual support escalation built into the AI chat interface.
- **AI Stylist Studio (`/stylist`):** Full-viewport interactive studio for outfit matching and product-to-model previews.
- **Hero Experience:** 1080p high-resolution looping video background with cross-fade transitions.

### Internal Portal (`apps/portal`)
- **Workflow Modules:** End-to-end intelligence for Briefs, Design Review, Pattern Tracking, and Forecast Planning.
- **Unified Transport:** Consolidated API client (`lib/api-client.ts`) for secure backend communication.

### Backend Infrastructure (`services/api`)
- **Commerce Engine:** Manages cart, catalog, orders, and support policies.
- **AI Tools Service:** Multi-turn conversational logic grounded in actual product data.
- **Database Tooling:** Custom Python migration runner for schema and seed management.

---

## 🚀 5. Development Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start Web & Portal development (Ports 3000, 3001) |
| `npm run api:dev` | Start FastAPI backend (Port 8000) |
| `npm run test` | Run frontend & backend tests |
| `npm run test:e2e` | Run Playwright browser tests |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:seed` | Populate database with master/demo data |

---

## 🤝 6. Governance (RACI Matrix)

| Activity | PM | Tech Lead | Developer | QA | DevOps | Security |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Implementation | I | A | **R** | C | I | I |
| Code Review | I | **A** | **R** | I | I | I |
| Testing | C | C | R | **A/R** | I | I |
| Security | I | C | I | C | C | **A/R** |

---

## 📈 7. Current Project Roadmap
1. [ ] Finalize Vercel Production deployment for Frontend.
2. [ ] Expand AI Stylist Studio with specialized vision models.
3. [ ] Implement Step 15: FinOps for AI credit/cost monitoring.
4. [ ] Implement Step 18: AIOps for tracking assistant accuracy.

*(End of SSOT — Last Updated: 2026-04-29)*