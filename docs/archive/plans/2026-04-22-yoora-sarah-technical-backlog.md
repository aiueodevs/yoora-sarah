# Yoora Sarah Technical Backlog

## Sprint and Module Breakdown

| Field | Value |
| --- | --- |
| Date | 2026-04-22 |
| Status | Draft backlog |
| Parent documents | `README.md`, PRD, BRD, Technical Design, AI Strategy, Execution Plan |

## 1. Planning Assumptions

- Sprint duration: 2 minggu
- Delivery model: fullstack monorepo
- Main modules: `apps/web`, `apps/portal`, `services/api`, `packages/database`, `packages/ui`
- Priority order: trust layer first, AI second, optimization third
- UI/UX constraint: preserve the current Yoora Sarah website experience as the approved baseline; no redesign track is included in these sprints
- Frontend scope: adapt existing pages and components to document requirements, data needs, trust states, and AI flows without replacing the current visual direction
- Surface rule: `apps/web` is reserved for buyer AI and commerce journeys, while `apps/portal` is reserved for management and SDM AI workflows
- Integration rule: both surfaces stay separate in UX and access, but share API contracts, business entities, auditability, and AI governance

## Execution Update on 2026-04-22

- `apps/web`: persistent catalog and cart wiring is in place against the commerce foundation, while preserving the current UI/UX baseline
- `apps/web`: buyer AI phase 2 is now materially in place with stylist recommendations, size guidance, preorder or launch policy lookup, recommendation telemetry, and human handoff preview wired into both the buyer assistant and the product detail surface
- `apps/portal`: briefs, design gallery, forecast, approvals, production plans, settings, and dashboard now use materially stronger session gating and actor propagation
- `apps/portal`: visual system, navigation, dashboard hierarchy, login, forecast, production plan list, briefs surface, and portal copilot now align much more closely with the premium website language while staying portal-native for management and SDM workflows
- `apps/portal`: internal AI now covers brief copilot, approval support, SOP and knowledge lookup, onboarding guidance, content drafting, launch readiness, performance summary, and merchandising insight in both the global copilot and page-level command surfaces
- `services/api`: auth and actor consistency for approvals, forecast, and design option status flows has been tightened
- `services/api`: AI tool coverage now includes recommendation, size guidance, preorder policy lookup, buyer handoff preview, internal knowledge retrieval, and leadership insight summaries
- `packages/database`: shared commerce contracts now cover the new storefront entities and cart state
- `services/api` plus `apps/web` and `apps/portal`: observability baseline now includes persisted telemetry ingestion, role-aware telemetry read endpoints, and event hooks across buyer AI, cart, checkout start, portal auth, copilot, and core workflow actions
- `apps/portal`: internal AI copilot requests now route through server actions that preserve actor email under enforced internal API auth
- `apps/web`: no redesign was executed because the approved docs keep the website visual baseline as a protected constraint
- Remaining priority for true production readiness: alerting, security operations hardening, deployment runbooks, and E2E regression coverage

## 2. Module Map

| Module | Responsibility |
| --- | --- |
| `apps/web` | Customer storefront, checkout, buyer AI entry, account, order visibility |
| `apps/portal` | Internal management and SDM dashboard, briefs, design gallery, forecast, approvals, production plans |
| `services/api` | Business API, auth, workflow logic, integrations, audit, AI tools |
| `packages/database` | Shared DB access and schema contracts |
| `packages/ui` | Shared component primitives and design consistency |

## 3. Sprint Backlog

## Sprint 0

### Objective

Lock foundation and technical clarity before feature acceleration.

### `docs` / delivery governance

- [ ] Final review of master documentation set
- [ ] Define canonical business glossary
- [ ] Define acceptance criteria templates for future tracks

### `services/api`

- [ ] Audit current endpoint coverage against target domain map
- [ ] Define missing contract list for catalog, support, orders, approvals, and AI tools

### `packages/database`

- [ ] Review current shared schema assumptions
- [ ] Identify gaps for catalog enrichment, approval logs, and AI logs

### Output

- approved delivery vocabulary
- gap list by module
- implementation readiness baseline

## Sprint 1

### Objective

Strengthen premium commerce trust layer.

### `apps/web`

- [ ] Align existing homepage sections and launch storytelling blocks to the approved document structure
- [ ] Improve category navigation and collection logic within the current header and menu patterns
- [ ] Improve product detail trust blocks: stock, preorder, fit, support CTA
- [ ] Tighten spacing, typography, and visual hierarchy within the current design language

### `packages/ui`

- [ ] Extract reusable UI primitives from existing storefront patterns
- [ ] Align buttons, badges, cards, and section patterns without introducing a new visual system

### `services/api`

- [ ] Ensure product and category data contracts support web needs

### Output

- stronger browse-to-product journey
- premium and more coherent commerce layer

