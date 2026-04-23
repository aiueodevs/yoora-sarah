# Yoora Sarah Acceptance Criteria Template

## Standard Template for Sprint and Ticket Delivery

| Field | Value |
| --- | --- |
| Date | 2026-04-22 |
| Status | Phase 0 draft |
| Purpose | Shared acceptance-criteria format for website, portal, API, database, and AI work |

## 1. Template

```md
## Feature Summary

- Feature name:
- Module:
- Owner:
- Related phase and sprint:
- Related ticket:

## Business Goal

- What business outcome should this feature improve?

## Scope

- In scope:
- Out of scope:

## Preconditions

- Required data dependencies:
- Required API dependencies:
- Required permissions or roles:

## Acceptance Criteria

- [ ] happy path works as intended
- [ ] failure states are handled clearly
- [ ] copy and labels match approved business glossary
- [ ] current approved UI/UX baseline is preserved where relevant
- [ ] analytics, audit, or logging is added where required
- [ ] docs are updated if contract or workflow changed

## AI-Specific Criteria

- [ ] tool-backed answer is used where factuality matters
- [ ] uncertainty is handled safely
- [ ] human handoff is defined when needed
- [ ] logs and evaluation hooks are present
- [ ] role and permission boundaries are enforced

## Technical Validation

- [ ] target files identified
- [ ] contract changes reviewed
- [ ] data model impact reviewed
- [ ] monitoring impact reviewed

## Review and Approval

- Product approval:
- Technical approval:
- Business approval:
```

## 2. Minimum Requirements by Work Type

### Website work

- [ ] no redesign outside approved baseline
- [ ] mobile and desktop flows stay coherent
- [ ] trust messaging is explicit where required

### Portal work

- [ ] role intent is clear
- [ ] management and SDM use cases are distinguished where needed
- [ ] workflow states are visible and understandable

### API work

- [ ] request and response shape is explicit
- [ ] auth and role behavior is explicit
- [ ] error cases are explicit

### Database work

- [ ] schema intent is documented
- [ ] migration need is explicit
- [ ] downstream app impact is identified

### AI work

- [ ] factual answers rely on approved tools or retrieval
- [ ] unsafe or ambiguous cases escalate to human support
- [ ] logging and evaluation are not optional

## 3. Definition of Ready

A task is ready to implement when:

- [ ] the ticket exists
- [ ] the business goal is clear
- [ ] the target module is clear
- [ ] dependencies are identified
- [ ] acceptance criteria are filled in

## 4. Definition of Done

A task is done when:

- [ ] implementation is completed
- [ ] criteria are validated
- [ ] relevant docs are updated
- [ ] required approval is recorded
