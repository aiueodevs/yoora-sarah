WITH seeded_products AS (
  SELECT *
  FROM (
    VALUES
      (
        '21000000-0000-0000-0000-000000000001'::uuid,
        'alya-abaya-7101',
        'Alya Abaya',
        ARRAY[
          'Alya Abaya membawa siluet jatuh yang tenang untuk agenda harian hingga pertemuan istimewa.',
          'Potongannya ringan, rapi, dan mudah dipadukan dengan khimar atau hijab bernuansa lembut.'
        ]::text[],
        ARRAY[
          'Nidha premium dengan tekstur halus dan jatuh kain yang stabil.',
          'Finishing manset lembut agar nyaman dipakai lebih lama.'
        ]::text[],
        ARRAY[
          'Cuci dengan tangan atau mode lembut.',
          'Gunakan steamer suhu rendah untuk menjaga jatuh kain.'
        ]::text[],
        359000::numeric,
        NULL::numeric,
        'https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260327_070011_45df0414.PNG',
        'abaya-2481',
        'Signature Abaya',
        TRUE,
        TRUE,
        2,
        'in_stock',
        ARRAY['Ready stock', 'Panduan layering tersedia']::text[],
        ARRAY['abaya', 'signature-edit']::text[]
      ),
      (
        '21000000-0000-0000-0000-000000000002'::uuid,
        'sereen-khimar-8824',
        'Sereen Khimar',
        ARRAY[
          'Sereen Khimar dirancang dengan jatuh lembut dan coverage yang terasa aman tanpa berat berlebih.',
          'Pilihan warnanya dibuat tenang untuk melengkapi dress, abaya, maupun essentials harian.'
        ]::text[],
        ARRAY[
          'Ceruty airy dengan feel ringan.',
          'Jahitan tepi halus agar bentuk tetap rapi.'
        ]::text[],
        ARRAY[
          'Cuci lembut dengan air dingin.',
          'Simpan tergantung agar siluet tetap terjaga.'
        ]::text[],
        149000::numeric,
        NULL::numeric,
        'https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260314_064210_d2574db9.png',
        'khimar-5295',
        NULL,
        TRUE,
        TRUE,
        2,
        'in_stock',
        ARRAY['Coverage nyaman', 'Mudah dipadukan']::text[],
        ARRAY['khimar', 'daily-edit']::text[]
      ),
      (
        '21000000-0000-0000-0000-000000000003'::uuid,
        'naima-pashmina-4810',
        'Naima Pashmina',
        ARRAY[
          'Naima Pashmina menghadirkan tekstur lembut dan bentuk yang mudah dibentuk untuk styling cepat.',
          'Tone warnanya dibuat refined agar menyatu dengan koleksi Yoora Sarah.'
        ]::text[],
        ARRAY[
          'Voal premium ringan.',
          'Tekstur matte lembut yang tidak licin berlebihan.'
        ]::text[],
        ARRAY[
          'Gunakan detergen lembut.',
          'Setrika suhu rendah dari sisi dalam.'
        ]::text[],
        99000::numeric,
        NULL::numeric,
        'https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260314_064042_b9760498.png',
        'pashmina-2310',
        NULL,
        FALSE,
        TRUE,
        2,
        'in_stock',
        ARRAY['All day comfort', 'Tone mudah dipadu']::text[],
        ARRAY['pashmina', 'styling-essential']::text[]
      ),
      (
        '21000000-0000-0000-0000-000000000004'::uuid,
        'rania-hijab-6405',
        'Rania Hijab',
        ARRAY[
          'Rania Hijab dibuat untuk tampilan ringkas dengan coverage nyaman dan tone yang clean.',
          'Pilihan tepat untuk daily rotation yang tetap terasa polished.'
        ]::text[],
        ARRAY[
          'Voal soft touch.',
          'Karakter kain ringan dengan struktur rapi.'
        ]::text[],
        ARRAY[
          'Cuci dengan tangan.',
          'Hindari pemutih langsung pada warna lembut.'
        ]::text[],
        89000::numeric,
        NULL::numeric,
        'https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260408_013541_7dddda2f.png',
        'hijab-1544',
        NULL,
        FALSE,
        TRUE,
        2,
        'in_stock',
        ARRAY['Siap kirim', 'Ringan dipakai']::text[],
        ARRAY['hijab', 'daily-core']::text[]
      ),
      (
        '21000000-0000-0000-0000-000000000005'::uuid,
        'ameera-sandals-3052',
        'Ameera Sandals',
        ARRAY[
          'Ameera Sandals menghadirkan langkah yang ringan dengan proporsi refined untuk melengkapi modest look.',
          'Bagian sol dibuat nyaman untuk dipakai dari siang hingga malam.'
        ]::text[],
        ARRAY[
          'Upper sintetis premium.',
          'Insole empuk dengan grip stabil.'
        ]::text[],
        ARRAY[
          'Lap dengan kain lembut setelah digunakan.',
          'Simpan pada dust bag agar bentuk tetap terjaga.'
        ]::text[],
        229000::numeric,
        NULL::numeric,
        'https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260327_070356_9a2c7245.JPG',
        'footwear-8675',
        NULL,
        FALSE,
        TRUE,
        2,
        'in_stock',
        ARRAY['Nyaman untuk daily wear', 'Mudah dipadukan']::text[],
        ARRAY['footwear', 'complete-the-look']::text[]
      ),
      (
        '21000000-0000-0000-0000-000000000006'::uuid,
        'luna-brooch-set-1944',
        'Luna Brooch Set',
        ARRAY[
          'Luna Brooch Set memberi aksen halus yang menyempurnakan styling tanpa terasa berlebihan.',
          'Pilihan finishing kecil untuk tampilan yang lebih selesai.'
        ]::text[],
        ARRAY[
          'Metal alloy ringan.',
          'Finishing glossy yang halus.'
        ]::text[],
        ARRAY[
          'Simpan di tempat kering.',
          'Hindari kontak langsung dengan parfum cair.'
        ]::text[],
        79000::numeric,
        NULL::numeric,
        'https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260327_070514_269aab7c.JPG',
        'accessories-4472',
        NULL,
        FALSE,
        TRUE,
        2,
        'in_stock',
        ARRAY['Detail finishing elegan', 'Cocok untuk gifting']::text[],
        ARRAY['accessories', 'giftable']::text[]
      ),
      (
        '21000000-0000-0000-0000-000000000007'::uuid,
        'nahla-kids-dress-2308',
        'Nahla Kids Dress',
        ARRAY[
          'Nahla Kids Dress menghadirkan tone lembut dan potongan nyaman untuk aktivitas si kecil.',
          'Dirancang ringan agar tetap rapi untuk momen keluarga maupun acara spesial.'
        ]::text[],
        ARRAY[
          'Katun rayon lembut.',
          'Inner ringan agar nyaman bergerak.'
        ]::text[],
        ARRAY[
          'Cuci dengan warna serupa.',
          'Setrika suhu rendah seperlunya.'
        ]::text[],
        189000::numeric,
        NULL::numeric,
        'https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260314_064253_e0f5f8fd.png',
        'kids-9967',
        NULL,
        TRUE,
        TRUE,
        2,
        'low_stock',
        ARRAY['Nyaman untuk anak', 'Ukuran terbatas']::text[],
        ARRAY['kids', 'family-edit']::text[]
      ),
      (
        '21000000-0000-0000-0000-000000000008'::uuid,
        'inner-luma-1173',
        'Inner Luma',
        ARRAY[
          'Inner Luma menjadi essentials layering yang bersih, ringan, dan mudah dipakai ulang.',
          'Proporsinya dibuat ringkas agar nyaman digunakan di balik dress maupun abaya.'
        ]::text[],
        ARRAY[
          'Spandex rayon lembut.',
          'Stretch nyaman untuk pemakaian seharian.'
        ]::text[],
        ARRAY[
          'Cuci lembut dengan warna senada.',
          'Keringkan di tempat teduh.'
        ]::text[],
        119000::numeric,
        NULL::numeric,
        'https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260406_032345_f8da4608.png',
        'essentials-7002',
        NULL,
        FALSE,
        TRUE,
        2,
        'in_stock',
        ARRAY['Layering essential', 'Ready stock']::text[],
        ARRAY['essentials', 'layering']::text[]
      ),
      (
        '21000000-0000-0000-0000-000000000009'::uuid,
        'safa-one-set-6112',
        'Safa One Set',
        ARRAY[
          'Safa One Set menawarkan tampilan selesai sejak awal dengan proporsi atas-bawah yang seimbang.',
          'Pilihan tepat untuk buyer yang ingin styling cepat tanpa kehilangan rasa refined.'
        ]::text[],
        ARRAY[
          'Nidha blend dengan jatuh kain yang clean.',
          'Waist finishing lembut untuk kenyamanan pemakaian.'
        ]::text[],
        ARRAY[
          'Cuci dengan mode lembut.',
          'Gunakan hanger untuk menjaga proporsi set.'
        ]::text[],
        429000::numeric,
        NULL::numeric,
        'https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034512_610519bd.jpg',
        'one-set-5182',
        'New Drop',
        TRUE,
        TRUE,
        2,
        'in_stock',
        ARRAY['Set siap pakai', 'Bantuan styling tersedia']::text[],
        ARRAY['one-set', 'occasion-edit']::text[]
      )
  ) AS seeded(
    id,
    slug,
    name,
    description_blocks,
    materials,
    care_instructions,
    price,
    compare_price,
    image,
    category_slug,
    badge,
    is_featured,
    is_active,
    swatch_count,
    stock_state,
    trust_badges,
    tags
  )
)
INSERT INTO products (
  id,
  slug,
  name,
  description_blocks,
  materials,
  care_instructions,
  price,
  compare_price,
  image,
  category_id,
  badge,
  is_featured,
  is_active,
  swatch_count,
  stock_state,
  trust_badges,
  tags
)
SELECT
  seeded.id,
  seeded.slug,
  seeded.name,
  seeded.description_blocks,
  seeded.materials,
  seeded.care_instructions,
  seeded.price,
  seeded.compare_price,
  seeded.image,
  categories.id,
  seeded.badge,
  seeded.is_featured,
  seeded.is_active,
  seeded.swatch_count,
  seeded.stock_state,
  seeded.trust_badges,
  seeded.tags
