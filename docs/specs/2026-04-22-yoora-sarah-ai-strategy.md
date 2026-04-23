# Yoora Sarah AI Strategy

## Buyer AI, Management AI, and SDM Enablement Blueprint

| Field | Value |
| --- | --- |
| Date | 2026-04-22 |
| Status | Strategic blueprint |
| Parent document | `DOC.md` |

## 1. AI Thesis

AI at Yoora Sarah should exist for one reason:

> to make premium fashion buying feel more guided, and to make internal execution feel more intelligent and less repetitive.

AI is not a decorative layer. It is a business acceleration layer.

Implementation structure:

- one AI surface for buyer and consumer needs on the public website
- one AI surface for management and SDM or employee needs in the internal dashboard
- both surfaces are separate by interface and permission model, but integrated by shared business truth, workflow context, and governance

## 2. AI Design Rules

1. AI must improve clarity, confidence, speed, or consistency.
2. AI must not dilute brand tone.
3. AI must know when to stop and hand off to a human.
4. AI outputs that influence money, production, or customer trust must be reviewable.
5. AI systems must be measurable by business impact, not novelty.

## 3. Priority AI Domains

### Domain A: Buyer AI

Goal:

- increase conversion confidence
- reduce hesitation
- improve product discovery and bundle quality

Key capabilities:

- AI stylist concierge
- AI look completion and bundle suggestion
- AI size and fit helper
- AI natural language product finder
- AI support for stock, order, shipping, and preorder questions

### Domain B: Management AI

Goal:

- reduce coordination drag
- increase decision speed
- improve signal quality for leadership

Key capabilities:

- approval summary assistant
- performance summary assistant
- launch readiness assistant
- merchandising insight assistant

### Domain C: SDM and Team AI

Goal:

- reduce repeated drafting and explanation work
- make SOP and knowledge accessible
- support onboarding and performance clarity

Key capabilities:

- SOP and policy assistant
- internal Q&A assistant
- task and handoff clarity assistant
- learning and skill-path recommendations

### Domain D: Creative and Planning AI

Goal:

- increase launch speed without damaging brand quality

Key capabilities:

- design brief copilot
- content and caption copilot
- campaign concept assistant
- forecast and size-mix recommendation engine

## 4. Recommended AI Product Surface

| AI surface | User | Job |
| --- | --- | --- |
| Yoora Concierge | Buyer | Discover, compare, and decide |
| Size Advisor | Buyer | Reduce fit hesitation |
| Support Agent | Buyer + CS | Answer routine questions and triage |
| Brief Copilot | Design/marketing | Draft and refine concepts |
| Content Copilot | Marketing | Produce launch copy, scripts, hooks |
| Forecast Copilot | Management/ops | Recommend quantity and mix |
| Approval Copilot | Owner/manager | Summarize proposals and risks |
| Knowledge Assistant | SDM | Retrieve SOP, policy, glossary, onboarding info |

Surface rule:

- website AI must optimize consumer confidence, conversion support, and assisted shopping
- portal AI must optimize management speed, SDM productivity, coordination quality, and workflow visibility
- shared models or tools are allowed, but the product surfaces must remain separate and role-aware

## 5. AI Use Cases by Value and Complexity

### High value, lower complexity

- FAQ and support retrieval
- order and shipping response assistance
- content drafting
- approval summaries
- SOP retrieval

### High value, medium complexity

- stylist recommendation
- personalized collection suggestions
- size recommendation
- forecast recommendation

### High value, higher complexity

- image-based style matching
- predictive assortment optimization
- end-to-end production planning suggestions

## 6. Data Requirements

AI quality will be limited by data quality. The required data domains are:

- product catalog with clean attributes
- variant, size, stock, and preorder status
- imagery and merchandising metadata
- customer profile and preference signals
- order and support history
- brief, design, forecast, approval, and production records
- SOPs, policy docs, glossary, and role knowledge

## 7. Architecture Alignment With Current Repo

The current repo already supports a practical AI operating model:

- `apps/web` can host buyer AI entry points
- `apps/portal` can host management and SDM copilots
- `services/api` can expose business tools and retrieval endpoints
- future `services/ai` or worker processes can orchestrate prompts, memory, evaluation, and jobs

Recommended AI architecture:

1. Interface layer
   - website chat
   - portal copilots
   - support console hooks
2. Orchestration layer
   - prompt routing
   - tool selection
   - session management
3. Tool layer
   - product lookup
   - stock lookup
   - order status
   - forecast query
   - approval summaries
4. Memory and retrieval layer
   - short-term session state
   - long-term preference and knowledge retrieval
5. Governance layer
   - logging
   - evaluation
   - safety

## 8. Tooling Model

Recommended initial tool contracts:

- `search_products`
- `get_product_details`
- `get_variant_availability`
- `get_size_guidance`
- `get_order_status`
- `get_launch_or_preorder_policy`
- `create_support_handoff`
- `summarize_brief`
- `summarize_approval_request`
- `forecast_recommendation`
- `retrieve_sop`

## 9. Buyer AI Experience Requirements

- The assistant must speak in a warm, elegant, reassuring tone.
- It must prioritize clarity over hype.
- It must make product recommendations grounded in actual availability.
- It must state uncertainty when confidence is low.
- It must push to human support when policy, emotion, or ambiguity is high.

## 10. Internal AI Requirements

- Internal copilots must respect role permissions.
- Summaries must reference source records and timestamps where possible.
- Forecast outputs must be framed as recommendations, not commands.
- Approval support must show rationale, risks, and required next action.
- management and SDM copilots must be accessible from the portal, not from the public storefront
- SDM assistance should cover SOP retrieval, onboarding support, policy lookup, and task clarity

## 11. Guardrails

### Safety controls

- prompt injection filtering
- PII minimization
- role-based data access
- output schema validation for structured actions
- explicit human approval before production-impacting actions

### Operational controls

- AI logs
- prompt versioning
- evaluation sets
- rollback path per AI feature

## 12. Measurement Framework

### Buyer AI metrics

- recommendation click-through rate
- assisted conversion uplift
- size-tool usage and downstream return impact
- containment rate for support interactions

### Internal AI metrics

- draft time saved
- approval review time reduced
- forecast confidence and adoption rate
- SOP retrieval success rate

### Quality metrics

- hallucination rate
- incorrect answer escalation rate
- safety violation rate
- human override frequency

## 13. Rollout Plan

### Stage 1

- support retrieval
- content copilot
- approval summary assistant

### Stage 2

- buyer stylist
- size advisor
- personalized recommendations

### Stage 3

- forecast intelligence
- production support
- deeper SDM knowledge assistant

## 14. Human-in-the-Loop Policy

Human review is mandatory for:

- high-value customer complaints
- payment disputes
- manual refunds or exceptions
- production quantity decisions
- launch approval and final content sign-off
- policy-sensitive support interactions

## 15. Decision

Yoora Sarah should adopt AI as a structured operating capability, starting with retrieval, summarization, recommendation, and guided support. The best early AI wins will come from buyer confidence, launch speed, and management clarity.
