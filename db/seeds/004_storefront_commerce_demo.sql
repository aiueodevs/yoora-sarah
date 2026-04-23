INSERT INTO categories (id, slug, name, description, hero_image, eyebrow)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'dress', 'Dress', 'Siluet anggun, warna cantik, dan potongan yang nyaman untuk menemani setiap momen.', 'https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260315_051257_f6b48e00.png', 'Setiap Dress Memiliki Ceritanya'),
  ('10000000-0000-0000-0000-000000000002', 'abaya-2481', 'Abaya', 'Siluet yang jatuh sempurna, menghadirkan ketenangan dan keanggunan yang terasa utuh.', 'https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260327_070011_45df0414.PNG', NULL),
  ('10000000-0000-0000-0000-000000000003', 'khimar-5295', 'Khimar', 'Khimar dengan siluet anggun dan pilihan warna yang menenangkan, dirancang untuk melengkapi setiap langkahmu dengan nyaman.', 'https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260314_064210_d2574db9.png', NULL),
  ('10000000-0000-0000-0000-000000000004', 'pashmina-2310', 'Pashmina', 'Pashmina dengan tekstur lembut dan warna-warna cantik yang mudah dipadukan untuk melengkapi setiap penampilanmu.', 'https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260314_064042_b9760498.png', NULL),
  ('10000000-0000-0000-0000-000000000005', 'hijab-1544', 'Hijab', 'Pilihan hijab refined dengan tone lembut yang terasa rapi, ringan, dan modern.', 'https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260408_013541_7dddda2f.png', NULL),
  ('10000000-0000-0000-0000-000000000006', 'footwear-8675', 'Footwear', 'Langkah yang tegas dengan desain refined yang melengkapi tampilan secara effortless.', 'https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260327_070356_9a2c7245.JPG', NULL),
  ('10000000-0000-0000-0000-000000000007', 'accessories-4472', 'Accessories', 'Detail elegan yang menyempurnakan tampilan dengan sentuhan berkelas yang halus.', 'https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260327_070514_269aab7c.JPG', NULL),
  ('10000000-0000-0000-0000-000000000008', 'kids-9967', 'Kids', 'Pilihan busana yang nyaman dan manis untuk si kecil, dengan warna-warna lembut yang siap menemani setiap langkah cerianya.', 'https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260314_064253_e0f5f8fd.png', NULL),
  ('10000000-0000-0000-0000-000000000009', 'essentials-7002', 'Essentials', 'Essentials serbaguna untuk layering yang terasa bersih, ringkas, dan matang.', 'https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260406_032345_f8da4608.png', NULL),
  ('10000000-0000-0000-0000-000000000010', 'one-set-5182', 'One Set', 'Edit komplit yang memudahkan styling dengan proporsi yang sudah selesai sejak awal.', 'https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034512_610519bd.jpg', NULL)
