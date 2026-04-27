# AI Stylist Premium UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the AI Stylist experience so it feels premium, professional, elegant, and easier to use with less visible text.

**Architecture:** Keep the existing data flow and APIs unchanged, and focus the work on presentation, hierarchy, layout, and copy density. The main stylist page remains the orchestration layer for chat, quick actions, result board, and refinement flow, while the product-to-model studio keeps its current generation logic but gets a tighter premium workspace presentation.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, lucide-react

---

## File Structure

- Modify: `apps/web/app/stylist/page.tsx`
  - Restyle the AI Stylist landing/workspace layout.
  - Reduce verbose copy in welcome, loading, empty states, and quick actions.
  - Improve visual hierarchy across chat, result board, and refinement rail.
- Modify: `apps/web/components/stylist/product-to-model-studio.tsx`
  - Simplify the studio form layout.
  - Remove technical/helper noise from the UI.
  - Promote the primary CTA and improve selected product/output presentation.
- Verify: `apps/web/app/stylist/layout.tsx`
  - Confirm metadata still matches the premium positioning.
- Verify in browser: `http://localhost:3000/stylist`
  - Check golden path, empty state, quick actions, chat flow, product-to-model panel, and result visual hierarchy.

### Task 1: Refresh the main AI Stylist workspace

**Files:**
- Modify: `apps/web/app/stylist/page.tsx`
- Verify: `apps/web/app/stylist/layout.tsx`
- Browser QA: `http://localhost:3000/stylist`

- [ ] **Step 1: Tighten the welcome copy and quick-entry tone**

Update the main welcome and helper copy so it is shorter and more premium.

Replace the current welcome string near `apps/web/app/stylist/page.tsx:59` with:

```ts
const STYLIST_WELCOME = `Welcome to AI Stylist Yoora Sarah.

Share the occasion, mood, or item you want to style. I will return a refined hero look with curated alternatives.`;
```

Replace the quick action labels and prompts near `apps/web/app/stylist/page.tsx:63` with:

```ts
const quickActions = [
  {
    label: "Evening Guest",
    mode: "brief" as const,
    prompt: "Create an elegant guest look in a soft neutral tone that feels refined and ready to wear.",
  },
  {
    label: "Office Edit",
    mode: "outfit" as const,
    prompt: "Build a polished office look that feels premium, modern, and composed.",
  },
  {
    label: "Match My Bag",
    mode: "match-item" as const,
    prompt: "I uploaded a black bag. Build a refined look around it with balanced proportions.",
  },
  {
    label: "Quiet Luxury",
    mode: "brief" as const,
    prompt: "Create a quiet luxury outfit that feels elevated, minimal, and effortless.",
  },
];
```

- [ ] **Step 2: Tighten the empty-state support copy**

Replace the arrays near `apps/web/app/stylist/page.tsx:89` and `apps/web/app/stylist/page.tsx:95` with shorter premium cues:

```ts
const defaultFollowUpPrompts = [
  "Make it sharper for evening.",
  "Refine it around my black accessories.",
  "Create a softer budget-conscious version.",
];

const emptyRailChecklist = [
  "Start with occasion, tone, or budget.",
  "Upload one personal item for a more precise direction.",
  "Refine the first result without starting over.",
];
```

Replace `studioSignals` near `apps/web/app/stylist/page.tsx:101` with:

```ts
const studioSignals = [
  { title: "Brief", copy: "Occasion, mood, budget" },
  { title: "Curated", copy: "Hero look + alternatives" },
  { title: "Refine", copy: "Adjust without reset" },
];
```

- [ ] **Step 3: Simplify the result-board empty state and make it feel more premium**

Inside `ResultBoardEmpty` in `apps/web/app/stylist/page.tsx`, keep the structure but shorten text and increase hierarchy. Update the key visible strings to:

```tsx
<p className="premium-kicker">Curated Result Board</p>
<h2 className="mt-3 font-display text-[2rem] leading-[0.95] tracking-[-0.05em] text-[#241915] md:text-[2.7rem]">
  Your next look starts here.
</h2>
```

Replace the hero card text with:

