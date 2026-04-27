# AI Buyer Premium Concierge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade AI Buyer into an all-in-one premium concierge that can handle discovery, styling, size, policy, order, and sensitive support questions with contextual WhatsApp handoff inside the chat UI.

**Architecture:** Keep the current grounded backend approach in `ai_tools_service.py`, but evolve the response contract from plain text + sources to structured assistant responses with `actions`. The frontend `BuyerAssistant` becomes the single customer entry point and renders contextual CTA buttons, while the global WhatsApp floating shortcut is removed so handoff happens only inside the concierge flow.

**Tech Stack:** Next.js 16 App Router, React client components, TypeScript, FastAPI, Python dataclasses, existing grounded commerce services, WhatsApp deep links.

---

## File Structure

**Create:**
- `apps/web/components/layout/route-shell.tsx` — route-aware shell that can hide overlays on selected routes and enforce full-viewport behavior.
- `docs/superpowers/specs/2026-04-28-ai-buyer-premium-concierge-design.md` — approved design spec (already written).

**Modify:**
- `apps/web/components/buyer-assistant.tsx` — render structured assistant actions, become the only customer entry point.
- `apps/web/app/lib/buyer-ai-api.ts` — extend assistant response types with `actions`.
- `apps/web/app/layout.tsx` — remove global WhatsApp shortcut and keep only BuyerAssistant as overlay.
- `services/api/app/services/ai_tools_service.py` — add structured `AIAssistantAction`, enrich fallback responses with actions and more concierge-style copy.
- `services/api/app/api/v1/endpoints/ai_tools.py` — ensure request/response path continues to serialize the richer assistant response contract.

**Delete:**
- `apps/web/components/layout/whatsapp-button.tsx` — remove standalone WhatsApp entry point.

**Test:**
- `services/api/tests/test_auth.py` — existing auth tests remain untouched.
- `services/api/tests/test_ai_stylist_service.py` — existing baseline remains untouched.
- `services/api/tests/test_ai_assistant_response.py` — new backend tests for assistant actions and grounded responses.
- `apps/web/components/buyer-assistant.test.tsx` — new frontend tests for action rendering and no-action fallback.

---

### Task 1: Extend the assistant response contract

**Files:**
- Modify: `services/api/app/services/ai_tools_service.py`
- Modify: `apps/web/app/lib/buyer-ai-api.ts`
- Test: `services/api/tests/test_ai_assistant_response.py`

- [ ] **Step 1: Write the failing backend tests for structured actions**

```python
from app.services.ai_tools_service import AIToolsService


def test_sensitive_query_returns_whatsapp_action():
    service = AIToolsService()
    response = service._fallback_assistant_response(
        "Saya kecewa dan ingin komplain soal pesanan saya",
        {
            "flags": {"is_sensitive": True, "is_size_query": False, "is_styling_query": False, "is_product_query": False},
            "handoff": {
                "summary": "Kasus ini lebih aman ditangani support.",
                "nextAction": "Lanjutkan ke WhatsApp support untuk penanganan manual.",
                "contact": {"whatsappHref": "https://wa.me/6282315866088?text=test"},
            },
            "order_status": {},
            "size_guidance": {},
            "recommendations": [],
            "products": [],
            "policies": [],
            "launch_policy": {},
            "anchor_product": None,
        },
    )
    assert response.actions is not None
    assert response.actions[0].kind == "whatsapp"
    assert response.actions[0].href.startswith("https://wa.me/")
```

- [ ] **Step 2: Run test to verify it fails if `actions` are not yet fully supported**

Run:
```bash
uv run --directory services/api pytest services/api/tests/test_ai_assistant_response.py -v
```

Expected: FAIL with missing test file or missing `actions` assertions.

- [ ] **Step 3: Add structured action types to backend and frontend contract**

```python
@dataclass
class AIAssistantAction:
    key: str
    label: str
    href: str | None = None
    kind: str = "link"


@dataclass
class AIAssistantResponse:
    content: str
    sources: list[AIAssistantSource] | None = None
    actions: list[AIAssistantAction] | None = None
    mode: str = "fallback"
```

```ts
export type AIAssistantAction = {
  key: string;
  label: string;
  href?: string | null;
  kind: 'link' | 'whatsapp';
};

export type AIAssistantResponse = {
  content: string;
  sources?: AIAssistantSource[] | null;
  actions?: AIAssistantAction[] | null;
  mode?: 'groq' | 'fallback';
};
```

- [ ] **Step 4: Run backend test to verify the contract passes**

Run:
```bash
uv run --directory services/api pytest services/api/tests/test_ai_assistant_response.py -v
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add services/api/app/services/ai_tools_service.py apps/web/app/lib/buyer-ai-api.ts services/api/tests/test_ai_assistant_response.py
git commit -m "feat: add structured AI assistant actions"
```

---

### Task 2: Add contextual WhatsApp handoff actions in backend fallback responses

**Files:**
- Modify: `services/api/app/services/ai_tools_service.py:924-1091`
- Test: `services/api/tests/test_ai_assistant_response.py`

- [ ] **Step 1: Write failing tests for handoff-triggered assistant responses**

