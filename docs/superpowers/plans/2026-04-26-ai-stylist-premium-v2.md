# AI Stylist Premium V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `/stylist` into a unified premium studio with four explicit modes, stronger session-aware styling orchestration, first-class product-to-model flow, and a verified markdown cleanup stream.

**Architecture:** Keep the existing `/stylist` page, backend stylist service, and product-to-model provider abstraction, but restructure the studio around a single shared session model. The frontend becomes mode-aware and result-first, while the backend becomes explicit about mode, session context, and image/product-to-model participation in the same workflow. Documentation cleanup is handled as a separate audited stream with keep/update/delete classification before any deletions.

**Tech Stack:** Next.js App Router, React client components, TypeScript, FastAPI, Pydantic, existing catalog store, existing Gemini/OpenAI/Replicate product-to-model providers, Playwright/manual QA for UI verification.

---

## File structure map

### Frontend files to modify
- `apps/web/app/stylist/page.tsx`
  - Current all-in-one studio page. Will be slimmed into a mode-aware shell that orchestrates dedicated subcomponents.
- `apps/web/components/outfit-composer.tsx`
  - Existing seed/template workflow. Will be adapted to fit explicit mode-driven studio behavior.
- `apps/web/components/stylist/product-to-model-studio.tsx`
  - Existing product-to-model module. Will be elevated from side-module to first-class studio mode panel.
- `apps/web/components/layout/header.tsx`
  - Keep navbar discoverability intact. Only copy/entry refinements if needed, no homepage structure changes.
- `apps/web/components/layout/mobile-menu.tsx`
  - Keep mobile discoverability aligned with navbar-only constraint.

### Frontend files to create
- `apps/web/components/stylist/studio-mode-switcher.tsx`
  - One responsibility: render four mode entries and active state.
- `apps/web/components/stylist/studio-brief-panel.tsx`
  - One responsibility: render brief entry, quick starts, seed mode entry, and upload affordances.
- `apps/web/components/stylist/studio-result-board.tsx`
  - One responsibility: render hero look, alternatives, compatibility lens, and product-to-model preview in one result-first surface.
- `apps/web/components/stylist/studio-refinement-rail.tsx`
  - One responsibility: show compact conversation, follow-up prompts, and refinement input.
- `apps/web/components/stylist/stylist-session.ts`
  - Shared frontend types and small pure helpers for mode/session state.

### Backend files to modify
- `services/api/app/api/v1/endpoints/ai_stylist.py`
  - Extend request/response models to include mode/session-oriented fields without breaking the current flow.
- `services/api/app/services/ai_stylist_service.py`
  - Central orchestration upgrades: explicit studio modes, session-aware refinement behavior, stronger image influence, product-to-model handoff metadata.

### Documentation files to modify
- `README.md`
  - Replace stale scaffold-era structure and commands with the actual monorepo reality.
- `docs/superpowers/specs/2026-04-22-ai-stylist-premium-design.md`
  - Archive or replace with a short note pointing to the V2 spec if we keep it.
- `docs/specs/2026-04-21-yoora-sarah-ecommerce-design.md`
  - Update homepage/stylist descriptions so they match the actual implementation.

### Documentation files to review for deletion
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

### Validation artifacts
- Use Playwright MCP on `/stylist`
- Use browser snapshots to verify no homepage hero structural regression
- Use targeted API requests or existing UI to verify mode behavior and product-to-model flow

---

### Task 1: Lock markdown cleanup inventory before code changes

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-04-22-ai-stylist-premium-design.md`
- Modify: `docs/specs/2026-04-21-yoora-sarah-ecommerce-design.md`
- Review: the ad hoc snapshot markdown files listed above
- Create: `docs/superpowers/plans/2026-04-26-markdown-cleanup-inventory.md`

- [ ] **Step 1: Write the failing inventory document test as a checklist expectation**

```md
# Markdown Cleanup Inventory

## Required sections
- Keep
- Update
- Delete

## Required rule
- Every file in Delete must include a one-line reason why it is obsolete in the active implementation.
- Every file in Update must include the active file(s) it contradicts.
- README.md must be in Update.
```

- [ ] **Step 2: Create the inventory document with initial classifications**

```md
# Markdown Cleanup Inventory

## Keep
- `docs/superpowers/specs/2026-04-26-ai-stylist-premium-v2-design.md` — active approved direction for stylist V2
- `docs/specs/2026-04-22-yoora-sarah-storefront-contract-foundation.md` — still aligned with active storefront/API contract work
- `docs/specs/2026-04-22-yoora-sarah-commerce-schema-foundation.md` — still aligned with active commerce schema work

