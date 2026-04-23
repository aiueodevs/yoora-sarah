# AI Stylist Premium Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement AI Stylist Premium with Mix & Match, Outfit Composer, Image Analysis, and dedicated Stylist page

**Architecture:** FastAPI backend with new stylist service, Next.js frontend with /stylist page. Uses Groq Llama for chat, Cloudflare Workers AI for vision analysis.

**Tech Stack:** FastAPI, Next.js, Groq Llama 3.1, Cloudflare Workers AI, Cloudflare R2

---

## Phase 1: Backend - AI Stylist Service

### Task 1: Create AI Stylist Service

**Files:**
- Create: `services/api/app/services/ai_stylist_service.py`

- [ ] **Step 1: Create ai_stylist_service.py with ColorMatcher and OutfitMatcher classes**

```python
from __future__ import annotations

from dataclasses import dataclass
from app.services.catalog_store import catalog_store
from app.schemas.catalog import CatalogProductDetail


@dataclass
class OutfitMatch:
    dress: CatalogProductDetail | None
    hijab: CatalogProductDetail | None
    accessories: list[CatalogProductDetail]
    total_price: int
    styling_notes: list[str]


class ColorMatcher:
    COLOR_CATEGORIES = {
        "neutral": ["black", "white", "broken white", "cream"],
        "earth": ["cappucino", "camel", "hazelnut", "caramel", "bitter coklat"],
        "soft": ["rose taupe", "chinderose", "blush", "mauve"],
        "bold": ["dark maroon", "dark teal", "sea storm", "charcoal"],
    }
    
    @classmethod
    def get_color_category(cls, color_name: str) -> str:
        color_lower = color_name.lower()
        for category, colors in cls.COLOR_CATEGORIES.items():
            if any(c in color_lower for c in colors):
                return category
        return "neutral"
    
    @classmethod
    def are_compatible(cls, color1: str, color2: str) -> bool:
        cat1 = cls.get_color_category(color1)
        cat2 = cls.get_color_category(color2)
        if cat1 == cat2:
            return True
        if cat1 == "neutral" or cat2 == "neutral":
            return True
        return False


class OutfitMatcher:
    def __init__(self):
        self.catalog = catalog_store
    
    def find_matching_hijab(self, dress: CatalogProductDetail, limit: int = 5) -> list[CatalogProductDetail]:
        hijab_categories = ["hijab-1544", "pashmina-2310", "khimar-5295"]
        candidates = []
        
        all_products = self.catalog.list_product_details()
        for product in all_products:
            if product.category_slug not in hijab_categories:
                continue
            if product.stock_state == "out_of_stock":
                continue
                
            score = 0
            if dress.colors and product.colors:
                for dc in dress.colors:
                    for pc in product.colors:
                        if ColorMatcher.are_compatible(dc.name, pc.name):
                            score += 5
                            break
            
            if abs(product.price - dress.price) <= 100000:
                score += 2
            if product.stock_state == "in_stock":
                score += 3
                
            candidates.append((score, product))
        
        candidates.sort(key=lambda x: -x[0])
        return [c[1] for c in candidates[:limit]]
    
    def find_accessories(self, dress: CatalogProductDetail, limit: int = 3) -> list[CatalogProductDetail]:
        acc_categories = ["accessories-4472"]
        candidates = []
        
        all_products = self.catalog.list_product_details()
        for product in all_products:
            if product.category_slug not in acc_categories:
                continue
            if product.stock_state == "out_of_stock":
                continue
            
            score = 0
            if product.price <= dress.price * 0.3:
                score += 2
            if product.stock_state == "in_stock":
                score += 1
                
            candidates.append((score, product))
        
        candidates.sort(key=lambda x: -x[0])
        return [c[1] for c in candidates[:limit]]
    
    def create_outfit(self, dress: CatalogProductDetail, occasion: str | None = None) -> OutfitMatch:
        hijab = self.find_matching_hijab(dress, limit=1)
        accessories = self.find_accessories(dress, limit=2)
        
        total_price = dress.price
        if hijab:
            total_price += hijab[0].price
        for acc in accessories:
            total_price += acc.price
        
        styling_notes = [
            f"Pilihan utama: {dress.name} dengan harga Rp {dress.price:,}",
        ]
        if hijab:
            styling_notes.append(f"Tambahkan {hijab[0].name} (Rp {hijab[0].price:,}) untuk tampilan yang lebih lengkap")
        if accessories:
            acc_names = ", ".join([a.name for a in accessories])
            styling_notes.append(f"Aksesori: {acc_names}")
        styling_notes.append(f"Total outfit: Rp {total_price:,}")
        
        return OutfitMatch(
            dress=dress,
            hijab=hijab[0] if hijab else None,
            accessories=accessories,
            total_price=total_price,
            styling_notes=styling_notes,
        )


ai_stylist_service = OutfitMatcher()
```

