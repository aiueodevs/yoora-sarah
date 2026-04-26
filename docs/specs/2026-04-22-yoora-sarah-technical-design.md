# Yoora Sarah Technical Design

## Architecture, Data, Integration, and Delivery Shape

| Field | Value |
| --- | --- |
| Date | 2026-04-22 |
| Step | SDLC Step 3 and Step 4 bridge |
| Status | Draft for technical alignment |
| Parent document | `README.md` |

## 1. Objective

Translate the Yoora Sarah business and AI strategy into a technical shape that:

- aligns with the current monorepo
- keeps the buyer website and the management or SDM portal separated at the interface layer
- shares business data and governance
- supports phased AI adoption safely

## 2. System Boundaries

### Customer-facing surface

- `apps/web`
- premium storefront, product discovery, checkout, account, order visibility
- buyer AI entry points

### Internal surface

- `apps/portal`
- management dashboards, SDM workflows, briefs, design jobs, forecast, patterns, approvals, production planning
- internal copilots and reporting views

### Service layer

- `services/api`
- operational API endpoints, auth enforcement, business rules, audit, integrations

### Shared packages

- `packages/database`
- `packages/ui`
- optional future `packages/config` or `packages/ai` if shared logic grows

## 3. Recommended Architecture Style

- monorepo with explicit app and service boundaries
- contract-first API design for cross-surface reuse
- domain-oriented modules, not page-driven spaghetti
- AI orchestration separated from core transactional rules
- auditability for any workflow that affects money, stock, or approvals

## 3B. Surface Separation and Integration Rule

- `apps/web` serves buyers and consumers only
- `apps/portal` serves management, SDM, and employee workflows only
- the two surfaces must not be merged into one UI, but they must remain synchronized through shared APIs, shared business entities, shared audit trails, and shared AI tooling constraints
- customer-facing AI and internal AI may share orchestration patterns, but they must have separate permissions, prompts, tools, and observability views

## 3A. Frontend Execution Constraint

- `apps/web` should use the current storefront UI/UX as the approved baseline
- sprint execution should not introduce a net-new visual direction, replacement IA, or redesign track unless explicitly approved later
- frontend work should prioritize content mapping, state handling, trust communication, AI entry points, responsiveness, and consistency using the current component language
- any shared UI extraction in `packages/ui` should codify existing patterns, not invent a parallel design system

## 4. Core Domains

| Domain | Description |
| --- | --- |
| Catalog | Products, variants, categories, collection edits, launch metadata |
| Customer | Accounts, addresses, preferences, service history |
| Commerce | Cart, checkout, orders, payment state, fulfillment state |
| Support | Contact logs, handoffs, FAQ sources, issue status |
| Design Ops | Briefs, design jobs, references, gallery assets |
| Planning | Forecast, production plans, inventory signals |
| Governance | Approvals, audit, role policies, critical events |
| AI | Prompt configs, tool logs, evaluation records, assistant sessions |

## 5. API Shape

Recommended API grouping:

- `/catalog/*`
- `/customers/*`
- `/orders/*`
- `/support/*`
- `/briefs/*`
- `/design-jobs/*`
- `/pattern-jobs/*`
- `/forecast/*`
- `/production-plans/*`
- `/approvals/*`
- `/ai/*`
- `/admin/*`

The current `services/api/app/api/v1/endpoints` structure already supports this evolution.

## 6. Data Model Priorities

### Commerce data

- products
- product_variants
- categories
- customers
- customer_addresses
- orders
- order_items
- wishlists

### Operational data

- briefs
- design_jobs
- pattern_jobs
- forecast_runs
- production_plans
- approvals
- audit_logs

### AI data

- assistant_sessions
- assistant_messages
- tool_invocations
- recommendation_events
- knowledge_documents
- evaluation_runs

## 7. Product Data Enrichment Requirements

To support premium commerce and buyer AI, product data should eventually include:

- silhouette
- fabric family
- fabric feel
- opacity or layering note
- occasion tags
- styling tags
- fit note
- care note
- preorder or launch status
- edit or collection membership

## 8. Integration Requirements

| Integration | Purpose |
| --- | --- |
| Payment | Checkout and payment confirmation |
| Logistics | Shipping label, tracking, fulfillment updates |
| WhatsApp | Assisted selling and support |
| Email / notifications | Order and launch messaging |
| Storage | Product media, design assets, pattern files |
| Analytics | Funnel, retention, recommendation performance |

## 9. Role and Access Model

Minimum roles:

- owner
- manager
- marketing
- CS
- production
- operations admin
- engineering admin

Access rules:

- website customer data access must be least-privilege
- internal AI outputs must respect role visibility
- approval and audit data must be protected from casual access

## 10. AI Technical Design

### Orchestration

- chat or copilot request enters orchestration layer
- orchestrator resolves role, context, and allowed tools
- tool-backed answer is preferred over freeform answer where factuality matters
- response is logged with evaluation metadata

Two AI surface model:

- buyer AI is exposed in `apps/web` for product discovery, fit confidence, order or support questions, and assisted conversion
- management and SDM AI is exposed in `apps/portal` for summaries, SOP retrieval, workflow clarity, planning support, and operational decision assistance
- both AI surfaces should integrate with the same governed business truth, but remain separate in UX, role access, and allowed actions

### Retrieval

- customer-facing retrieval should prioritize product truth and policy truth
- internal retrieval should prioritize SOP, workflow, and structured business records

### Human handoff

- support cases with ambiguity or policy sensitivity create a handoff object
- the handoff includes summary, source context, and next action request

## 11. Observability Requirements

- request logging for API and AI endpoints
- audit logs for approvals and critical state changes
- error tracking for web, portal, and API
- funnel analytics for browse, add-to-cart, checkout, and assisted conversion
- AI evaluation dashboards for quality and containment

## 12. Security Requirements

- session and auth hardening
- role-based access control
- secret management discipline
- prompt injection mitigation for AI surfaces
- output validation for AI actions
- redaction or minimization for sensitive customer data in prompts and logs

## 13. Delivery Recommendations

### First technical slice

- stabilize data contracts for catalog, orders, and support
- expose safe API tools for lookup and retrieval
- wire buyer support assistant against real data

### Second technical slice

- enrich product attributes
- wire stylist recommendation logic
- improve portal summary and approval intelligence

### Third technical slice

- forecasting intelligence
- deeper planning and production support
- evaluation and cost controls

## 14. Definition of Technical Readiness

A feature is technically ready when:

- domain ownership is clear
- API contract is defined
- data dependencies are identified
- roles and permissions are defined
- observability and failure handling are considered
- AI safety is defined where the feature uses AI

## 15. Decision

Yoora Sarah should continue with a shared-data, separated-surface architecture: `apps/web` for premium commerce, `apps/portal` for internal operations, `services/api` for business logic, and a phased AI orchestration layer on top of safe tools and audit-friendly workflows.
