# Yoora Sarah Implementation Tickets

## Detailed Tickets by Feature, Module, and Target File

| Field | Value |
| --- | --- |
| Date | 2026-04-22 |
| Status | Draft implementation tickets |
| Parent documents | `DOC.md`, PRD, BRD, Technical Design, AI Strategy, Technical Backlog |

## Ticket Format

Each ticket below includes:

- objective
- business outcome
- module ownership
- likely target files
- dependencies
- acceptance notes

Global execution constraint:

- all storefront work must preserve the current Yoora Sarah UI/UX as the baseline
- tickets below are implementation and alignment tickets, not redesign tickets
- changes should reuse existing layout patterns, visual language, and component behavior wherever possible
- `apps/web` is for buyer AI and commerce only
- `apps/portal` is for management and SDM AI only
- both surfaces must integrate through shared APIs and business data, not by merging UI concerns

## Sprint 1 Tickets

### TKT-WEB-001

**Title:** Align existing homepage structure and launch storytelling

- Objective: menyesuaikan homepage yang sudah ada agar lebih jelas, lebih conversion-ready, dan selaras dengan struktur dokumen tanpa membuat UI baru
- Business outcome: improve first impression, category discovery, and launch clarity
- Module: `apps/web`
- Likely target files:
  - `apps/web/app/page.tsx`
  - `apps/web/components/home/hero.tsx`
  - `apps/web/components/home/hero-sequence.tsx`
  - `apps/web/components/home/category-tabs.tsx`
  - `apps/web/components/home/product-grid.tsx`
  - `apps/web/app/globals.css`
- Dependencies:
  - final homepage section hierarchy
  - category and launch content priorities
- Acceptance notes:
  - hero, category, and featured sections have clearer hierarchy using the current visual direction
  - launch or highlight logic is visible without clutter
  - mobile and desktop rhythm remain premium

### TKT-WEB-002

**Title:** Improve header, navigation, and collection discovery

- Objective: make navigation easier for category-led and collection-led shopping
- Business outcome: better browse efficiency and lower discovery friction
- Module: `apps/web`
- Likely target files:
  - `apps/web/components/layout/header.tsx`
  - `apps/web/components/layout/mobile-menu.tsx`
  - `apps/web/components/layout/footer.tsx`
- Dependencies:
  - final IA for category groups and collection links
- Acceptance notes:
  - navigation exposes core categories and collections clearly
  - mobile menu supports fast shopping paths without changing the approved navigation style

### TKT-UI-001

**Title:** Extract premium commerce UI primitives

- Objective: standardize section shells, badges, cards, and trust blocks by codifying patterns that already exist
- Business outcome: reduce visual inconsistency and accelerate future builds
- Module: `packages/ui`
- Likely target files:
  - `packages/ui/src/*`
  - any index export file in `packages/ui`
- Dependencies:
  - agreed mapping of current storefront patterns into shared primitives
- Acceptance notes:
  - repeated patterns from web can be migrated into shared primitives without introducing a new design language

### TKT-API-001

**Title:** Validate and normalize catalog payloads for storefront

- Objective: make sure catalog data is sufficient for premium browsing and product cards
- Business outcome: web can render stronger category and product experiences
- Module: `services/api`
- Likely target files:
  - `services/api/app/api/v1/endpoints/master_data.py`
  - `services/api/app/schemas/master_data.py`
  - `services/api/app/services/postgres_store.py`
- Dependencies:
  - required product fields from commerce UX
- Acceptance notes:
  - product/category payloads expose enough shape for web rendering

## Sprint 2 Tickets

### TKT-WEB-003

**Title:** Strengthen cart clarity and edge-case handling

- Objective: reduce hesitation and confusion inside cart
- Business outcome: better checkout continuation rate
- Module: `apps/web`
- Likely target files:
  - `apps/web/app/cart/page.tsx`
  - `apps/web/components/cart/cart-item.tsx`
  - `apps/web/components/storefront/cart-page.tsx`