```python
def test_size_handoff_returns_whatsapp_action():
    service = AIToolsService()
    response = service._fallback_assistant_response(
        "Ukuran M saya tidak tersedia, sebaiknya apa?",
        {
            "flags": {"is_sensitive": False, "is_size_query": True, "is_styling_query": False, "is_product_query": False},
            "handoff": {
                "nextAction": "Lanjutkan ke WhatsApp support untuk konfirmasi ukuran.",
                "contact": {"whatsappHref": "https://wa.me/6282315866088?text=size-help"},
            },
            "size_guidance": {
                "found": True,
                "message": "Rekomendasi awal ukuran L.",
                "fit_summary": "Ukuran L lebih aman untuk ruang gerak.",
                "measurement_note": "Pilihan ukuran tersedia: S, M, L.",
                "alternative_sizes": ["L"],
                "handoff_recommended": True,
            },
            "order_status": {},
            "recommendations": [],
            "products": [],
            "policies": [],
            "launch_policy": {},
            "anchor_product": None,
        },
    )
    assert response.actions
    assert response.actions[0].label == "Chat CS via WhatsApp"
```

- [ ] **Step 2: Run tests to verify failure first**

Run:
```bash
uv run --directory services/api pytest services/api/tests/test_ai_assistant_response.py -v
```

Expected: FAIL if size-handoff action is not emitted yet.

- [ ] **Step 3: Implement minimal backend action emission for sensitive + size handoff cases**

```python
actions=[
    AIAssistantAction(
        key="whatsapp_handoff",
        label="Chat CS via WhatsApp",
        href=contact.get("whatsappHref", "/pages/hubungi-kami"),
        kind="whatsapp",
    )
] if contact.get("whatsappHref") else None
```

Apply in:
- sensitive support case
- size guidance case when `handoff_recommended` is true

- [ ] **Step 4: Run tests again**

Run:
```bash
uv run --directory services/api pytest services/api/tests/test_ai_assistant_response.py -v
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add services/api/app/services/ai_tools_service.py services/api/tests/test_ai_assistant_response.py
git commit -m "feat: add WhatsApp handoff actions to assistant responses"
```

---

### Task 3: Render assistant action CTAs inside BuyerAssistant

**Files:**
- Modify: `apps/web/components/buyer-assistant.tsx`
- Test: `apps/web/components/buyer-assistant.test.tsx`

- [ ] **Step 1: Write the failing frontend tests**

