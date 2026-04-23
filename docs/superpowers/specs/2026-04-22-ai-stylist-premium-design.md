# AI Stylist Premium - Design Document

## Overview

AI Stylist Premium is an enhanced version of the existing Buyer Assistant with advanced fashion styling capabilities. It enables customers to get personalized outfit recommendations through mix & match, outfit composition, and AI-powered image analysis.

## User Request

User wants to implement AI Stylist Premium for Yoora Sarah e-commerce with:
- Mix & Match from all catalog products (dress + hijab + accessories)
- Outfit Composer with pre-built templates
- Image Understanding (customer can upload photos)
- Dedicated AI Stylist page in navbar with chat AI agent

**Constraint:** Use free tier solutions (Groq Llama, free vision API, Cloudflare R2 for storage)

---

## Current State

### Already Implemented
1. **Catalog Store** - 27 products from 9 categories synced from real API
2. **Buyer Assistant** - Floating chat widget with Groq integration
3. **Stylist Recommendations** - Basic matching in backend (`get_stylist_recommendations`)
4. **Product Lookup** - Search, size guidance, order tracking

### What's Missing
1. Mix & Match across all categories (dress + hijab + accessories)
2. Outfit Composer with visual templates
3. Image upload and analysis capability
4. Dedicated Stylist page in navbar

---

## Design

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │ Buyer       │  │ AI Stylist  │  │ Outfit          │   │
│  │ Assistant   │  │ Page        │  │ Composer        │   │
│  │ (floating)  │  │ (/stylist)  │  │ (modal/page)    │   │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘   │
│         │                 │                    │             │
│         └─────────────────┼────────────────────┘             │
│                           │                                  │
│                    ┌──────▼──────┐                         │
│                    │ AI API      │                         │
│                    │ /ai/stylist │                         │
│                    └──────┬──────┘                         │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                    Backend (FastAPI)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌─────────────────────────────┐   │
│  │ AI Tools Service │  │ Catalog Store (27 products)│   │
│  │ (Groq Llama)     │  │ - Dress (7)                │   │
│  └────────┬─────────┘  │ - Abaya (6)                 │   │
│           │             │ - Khimar (3)                 │   │
│           ▼             │ - Hijab (2)                  │   │
│  ┌──────────────────┐  │ - Accessories (2)            │   │
│  │ Vision API      │  │ - Kids (3)                  │   │
│  │ (Cloudflare AI)│  └─────────────────────────────┘   │
│  └──────────────────┘                                      │
└─────────────────────────────────────────────────────────────┘
```

### Components

#### 1. AI Stylist Service (`ai_stylist_service.py`)

New service with:
- `OutfitMatcher` - Mix & match algorithm
- `ImageAnalyzer` - Cloudflare Workers AI for image analysis  
- `ColorMatcher` - Color harmony matching

#### 2. New Endpoints

```
POST /ai/stylist/mix-match
  Input: { category_slug, product_slug, occasion }
  Output: { dress, hijab, accessories, total_price }

POST /ai/stylist/outfit-composer
  Input: { template_id, customization }
  Output: { products, styling_notes }

POST /ai/stylist/analyze-image
  Input: { image_url }
  Output: { detected_colors, style_tags, suggestions }
```

#### 3. Frontend Pages

- `/stylist` - Dedicated AI Stylist page with chat interface
- `OutfitComposerModal` - Visual outfit builder
- `ImageUpload` - Photo upload for style analysis

### Data Flow

**Mix & Match Flow:**
1. User selects a dress on Stylist page
2. Backend fetches all products from categories: dress, hijab, accessories
3. OutfitMatcher finds complementary items based on:
   - Color harmony (matching/complementary colors)
   - Price range (within 50% of main item)
   - Stock availability (in_stock preferred)
   - Occasion tags
4. Returns complete outfit with dress + hijab + accessories

**Image Analysis Flow:**
1. User uploads photo (stored in Cloudflare R2)
2. Cloudflare Workers AI analyzes image
3. Extracts: dominant colors, style tags, body shape hints
4. Suggests products matching the analysis

---

## Color Matching Algorithm

### Categories
- **Netral**: Black, White, Broken White, Cream
- **Earth**: Cappucino, Camel, Hazelnut, Caramel, Bitter Coklat
- **Soft**: Rose Taupe, Chinderose, Blush, Mauve
- **Bold**: Dark Maroon, Dark Teal, Sea Storm, Charcoal

### Matching Rules
- Netral + Earth = Elegant
- Soft + Netral = Soft feminine
- Bold + Netral = Statement look

---

## Outfit Templates

Pre-built templates stored in database:

1. **Daily Look** - Dress + Pashmina simple
2. **Office Ready** - Abaya + Hijab formal  
3. **Party Glam** - Dress + Accessories
4. **Weekend Casual** - Dress + Khimar
5. **Modest Elegant** - Abaya + Khimar + Accessories

---

## Implementation Plan

### Phase 1: Backend Enhancement
1. Add vision API to config (Cloudflare Workers AI)
2. Create `ai_stylist_service.py` with:
   - `OutfitMatcher` class
   - `ImageAnalyzer` class
   - `ColorMatcher` utility
3. Add new endpoints in `/api/v1/endpoints/ai_stylist.py`

### Phase 2: Frontend - Stylist Page
1. Create `/apps/web/app/stylist/page.tsx`
2. Add to navbar navigation
3. Implement chat interface with enhanced prompts

### Phase 3: Outfit Composer
1. Create `OutfitComposer` component
2. Add visual product cards
3. Integrate mix-match API

### Phase 4: Image Upload
1. Add Cloudflare R2 upload endpoint
2. Create image analysis flow
3. Display suggestions based on analysis

---

## Technical Details

### Vision API: Cloudflare Workers AI
- **Model**: `@cf/meta/llama-3.2-11b-vision-instruct`
- **Free tier**: 10,000 requests/day
- **Endpoint**: Workers AI

### LLM: Groq (already configured)
- **Model**: llama-3.1-8b-instant (free tier: 28M tokens/day)
- Already configured in config

### Storage: Cloudflare R2 (already has)
- Used for product images
- Can use for user uploads

---

## Acceptance Criteria

1. ✅ User can access AI Stylist via navbar (/stylist)
2. ✅ User can select a dress and get matching hijab + accessories
3. ✅ User can browse pre-built outfit templates
4. ✅ User can upload photo and get style analysis
5. ✅ Chat interface works with Groq Llama
6. ✅ All products from 9 categories available for matching
7. ✅ Mobile responsive

---

## Files to Create/Modify

### New Files
- `services/api/app/services/ai_stylist_service.py`
- `services/api/app/api/v1/endpoints/ai_stylist.py`
- `apps/web/app/stylist/page.tsx`
- `apps/web/components/ai-stylist/*`

### Modified Files
- `services/api/app/core/config.py` - Add vision API config
- `apps/web/app/layout.tsx` - Add stylist to navbar
- `services/api/app/api/v1/router.py` - Register new endpoints
