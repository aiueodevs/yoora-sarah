CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'converted', 'abandoned')),
  shipping_cost NUMERIC(12,2) NOT NULL DEFAULT 18000,
  service_fee NUMERIC(12,2) NOT NULL DEFAULT 2000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX carts_customer_id_idx ON carts (customer_id);
CREATE UNIQUE INDEX carts_active_customer_idx ON carts (customer_id) WHERE status = 'active';

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX cart_items_cart_id_idx ON cart_items (cart_id);
CREATE INDEX cart_items_product_id_idx ON cart_items (product_id);
CREATE UNIQUE INDEX cart_items_cart_variant_idx ON cart_items (cart_id, variant_id) WHERE variant_id IS NOT NULL;

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS deny_anon_all ON public.carts;
DROP POLICY IF EXISTS deny_authenticated_all ON public.carts;
CREATE POLICY deny_anon_all ON public.carts AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY deny_authenticated_all ON public.carts AS RESTRICTIVE FOR ALL TO authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS deny_anon_all ON public.cart_items;
DROP POLICY IF EXISTS deny_authenticated_all ON public.cart_items;
CREATE POLICY deny_anon_all ON public.cart_items AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY deny_authenticated_all ON public.cart_items AS RESTRICTIVE FOR ALL TO authenticated USING (false) WITH CHECK (false);