```tsx
<p className="text-[0.66rem] uppercase tracking-[0.22em] text-[#8a6c5f]">Hero Look</p>
<h3 className="mt-3 font-display text-[1.65rem] leading-none tracking-[-0.04em] text-[#241915]">
  Waiting for your brief.
</h3>
```

Replace the alternative card copy with:

```tsx
<p className="mt-2 text-sm leading-6 text-[#6f5b52]">Reserved for fast alternatives.</p>
```

Replace the section label `Start With` with `Quick Start`.

- [ ] **Step 4: Make the chat/loading UI feel quieter and more premium**

In `ChatLoadingState` inside `apps/web/app/stylist/page.tsx`, replace the visible copy with:

```tsx
<p className="text-[0.66rem] uppercase tracking-[0.22em] text-[#8a6c5f]">
  Stylist at Work
</p>
<p className="mt-1 text-[0.9rem] text-[#241915]">
  Building your look.
</p>
```

Replace the loading checklist array with:

```tsx
{[
  "Selecting anchor pieces.",
  "Balancing tone and silhouette.",
  "Preparing refined alternatives.",
].map((step) => (
```

In `ChatBubble`, update the labels:

```tsx
{isUser ? "Your Brief" : "Stylist Edit"}
```

and reduce the image reading helper text to:

```tsx
{message.analysis.compatibilityNote ??
  "Reference captured for a more aligned direction."}
```

- [ ] **Step 5: Upgrade layout spacing and surface hierarchy on the main page**

In the main `StylistPage` return block, apply these visual rules wherever the current layout defines the outer section, cards, and columns:

```tsx
- Increase outer section spacing by one step on desktop (`gap-6` -> `gap-8`, `p-5` -> `p-6`/`p-7` where already present).
- Prefer larger rounded containers for primary surfaces (`rounded-[1.9rem]` or `rounded-[2rem]`).
- Keep borders subtle (`border-[rgba(156,131,117,0.10-0.14)]`) and use slightly stronger shadow only on primary result surfaces.
- Keep helper paragraphs to one short sentence max in each visible block.
```

Apply the changes directly in `apps/web/app/stylist/page.tsx` without changing any fetch, state, mode, or API logic.

- [ ] **Step 6: Run the dev server and verify the stylist page loads**

Run:

```bash
npm --prefix apps/web run dev
```

Expected:

```text
▲ Next.js 16.x.x
- Local:         http://localhost:3000
✓ Ready
```

- [ ] **Step 7: QA the main stylist workspace in the browser**

Open `http://localhost:3000/stylist` and verify:

```text
- The first screen feels cleaner and less text-heavy.
- Quick actions are visible and easy to scan.
- The result board has stronger visual priority than helper copy.
- Chat bubbles feel premium and readable.
- Empty states no longer look like internal tooling copy.
```

- [ ] **Step 8: Commit the workspace refresh**

```bash
git add apps/web/app/stylist/page.tsx apps/web/app/stylist/layout.tsx
git commit -m "refine AI stylist workspace presentation"
```

### Task 2: Simplify and elevate the Product-to-Model studio panel

**Files:**
- Modify: `apps/web/components/stylist/product-to-model-studio.tsx`
- Browser QA: `http://localhost:3000/stylist`

- [ ] **Step 1: Remove technical UI copy and shorten the header**

In `apps/web/components/stylist/product-to-model-studio.tsx`, replace the current header copy near lines `205-220` with:

```tsx
<p className="text-[0.66rem] uppercase tracking-[0.22em] text-[#8a6c5f]">
  Product to Model
</p>
<h3 className="mt-2 font-display text-[1.65rem] leading-[0.96] tracking-[-0.04em] text-[#241915]">
  Studio preview from catalog.
</h3>
```

Replace the badge text:

```tsx
Preview
```

Delete the explanatory paragraph about provider support entirely.

- [ ] **Step 2: Reduce form noise and make the form feel more premium**

Keep the same fields and handlers, but tighten the copy and spacing:

```tsx
- Rename `Extra Prompt` to `Creative Direction`.
- Update the placeholder to: "Optional notes for mood, framing, or finish."
- Keep the selects, but group them under cleaner spacing (`mt-5`, `gap-3`, `sm:grid-cols-2`).
- Increase textarea/card radius slightly to match the premium workspace.
```

