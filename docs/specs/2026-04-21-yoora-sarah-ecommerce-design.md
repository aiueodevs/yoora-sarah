# Yoora Sarah E-Commerce Website Specification

**Date:** 2026-04-21  
**Project:** Yoora Sarah Customer-Facing Website  
**Status:** Updated for active implementation

## 1. Project Overview

**Purpose:**  
Membangun website e-commerce untuk brand fashion muslim Yoora Sarah yang terpisah dari dashboard management (portal) tetapi tetap terintegrasi dan sinkron.

**Scope:**  
- Customer-facing website di `apps/web`
- Dashboard management di `apps/portal`
- Shared database menggunakan Supabase
- Dedicated AI Stylist studio di `/stylist`

## 2. Architecture

```text
YOORA-SARAH (Monorepo)
├── apps/
│   ├── portal    (Dashboard management internal)
│   └── web       (Customer e-commerce website + AI Stylist studio)
├── services/
│   └── api       (FastAPI backend)
├── db/
│   ├── migrations/
│   └── seeds/
└── tools/
    └── db/
```

## 3. Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase / PostgreSQL |
| Backend API | FastAPI |
| Icons | Lucide React |

## 4. Website Routes

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Single-scene homepage hero with fixed header and in-viewport clearance rail |
| Stylist | `/stylist` | Private AI Stylist studio with chat, outfit building, item matching, and product-to-model workflows |
| Category | `/[category]` | Category product page |
| Product Detail | `/[category]/[productSlug]` | Product detail page |
| Search | `/search` | Pencarian produk |
| Cart | `/cart` | Keranjang belanja |
| Wishlist | `/wishlist` | Daftar keinginan |
| Profile | `/profile` | Dashboard customer |
| Checkout | `/checkout` | Proses checkout |

## 5. Home Page Experience

The homepage is a one-page, single-scene hero experience.

It includes:
1. Fixed navigation header
2. Hero media sequence
3. In-viewport clearance rail
4. Navbar entry to the dedicated `/stylist` studio

The homepage does not expand into a long scrolling landing page.
Advanced AI styling workflows live inside `/stylist`.

## 6. AI Stylist Studio

The active AI Stylist direction centers on `/stylist` as a premium workspace for customers.

Core workflows:
- Start with a brief
- Build my outfit
- Match my item
- Product to model

Result expectations:
- 1 hero look
- alternative looks
- compatibility guidance
- refinement prompts
- visual product preview when relevant

## 7. Notes

- Brand identity follows Yoora Sarah's premium modest fashion direction
- Homepage hero should stay single-page and should not gain extra scroll-below sections
- Advanced AI workflows belong inside `/stylist`, not on the homepage