## Sprint 2

### Objective

Stabilize checkout confidence and support entry.

### `apps/web`

- [ ] Improve cart clarity and error handling
- [ ] Improve checkout step logic and support messaging
- [ ] Add stronger post-purchase and order visibility placeholders or flows

### `services/api`

- [ ] Add or harden order, customer, and support-oriented endpoints
- [ ] Define structured support handoff payloads

### `packages/database`

- [ ] Validate order and customer-address relationships against desired UX

### Output

- reduced hesitation at purchase stage
- support-ready commerce flow

## Sprint 3

### Objective

Align portal workflow to business reality.

### `apps/portal`

- [ ] Audit current modules against target workflows: briefs, design jobs, patterns, forecast, approvals, production plans
- [ ] Add or refine dashboard summary blocks for leadership
- [ ] Add or refine SDM workflow visibility and knowledge access surfaces
- [ ] Clarify role-based navigation and module purpose

### `services/api`

- [ ] Normalize workflow responses for briefs, forecast, and approvals
- [ ] Add audit and summary-friendly data shapes

### Output

- portal becomes clearer as an operations command center

## Sprint 4

### Objective

Ship buyer AI phase 1 with low-risk, high-value scope.

### `services/api`

- [x] Build safe tool endpoints for product lookup, stock lookup, order status, and support policy retrieval
- [x] Add AI interaction logging model

### `apps/web`

- [x] Add buyer AI entry point and basic conversational shell
- [x] Connect support retrieval and FAQ assistant

### `packages/database`

- [ ] Add AI log and retrieval-support tables if needed

### Output

- buyer support assistant MVP
- measurable AI interactions

## Sprint 5

### Objective

Ship buyer AI phase 2 for discovery and conversion guidance.

### `services/api`

- [x] Add tool contracts for recommendation and size guidance
- [x] Add handoff trigger logic for ambiguous or sensitive cases

### `apps/web`

- [x] Add stylist recommendation flow
- [x] Add size guidance surface with confidence language
- [x] Add recommendation event tracking

### Output

- AI stylist MVP
- early size-confidence feature

## Sprint 6

### Objective

Ship internal AI productivity phase 1.

### `apps/portal`

- [x] Add brief copilot entry point
- [x] Add approval summary view or assistant panel
- [x] Add SOP / knowledge assistant shell
- [x] Add SDM-focused assistant access for onboarding, policy lookup, and task clarity

### `services/api`

- [x] Add summary and retrieval tools for briefs, approvals, and SOP docs
- [x] Add role-based access enforcement for internal AI

### Output

- first management and SDM AI capabilities

## Sprint 7

### Objective

Add forecast and planning intelligence.

### `apps/portal`

- [x] Improve forecast UX and recommendation visibility
- [ ] Improve production plan linkage to forecast outputs

### `services/api`

- [x] Add forecast recommendation service or API shape
- [x] Add explainability fields for planning suggestions

### Output

- more decision-ready planning workflows

## Sprint 8

### Objective

Harden governance, observability, and release quality.

### `services/api`

- [ ] Add audit expansion for approvals and AI
- [ ] Add error tracking and monitoring hooks

### `apps/web`

- [ ] Instrument key buyer funnel metrics

### `apps/portal`

- [ ] Instrument key workflow and approval metrics

### Output

- stronger reliability and executive visibility

## 4. Cross-Cutting Backlog

### Data enrichment

- [ ] product attributes for styling and AI
- [ ] launch and preorder metadata
- [ ] size guidance logic and confidence notes

### Design system

- [ ] codify existing shared tokens and component rules
- [ ] reusable section composition from current patterns
- [ ] consistent responsive behavior

### QA and release

- [ ] define critical buyer journeys
- [ ] define critical portal workflows
- [ ] define AI evaluation set for support and recommendation answers

## 5. Dependency Notes

- Buyer AI depends on clean product and support data.
- Internal AI depends on structured briefs, approvals, and SOP sources.
- Management and SDM AI should remain portal-native even when reusing shared AI services.
- Forecast AI should follow after workflow clarity, not before.
- Frontend polish should happen alongside component rationalization in `packages/ui`, while preserving the current approved UI/UX direction.

## 6. Definition of Done per Sprint

A sprint item is done when:

- [ ] requirements are understood
- [ ] implementation is merged in the correct module
- [ ] data and API dependencies are satisfied
- [ ] failure states are considered
- [ ] relevant docs are updated
- [ ] analytics or logging are added where needed

## 7. Recommended Immediate Start

The best first execution slice is:

1. Sprint 1 and Sprint 2 for trust and checkout quality.
2. Sprint 3 for portal workflow clarity.
3. Sprint 4 for support AI MVP.

That sequence gives Yoora Sarah the fastest path to visible business value with controlled complexity.