ON CONFLICT (id) DO UPDATE
SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  hero_image = EXCLUDED.hero_image,
  eyebrow = EXCLUDED.eyebrow;

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
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    'clara-dress-5254',
    'Clara Dress',
    ARRAY[
      'Clara Dress dari Yoora Sarah hadir sebagai pilihan feminin dengan sentuhan glamor yang tetap sopan.',
      'Busui friendly dengan resleting depan, detail lengan balon berhias payet, serta pilihan ukuran lengkap untuk tampilan formal maupun momen spesial.'
    ],
    ARRAY[
      'Ceruty Babydoll dengan jatuh kain yang lembut dan flowy.',
      'Full puring premium berbahan jersey agar lebih adem di kulit.'
    ],
    ARRAY[
      'Cuci tangan atau gunakan mode lembut dengan air dingin.',
      'Setrika suhu rendah dari sisi dalam atau gunakan steamer.'
    ],
    199999,
    NULL,
    'https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_064832_e5543942.jpg',
    '10000000-0000-0000-0000-000000000001',
    'Best Seller',
    TRUE,
    TRUE,
    13,
    'low_stock',
    ARRAY['Stok terbatas', 'Busui friendly', 'Bantuan ukuran tersedia'],
    ARRAY['featured', 'occasionwear']
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'yoora-dress-9662',
    'Yoora Dress',
    ARRAY[
      'Yoora Dress mengedepankan garis potong yang bersih dan jatuh kain yang rapi.',
      'Proporsinya dibuat ringan untuk dipakai dari agenda sehari-hari hingga acara semi-formal.'
    ],
    ARRAY['Ceruty ringan dengan inner nyaman.', 'Finishing halus pada area lengan dan badan.'],
    ARRAY['Cuci dengan warna serupa.', 'Gunakan suhu rendah saat menyetrika.'],
    199999,
    NULL,
    'https://yoorasarah-products.fly.storage.tigris.dev/products/20260326_031815_9bb48e29.jpeg',
    '10000000-0000-0000-0000-000000000001',
    NULL,
    FALSE,
    TRUE,
    10,
    'in_stock',
    ARRAY['Siap kirim', 'Panduan ukuran tersedia'],
    ARRAY[]::TEXT[]
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'bella-dress-4179',
    'Bella Dress',
    ARRAY[
      'Bella Dress menonjolkan detail tekstur dan volume yang lebih dramatis.',
      'Siluetnya tetap modest namun memberi kesan formal yang kuat.'
    ],
    ARRAY['Outer ringan dengan tekstur lembut.', 'Furing halus agar nyaman sepanjang hari.'],
    ARRAY['Simpan dengan hanger lebar.', 'Hindari panas tinggi langsung pada detail tekstur.'],
    419000,
    NULL,
    'https://yoorasarah-products.fly.storage.tigris.dev/products/20260314_082635_51d02692.png',
    '10000000-0000-0000-0000-000000000001',
    NULL,
    FALSE,
    TRUE,
    18,
    'low_stock',
    ARRAY['Pilihan acara formal', 'Butuh bantuan styling?'],
    ARRAY[]::TEXT[]
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    'medina-dress-8751',
    'Medina Dress',
    ARRAY[
      'Medina Dress memberi karakter lembut dengan proporsi yang ramping dan refined.',
      'Cocok untuk tampilan sehari-hari yang tetap polished.'
    ],
    ARRAY['Kain ringan dengan gerak yang luwes.', 'Inner nyaman untuk pemakaian lama.'],
    ARRAY['Cuci lembut.', 'Steamer dianjurkan untuk hasil paling rapi.'],
    179999,
    NULL,
    'https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034512_610519bd.jpg',
    '10000000-0000-0000-0000-000000000001',
    NULL,
    FALSE,
    TRUE,
    10,
    'in_stock',
    ARRAY['Ready stock', 'Tersedia bantuan warna'],
    ARRAY[]::TEXT[]
  )
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
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'CLARA-CAP-S', 'Cappucino', '#987d6f', 'S', 1, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_064832_e5543942.jpg', 'https://yoorasarah-products.fly.storage.tigris.dev/products/20260409_081105_1eb842fd.JPG'], 1, TRUE),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'CLARA-CAP-M', 'Cappucino', '#987d6f', 'M', 2, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_064832_e5543942.jpg', 'https://yoorasarah-products.fly.storage.tigris.dev/products/20260409_081105_1eb842fd.JPG'], 2, TRUE),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'CLARA-CAP-L', 'Cappucino', '#987d6f', 'L', 1, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_064832_e5543942.jpg', 'https://yoorasarah-products.fly.storage.tigris.dev/products/20260409_081105_1eb842fd.JPG'], 3, TRUE),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 'CLARA-CAP-XL', 'Cappucino', '#987d6f', 'XL', 0, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_064832_e5543942.jpg', 'https://yoorasarah-products.fly.storage.tigris.dev/products/20260409_081105_1eb842fd.JPG'], 4, TRUE),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', 'CLARA-CAM-S', 'Camel', '#bdadab', 'S', 1, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/products/20260327_033421_e66544b5.jpg'], 5, TRUE),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', 'CLARA-CAM-M', 'Camel', '#bdadab', 'M', 1, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/products/20260327_033421_e66544b5.jpg'], 6, TRUE),
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000001', 'CLARA-CAM-L', 'Camel', '#bdadab', 'L', 0, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/products/20260327_033421_e66544b5.jpg'], 7, TRUE),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000001', 'CLARA-CAM-XL', 'Camel', '#bdadab', 'XL', 0, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/products/20260327_033421_e66544b5.jpg'], 8, TRUE),
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000002', 'YOORA-MAU-S', 'Mauve', '#8d6f78', 'S', 3, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/products/20260326_031815_9bb48e29.jpeg'], 1, TRUE),
  ('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000002', 'YOORA-MAU-M', 'Mauve', '#8d6f78', 'M', 3, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/products/20260326_031815_9bb48e29.jpeg'], 2, TRUE),
  ('30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000002', 'YOORA-MAU-L', 'Mauve', '#8d6f78', 'L', 2, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/products/20260326_031815_9bb48e29.jpeg'], 3, TRUE),
  ('30000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000003', 'BELLA-ROS-S', 'Rose Taupe', '#8f7275', 'S', 1, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/products/20260314_082635_51d02692.png'], 1, TRUE),
  ('30000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000003', 'BELLA-ROS-M', 'Rose Taupe', '#8f7275', 'M', 1, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/products/20260314_082635_51d02692.png'], 2, TRUE),
  ('30000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000003', 'BELLA-ROS-L', 'Rose Taupe', '#8f7275', 'L', 1, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/products/20260314_082635_51d02692.png'], 3, TRUE),
  ('30000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000003', 'BELLA-ROS-XL', 'Rose Taupe', '#8f7275', 'XL', 1, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/products/20260314_082635_51d02692.png'], 4, TRUE),
  ('30000000-0000-0000-0000-000000000016', '20000000-0000-0000-0000-000000000004', 'MEDINA-BLR-S', 'Blush Rose', '#b897a0', 'S', 3, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034512_610519bd.jpg'], 1, TRUE),
  ('30000000-0000-0000-0000-000000000017', '20000000-0000-0000-0000-000000000004', 'MEDINA-BLR-M', 'Blush Rose', '#b897a0', 'M', 3, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034512_610519bd.jpg'], 2, TRUE),
  ('30000000-0000-0000-0000-000000000018', '20000000-0000-0000-0000-000000000004', 'MEDINA-BLR-L', 'Blush Rose', '#b897a0', 'L', 3, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034512_610519bd.jpg'], 3, TRUE),
  ('30000000-0000-0000-0000-000000000019', '20000000-0000-0000-0000-000000000004', 'MEDINA-BLR-XL', 'Blush Rose', '#b897a0', 'XL', 3, ARRAY['https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034512_610519bd.jpg'], 4, TRUE)
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

INSERT INTO customers (id, email, name, phone, member_state)
VALUES
  ('40000000-0000-0000-0000-000000000001', 'sarah.rahmawati@yoora.local', 'Sarah Rahmawati', '+62 823-1586-6088', 'member_active')
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  member_state = EXCLUDED.member_state,
  updated_at = now();

INSERT INTO customer_addresses (id, customer_id, label, recipient_name, phone, address_line, city, province, postal_code, is_default)
VALUES
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Rumah Subang', 'Sarah Rahmawati', '+62 823-1586-6088', 'Jl. Otto Iskandardinata No.271, Karanganyar', 'Subang', 'Jawa Barat', '41211', TRUE),
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 'Studio Bandung', 'Sarah Rahmawati', '+62 823-1586-6088', 'Jl. Ciumbuleuit No.112, Hegarmanah', 'Bandung', 'Jawa Barat', '40141', FALSE),
  ('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', 'Keluarga Jakarta', 'Sarah Rahmawati', '+62 823-1586-6088', 'Jl. Tebet Barat Dalam VIII No.5, Tebet', 'Jakarta Selatan', 'DKI Jakarta', '12810', FALSE)
ON CONFLICT (id) DO UPDATE
SET
  customer_id = EXCLUDED.customer_id,
  label = EXCLUDED.label,
  recipient_name = EXCLUDED.recipient_name,
  phone = EXCLUDED.phone,
  address_line = EXCLUDED.address_line,
  city = EXCLUDED.city,
  province = EXCLUDED.province,
  postal_code = EXCLUDED.postal_code,
  is_default = EXCLUDED.is_default;

INSERT INTO orders (
  id,
  order_number,
  customer_id,
  status,
  subtotal,
  shipping_cost,
  service_fee,
  total,
  shipping_address_id,
  payment_method,
  payment_status,
  payment_due_at,
  placed_at
)
VALUES
  (
    '60000000-0000-0000-0000-000000000001',
    'YS-2026-0419-182',
    '40000000-0000-0000-0000-000000000001',
    'awaiting_payment',
    618999,
    18000,
    2000,
    638999,
    '50000000-0000-0000-0000-000000000001',
    'virtual_account_bca',
    'pending',
    '2026-04-20T09:45:00+07:00',
    '2026-04-19T09:45:00+07:00'
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    'YS-2026-0417-145',
    '40000000-0000-0000-0000-000000000001',
    'processing',
    199999,
    18000,
    2000,
    219999,
    '50000000-0000-0000-0000-000000000002',
    'virtual_account_bca',
    'confirmed',
    '2026-04-18T14:20:00+07:00',
    '2026-04-17T14:20:00+07:00'
  )
ON CONFLICT (id) DO UPDATE
SET
  order_number = EXCLUDED.order_number,
  customer_id = EXCLUDED.customer_id,
  status = EXCLUDED.status,
  subtotal = EXCLUDED.subtotal,
  shipping_cost = EXCLUDED.shipping_cost,
  service_fee = EXCLUDED.service_fee,
  total = EXCLUDED.total,
  shipping_address_id = EXCLUDED.shipping_address_id,
  payment_method = EXCLUDED.payment_method,
  payment_status = EXCLUDED.payment_status,
  payment_due_at = EXCLUDED.payment_due_at,
  placed_at = EXCLUDED.placed_at,
  updated_at = now();

INSERT INTO order_items (id, order_id, product_id, variant_id, quantity, price)
VALUES
  ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 1, 199999),
  ('70000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000014', 1, 419000),
  ('70000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000010', 1, 199999)
ON CONFLICT (id) DO UPDATE
SET
  order_id = EXCLUDED.order_id,
  product_id = EXCLUDED.product_id,
  variant_id = EXCLUDED.variant_id,
  quantity = EXCLUDED.quantity,
  price = EXCLUDED.price;

INSERT INTO wishlists (id, customer_id, product_id, created_at)
VALUES
  ('80000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '2026-04-22T09:00:00+07:00'),
  ('80000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', '2026-04-22T09:01:00+07:00'),
  ('80000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '2026-04-22T09:02:00+07:00'),
  ('80000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', '2026-04-22T09:03:00+07:00')
ON CONFLICT (id) DO UPDATE
SET
  customer_id = EXCLUDED.customer_id,
  product_id = EXCLUDED.product_id,
  created_at = EXCLUDED.created_at;

INSERT INTO support_policy_articles (id, slug, title, summary, href, topics)
VALUES
  ('90000000-0000-0000-0000-000000000001', 'payment-confirmation', 'Konfirmasi pembayaran', 'Pembayaran virtual account atau transfer manual perlu dibuktikan agar tim dapat memulai verifikasi dan proses pesanan.', '/pages/metode-pembayaran', ARRAY['payment', 'order_status']),
  ('90000000-0000-0000-0000-000000000002', 'shipping-updates', 'Pembaruan pengiriman', 'Nomor resi dibagikan setelah paket masuk tahap kirim, dan pembaruan status mengikuti mitra logistik yang dipilih.', '/pages/pengiriman', ARRAY['shipping', 'order_status']),
  ('90000000-0000-0000-0000-000000000003', 'returns-exchange', 'Pengembalian dan penukaran', 'Penukaran mengikuti syarat kondisi produk, periode pengajuan, dan ketersediaan stok pengganti.', '/pages/pengembalian-penukaran-produk', ARRAY['returns', 'size'])
ON CONFLICT (id) DO UPDATE
SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  href = EXCLUDED.href,
  topics = EXCLUDED.topics,
  updated_at = now();