- Dependencies:
  - cart data and stock behavior rules
- Acceptance notes:
  - quantity, removal, subtotal, and warning states are explicit within the current cart experience

### TKT-WEB-004

**Title:** Improve checkout messaging, preorder visibility, and support handoff

- Objective: make checkout feel safe and premium
- Business outcome: improve conversion confidence
- Module: `apps/web`
- Likely target files:
  - `apps/web/app/checkout/page.tsx`
  - `apps/web/components/layout/whatsapp-button.tsx`
  - `apps/web/app/globals.css`
- Dependencies:
  - payment and shipping messaging rules
  - preorder policy wording
- Acceptance notes:
  - checkout clearly communicates next steps, exceptions, and support path without redesigning the existing checkout surface

### TKT-API-002

**Title:** Harden order and customer support endpoints

- Objective: support checkout, order visibility, and structured support escalation
- Business outcome: web and support assistant can rely on stable business APIs
- Module: `services/api`
- Likely target files:
  - `services/api/app/api/v1/endpoints/system.py`
  - `services/api/app/api/v1/router.py`
  - `services/api/app/schemas/*`
  - `services/api/app/services/postgres_store.py`
- Dependencies:
  - desired order state visibility model
- Acceptance notes:
  - API can return order state and support handoff-ready payloads

### TKT-DB-001

**Title:** Review customer and order schema fitness for premium checkout UX

- Objective: ensure database shape supports addresses, orders, and follow-up visibility
- Business outcome: fewer blockers for post-purchase and account surfaces
- Module: `packages/database`
- Likely target files:
  - `packages/database/src/**/*`
  - migration files if schema changes are needed
- Dependencies:
  - checkout UX field requirements
- Acceptance notes:
  - documented gap list or migration proposal exists

## Sprint 3 Tickets

### TKT-PORTAL-001

**Title:** Align portal dashboard to management decision needs

- Objective: reposition dashboard as summary and command center
- Business outcome: leadership can assess launch, approval, and workflow status faster
- Module: `apps/portal`
- Likely target files:
  - `apps/portal/app/dashboard/page.tsx`
  - `apps/portal/lib/dashboard-data.ts`
  - `apps/portal/app/globals.css`
- Dependencies:
  - dashboard KPI definitions
- Acceptance notes:
  - dashboard emphasizes decision signals over generic stats while keeping the current portal UI approach
  - management and SDM needs are visible as separate but connected workflow blocks

### TKT-PORTAL-002

**Title:** Clarify briefs workflow and draft-review states

- Objective: make briefs module structurally match actual design/marketing workflow
- Business outcome: better concept intake and review readiness
- Module: `apps/portal`
- Likely target files:
  - `apps/portal/app/briefs/page.tsx`
  - `apps/portal/app/components/briefs-client.tsx`
  - `apps/portal/lib/briefs-api.ts`
- Dependencies:
  - final brief fields and status vocabulary
- Acceptance notes:
  - briefs can be understood as a tracked workflow, not just a page

### TKT-PORTAL-003

**Title:** Normalize forecast and production plan linkage

- Objective: tighten connection between forecast views and production planning
- Business outcome: planning becomes more decision-ready
- Module: `apps/portal`
- Likely target files:
  - `apps/portal/app/forecast/page.tsx`
  - `apps/portal/app/forecast/planner-client.tsx`
  - `apps/portal/app/forecast/[runId]/page.tsx`
  - `apps/portal/app/production-plans/page.tsx`
  - `apps/portal/app/production-plans/[planId]/page.tsx`
- Dependencies:
  - forecast output model from API
- Acceptance notes:
  - users can follow flow from forecast insight to production action

### TKT-API-003

**Title:** Normalize workflow payloads for briefs, forecast, approvals, and pattern jobs

