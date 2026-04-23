CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  hero_image TEXT,
  eyebrow TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX categories_parent_id_idx ON categories (parent_id);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description_blocks TEXT[] NOT NULL DEFAULT '{}',
  materials TEXT[] NOT NULL DEFAULT '{}',
  care_instructions TEXT[] NOT NULL DEFAULT '{}',
  price NUMERIC(12,2) NOT NULL,
  compare_price NUMERIC(12,2),
  image TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  badge TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  swatch_count INTEGER NOT NULL DEFAULT 0,
  stock_state TEXT CHECK (stock_state IN ('in_stock', 'low_stock', 'out_of_stock', 'preorder')),
  trust_badges TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX products_category_id_idx ON products (category_id);
CREATE INDEX products_is_active_idx ON products (is_active);

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  color_name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  size_code TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, color_name, size_code)
);
CREATE INDEX product_variants_product_id_idx ON product_variants (product_id);

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  member_state TEXT NOT NULL DEFAULT 'guest' CHECK (member_state IN ('guest', 'member_active', 'member_priority')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX customers_email_lower_uq ON customers (LOWER(email));

CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX customer_addresses_customer_id_idx ON customer_addresses (customer_id);
CREATE UNIQUE INDEX customer_addresses_default_idx ON customer_addresses (customer_id) WHERE is_default;

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('awaiting_payment', 'processing', 'ready_to_ship', 'shipped', 'delivered')),
  subtotal NUMERIC(12,2) NOT NULL,
  shipping_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  service_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  shipping_address_id UUID REFERENCES customer_addresses(id) ON DELETE RESTRICT,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  payment_due_at TIMESTAMPTZ,
  placed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX orders_customer_id_idx ON orders (customer_id);
CREATE INDEX orders_status_idx ON orders (status);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX order_items_order_id_idx ON order_items (order_id);
CREATE INDEX order_items_product_id_idx ON order_items (product_id);

CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (customer_id, product_id)
);
CREATE INDEX wishlists_customer_id_idx ON wishlists (customer_id);

CREATE TABLE support_policy_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  href TEXT NOT NULL,
  topics TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE support_handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_reference TEXT,
  order_reference TEXT,
  reason TEXT NOT NULL,
  context_summary TEXT NOT NULL,
  requested_channel TEXT NOT NULL CHECK (requested_channel IN ('whatsapp', 'human_cs')),
  source TEXT NOT NULL CHECK (source IN ('checkout', 'order_tracking', 'buyer_ai', 'profile')),
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('draft', 'ready', 'submitted')),
  next_action TEXT NOT NULL,
  contact_whatsapp_number TEXT,
  contact_whatsapp_href TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX support_handoffs_created_at_idx ON support_handoffs (created_at DESC);

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOR table_name IN
    SELECT unnest(
      ARRAY[
        'categories',
        'products',
        'product_variants',
        'customers',
        'customer_addresses',
        'orders',
        'order_items',
        'wishlists',
        'support_policy_articles',
        'support_handoffs'
      ]
    )
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_name);
    EXECUTE format('DROP POLICY IF EXISTS deny_anon_all ON public.%I;', table_name);
    EXECUTE format('DROP POLICY IF EXISTS deny_authenticated_all ON public.%I;', table_name);
    EXECUTE format(
      'CREATE POLICY deny_anon_all ON public.%I AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);',
      table_name
    );
    EXECUTE format(
      'CREATE POLICY deny_authenticated_all ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (false) WITH CHECK (false);',
      table_name
    );
  END LOOP;
END $$;