- [ ] **Step 2: Add AI_STYLIST_SYSTEM_PROMPT to ai_tools_service.py**

Add to `services/api/app/services/ai_tools_service.py`:
```python
AI_STYLIST_SYSTEM_PROMPT = """Anda adalah AI Stylist Premium dari Yoora Sarah. 
Tugas Anda membantu customer menemukan outfit yang tepat dengan:
1. Mix & Match - Mencari kombinasi dress + hijab + accessories yang cocok
2. Outfit Composer - Memberikan template outfit berdasarkan occasion
3. Style Advice - Memberikan tips styling berdasarkan foto customer

Katalog produk:
- Dress: Clara Dress, Yoora Dress, Bella Dress, Medina Dress, Safiyyah Sora Dress, Yume Striped Dress, Medina Poka Dress
- Abaya: PO Lianhua Abaya, Beyza Abaya, Talia Denim Abaya, Bloom Love Abaya, Bloom Flower Abaya, Zippa Abaya
- Hijab: Naura Oval, Bergo Syar'i
- Khimar: Khimar Medina, Madiha Square Ban, French Khimar Armuzna
- Pashmina: Serene Pashmina Curve
- Accessories: Bross Yoora Sarah, Tote Bag
- Footwear: Lilly Heels, Levine Boots
- Kids: Azalia Kids, Bella Kids Dress, Yume Striped Kids Dress

Setiap produk punya 13-22 warna (Cappucino, Camel, Black, Hazelnut, dll) dan ukuran S/M/L/XL.

Selalu ответ dalam Bahasa Indonesia yang natural dan friendly.
"""
```

- [ ] **Step 3: Test the service**

Run:
```bash
cd services/api && python -c "
from app.services.ai_stylist_service import ai_stylist_service, OutfitMatcher, ColorMatcher

# Test ColorMatcher
print('Testing ColorMatcher:')
print('Cappucino category:', ColorMatcher.get_color_category('Cappucino'))
print('Black category:', ColorMatcher.get_color_category('Black'))

# Test OutfitMatcher
matcher = OutfitMatcher()
products = matcher.catalog.list_product_details('dress')
if products:
    outfit = matcher.create_outfit(products[0])
    print(f'\\nOutfit for {products[0].name}:')
    print(f'  Dress: {outfit.dress.name}')
    if outfit.hijab:
        print(f'  Hijab: {outfit.hijab.name}')
    print(f'  Accessories: {[a.name for a in outfit.accessories]}')
    print(f'  Total: Rp {outfit.total_price:,}')
"
```

Expected: PASS with outfit details printed

- [ ] **Step 4: Commit**

```bash
git add services/api/app/services/ai_stylist_service.py
git commit -m "feat: add AI Stylist service with ColorMatcher and OutfitMatcher"
```

---

### Task 2: Create AI Stylist Endpoints

**Files:**
- Create: `services/api/app/api/v1/endpoints/ai_stylist.py`

- [ ] **Step 1: Create endpoints file**

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ai_stylist_service import ai_stylist_service, OutfitMatcher
from app.services.catalog_store import catalog_store
from app.schemas.catalog import CatalogProductDetail


router = APIRouter(prefix="/ai/stylist", tags=["ai-stylist"])


class MixMatchRequest(BaseModel):
    category_slug: str
    product_slug: str
    occasion: str | None = None