```tsx
import { render, screen } from '@testing-library/react';
import { BuyerAssistant } from './buyer-assistant';

it('renders a WhatsApp action CTA inside assistant messages', async () => {
  render(<BuyerAssistant />);
  expect(screen.queryByText('Chat CS via WhatsApp')).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails before implementation**

Run:
```bash
npm run test --prefix apps/web -- buyer-assistant.test.tsx
```

Expected: FAIL because no action rendering path exists yet.

- [ ] **Step 3: Extend local message type and response mapping**

```ts
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; href: string }>;
  actions?: Array<{ key: string; label: string; href?: string | null; kind: string }>;
}
```

```ts
const assistantMessage: Message = {
  id: (Date.now() + 1).toString(),
  role: 'assistant',
  content: response?.content ?? fallback,
  sources: response?.sources ?? undefined,
  actions: response?.actions ?? undefined,
};
```

- [ ] **Step 4: Render CTA buttons below assistant content and above sources**

```tsx
{message.actions && message.actions.length > 0 && (
  <div className="mt-3 flex flex-wrap gap-2 border-t border-neutral-200 pt-3">
    {message.actions.map((action) => (
      <a
        key={action.key}
        href={action.href ?? '/pages/hubungi-kami'}
        target="_blank"
        rel="noopener noreferrer"
        className={action.kind === 'whatsapp'
          ? 'inline-flex items-center rounded-full px-3 py-2 text-xs font-semibold bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white'
          : 'inline-flex items-center rounded-full px-3 py-2 text-xs font-semibold bg-[#f4ede7] text-[#241915]'}
      >
        {action.label}
      </a>
    ))}
  </div>
)}
```

- [ ] **Step 5: Run frontend tests**

Run:
```bash
npm run test --prefix apps/web
```

Expected: PASS with BuyerAssistant tests green.

- [ ] **Step 6: Commit**

```bash
git add apps/web/components/buyer-assistant.tsx apps/web/components/buyer-assistant.test.tsx
git commit -m "feat: render assistant action CTAs in buyer chat"
```

---

### Task 4: Remove the global WhatsApp floating shortcut and make AI Buyer the only entry point

**Files:**
- Modify: `apps/web/app/layout.tsx`
- Modify: `apps/web/components/layout/route-shell.tsx`
- Delete: `apps/web/components/layout/whatsapp-button.tsx`

- [ ] **Step 1: Write the failing frontend expectation**

```tsx
it('does not render the global WhatsApp floating shortcut', async () => {
  render(<RouteShell header={<div />} main={<div />} footer={<div />} overlays={<div />} />);
  expect(screen.queryByLabelText(/Chat via WhatsApp/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests or manual check to confirm existing WhatsApp shortcut still exists**

Run:
```bash
npm run dev --prefix apps/web
```

Expected: the green WhatsApp floating button is still visible before removal.

- [ ] **Step 3: Remove WhatsApp from root overlays and delete the component**

```tsx
<RouteShell
  header={<Header featuredStories={featuredStories} />}
  main={children}
  footer={<Footer footerData={footer} />}
  overlays={<BuyerAssistant />}
/>
```

Then remove:
```bash
rm -f apps/web/components/layout/whatsapp-button.tsx
```

- [ ] **Step 4: Restart frontend and verify**

Run:
```bash
npm run dev --prefix apps/web
```

Expected: no global WhatsApp icon, only AI Buyer entry point remains.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/layout.tsx apps/web/components/layout/route-shell.tsx apps/web/components/layout/whatsapp-button.tsx
git commit -m "feat: remove global WhatsApp shortcut from storefront"
```

---

### Task 5: Humanize and strengthen the concierge orchestration

**Files:**
- Modify: `services/api/app/services/ai_tools_service.py`
- Test: `services/api/tests/test_ai_assistant_response.py`

- [ ] **Step 1: Write failing tests for premium concierge tone and grounded content**

```python
def test_general_greeting_uses_concierge_tone():
    service = AIToolsService()
    response = service._fallback_assistant_response(
        "halo",
        {
            "flags": {
                "is_sensitive": False,
                "is_size_query": False,
                "is_styling_query": False,
                "is_product_query": False,
            },
            "handoff": {},
            "order_status": {},
            "size_guidance": {},
            "recommendations": [],
            "products": [],
            "policies": [],
            "launch_policy": {},
            "anchor_product": None,
        },
    )
    assert "Yoora Sarah" in response.content
```

- [ ] **Step 2: Run tests to verify current wording is too generic**

Run:
```bash
uv run --directory services/api pytest services/api/tests/test_ai_assistant_response.py -v
```

Expected: FAIL if greeting is not aligned to the concierge standard being tested.

- [ ] **Step 3: Refine fallback copy for major intents**

Update `_fallback_assistant_response()` so the message style becomes:
- warmer
- more elegant
- more premium
- still grounded and concise

Examples of target improvements:
- greeting should sound like a boutique concierge
- product discovery should explain *why* products are relevant
- size guidance should reassure and clarify uncertainty
- handoff wording should sound like premium service, not error fallback

- [ ] **Step 4: Keep responses grounded**

Do not change the source of truth.
Keep using:
- `search_products`
- `get_size_guidance`
- `get_stylist_recommendations`
- `get_order_status`
- `get_support_policy`
- `create_support_handoff`

Only improve orchestration and wording.

- [ ] **Step 5: Run backend tests again**

Run:
```bash
uv run --directory services/api pytest services/api/tests/test_ai_assistant_response.py -v
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add services/api/app/services/ai_tools_service.py services/api/tests/test_ai_assistant_response.py
git commit -m "feat: refine AI Buyer into premium concierge voice"
```

---

### Task 6: End-to-end verification and local runtime validation

**Files:**
- Verify: `apps/web/components/buyer-assistant.tsx`
- Verify: `apps/web/app/layout.tsx`
- Verify: `services/api/app/services/ai_tools_service.py`

- [ ] **Step 1: Start backend**

Run:
```bash
npm run api:dev
```

Expected: `Uvicorn running on http://127.0.0.1:8000`

- [ ] **Step 2: Start frontend**

Run:
```bash
npm run dev --prefix apps/web
```

Expected: `Local: http://localhost:3000`

- [ ] **Step 3: Verify main user journeys manually**

Test these exact prompts in the AI Buyer chat:

1. Discovery:
```text
Saya cari dress yang anggun untuk kondangan warna nude.
```
Expected:
- elegant concierge wording
- relevant product links in `sources`
- no WhatsApp CTA unless needed

2. Size ambiguity:
```text
Saya tinggi 158 berat 60, kira-kira Clara Dress cocok ukuran apa?
```
Expected:
- size guidance response
- if uncertainty/handoff is recommended, show `Chat CS via WhatsApp`

3. Sensitive support:
```text
Saya kecewa karena pesanan saya salah kirim.
```
Expected:
- empathetic response
- WhatsApp CTA shown inside assistant bubble
- no global floating WhatsApp button on page

4. Order lookup:
```text
Tolong cek pesanan YS-2026-0419-182.
```
Expected:
- order status response or grounded fallback
- optional source to `/profile`

- [ ] **Step 4: Run frontend test suite**

Run:
```bash
npm run test --prefix apps/web
```

Expected: PASS.

- [ ] **Step 5: Run backend test suite**

Run:
```bash
uv run --directory services/api pytest services/api/tests/ -v
```

Expected: PASS.

- [ ] **Step 6: Commit final verification checkpoint**

```bash
git add apps/web/components/buyer-assistant.tsx apps/web/app/lib/buyer-ai-api.ts apps/web/app/layout.tsx services/api/app/services/ai_tools_service.py services/api/tests/test_ai_assistant_response.py
git commit -m "test: verify premium concierge flows end to end"
```
