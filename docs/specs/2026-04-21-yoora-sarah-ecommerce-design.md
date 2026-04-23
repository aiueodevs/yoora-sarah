# Yoora Sarah E-Commerce Website Specification

**Date:** 2026-04-21  
**Project:** Yoora Sarah Customer-Facing Website  
**Status:** Approved

## 1. Project Overview

**Purpose:**  
Membangun website e-commerce untuk brand fashion muslim Yoora Sarah yang terpisah dari dashboard management (portal) tetapi tetap terintegrasi dan sinkron.

**Scope:**  
- Customer-facing website di `apps/web`
- Dashboard management yang sudah ada di `apps/portal`
- Shared database menggunakan Supabase

## 2. Architecture

```
YOORA-SARAH (Monorepo - Turborepo)
├── apps/
│   ├── portal    (Yang sudah ada - Dashboard Management Internal)
│   │   ├── app/           (Next.js App Router)
│   │   ├── lib/           (API clients, utilities)
│   │   ├── components/    (Portal-specific components)
│   │   └── package.json
│   └── web       (BARU - Customer E-Commerce Website)
│       ├── app/           (Next.js App Router)
│       ├── lib/           (API clients, utilities)
│       ├── components/    (E-commerce components)
│       └── package.json
├── packages/
│   ├── ui               (Shared UI components)
│   ├── database         (Shared Supabase client)
│   └── config           (Shared configuration)
├── db/
│   ├── migrations/      (Database migrations)
│   └── seeds/           (Initial data)
├── turbo.json
└── pnpm-workspace.yaml
```

## 3. Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + Shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Better Auth / Supabase Auth |
| State | Zustand + React Query |
| i18n | next-intl |
| Icons | Lucide React |

## 4. Database Schema (Shared)

### 4.1 Tables

```sql
-- Products
products (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  compare_price NUMERIC,
  images TEXT[],
  category_id UUID REFERENCES categories(id),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Categories
categories (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMP
)

-- Product Variants
product_variants (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  sku TEXT,
  name TEXT,
  color TEXT,
  size TEXT,
  price NUMERIC,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
)

-- Customers
customers (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  phone TEXT,
  password_hash TEXT,
  created_at TIMESTAMP
)

-- Customer Addresses
customer_addresses (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  name TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  phone TEXT,
  is_default BOOLEAN DEFAULT false
)

-- Orders
orders (
  id UUID PRIMARY KEY,
  order_number TEXT UNIQUE,
  customer_id UUID REFERENCES customers(id),
  status TEXT,
  subtotal NUMERIC,
  shipping_cost NUMERIC,
  total NUMERIC,
  shipping_address_id UUID REFERENCES customer_addresses(id),
  payment_method TEXT,
  payment_status TEXT,
  created_at TIMESTAMP
)

-- Order Items
order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER,
  price NUMERIC
)

-- Wishlists
wishlists (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  product_id UUID REFERENCES products(id),
  created_at TIMESTAMP
)
```

## 5. Website Sections

### 5.1 Main Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page dengan semua section |
| Category | `/[category]` | Halaman kategori produk |
| Product Detail | `/product/[slug]` | Detail produk dengan variant |
| Search | `/search` | Pencarian produk |
| Cart | `/cart` | Keranjang belanja |
| Checkout | `/checkout` | Proses checkout |
| Auth - Login | `/login` | Login customer |
| Auth - Register | `/register` | Registrasi customer |
| Profile | `/profile` | Dashboard customer |
| Orders | `/orders` | Riwayat pesanan |
| Wishlist | `/wishlist` | Daftar keinginan |

### 5.2 Home Page Sections

1. **Navigation Header**
   - Logo (kiri)
   - Search bar (tengah)
   - Icons: Cart, Wishlist, Profile (kanan)
   - Mobile: Hamburger menu

2. **Category Tabs**
   - Best Seller (Terlaris)
   - Sale (Diskon)
   - New Arrival (Koleksi Terbaru)
   - Exclusive (Eksklusif)
   - Coming Soon (Segera Hadir)

3. **Hero Banner**
   - Full-width image carousel
   - CTA buttons

