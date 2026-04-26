# Yoora Sarah AI Stylist Premium V2 - Design Spec

## Status
Draft for review

## Date
2026-04-26

## Goal
Upgrade the existing Yoora Sarah `/stylist` experience into a premium private styling studio that feels elegant, luxury, and professional while staying conversion-focused.

This V2 must preserve the current homepage guardrails:
- keep the homepage hero as a single-page experience
- do not add scroll-below sections to the homepage
- use navbar-only discoverability for stylist entry points
- concentrate all advanced AI styling workflows inside `/stylist`

## Why this exists
Customers do not want to browse a large catalog and figure everything out themselves. They want to be given a finished outfit direction with confidence.

The AI Stylist should become a differentiating feature for Yoora Sarah by:
- increasing conversion through clear outfit recommendations
- increasing AOV through natural bundling
- creating a premium brand experience that feels guided, not mechanical
- turning product exploration into a styling studio workflow

## Current implementation baseline
The current codebase already includes a strong V1 foundation.

### Verified existing capabilities
- Stylist entry in the navbar:
  - `apps/web/components/layout/header.tsx`
  - `apps/web/components/layout/mobile-menu.tsx`
- Dedicated stylist page:
  - `apps/web/app/stylist/page.tsx`
- Chat-based stylist workflow:
  - `apps/web/app/api/v1/ai/stylist/chat/route.ts`
  - `services/api/app/api/v1/endpoints/ai_stylist.py`
  - `services/api/app/services/ai_stylist_service.py`
- Outfit composer and templates:
  - `apps/web/components/outfit-composer.tsx`
  - `services/api/app/api/v1/endpoints/ai_stylist.py`
- Image upload and image-aware styling:
  - `apps/web/app/stylist/page.tsx`
  - `services/api/app/api/v1/endpoints/ai_stylist.py`
  - `services/api/app/services/ai_stylist_service.py`
- Product-to-model workflow:
  - `apps/web/components/stylist/product-to-model-studio.tsx`
  - `services/api/app/api/v1/endpoints/ai_stylist.py`
  - `services/api/app/services/ai_stylist_service.py`

### Current limitations
- the studio still feels like several powerful modules living side-by-side, not one orchestrated premium workflow
- session context exists, but mode separation is not yet explicit enough
- product-to-model feels secondary instead of first-class
- image understanding influences outputs, but not strongly enough to feel decisive
- the existing stylist spec is outdated and no longer reflects the actual implementation or current product direction

## Product direction
The target experience is **Balanced Premium**.

That means:
- luxury in tone, not intimidating
- elegant in structure, not overloaded
- professional in output, not experimental for its own sake
- clear enough for normal customers, not only fashion insiders

Wearview is used as a workflow reference, not a visual clone. The useful lessons are:
- studio-mode separation
- step-based task flow
- premium tool clarity
- strong output focus

The Yoora Sarah studio must remain customer-friendly and fashion-led, not feel like a production dashboard.

## Primary design decision
Build **one private styling studio** at `/stylist` with **four studio modes** that all share one session context.

### Studio modes
1. **Start with a Brief**
2. **Build My Outfit**
3. **Match My Item**
4. **Product to Model**

These are not separate products. They are separate entry paths into the same styling session.

## Information architecture

### Entry point
- Homepage remains visually unchanged in structure.
- `/stylist` is accessed from the navbar and mobile menu.
- No new below-the-fold homepage sections are added.

### `/stylist` role
`/stylist` is the private premium workspace for customer styling.
It is not a marketing page and not a generic catalog page.
It is a task-oriented studio for generating finished styling directions.

### Page structure
The studio keeps a three-column mental model because the current implementation already supports it well.

#### 1. Studio Brief Rail
Purpose:
- mode selection
- initial brief capture
- quick-start prompts
- template seeds
- item upload entry

#### 2. Result Board
Purpose:
- hero look display
- alternative looks
- reasoning summary
- image-based compatibility notes
- product-to-model preview when relevant

This is the visual center of the experience.

#### 3. Refinement Rail
Purpose:
- live stylist conversation
- quick follow-up prompts
- session memory summary
- compact refinements without restarting the workflow

## Mode-by-mode user flows

### Mode 1: Start with a Brief
Best for customers who know the occasion, color, mood, or budget.

Flow:
1. Customer enters a short brief.
2. System interprets occasion, palette, tone, and budget cues.
3. System generates:
   - 1 hero look
   - 2 alternative looks
   - concise stylist reasoning
4. Customer refines using follow-up prompts or free text.

Primary output:
- a ready-to-understand outfit direction

Business effect:
- faster decision-making
- reduced browsing fatigue

### Mode 2: Build My Outfit
Best for customers who want a structured full outfit from catalog inventory.

Flow:
1. Customer selects or starts from a seed template.
2. System chooses a base piece.
3. System composes the outfit across:
   - main piece
   - headwear
   - accent products
4. Result board shows:
   - hero look
   - alternatives
   - total direction
5. Customer refines formality, softness, boldness, or price direction.

Primary output:
- a bundled outfit recommendation

Business effect:
- stronger bundling
- higher average order value

### Mode 3: Match My Item
Best for customers who already own an item and want the catalog matched around it.

Flow:
1. Customer uploads a personal item like a bag or shoes.
2. System analyzes image cues and supporting text.
3. System generates a compatibility direction.
4. System produces:
   - hero look matched to the uploaded item
   - alternatives with slight tonal or price variation
5. Customer refines further.

Primary output:
- a catalog look aligned to a real owned item

Business effect:
- stronger personalization
- more premium perceived service

### Mode 4: Product to Model
Best for customers who want a more aspirational visual preview of a specific product.