- Objective: standardize response shapes for portal consumption
- Business outcome: fewer custom UI workarounds and clearer workflow logic
- Module: `services/api`
- Likely target files:
  - `services/api/app/api/v1/endpoints/briefs.py`
  - `services/api/app/api/v1/endpoints/forecast.py`
  - `services/api/app/api/v1/endpoints/approvals.py`
  - `services/api/app/api/v1/endpoints/pattern_jobs.py`
  - `services/api/app/schemas/brief.py`
  - `services/api/app/schemas/forecast.py`
  - `services/api/app/schemas/approval.py`
  - `services/api/app/schemas/pattern.py`
- Dependencies:
  - portal state model agreement
- Acceptance notes:
  - status and summary fields are consistent across modules

## Sprint 4 Tickets

### TKT-AI-001

**Title:** Build safe product lookup and support retrieval tools

- Objective: enable first buyer support assistant with factual answers
- Business outcome: lower CS repetition and faster buyer response
- Module: `services/api`
- Likely target files:
  - `services/api/app/api/v1/endpoints/system.py`
  - `services/api/app/api/v1/endpoints/master_data.py`
  - new AI-specific endpoint file if introduced
  - `services/api/app/schemas/*`
- Dependencies:
  - support policy source content
  - product truth source
- Acceptance notes:
  - tools can answer product, stock, and support-policy queries safely

### TKT-WEB-005

**Title:** Add buyer assistant shell to storefront

- Objective: create initial UI shell for buyer AI assistant
- Business outcome: launch support assistant MVP inside owned channel
- Module: `apps/web`
- Likely target files:
  - `apps/web/app/layout.tsx`
  - `apps/web/components/layout/whatsapp-button.tsx`
  - new AI assistant component in `apps/web/components/`
  - `apps/web/app/providers.tsx`
- Dependencies:
  - API retrieval tools
- Acceptance notes:
  - assistant can be opened, queried, and safely constrained with minimal disruption to the existing storefront UX

### TKT-DB-002

**Title:** Add AI logging and retrieval support data structures

- Objective: make buyer AI measurable and auditable
- Business outcome: AI can be reviewed and improved safely
- Module: `packages/database`
- Likely target files:
  - migration files
  - `packages/database/src/**/*`
- Dependencies:
  - logging schema agreement
- Acceptance notes:
  - assistant sessions and tool interactions can be stored or at least specified cleanly

## Sprint 5 Tickets

### TKT-AI-002

**Title:** Add stylist recommendation tool contracts

- Objective: support guided discovery and bundle logic
- Business outcome: better product discovery and potential AOV lift
- Module: `services/api`
- Likely target files:
  - new AI/recommendation service files
  - `services/api/app/schemas/*`
  - `services/api/app/services/*`
- Dependencies:
  - enriched product attributes
- Acceptance notes:
  - recommendation logic returns grounded, explainable suggestions

### TKT-WEB-006

**Title:** Add size guidance and recommendation UI surfaces

- Objective: present fit confidence and stylist suggestions clearly
- Business outcome: reduce hesitation during decision stage
- Module: `apps/web`
- Likely target files:
  - `apps/web/components/product/product-detail.tsx`
  - `apps/web/app/[category]/[productSlug]/page.tsx`
  - new AI recommendation component files
- Dependencies:
  - recommendation and size tools
- Acceptance notes:
  - product page shows recommendation and size guidance without clutter and without changing the approved product-page look and feel

## Sprint 6 Tickets

### TKT-PORTAL-004

**Title:** Add brief copilot and approval summary shell

- Objective: reduce internal drafting and review effort
- Business outcome: faster internal throughput
- Module: `apps/portal`
- Likely target files:
  - `apps/portal/app/briefs/page.tsx`
  - `apps/portal/app/approvals/page.tsx`
  - new portal AI component files
- Dependencies:
  - retrieval and summarization tools
- Acceptance notes:
  - users can invoke assistant support directly in the right context

### TKT-PORTAL-006

**Title:** Add SDM knowledge and employee assistance shell