FROM seeded_products AS seeded
JOIN categories
  ON categories.slug = seeded.category_slug
ON CONFLICT (id) DO UPDATE
SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  description_blocks = EXCLUDED.description_blocks,
  materials = EXCLUDED.materials,
  care_instructions = EXCLUDED.care_instructions,
  price = EXCLUDED.price,
  compare_price = EXCLUDED.compare_price,
  image = EXCLUDED.image,
  category_id = EXCLUDED.category_id,
  badge = EXCLUDED.badge,
  is_featured = EXCLUDED.is_featured,
  is_active = EXCLUDED.is_active,
  swatch_count = EXCLUDED.swatch_count,
  stock_state = EXCLUDED.stock_state,
  trust_badges = EXCLUDED.trust_badges,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO product_variants (id, product_id, sku, color_name, color_hex, size_code, stock, image_urls, position, is_active)
VALUES
  ('31000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000001', 'ALYA-MOC-M', 'Mocha', '#8a7369', 'M', 3, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260327_070011_45df0414.PNG'], 1, TRUE),
  ('31000000-0000-0000-0000-000000000002', '21000000-0000-0000-0000-000000000001', 'ALYA-MOC-L', 'Mocha', '#8a7369', 'L', 2, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260327_070011_45df0414.PNG'], 2, TRUE),
  ('31000000-0000-0000-0000-000000000003', '21000000-0000-0000-0000-000000000001', 'ALYA-SAN-M', 'Sand', '#c7b4a3', 'M', 2, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260327_070011_45df0414.PNG'], 3, TRUE),
  ('31000000-0000-0000-0000-000000000004', '21000000-0000-0000-0000-000000000001', 'ALYA-SAN-L', 'Sand', '#c7b4a3', 'L', 2, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260327_070011_45df0414.PNG'], 4, TRUE),
  ('31000000-0000-0000-0000-000000000005', '21000000-0000-0000-0000-000000000002', 'SEREEN-DUS-REG', 'Dusty Olive', '#8e8a7a', 'Regular', 4, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260314_064210_d2574db9.png'], 1, TRUE),
  ('31000000-0000-0000-0000-000000000006', '21000000-0000-0000-0000-000000000002', 'SEREEN-DUS-LNG', 'Dusty Olive', '#8e8a7a', 'Long', 3, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260314_064210_d2574db9.png'], 2, TRUE),
  ('31000000-0000-0000-0000-000000000007', '21000000-0000-0000-0000-000000000002', 'SEREEN-MIS-REG', 'Misty Rose', '#b4979c', 'Regular', 3, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260314_064210_d2574db9.png'], 3, TRUE),
  ('31000000-0000-0000-0000-000000000008', '21000000-0000-0000-0000-000000000003', 'NAIMA-TAU-OS', 'Taupe', '#a48d82', 'All Size', 6, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260314_064042_b9760498.png'], 1, TRUE),
  ('31000000-0000-0000-0000-000000000009', '21000000-0000-0000-0000-000000000003', 'NAIMA-SAG-OS', 'Sage', '#98a28f', 'All Size', 5, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260314_064042_b9760498.png'], 2, TRUE),
  ('31000000-0000-0000-0000-000000000010', '21000000-0000-0000-0000-000000000004', 'RANIA-IVO-OS', 'Ivory Sand', '#d7cdc1', 'All Size', 6, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260408_013541_7dddda2f.png'], 1, TRUE),
  ('31000000-0000-0000-0000-000000000011', '21000000-0000-0000-0000-000000000004', 'RANIA-COF-OS', 'Coffee Beige', '#9b8477', 'All Size', 6, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260408_013541_7dddda2f.png'], 2, TRUE),
  ('31000000-0000-0000-0000-000000000012', '21000000-0000-0000-0000-000000000005', 'AMEERA-ESP-37', 'Espresso', '#5b463a', '37', 2, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260327_070356_9a2c7245.JPG'], 1, TRUE),
  ('31000000-0000-0000-0000-000000000013', '21000000-0000-0000-0000-000000000005', 'AMEERA-ESP-38', 'Espresso', '#5b463a', '38', 2, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260327_070356_9a2c7245.JPG'], 2, TRUE),
  ('31000000-0000-0000-0000-000000000014', '21000000-0000-0000-0000-000000000005', 'AMEERA-ESP-39', 'Espresso', '#5b463a', '39', 1, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260327_070356_9a2c7245.JPG'], 3, TRUE),
  ('31000000-0000-0000-0000-000000000015', '21000000-0000-0000-0000-000000000005', 'AMEERA-BON-38', 'Bone', '#d4cabf', '38', 2, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260327_070356_9a2c7245.JPG'], 4, TRUE),
  ('31000000-0000-0000-0000-000000000016', '21000000-0000-0000-0000-000000000006', 'LUNA-GOL-OS', 'Gold', '#b7924d', 'One Size', 8, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260327_070514_269aab7c.JPG'], 1, TRUE),
  ('31000000-0000-0000-0000-000000000017', '21000000-0000-0000-0000-000000000006', 'LUNA-SIL-OS', 'Silver', '#c0c0c0', 'One Size', 8, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260327_070514_269aab7c.JPG'], 2, TRUE),
  ('31000000-0000-0000-0000-000000000018', '21000000-0000-0000-0000-000000000007', 'NAHLA-BLS-2Y', 'Blush', '#d8b0b0', '2Y', 1, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260314_064253_e0f5f8fd.png'], 1, TRUE),
  ('31000000-0000-0000-0000-000000000019', '21000000-0000-0000-0000-000000000007', 'NAHLA-BLS-4Y', 'Blush', '#d8b0b0', '4Y', 1, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260314_064253_e0f5f8fd.png'], 2, TRUE),
  ('31000000-0000-0000-0000-000000000020', '21000000-0000-0000-0000-000000000007', 'NAHLA-MIN-6Y', 'Mint', '#a8c5b1', '6Y', 1, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260314_064253_e0f5f8fd.png'], 3, TRUE),
  ('31000000-0000-0000-0000-000000000021', '21000000-0000-0000-0000-000000000008', 'LUMA-IVO-S', 'Ivory', '#e6ddd3', 'S', 5, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260406_032345_f8da4608.png'], 1, TRUE),
  ('31000000-0000-0000-0000-000000000022', '21000000-0000-0000-0000-000000000008', 'LUMA-IVO-M', 'Ivory', '#e6ddd3', 'M', 5, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260406_032345_f8da4608.png'], 2, TRUE),
  ('31000000-0000-0000-0000-000000000023', '21000000-0000-0000-0000-000000000008', 'LUMA-MOC-L', 'Mocha', '#8d7568', 'L', 4, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260406_032345_f8da4608.png'], 3, TRUE),
  ('31000000-0000-0000-0000-000000000024', '21000000-0000-0000-0000-000000000009', 'SAFA-OAT-S', 'Oat', '#b9aa9c', 'S', 2, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034512_610519bd.jpg'], 1, TRUE),
  ('31000000-0000-0000-0000-000000000025', '21000000-0000-0000-0000-000000000009', 'SAFA-OAT-M', 'Oat', '#b9aa9c', 'M', 2, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034512_610519bd.jpg'], 2, TRUE),
  ('31000000-0000-0000-0000-000000000026', '21000000-0000-0000-0000-000000000009', 'SAFA-SLATE-L', 'Slate', '#847c7a', 'L', 1, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034512_610519bd.jpg'], 3, TRUE)
ON CONFLICT (id) DO UPDATE
SET
  product_id = EXCLUDED.product_id,
  sku = EXCLUDED.sku,
  color_name = EXCLUDED.color_name,
  color_hex = EXCLUDED.color_hex,
  size_code = EXCLUDED.size_code,
  stock = EXCLUDED.stock,
  image_urls = EXCLUDED.image_urls,
  position = EXCLUDED.position,
  is_active = EXCLUDED.is_active;

INSERT INTO wishlists (id, customer_id, product_id, created_at)
VALUES
  ('80000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000004', '2026-04-22T09:04:00+07:00'),
  ('80000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000009', '2026-04-22T09:05:00+07:00')
ON CONFLICT (id) DO UPDATE
SET
  customer_id = EXCLUDED.customer_id,
  product_id = EXCLUDED.product_id,
  created_at = EXCLUDED.created_at;

INSERT INTO carts (id, customer_id, status, shipping_cost, service_fee, created_at, updated_at)
VALUES
  (
    '61000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    'active',
    18000,
    2000,
    '2026-04-22T09:10:00+07:00',
    '2026-04-22T09:16:00+07:00'
  )
ON CONFLICT (id) DO UPDATE
SET
  customer_id = EXCLUDED.customer_id,
  status = EXCLUDED.status,
  shipping_cost = EXCLUDED.shipping_cost,
  service_fee = EXCLUDED.service_fee,
  updated_at = EXCLUDED.updated_at;

INSERT INTO cart_items (id, cart_id, product_id, variant_id, quantity, unit_price, created_at, updated_at)
VALUES
  (
    '62000000-0000-0000-0000-000000000001',
    '61000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002',
    1,
    199999,
    '2026-04-22T09:10:00+07:00',
    '2026-04-22T09:10:00+07:00'
  ),
  (
    '62000000-0000-0000-0000-000000000002',
    '61000000-0000-0000-0000-000000000001',
    '21000000-0000-0000-0000-000000000001',
    '31000000-0000-0000-0000-000000000002',
    1,
    359000,
    '2026-04-22T09:12:00+07:00',
    '2026-04-22T09:12:00+07:00'
  ),
  (
    '62000000-0000-0000-0000-000000000003',
    '61000000-0000-0000-0000-000000000001',
    '21000000-0000-0000-0000-000000000008',
    '31000000-0000-0000-0000-000000000022',
    1,
    119000,
    '2026-04-22T09:16:00+07:00',
    '2026-04-22T09:16:00+07:00'
  )
ON CONFLICT (id) DO UPDATE
SET
  cart_id = EXCLUDED.cart_id,
  product_id = EXCLUDED.product_id,
  variant_id = EXCLUDED.variant_id,
  quantity = EXCLUDED.quantity,
  unit_price = EXCLUDED.unit_price,
  updated_at = EXCLUDED.updated_at;