## Update
- `README.md` — still references `sdlc/` and omits active `apps/web` storefront reality
- `docs/superpowers/specs/2026-04-22-ai-stylist-premium-design.md` — stale relative to active `/stylist` implementation
- `docs/specs/2026-04-21-yoora-sarah-ecommerce-design.md` — homepage and route assumptions do not match active storefront

## Delete
- `playwright-home-snapshot.md` — transient inspection artifact, not a durable project doc
- `playwright-home-navbar-v3.md` — transient inspection artifact, not a durable project doc
- `playwright-header-dropdown-snapshot.md` — transient inspection artifact, not a durable project doc
- `portal-login-1440.md` — transient UI scratch artifact
- `portal-login-390.md` — transient UI scratch artifact
- `portal-login-postfix-390.md` — transient UI scratch artifact
- `apps/web/home-navbar-scene-desktop.md` — transient visual scratch artifact
- `apps/web/home-navbar-scene-mobile.md` — transient visual scratch artifact
- `apps/web/home-navbar-scene-desktop-current.md` — transient visual scratch artifact
- `apps/web/home-navbar-scene-desktop-deep.md` — transient visual scratch artifact
- `apps/web/home-navbar-overlay-collections.md` — transient visual scratch artifact
```

- [ ] **Step 3: Verify the inventory is internally consistent**

Run: `python - <<'PY'
from pathlib import Path
p = Path('docs/superpowers/plans/2026-04-26-markdown-cleanup-inventory.md')
text = p.read_text(encoding='utf-8')
required = ['## Keep', '## Update', '## Delete', 'README.md']
missing = [item for item in required if item not in text]
print('OK' if not missing else f'MISSING: {missing}')
PY`
Expected: `OK`

- [ ] **Step 4: Commit the inventory before making deletions**

```bash
git add docs/superpowers/plans/2026-04-26-markdown-cleanup-inventory.md
git commit -m "docs: add markdown cleanup inventory"
```

---

### Task 2: Refactor `/stylist` into an explicit mode-aware studio shell

**Files:**
- Modify: `apps/web/app/stylist/page.tsx`
- Create: `apps/web/components/stylist/stylist-session.ts`
- Create: `apps/web/components/stylist/studio-mode-switcher.tsx`
- Create: `apps/web/components/stylist/studio-brief-panel.tsx`
- Create: `apps/web/components/stylist/studio-result-board.tsx`
- Create: `apps/web/components/stylist/studio-refinement-rail.tsx`

- [ ] **Step 1: Write the failing frontend type scaffold**

```ts
export type StylistStudioMode =
  | 'brief'
  | 'outfit'
  | 'match-item'
  | 'product-to-model';

export type StylistSessionState = {
  activeMode: StylistStudioMode;
  activeLookIndex: number;
  imageFile: string | null;
  imageName: string | null;
};
```

- [ ] **Step 2: Create shared stylist session types**

Create `apps/web/components/stylist/stylist-session.ts`:

```ts
export type StylistStudioMode =
  | 'brief'
  | 'outfit'
  | 'match-item'
  | 'product-to-model';

export type StylistProduct = {
  id?: string;
  name: string;
  category: string;
  categoryLabel?: string;
  price: number;
  image: string;
  slug?: string;
  role?: string;
  reason?: string;
};

export type StylistLook = {
  id: string;
  title: string;
  note: string;
  occasion?: string;
  totalPrice?: number;
  products: StylistProduct[];
};

export type ImageAnalysis = {
  itemType?: string;
  dominantColors?: string[];
  styleDirection?: string;
  compatibilityNote?: string;
};

export type StylistMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  products?: StylistProduct[];
  looks?: StylistLook[];
  analysis?: ImageAnalysis | null;
  followUpPrompts?: string[];
};

export type StylistSessionState = {
  activeMode: StylistStudioMode;
  activeLookIndex: number;
  imageFile: string | null;
  imageName: string | null;
};

export const STUDIO_MODE_LABELS: Record<StylistStudioMode, string> = {
  brief: 'Start with a Brief',
  outfit: 'Build My Outfit',
  'match-item': 'Match My Item',
  'product-to-model': 'Product to Model',
};
```

- [ ] **Step 3: Create the mode switcher component**

Create `apps/web/components/stylist/studio-mode-switcher.tsx`:

```tsx
'use client';

import { STUDIO_MODE_LABELS, type StylistStudioMode } from './stylist-session';

const MODE_ORDER: StylistStudioMode[] = ['brief', 'outfit', 'match-item', 'product-to-model'];