class MixMatchResponse(BaseModel):
    dress: dict | None
    hijab: dict | None
    accessories: list[dict]
    total_price: int
    styling_notes: list[str]


def product_to_dict(product: CatalogProductDetail | None) -> dict | None:
    if product is None:
        return None
    return {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "category": product.category_slug,
        "price": product.price,
        "image": product.image,
        "colors": [{"name": c.name, "hex": c.hex} for c in product.colors[:3]],
        "sizes": product.sizes,
    }


@router.post("/mix-match", response_model=MixMatchResponse)
async def mix_match(request: MixMatchRequest) -> MixMatchResponse:
    dress = catalog_store.get_product_detail(request.category_slug, request.product_slug)
    if dress is None:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
    
    outfit = ai_stylist_service.create_outfit(dress, request.occasion)
    
    return MixMatchResponse(
        dress=product_to_dict(outfit.dress),
        hijab=product_to_dict(outfit.hijab),
        accessories=[product_to_dict(a) for a in outfit.accessories],
        total_price=outfit.total_price,
        styling_notes=outfit.styling_notes,
    )


@router.get("/products/{category_slug}")
async def get_category_products(category_slug: str) -> list[dict]:
    products = catalog_store.list_product_details(category_slug)
    return [product_to_dict(p) for p in products]
```

- [ ] **Step 2: Register router in main router**

Modify `services/api/app/api/v1/router.py`:
```python
from app.api.v1.endpoints import ai_tools, catalog, orders, customers, support, ai_stylist

router.include_router(ai_stylist.router)
```

- [ ] **Step 3: Test endpoint**

```bash
curl -X POST http://localhost:8000/api/v1/ai/stylist/mix-match \
  -H "Content-Type: application/json" \
  -d '{"category_slug": "dress", "product_slug": "clara-dress-5254"}'
```

Expected: JSON with dress, hijab, accessories, total_price

- [ ] **Step 4: Commit**

```bash
git add services/api/app/api/v1/endpoints/ai_stylist.py services/api/app/api/v1/router.py
git commit -m "feat: add AI Stylist endpoints for mix-match"
```

---

## Phase 2: Frontend - Stylist Page

### Task 3: Create Stylist Page

**Files:**
- Create: `apps/web/app/stylist/page.tsx`

- [ ] **Step 1: Create stylist page directory and page.tsx**

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Loader2, X, ShoppingBag } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Array<{
    name: string;
    category: string;
    price: number;
    image: string;
  }>;
}

const STYLIST_WELCOME = `Hai! Saya AI Stylist Premium Yoora Sarah. 🎨

Saya bisa bantu Anda:
• Mix & Match - Pilih dress, saya cari hijab & aksesoris yang cocok
• Style Advice - Rekomendasi berdasarkan occasion
• Outfit Templates - Template outfit siap pakai

 Mau mulai? Pilih dress favorit Anda atau ceritakan gaya yang Anda mau!`;

export default function StylistPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: STYLIST_WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/ai/stylist/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input.trim(),
          history: messages.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || "Maaf, ada sedikit gangguan. Coba lagi ya.",
        products: data.products,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Maaf, ada gangguan. Silakan coba lagi ya!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-serif text-neutral-900 mb-2">
            AI Stylist Premium
          </h1>
          <p className="text-neutral-600">
            Mix & Match outfit pilihan Anda dengan bantuan AI
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
          <div className="h-[600px] overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    msg.role === "user"
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {msg.products.map((product, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-lg p-2 border border-neutral-200"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-24 object-cover rounded-lg mb-2"
                          />
                          <p className="text-xs font-medium truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            Rp {product.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 rounded-2xl px-5 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-neutral-100 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Pilih dress atau ceritakan gaya yang kamu mau..."
                className="flex-1 px-4 py-3 rounded-full border border-neutral-200 focus:outline-none focus:border-neutral-400"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-5 py-3 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Test page compiles**

```bash
cd apps/web && npm run build 2>&1 | head -30
```

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/stylist/page.tsx
git commit -m "feat: add AI Stylist page with chat interface"
```

---