- Objective: provide SDM and employee-facing AI help inside the internal dashboard
- Business outcome: reduce repetitive explanation work, accelerate onboarding, and improve policy clarity
- Module: `apps/portal`
- Likely target files:
  - `apps/portal/app/dashboard/page.tsx`
  - new portal AI component files
  - `apps/portal/app/globals.css`
- Dependencies:
  - internal retrieval tools and role policies
- Acceptance notes:
  - SDM users can access SOP, policy, and task-clarity support inside the portal
  - the feature remains separated from public website AI surfaces

### TKT-AI-003

**Title:** Add internal retrieval and summary tools for briefs, approvals, and SOPs

- Objective: support management and SDM AI
- Business outcome: lower repetitive explanation work and better decision summaries
- Module: `services/api`
- Likely target files:
  - `services/api/app/api/v1/endpoints/briefs.py`
  - `services/api/app/api/v1/endpoints/approvals.py`
  - new internal AI tool endpoints
  - `services/api/app/services/*`
- Dependencies:
  - source records and SOP content availability
- Acceptance notes:
  - summaries cite source context and obey role permissions
  - tools support both management and SDM use cases without exposing them to the public storefront

## Sprint 7 Tickets

### TKT-PORTAL-005

**Title:** Add explainable forecast recommendations to portal

- Objective: make forecast outputs more actionable
- Business outcome: management can act on recommendations, not raw tables alone
- Module: `apps/portal`
- Likely target files:
  - `apps/portal/app/forecast/page.tsx`
  - `apps/portal/app/forecast/[runId]/page.tsx`
  - `apps/portal/lib/forecast-api.ts`
- Dependencies:
  - explainable forecast payloads
- Acceptance notes:
  - recommendation rationale is visible to the user

### TKT-AI-004

**Title:** Add forecast recommendation service and explanation fields

- Objective: power portal-side planning intelligence
- Business outcome: better planning judgment and faster operational readiness
- Module: `services/api`
- Likely target files:
  - `services/api/app/api/v1/endpoints/forecast.py`
  - `services/api/app/schemas/forecast.py`
  - `services/api/app/services/forecast_workflow_store.py`
- Dependencies:
  - baseline forecast data quality
- Acceptance notes:
  - forecast responses can include recommendation, confidence, and explanation

## Sprint 8 Tickets

### TKT-OPS-001

**Title:** Expand audit, observability, and release readiness instrumentation

- Objective: prepare the platform for safer scale
- Business outcome: better reliability, traceability, and leadership visibility
- Module: `services/api`, `apps/web`, `apps/portal`
- Likely target files:
  - `services/api/app/api/v1/endpoints/audit.py`
  - `services/api/app/main.py`
  - `apps/web/app/*`
  - `apps/portal/app/*`
- Dependencies:
  - metric and logging standard agreement
- Acceptance notes:
  - major buyer and workflow events can be observed consistently

## Cross-Cutting Tickets

### TKT-DATA-001

**Title:** Enrich product model for styling, recommendation, and launch logic

- Objective: add data fields required for premium commerce and AI
- Module: `packages/database`, `services/api`, `apps/web`
- Likely target files:
  - migrations
  - `packages/database/src/**/*`
  - `services/api/app/schemas/master_data.py`
  - `services/api/app/api/v1/endpoints/master_data.py`
  - `apps/web/app/lib/storefront-data.ts`

### TKT-QA-001

**Title:** Define critical journey test matrix

- Objective: establish QA baseline for buyer and portal workflows
- Module: repo-wide
- Likely target files:
  - docs or test plan files
  - future test suites in `apps/web` and `apps/portal`

## Recommended Start Sequence

Start with these 6 tickets first:

1. `TKT-WEB-001`
2. `TKT-WEB-003`
3. `TKT-WEB-004`
4. `TKT-PORTAL-001`
5. `TKT-API-001`
6. `TKT-AI-001`

That sequence gives Yoora Sarah visible improvement in customer trust, operational clarity, and first-stage AI usefulness without jumping too quickly into higher-complexity automation.