Flow:
1. Customer selects a product.
2. Customer selects visual direction and background.
3. System generates a product-to-model preview.
4. The result is shown inside the result board as a first-class output.
5. Customer can continue into styling with that generated hero piece.

Primary output:
- a visual product-on-model preview connected to styling

Business effect:
- aspirational visualization
- stronger confidence in hero product selection

## Session orchestration

### Core rule
All four modes share one active styling session.
The session should not reset just because the user changes workflow.

### Session state should preserve
- current user brief
- current uploaded item reference
- current hero look
- current alternative looks
- compatibility notes
- generated visual preview state
- refinement history

### Example session sequence
A customer should be able to:
1. start with a brief
2. upload a black bag
3. receive a matched hero look
4. ask for a more formal alternative
5. generate product-to-model for the main piece
6. continue refining without losing the prior context

That is the defining V2 behavior.

## Result hierarchy
The result board should always prioritize outputs in this order:
1. Hero Look
2. Alternative Looks
3. Compatibility / Stylist Direction
4. Refinement Prompts
5. Product-to-Model Preview when active

This prevents the interface from collapsing into a chat log.
The customer should always feel that the main outcome is a styled result, not a conversation transcript.

## UX and content principles

### What the user should feel
- guided
- reassured
- styled by a professional
- not buried in options

### What the user should not feel
- like they are configuring an AI tool
- like they are operating a design dashboard
- like they must understand the catalog structure first

### Copy style
Use concise premium copy:
- calm
- confident
- service-oriented
- low-jargon
- fashion-aware but not pretentious

## Backend direction
This spec does not require replacing the current backend foundations. It upgrades how they are orchestrated.

### Keep
- existing stylist endpoints
- existing outfit templates
- existing image-aware chat flow
- existing product-to-model provider abstraction
- existing catalog grounding approach as the first production-safe layer

### Upgrade
#### 1. Session-aware orchestration
The backend should become more explicit about current studio mode and session context so refinements feel coherent.

#### 2. Stronger catalog intelligence
Improve consistency of:
- style metadata
- ranking logic
- reasoning generation
- alternative look selection

#### 3. Better image influence
Image analysis should influence product ranking and explanation more strongly, not just append a note.

#### 4. First-class product-to-model flow
Product-to-model should participate in the same session orchestration instead of feeling like a detached side tool.

## Non-goals for this phase
These are intentionally out of scope for V2 phase 1.

- changing the homepage into a long scrolling landing page
- moving stylist complexity onto the homepage
- building full-body virtual try-on simulation
- introducing a complex multi-page studio before the single `/stylist` experience is coherent
- replacing all current heuristics with embeddings and vector retrieval immediately

Those may become later phases, but they are not required to ship a strong premium V2.

## Documentation cleanup stream
The repo currently contains multiple markdown files that are outdated, contradictory, or no longer useful.

### Cleanup policy
Each `.md` file will be classified as one of:
- **Keep**
- **Update**
- **Delete**

### Delete only when all are true
A markdown file should be deleted only if it is:
- obsolete in relation to the active implementation
- misleading if left in place
- not useful as historical or strategic context
- not the best place to preserve decisions

### Update instead of delete when
- the file is conceptually important but stale
- the direction is still valid even if the details changed
- the document is a primary repo entry point like `README.md`

### High-confidence cleanup targets already identified
#### Update
- `README.md`
- `docs/superpowers/specs/2026-04-22-ai-stylist-premium-design.md`
- `docs/specs/2026-04-21-yoora-sarah-ecommerce-design.md`

#### Review for delete or archive
- root-level ad hoc snapshots and visual scratch markdown files such as:
  - `playwright-home-snapshot.md`
  - `playwright-home-navbar-v3.md`
  - `playwright-header-dropdown-snapshot.md`
  - `portal-login-1440.md`
  - `portal-login-390.md`
  - `portal-login-postfix-390.md`
  - `apps/web/home-navbar-scene-desktop.md`
  - `apps/web/home-navbar-scene-mobile.md`
  - `apps/web/home-navbar-scene-desktop-current.md`
  - `apps/web/home-navbar-scene-desktop-deep.md`
  - `apps/web/home-navbar-overlay-collections.md`

These appear more like transient design or QA artifacts than durable project docs, but they must still be confirmed against actual usage before deletion.

### Explicit rule
Never mass-delete all old docs. Cleanup must be selective and justified file-by-file.

## Acceptance criteria
The design is successful when the implemented V2 provides:

1. a premium `/stylist` studio without altering the homepage structure
2. four clear studio modes that still share one session context
3. a result board that consistently foregrounds styled outputs
4. a refinement rail that supports iterative improvement without resetting
5. product-to-model elevated to a first-class studio workflow
6. image-based item matching that clearly affects recommendations
7. documentation cleanup that removes only truly obsolete `.md` files and updates important entry docs

## Implementation phases

### Phase 1: Studio shell unification
- lock the four-mode structure
- restructure the `/stylist` shell around one premium session model
- keep result board central
- keep refinement rail compact and useful

### Phase 2: Intelligence upgrade
- improve session-aware orchestration
- strengthen look ranking and reasoning
- make image analysis more decisive in recommendations

### Phase 3: Product-to-model promotion
- elevate product-to-model to a first-class mode
- connect visual generation results back into the styling workflow

### Phase 4: Documentation cleanup
- audit all repo markdown files
- classify keep / update / delete
- update primary docs
- delete only confirmed obsolete files

## Key design decision summary
The best path is not to build a new separate AI product. The best path is to unify the real capabilities Yoora Sarah already has into one coherent private styling studio.

That gives the brand something distinctive, premium, and practical without breaking the homepage guardrails or overreaching into speculative complexity.