4. **Featured Products Grid**
   - Product cards dengan:
     - Image
     - Nama produk
     - Harga (diskon显示原价)
     - Quick add to cart
     - Wishlist button

5. **Category Showcase**
   - Grid kategori dengan image

6. **Footer**
   - Company info
   - Quick links
   - Payment methods
   - Shipping methods
   - Customer service contact
   - Social media
   - Copyright

### 5.3 Product Card Components

```
┌─────────────────────┐
│  [Product Image]   │
│                   │
│  [Wishlist Button]  │
├─────────────────────┤
│  Product Name     │
│  Rp XXX.000      │
│  Rp YYY.000     │  (jika ada diskon)
│  ─────────────────│
│  [S] [M] [L]     │  (size options)
│  [+] [-] [Cart]  │
└─────────────────────┘
```

### 5.4 Feature Specifications

- **Multi-language**: Indonesian (default), English
- **Variant Selection**: Color, Size dengan stock check
- **Shopping Cart**: Add/remove/update quantity
- **Wishlist**: Save for later
- **Checkout Flow**: Address → Shipping → Payment → Confirmation
- **Order Tracking**: Dari checkout sampai delivery
- **WhatsApp Integration**: Floating button untuk customer service

## 6. UI/UX Specification

### 6.1 Design Tokens (sesuai yoorasarah.com)

```css
/* Font */
--font-family: 'Poppins', sans-serif;

/* Colors - Neutral & Elegant */
--color-primary: #000000;
--color-secondary: #666666;
--color-accent: #BDBDBD;
--color-background: #FFFFFF;
--color-surface: #F5F5F5;
--color-error: #DC2626;
--color-success: #16A34A;

/* Spacing */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;

/* Border Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
```

### 6.2 Responsive Breakpoints

| Breakpoint | Width |
|-----------|-------|
| Mobile | < 640px |
| Tablet | 640px - 1024px |
| Desktop | > 1024px |

### 6.3 Component States

- **Default**: Base state
- **Hover**: Interactive feedback
- **Active**: Pressed state
- **Disabled**: Non-interactive
- **Loading**: Async processing
- **Error**: Validation error
- **Success**: Operation complete

## 7. Integration dengan Portal

### 7.1 Data Sync

| Data Type | Portal → Web | Web → Portal |
|----------|-------------|--------------|
| Products | ✅ Read | ✅ Create/Update |
| Categories | ✅ Read | ✅ Create/Update |
| Orders | ❌ | ✅ Create (from web) |
| Customers | ✅ Read | ✅ Create (from register) |

### 7.2 Shared Components

- `@yoora/ui` - Button, Input, Card, etc.
- `@yoora/database` - Supabase client
- `@yoora/config` - Environment variables

## 8. Implementation Phases

### Phase 1: Foundation
- [ ] Setup `apps/web` project
- [ ] Configure Tailwind + Shadcn/ui
- [ ] Setup shared Supabase client
- [ ] Create base layout components

### Phase 2: Core Pages
- [ ] Home page dengan all sections
- [ ] Navigation header
- [ ] Footer
- [ ] Product detail page

### Phase 3: E-Commerce Features
- [ ] Cart functionality
- [ ] Checkout flow
- [ ] User authentication

### Phase 4: User Dashboard
- [ ] Profile management
- [ ] Order history
- [ ] Wishlist

### Phase 5: Polish & Deploy
- [ ] Responsive testing
- [ ] Performance optimization
- [ ] Deployment to Vercel

## 9. Acceptance Criteria

1. ✅ Website menampilkan semua section seperti yoorasarah.com
2. ✅ Products sync dengan portal
3. ✅ Cart dan checkout berfungsi
4. ✅ User bisa login/register
5. ✅ Responsive di mobile, tablet, desktop
6. ✅ Loading speed < 3 detik
7. ✅ SEO optimized
8. ✅ WhatsApp integration berfungsi

## 10. Notes

- Brand identity mengikuti yoorasarah.com (Muslim fashion, elegant, premium)
- Konten produk diambil dari yoorasarah.com
- Database menggunakan yang sudah ada di Supabase
- Deployment: Vercel (sama seperti portal)