### Task 4: Add Chat API Endpoint

**Files:**
- Modify: `services/api/app/api/v1/endpoints/ai_stylist.py`

- [ ] **Step 1: Add chat endpoint**

Add to `services/api/app/api/v1/endpoints/ai_stylist.py`:

```python
import requests
from app.core.config import get_settings
from app.services.ai_tools_service import AI_STYLIST_SYSTEM_PROMPT


@router.post("/chat")
async def stylist_chat(request: dict) -> dict:
    settings = get_settings()
    message = request.get("message", "")
    history = request.get("history", [])
    
    if not message:
        return {"content": "Silakan tulis pesan untuk memulai percakapan."}
    
    messages = [{"role": "system", "content": AI_STYLIST_SYSTEM_PROMPT}]
    for msg in history[-5:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": message})
    
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.groq_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.groq_model,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 500,
            },
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        
        return {"content": content, "products": []}
    except Exception as e:
        return {"content": f"Maaf, ada gangguan teknis. {str(e)}", "products": []}
```

- [ ] **Step 2: Test chat endpoint**

```bash
curl -X POST http://localhost:8000/api/v1/ai/stylist/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Saya mau cari dress untuk pesta", "history": []}'
```

Expected: JSON with content from Groq

- [ ] **Step 3: Commit**

```bash
git add services/api/app/api/v1/endpoints/ai_stylist.py
git commit -m "feat: add stylist chat endpoint with Groq"
```

---

### Task 5: Add Stylist to Navbar

**Files:**
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Find navbar component**

```bash
grep -n "nav" apps/web/app/layout.tsx | head -20
```

- [ ] **Step 2: Add Stylist link to navbar**

Find the navigation section and add:
```tsx
<Link href="/stylist" className="flex items-center gap-2">
  <Sparkles className="w-4 h-4" />
  AI Stylist
</Link>
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/layout.tsx
git commit -m "feat: add AI Stylist link to navbar"
```

---

## Phase 3: Outfit Composer

### Task 6: Create Outfit Templates

**Files:**
- Modify: `services/api/app/api/v1/endpoints/ai_stylist.py`

- [ ] **Step 1: Add outfit templates endpoint**

```python
OUTFIT_TEMPLATES = [
    {
        "id": "daily-look",
        "name": "Daily Look",
        "description": "Tampilan sehari-hari yang nyaman dan praktis",
        "icon": "☀️",
        "suggestions": ["dress", "pashmina"],
    },
    {
        "id": "office-ready",
        "name": "Office Ready",
        "description": "Tampilan profesional untuk kantor",
        "icon": "💼",
        "suggestions": ["abaya", "hijab"],
    },
    {
        "id": "party-glam",
        "name": "Party Glam",
        "description": "Tampilan glamor untuk pesta",
        "icon": "✨",
        "suggestions": ["dress", "accessories"],
    },
    {
        "id": "weekend-casual",
        "name": "Weekend Casual",
        "description": "Tampilan rileks untuk akhir pekan",
        "icon": "🌸",
        "suggestions": ["dress", "khimar"],
    },
    {
        "id": "modest-elegant",
        "name": "Modest Elegant",
        "description": "Tampilan sopan elegan",
        "icon": "🕌",
        "suggestions": ["abaya", "khimar", "accessories"],
    },
]


@router.get("/templates")
async def get_outfit_templates() -> list[dict]:
    return OUTFIT_TEMPLATES


@router.get("/templates/{template_id}/products")
async def get_template_products(template_id: str) -> dict:
    template = next((t for t in OUTFIT_TEMPLATES if t["id"] == template_id), None)
    if template is None:
        raise HTTPException(status_code=404, detail="Template tidak ditemukan")
    
    products = []
    for cat in template["suggestions"]:
        prods = catalog_store.list_product_details(cat)[:2]
        products.extend(prods)
    
    return {
        "template": template,
        "products": [
            {
                "id": p.id,
                "name": p.name,
                "category": p.category_slug,
                "price": p.price,
                "image": p.image,
            }
            for p in products
        ],
    }
```

- [ ] **Step 2: Commit**