export function StudioModeSwitcher({
  activeMode,
  onModeChange,
}: {
  activeMode: StylistStudioMode;
  onModeChange: (mode: StylistStudioMode) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {MODE_ORDER.map((mode) => {
        const isActive = mode === activeMode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onModeChange(mode)}
            className={`rounded-[1.15rem] border px-4 py-3 text-left transition ${
              isActive
                ? 'border-[rgba(92,67,55,0.24)] bg-white shadow-[0_14px_30px_rgba(58,39,28,0.06)]'
                : 'border-[rgba(156,131,117,0.12)] bg-[rgba(255,252,248,0.72)] hover:border-[rgba(92,67,55,0.2)] hover:bg-white'
            }`}
          >
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[#8a6c5f]">Studio Mode</p>
            <p className="mt-2 text-[0.88rem] font-medium text-[#241915]">{STUDIO_MODE_LABELS[mode]}</p>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Create the brief panel component**

Create `apps/web/components/stylist/studio-brief-panel.tsx` with extracted rendering for:
- mode switcher
- brief entry
- quick starts
- item upload summary
- outfit composer mount point
- product-to-model mount point

Use this skeleton to start:

```tsx
'use client';

import { ArrowRight, Paperclip, Wand2, X } from 'lucide-react';
import { StudioModeSwitcher } from './studio-mode-switcher';
import { OutfitComposer } from '@/components/outfit-composer';
import { ProductToModelStudio } from '@/components/stylist/product-to-model-studio';
import type { StylistStudioMode } from './stylist-session';

export function StudioBriefPanel(props: {
  activeMode: StylistStudioMode;
  onModeChange: (mode: StylistStudioMode) => void;
  isEmptyConversation: boolean;
  input: string;
  setInput: (value: string) => void;
  imageFile: string | null;
  imageName: string | null;
  fileError: string | null;
  isLoading: boolean;
  onSend: () => void;
  onQuickAction: (prompt: string) => void;
  onUploadClick: () => void;
  onClearImage: () => void;
  briefInputRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return <aside className="premium-panel order-1 self-start rounded-[1.9rem] p-4 md:p-5 lg:p-6">...</aside>;
}
```

- [ ] **Step 5: Create the result board component**

Create `apps/web/components/stylist/studio-result-board.tsx` with extracted rendering for:
- empty state
- hero look
- compatibility lens
- alternatives
- optional product-to-model hero preview block

Use this skeleton:

```tsx
'use client';

import Link from 'next/link';
import { Image as ImageIcon } from 'lucide-react';
import type { StylistLook, StylistMessage, StylistProduct } from './stylist-session';

export function StudioResultBoard(props: {
  isLoading: boolean;
  latestStylistMessage?: StylistMessage;
  activeLook: StylistLook | null;
  activeProducts: StylistProduct[];
  alternativeLooks: StylistLook[];
  activeLookIndex: number;
  setActiveLookIndex: (index: number) => void;
  onQuickAction: (prompt: string) => void;
  productToModelPreview?: { imageUrl?: string | null; prompt?: string } | null;
}) {
  return <section className="order-2 self-start">...</section>;
}
```

- [ ] **Step 6: Create the refinement rail component**

Create `apps/web/components/stylist/studio-refinement-rail.tsx` with extracted rendering for:
- compact chat history
- follow-up prompts
- refinement input
- loading state

Use this skeleton:

```tsx
'use client';

import { Loader2, Paperclip, Send } from 'lucide-react';
import type { StylistMessage } from './stylist-session';

export function StudioRefinementRail(props: {
  isEmptyConversation: boolean;
  sessionSummary: string;
  visibleMessages: StylistMessage[];
  isLoading: boolean;
  input: string;
  setInput: (value: string) => void;
  imageFile: string | null;
  onSend: () => void;
  onQuickAction: (prompt: string) => void;
  onUploadClick: () => void;
  followUpPrompts: string[];
  chatInputRef: React.RefObject<HTMLInputElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  return <aside className="premium-panel order-3 flex flex-col self-start rounded-[1.9rem] p-4 md:p-5 lg:p-6">...</aside>;
}
```

- [ ] **Step 7: Replace the monolith in `page.tsx` with the new shell composition**

Update `apps/web/app/stylist/page.tsx` imports:

```tsx
import {
  type ImageAnalysis,
  type StylistLook,
  type StylistMessage,
  type StylistProduct,
  type StylistStudioMode,
} from '@/components/stylist/stylist-session';
import { StudioBriefPanel } from '@/components/stylist/studio-brief-panel';
import { StudioResultBoard } from '@/components/stylist/studio-result-board';
import { StudioRefinementRail } from '@/components/stylist/studio-refinement-rail';
```

Add state near the top:

```tsx
const [activeMode, setActiveMode] = useState<StylistStudioMode>('brief');
const [productToModelPreview, setProductToModelPreview] = useState<{
  imageUrl?: string | null;
  prompt?: string;
} | null>(null);
```

Replace the three inline column blocks with:

```tsx
<section className="page-reveal-delay mt-4 grid gap-4 xl:grid-cols-[0.96fr_1.36fr_0.9fr] xl:items-start">
  <StudioBriefPanel
    activeMode={activeMode}
    onModeChange={setActiveMode}
    isEmptyConversation={isEmptyConversation}
    input={input}
    setInput={setInput}
    imageFile={imageFile}
    imageName={imageName}
    fileError={fileError}
    isLoading={isLoading}
    onSend={() => void handleSend()}
    onQuickAction={handleQuickAction}
    onUploadClick={() => fileInputRef.current?.click()}
    onClearImage={() => {
      setImageFile(null);
      setImageName(null);
    }}
    briefInputRef={briefInputRef}
  />
  <StudioResultBoard
    isLoading={isLoading}
    latestStylistMessage={latestStylistMessage}
    activeLook={activeLook}
    activeProducts={activeProducts}
    alternativeLooks={alternativeLooks}
    activeLookIndex={activeLookIndex}
    setActiveLookIndex={setActiveLookIndex}
    onQuickAction={handleQuickAction}
    productToModelPreview={productToModelPreview}
  />
  <StudioRefinementRail
    isEmptyConversation={isEmptyConversation}
    sessionSummary={sessionSummary}
    visibleMessages={visibleMessages}
    isLoading={isLoading}
    input={input}
    setInput={setInput}
    imageFile={imageFile}
    onSend={() => void handleSend()}
    onQuickAction={handleQuickAction}
    onUploadClick={() => fileInputRef.current?.click()}
    followUpPrompts={followUpPrompts}
    chatInputRef={chatInputRef}
    messagesEndRef={messagesEndRef}
  />
</section>
```

- [ ] **Step 8: Run typecheck for the stylist shell refactor**

Run: `npm --prefix apps/web run typecheck`
Expected: `0 errors`

- [ ] **Step 9: Commit the shell unification**

```bash
git add apps/web/app/stylist/page.tsx apps/web/components/stylist/stylist-session.ts apps/web/components/stylist/studio-mode-switcher.tsx apps/web/components/stylist/studio-brief-panel.tsx apps/web/components/stylist/studio-result-board.tsx apps/web/components/stylist/studio-refinement-rail.tsx
git commit -m "feat: unify stylist studio shell"
```

---

### Task 3: Make backend chat orchestration explicit about studio modes

**Files:**
- Modify: `services/api/app/api/v1/endpoints/ai_stylist.py`
- Modify: `services/api/app/services/ai_stylist_service.py`

- [ ] **Step 1: Extend the request model with explicit mode**

Add to `ChatRequest` in `services/api/app/api/v1/endpoints/ai_stylist.py`:

```python
class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=3000)
    history: list[dict] | None = None
    image: str | None = None
    mode: str = Field(default="brief", pattern="^(brief|outfit|match-item|product-to-model)$")
```

- [ ] **Step 2: Extend the response model with session metadata**

Add to `ChatResponse` in `services/api/app/api/v1/endpoints/ai_stylist.py`:

```python
class ChatResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    content: str
    products: list[ProductCard] = Field(default_factory=list)
    looks: list[LookCard] = Field(default_factory=list)
    analysis: ImageAnalysisResponse | None = None
    follow_up_prompts: list[str] = Field(
        default_factory=list,
        alias="followUpPrompts",
        serialization_alias="followUpPrompts",
    )
    mode: str = "grounded-stylist"
    active_mode: str = Field(default="brief", alias="activeMode", serialization_alias="activeMode")
    session_summary: str | None = Field(default=None, alias="sessionSummary", serialization_alias="sessionSummary")
```

- [ ] **Step 3: Pass mode into the service**

Change `stylist_chat` in `services/api/app/api/v1/endpoints/ai_stylist.py`:

```python
@router.post("/chat", response_model=ChatResponse)
async def stylist_chat(request: ChatRequest) -> ChatResponse:
    result = ai_stylist_service.build_chat_response(
        message=request.message,
        history=request.history,
        image=request.image,
        mode=request.mode,
    )
    return ChatResponse.model_validate(result)
```

- [ ] **Step 4: Add a mode-normalizer to the service**

Add near the top of `OutfitMatcher`:

```python
    VALID_MODES = {"brief", "outfit", "match-item", "product-to-model"}

    def _normalize_mode(self, mode: str | None) -> str:
        if not mode:
            return "brief"
        normalized = self._normalize(mode).replace(" ", "-")
        if normalized in self.VALID_MODES:
            return normalized
        return "brief"
```

- [ ] **Step 5: Make chat orchestration aware of mode**

Update `build_chat_response` signature and opening:

```python
def build_chat_response(
    self,
    *,
    message: str,
    history: list[dict[str, Any]] | None = None,
    image: str | None = None,
    mode: str = "brief",
) -> dict[str, Any]:
    active_mode = self._normalize_mode(mode)
    contextual_message, prior_context = self._build_conversation_context(
        message=message,
        history=history,
    )
```

- [ ] **Step 6: Add mode-specific system messaging**

Inside `build_chat_response`, after looks are computed, add:

```python
    session_summary = {
        "brief": "Session dimulai dari brief untuk menghasilkan hero look dan alternatif yang siap dipakai.",
        "outfit": "Session difokuskan pada penyusunan outfit lengkap dari katalog Yoora Sarah.",
        "match-item": "Session difokuskan pada pencocokan item referensi pribadi dengan look dari katalog.",
        "product-to-model": "Session difokuskan pada visual hero product dan kelanjutan styling dari produk tersebut.",
    }[active_mode]
```

Then append mode-specific content branches:

```python
    if active_mode == "match-item" and analysis:
        content = (
            "Saya membaca item referensi Anda lebih dulu, lalu menyusun look yang tidak bentrok dengan warna dan arahnya. "
            + content
        )
    elif active_mode == "product-to-model":
        content = (
            "Saya menjaga fokus sesi ini pada hero product agar visual preview dan styling recommendation tetap saling terhubung. "
            + content
        )
    elif active_mode == "outfit":
        content = (
            "Saya menyusun sesi ini sebagai outfit lengkap, bukan rekomendasi produk lepas. "
            + content
        )
```

- [ ] **Step 7: Return the new metadata fields**

At the bottom of `build_chat_response`, return:

```python
    return {
        "content": content,
        "products": primary_products,
        "looks": looks,
        "analysis": analysis,
        "followUpPrompts": self.FOLLOW_UP_PROMPTS,
        "mode": "grounded-stylist",
        "activeMode": active_mode,
        "sessionSummary": session_summary,
    }
```

- [ ] **Step 8: Verify the API module imports and types still pass**

Run: `uv run --directory services/api python -m compileall app`
Expected: compile succeeds without syntax errors

- [ ] **Step 9: Commit the backend mode-orchestration upgrade**

```bash
git add services/api/app/api/v1/endpoints/ai_stylist.py services/api/app/services/ai_stylist_service.py
git commit -m "feat: add studio mode aware stylist orchestration"
```

---

### Task 4: Make image influence more decisive in recommendation ranking

**Files:**
- Modify: `services/api/app/services/ai_stylist_service.py`

- [ ] **Step 1: Add explicit image-analysis scoring helper**

Add inside `OutfitMatcher`:

```python
    def _analysis_boost(
        self,
        *,
        product: CatalogProductDetail,
        analysis: dict[str, Any] | None,
        palette: list[str],
    ) -> int:
        if not analysis:
            return 0

        boost = 0
        dominant_colors = analysis.get("dominantColors") or []
        if dominant_colors and any(
            any(ColorMatcher.are_compatible(color.name, desired) for desired in dominant_colors)
            for color in product.colors
        ):
            boost += 5

        style_direction = analysis.get("styleDirection")
        product_text = self._product_text(product)
        if style_direction == "formal" and any(token in product_text for token in {"formal", "occasionwear", "best"}):
            boost += 2
        if style_direction == "casual" and "daily" in product_text:
            boost += 2
        return boost
```

- [ ] **Step 2: Thread `analysis` into base-candidate scoring**

Update `_base_candidates` signature:

```python
    def _base_candidates(
        self,
        message: str,
        palette: list[str],
        occasion: str,
        style_direction: str,
        analysis: dict[str, Any] | None = None,
    ) -> list[CatalogProductDetail]:
```

Update the `sorted` key:

```python
        scored = sorted(
            candidates,
            key=lambda product: self._score_base_product(
                product,
                message=message,
                palette=palette,
                occasion=occasion,
                style_direction=style_direction,
            ) + self._analysis_boost(product=product, analysis=analysis, palette=palette),
            reverse=True,
        )
```

- [ ] **Step 3: Thread `analysis` into alternative look generation**

Update `get_alternative_looks` signature:

```python
    def get_alternative_looks(
        self,
        *,
        message: str,
        limit: int = 3,
        exclude_slug: str | None = None,
        analysis: dict[str, Any] | None = None,
    ) -> list[dict[str, Any]]:
```

Then update the `_base_candidates` call:

```python
        base_candidates = self._base_candidates(message, palette, occasion, style_direction, analysis)
```

- [ ] **Step 4: Use analysis-driven alternatives in chat response**

Update the `get_alternative_looks` call in `build_chat_response`:

```python
        looks = self.get_alternative_looks(
            message=f"{contextual_message} {' '.join(palette)} {style_direction}",
            limit=3,
            analysis=analysis,
        )
```

- [ ] **Step 5: Strengthen compatibility note when analysis is active**

Replace the `if analysis and analysis.get("compatibilityNote")` branch with:

```python
        if analysis and analysis.get("compatibilityNote"):
            content = (
                f"{content} Saya memakai pembacaan item referensi untuk mengubah arah ranking dan menjaga output tetap selaras. "
                f"{analysis['compatibilityNote']}"
            )
```

- [ ] **Step 6: Verify service compiles after ranking changes**

Run: `uv run --directory services/api python -m compileall app/services/ai_stylist_service.py`
Expected: compile succeeds

- [ ] **Step 7: Commit the stronger image influence update**

```bash
git add services/api/app/services/ai_stylist_service.py
git commit -m "feat: strengthen image-aware stylist ranking"
```

---

### Task 5: Elevate product-to-model to a first-class studio workflow

**Files:**
- Modify: `apps/web/components/stylist/product-to-model-studio.tsx`
- Modify: `apps/web/app/stylist/page.tsx`
- Modify: `apps/web/components/stylist/studio-result-board.tsx`

- [ ] **Step 1: Add a callback contract to product-to-model studio**

Change the prop type in `apps/web/components/stylist/product-to-model-studio.tsx`:

```tsx
type ProductToModelStudioProps = {
  className?: string;
  onGenerated?: (result: ProductToModelResult) => void;
};

export function ProductToModelStudio({ className = "", onGenerated }: ProductToModelStudioProps) {
```

- [ ] **Step 2: Fire the callback after successful generation**

After `setResult(data);` in `handleGenerate`, add:

```tsx
      onGenerated?.(data);
```

Inside the polling effect, after `setResult(data);`, add:

```tsx
        onGenerated?.(data);
```

- [ ] **Step 3: Make the page store the generated preview in shared session state**

In `apps/web/app/stylist/page.tsx`, pass the callback into `ProductToModelStudio`:

```tsx
<ProductToModelStudio
  className="mt-5"
  onGenerated={(result) => {
    setActiveMode('product-to-model');
    setProductToModelPreview({
      imageUrl: result.imageUrl,
      prompt: result.prompt,
    });
  }}
/>
```

- [ ] **Step 4: Add a product-to-model block in the result board**

Inside `StudioResultBoard`, render the preview above or beside the hero look when available:

```tsx
{productToModelPreview?.imageUrl ? (
  <div className="mb-4 rounded-[1.2rem] border border-[rgba(156,131,117,0.12)] bg-[rgba(255,252,248,0.74)] p-4">
    <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[#8a6c5f]">Product to Model</p>
    <div className="mt-3 overflow-hidden rounded-[1rem] bg-[#f4ede7]">
      <img
        src={productToModelPreview.imageUrl}
        alt="Generated product-to-model preview"
        className="w-full object-cover"
      />
    </div>
    {productToModelPreview.prompt ? (
      <p className="mt-3 text-sm leading-6 text-[#6f5b52]">{productToModelPreview.prompt}</p>
    ) : null}
  </div>
) : null}
```

- [ ] **Step 5: Add a continuation CTA from visual preview into styling**

In the same block, add:

```tsx
<button
  type="button"
  onClick={() => onQuickAction('Buatkan outfit lengkap untuk produk ini dengan arah premium yang selaras.')}
  className="premium-button-secondary mt-3 inline-flex min-h-10 px-4 text-[0.64rem] uppercase tracking-[0.18em] transition hover:bg-white"
>
  Continue Styling From This Preview
</button>
```

Update the result-board props to include `onQuickAction` and thread that from `page.tsx`.

- [ ] **Step 6: Verify the product-to-model workflow end-to-end**

Run the app, then verify manually in browser:
- open `/stylist`
- generate one product-to-model preview
- confirm preview appears in the result board
- confirm “Continue Styling From This Preview” seeds the refinement flow

Expected: preview and styling now feel like one workflow, not two separate tools

- [ ] **Step 7: Commit the first-class product-to-model flow**

```bash
git add apps/web/components/stylist/product-to-model-studio.tsx apps/web/app/stylist/page.tsx apps/web/components/stylist/studio-result-board.tsx
git commit -m "feat: connect product-to-model into stylist session"
```

---

### Task 6: Update primary docs to match active implementation

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-04-22-ai-stylist-premium-design.md`
- Modify: `docs/specs/2026-04-21-yoora-sarah-ecommerce-design.md`

- [ ] **Step 1: Replace stale README structure with the actual repo entry points**

Replace the opening and repository layout section of `README.md` with:

```md
# Yoora Sarah Platform Monorepo

This workspace contains the live Yoora Sarah customer storefront, the internal portal, the FastAPI backend, and the database migrations/seeds that support both surfaces.

## Active surfaces

- `apps/web` — customer-facing storefront and AI Stylist studio
- `apps/portal` — internal portal
- `services/api` — FastAPI application backing internal and storefront workflows
- `db/migrations` — executable database migrations
- `db/seeds` — executable seed SQL
- `tools/db` — migration and seed runners

## Repository layout

```text
apps/
  web/           Next.js storefront and AI Stylist studio
  portal/        Next.js internal portal
services/
  api/           FastAPI API
  workers/       background worker scaffold
  ai/            AI service scaffold
packages/
  ...            shared packages
 db/
  migrations/    executable migrations
  seeds/         executable seeds
tools/
  db/            migration and seed runner
```
```

- [ ] **Step 2: Add the current storefront/stylist realities to README**

Append these sections to `README.md`:

```md
## Storefront

The customer storefront lives in `apps/web`.

Notable customer-facing surfaces:
- `/` — single-scene homepage hero with embedded clearance rail
- `/stylist` — private AI Stylist studio
- category and product routes under `apps/web/app`

## AI Stylist

The active AI Stylist experience is centered on `/stylist` and currently includes:
- chat-based styling guidance
- outfit seed templates
- image-aware item matching
- product-to-model generation

The homepage should remain a one-page hero experience. Advanced stylist workflows belong inside `/stylist`, not as added homepage sections.
```

- [ ] **Step 3: Convert the stale 2026-04-22 stylist spec into a pointer doc**

Replace the content of `docs/superpowers/specs/2026-04-22-ai-stylist-premium-design.md` with:

```md
# AI Stylist Premium - Archived V1 Direction

This document described an earlier AI Stylist direction before the current `/stylist` implementation matured.

It is retained only as historical context.

For the active direction, use:
- `docs/superpowers/specs/2026-04-26-ai-stylist-premium-v2-design.md`
```

- [ ] **Step 4: Update the ecommerce spec to match the active homepage and stylist reality**

In `docs/specs/2026-04-21-yoora-sarah-ecommerce-design.md`, change the homepage and route assumptions:

```md
| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Single-scene homepage hero with fixed header and in-viewport clearance rail |
| Stylist | `/stylist` | Private AI Stylist studio with chat, outfit building, item matching, and product-to-model workflows |
| Category | `/[category]` | Category product page |
| Product Detail | `/[category]/[productSlug]` | Product detail page |
```

Replace the old “Home Page Sections” assumptions with:

```md
### 5.2 Home Page Experience

The homepage is a one-page, single-scene hero experience.

It includes:
1. Fixed navigation header
2. Hero media sequence
3. In-viewport clearance rail
4. Navbar entry to the dedicated `/stylist` studio

The homepage does not expand into a long scrolling landing page.
Advanced AI styling workflows live inside `/stylist`.
```

- [ ] **Step 5: Verify markdown docs are coherent after updates**

Run: `python - <<'PY'
from pathlib import Path
paths = [
    Path('README.md'),
    Path('docs/superpowers/specs/2026-04-22-ai-stylist-premium-design.md'),
    Path('docs/specs/2026-04-21-yoora-sarah-ecommerce-design.md'),
]
for path in paths:
    text = path.read_text(encoding='utf-8')
    print(path, 'OK' if text.strip() else 'EMPTY')
PY`
Expected: all paths print `OK`

- [ ] **Step 6: Commit the primary doc updates**

```bash
git add README.md docs/superpowers/specs/2026-04-22-ai-stylist-premium-design.md docs/specs/2026-04-21-yoora-sarah-ecommerce-design.md
git commit -m "docs: align stylist and storefront docs with current implementation"
```

---

### Task 7: Delete only the confirmed obsolete markdown artifacts

**Files:**
- Delete: `playwright-home-snapshot.md`
- Delete: `playwright-home-navbar-v3.md`
- Delete: `playwright-header-dropdown-snapshot.md`
- Delete: `portal-login-1440.md`
- Delete: `portal-login-390.md`
- Delete: `portal-login-postfix-390.md`
- Delete: `apps/web/home-navbar-scene-desktop.md`
- Delete: `apps/web/home-navbar-scene-mobile.md`
- Delete: `apps/web/home-navbar-scene-desktop-current.md`
- Delete: `apps/web/home-navbar-scene-desktop-deep.md`
- Delete: `apps/web/home-navbar-overlay-collections.md`

- [ ] **Step 1: Verify the deletion set exactly matches the cleanup inventory**

Run: `python - <<'PY'
from pathlib import Path
inventory = Path('docs/superpowers/plans/2026-04-26-markdown-cleanup-inventory.md').read_text(encoding='utf-8')
paths = [
'playwright-home-snapshot.md',
'playwright-home-navbar-v3.md',
'playwright-header-dropdown-snapshot.md',
'portal-login-1440.md',
'portal-login-390.md',
'portal-login-postfix-390.md',
'apps/web/home-navbar-scene-desktop.md',
'apps/web/home-navbar-scene-mobile.md',
'apps/web/home-navbar-scene-desktop-current.md',
'apps/web/home-navbar-scene-desktop-deep.md',
'apps/web/home-navbar-overlay-collections.md',
]
missing = [p for p in paths if p not in inventory]
print('OK' if not missing else f'MISSING: {missing}')
PY`
Expected: `OK`

- [ ] **Step 2: Delete the confirmed obsolete docs**

Run:

```bash
rm "playwright-home-snapshot.md" "playwright-home-navbar-v3.md" "playwright-header-dropdown-snapshot.md" "portal-login-1440.md" "portal-login-390.md" "portal-login-postfix-390.md" "apps/web/home-navbar-scene-desktop.md" "apps/web/home-navbar-scene-mobile.md" "apps/web/home-navbar-scene-desktop-current.md" "apps/web/home-navbar-scene-desktop-deep.md" "apps/web/home-navbar-overlay-collections.md"
```

Expected: command completes without “No such file or directory”

- [ ] **Step 3: Confirm no required markdown entry points were touched**

Run: `git status --short`
Expected: only the intended deletions plus earlier approved doc updates

- [ ] **Step 4: Commit the confirmed deletions**

```bash
git add -u playwright-home-snapshot.md playwright-home-navbar-v3.md playwright-header-dropdown-snapshot.md portal-login-1440.md portal-login-390.md portal-login-postfix-390.md apps/web/home-navbar-scene-desktop.md apps/web/home-navbar-scene-mobile.md apps/web/home-navbar-scene-desktop-current.md apps/web/home-navbar-scene-desktop-deep.md apps/web/home-navbar-overlay-collections.md
git commit -m "docs: remove obsolete UI snapshot markdown artifacts"
```

---

### Task 8: Verify the full experience and guardrails before completion

**Files:**
- Verify: `apps/web/app/stylist/page.tsx`
- Verify: `apps/web/components/layout/header.tsx`
- Verify: homepage files remain structurally unchanged

- [ ] **Step 1: Run storefront typecheck**

Run: `npm --prefix apps/web run typecheck`
Expected: success with no type errors

- [ ] **Step 2: Run API compile verification**

Run: `uv run --directory services/api python -m compileall app`
Expected: compile succeeds without syntax errors

- [ ] **Step 3: Start the storefront locally**

Run: `npm --prefix apps/web run dev`
Expected: local Next.js dev server starts successfully

- [ ] **Step 4: Verify homepage guardrails manually**

Using browser QA:
- open `/`
- confirm homepage remains a one-page hero scene
- confirm no new below-the-fold sections were added
- confirm stylist discoverability remains navbar/mobile-menu based

Expected: homepage structure is preserved

- [ ] **Step 5: Verify `/stylist` end-to-end manually**

Using browser QA:
- open `/stylist`
- switch between the four studio modes
- submit a brief
- upload an item and confirm image-aware result
- generate a product-to-model preview
- continue styling from the preview
- refine the session without losing context

Expected: all four flows feel like one studio session

- [ ] **Step 6: Commit the final verification checkpoint if any small verification-only fixes were required**

```bash
git status --short
```
Expected: ideally clean; if not clean, commit only the minimal verification follow-up changes with a focused message

---

## Spec coverage check
- Studio shell unification into four modes: covered by Task 2
- Session-aware orchestration upgrades: covered by Task 3
- Elevating product-to-model: covered by Task 5
- Markdown cleanup with keep/update/delete classification before deletion: covered by Task 1, Task 6, Task 7
- Preserve homepage one-page hero and navbar-only discoverability: enforced in Task 6 and Task 8

## Placeholder scan
The plan avoids TBD/TODO placeholders and includes actual paths, code skeletons, commands, and expected outputs.

## Type consistency check
- Frontend shared types are centralized in `stylist-session.ts`
- Backend mode names use: `brief`, `outfit`, `match-item`, `product-to-model`
- Result-board and refinement-rail props align with the same mode/session model