Use these exact labels:

```tsx
Category
Product
Direction
Background
Creative Direction
```

- [ ] **Step 3: Upgrade the selected product summary card**

Keep the selected product card logic, but make the card read like a premium summary. Update the visible text to:

```tsx
<p className="text-[0.62rem] uppercase tracking-[0.18em] text-[#8a6c5f]">
  Selected Piece
</p>
```

and keep only:

```tsx
- product name
- formatted price
```

Do not add extra descriptive text.

- [ ] **Step 4: Make the primary CTA more confident and concise**

Replace the button copy near `apps/web/components/stylist/product-to-model-studio.tsx:326` with:

```tsx
{isGenerating ? (
  <>
    <Loader2 className="h-4 w-4 animate-spin" />
    Creating Preview
  </>
) : (
  <>
    Create Preview
    <Sparkles className="h-4 w-4" />
  </>
)}
```

Keep the same disabled logic and click handler.

- [ ] **Step 5: Redesign the output card to feel like a premium result surface**

In the result block near `apps/web/components/stylist/product-to-model-studio.tsx:345`, keep all existing logic, but update the visible text and layout rules:

```tsx
- Change `Generated Output` to `Studio Output`
- Keep provider and status chips, but make them secondary metadata only
- Keep the image large and edge-to-edge inside a softly tinted container
- Replace the long helper note fallback with: "Your preview appears here once ready."
- Keep model/size/quality pills only when present
- Keep the error message only when present
```

- [ ] **Step 6: Preserve behavior while tightening surfaces**

Do not change any of the following:

```tsx
- `useEffect` product loading behavior
- polling behavior for `predictionId`
- POST payload for generation
- error handling branches
- the selected product lookup
```

Only restyle, regroup, rename visible labels, and reduce copy density.

- [ ] **Step 7: Verify the Product-to-Model panel in the browser**

Open `http://localhost:3000/stylist` and verify:

```text
- The Product-to-Model panel looks like part of a premium suite, not a dev utility.
- The form is easier to scan.
- The CTA is the strongest action in the panel.
- The output card feels visual-first.
- There is no exposed technical provider explanation in the main visible UI.
```

- [ ] **Step 8: Commit the studio refresh**

```bash
git add apps/web/components/stylist/product-to-model-studio.tsx
git commit -m "polish AI stylist product studio UI"
```

### Task 3: Final verification and polish pass

**Files:**
- Modify if needed: `apps/web/app/stylist/page.tsx`
- Modify if needed: `apps/web/components/stylist/product-to-model-studio.tsx`
- Browser QA: `http://localhost:3000/stylist`

- [ ] **Step 1: Run a final visual QA pass**

Check the full page in the browser and confirm:

```text
- The page feels premium and professional at first glance.
- Text density is clearly lower than before.
- The user can understand where to start in under 5 seconds.
- The result surfaces dominate over helper content.
- No section reads like internal MVP or provider-debug UI.
```

- [ ] **Step 2: Run lint on changed files**

Run:

```bash
npm --prefix apps/web run lint
```

Expected:

```text
No errors for apps/web/app/stylist/page.tsx and apps/web/components/stylist/product-to-model-studio.tsx
```

- [ ] **Step 3: Make only minimal follow-up tweaks if QA exposes visual imbalance**

Allowed fixes:

```tsx
- spacing adjustments
- one-line copy tightening
- chip/button hierarchy adjustments
- card shadow/border tuning
```

Do not add new features or new UI sections.

- [ ] **Step 4: Commit the final polish**

```bash
git add apps/web/app/stylist/page.tsx apps/web/components/stylist/product-to-model-studio.tsx
git commit -m "finalize premium AI stylist UI refresh"
```

## Self-Review

- Spec coverage: covers landing/workspace hierarchy, reduced text density, premium result-board presentation, simplified chat surfaces, and a cleaner Product-to-Model studio.
- Placeholder scan: no TODO/TBD placeholders remain.
- Type consistency: all tasks preserve existing React state, modes, fetch APIs, and existing component boundaries.