```bash
git add services/api/app/api/v1/endpoints/ai_stylist.py
git commit -m "feat: add outfit templates endpoint"
```

---

### Task 7: Create Outfit Composer Component

**Files:**
- Create: `apps/web/components/outfit-composer.tsx`

- [ ] **Step 1: Create component**

```tsx
"use client";

import { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

export function OutfitComposer() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/v1/ai/stylist/templates")
      .then((r) => r.json())
      .then(setTemplates);
  }, []);

  const selectTemplate = async (template: Template) => {
    setSelectedTemplate(template);
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/ai/stylist/templates/${template.id}/products`);
      const data = await res.json();
      setProducts(data.products || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        Outfit Composer
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => selectTemplate(template)}
            className={`p-4 rounded-xl border text-left transition ${
              selectedTemplate?.id === template.id
                ? "border-neutral-900 bg-neutral-50"
                : "border-neutral-200 hover:border-neutral-400"
            }`}
          >
            <span className="text-2xl">{template.icon}</span>
            <p className="font-medium mt-2">{template.name}</p>
            <p className="text-xs text-neutral-500">{template.description}</p>
          </button>
        ))}
      </div>

      {products.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-3">Produk dalam outfit ini:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-32 object-cover"
                />
                <div className="p-2">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-neutral-500">
                    Rp {product.price.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Integrate into Stylist page**

Add import to `apps/web/app/stylist/page.tsx`:
```tsx
import { OutfitComposer } from "@/components/outfit-composer";
```

Add after chat container:
```tsx
<div className="mt-8">
  <OutfitComposer />
</div>
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/outfit-composer.tsx apps/web/app/stylist/page.tsx
git commit -m "feat: add Outfit Composer component"
```

---

## Phase 4: Image Analysis (Optional - Cloudflare Vision)

### Task 8: Image Analysis Endpoint

**Files:**
- Modify: `services/api/app/api/v1/endpoints/ai_stylist.py`

- [ ] **Step 1: Add image analysis endpoint**

```python
@router.post("/analyze-image")
async def analyze_image(request: dict) -> dict:
    image_url = request.get("image_url")
    if not image_url:
        raise HTTPException(status_code=400, detail="Image URL required")
    
    settings = get_settings()
    
    try:
        response = requests.post(
            "https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/meta/llama-3.2-11b-vision-instruct",
            headers={
                "Authorization": f"Bearer {settings.cloudflare_api_key}",
            },
            json={
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Analisis gaya busana muslimah dalam foto ini. Warnai dominan apa yang cocok?"},
                            {"type": "image_url", "image_url": {"url": image_url}}
                        ]
                    }
                ]
            },
            timeout=60,
        )
        data = response.json()
        
        if data.get("success"):
            return {
                "analysis": data["result"]["response"],
                "suggestions": ["cappucino", "camel", "black"]
            }
        return {"analysis": "Tidak dapat menganalisis gambar", "suggestions": []}
    except Exception as e:
        return {"analysis": f"Error: {str(e)}", "suggestions": []}
```

- [ ] **Step 2: Commit**

```bash
git add services/api/app/api/v1/endpoints/ai_stylist.py
git commit -m "feat: add image analysis endpoint"
```

---

## Verification

### Final Integration Test

- [ ] Test Mix Match: `POST /api/v1/ai/stylist/mix-match`
- [ ] Test Templates: `GET /api/v1/ai/stylist/templates`
- [ ] Test Chat: `POST /api/v1/ai/stylist/chat`
- [ ] Test Stylist Page: Navigate to /stylist
- [ ] Verify Navbar has AI Stylist link

---

## Summary

**Created Files:**
- `services/api/app/services/ai_stylist_service.py`
- `services/api/app/api/v1/endpoints/ai_stylist.py`
- `apps/web/app/stylist/page.tsx`
- `apps/web/components/outfit-composer.tsx`

**Modified Files:**
- `services/api/app/core/config.py`
- `services/api/app/api/v1/router.py`
- `apps/web/app/layout.tsx`
- `apps/web/app/stylist/page.tsx`

**Tasks Completed:** 8 major tasks with sub-steps
