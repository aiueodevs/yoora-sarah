# Audit Marketing dan Security Yoora Sarah

Tanggal audit: 2026-04-20  
Format: marketing audit + security audit  
Sumber observasi:
- observasi publik website `https://www.yoorasarah.com/id` pada 2026-04-20
- request publik yang termuat oleh homepage website
- screenshot kanal sosial dan marketplace yang tersedia di workspace

Ruang lingkup:
- `https://www.yoorasarah.com/id`
- `https://www.instagram.com/yoora.sarah/`
- `https://www.instagram.com/yoorasarah.catalogue/`
- `https://www.instagram.com/yoorakids/`
- `https://shopee.co.id/yoora.sarah`
- `https://www.tiktok.com/@yoora_sarah?is_from_webapp=1&sender_device=pc`

Batasan:
- Audit ini berbasis akses publik saja.
- Tidak ada pengujian eksploitasi, brute force, bypass, atau akses ke area privat.
- Temuan keamanan di bawah adalah observasi defensif dan rekomendasi mitigasi, bukan bukti kompromi akun atau server.

## 1. Ringkasan Eksekutif

Yoora Sarah sudah memiliki fondasi digital yang kuat. Dari sisi marketing, brand ini menang di tiga hal: jangkauan audiens, trust marketplace, dan keberadaan aset brand sendiri melalui website. Dari sisi security, tidak terlihat indikasi compromise dari observasi publik, tetapi ada satu temuan penting yang perlu dianggap prioritas tinggi: API publik storefront masih mengirim metadata internal yang tidak dibutuhkan UI.

Secara praktis, posisi bisnis digital Yoora Sarah sudah matang untuk scale. Tantangan utamanya bukan lagi membangun presence, melainkan merapikan funnel lintas kanal, memperjelas CTA per channel, dan menutup kebocoran data publik yang menambah risiko social engineering.

## 2. Skor Ringkas

### Marketing posture: 8/10
- Awareness kuat di TikTok dan Instagram utama.
- Trust komersial kuat di Shopee.
- Segmentasi channel sudah ada: akun utama, katalog, dan kids.
- Gap utama ada pada ketajaman funnel, CTA primer, dan konsistensi pesan lintas kanal.

### Security posture: 6/10
- Header keamanan dasar website sudah cukup baik.
- Tidak ada bukti compromise dari audit publik ini.
- Temuan terpenting adalah `data exposure` pada API publik produk.
- Risiko tambahan berasal dari CSP yang masih permisif dan paparan detail operasional publik yang memudahkan penipuan/impersonation.

## 3. Marketing Audit

## A. Gambaran Omnichannel

Kombinasi website, Instagram, TikTok, dan Shopee sudah membentuk ekosistem omnichannel yang kuat. Website berperan sebagai owned asset, TikTok sebagai mesin awareness dan live commerce, Instagram sebagai pusat trust dan edukasi brand, sedangkan Shopee menjadi kanal transaksi dengan social proof paling matang.

Masalah utamanya ada di orchestration, bukan di presence. User sudah punya banyak pintu masuk, tetapi belum terlihat satu funnel utama yang benar-benar dominan dan konsisten per kanal.

## B. Audit Per Kanal

### Website: `yoorasarah.com/id`

#### Yang sudah kuat
- Navigasi kategori jelas dan relevan untuk modest wear.
- Website terasa seperti hub brand, bukan sekadar katalog.
- Ada CTA operasional seperti `Search`, `Wishlist`, `Cart`, `User`, bahasa, dan tombol `WhatsApp`.
- Homepage cukup kuat secara visual untuk memperkenalkan produk dan kategori.

#### Gap marketing
- Homepage padat promosi sehingga fokus produk unggulan bisa saling berebut perhatian.
- Funnel belum sangat tegas: user diarahkan ke banyak kemungkinan aksi sekaligus.
- Metadata SEO lintas bahasa masih tampak kurang rapi. Pada homepage terlihat canonical `https://yoorasarah.com/id/`, tetapi alternate language mengarah ke path `https://yoorasarah.com/id/en` dan `https://yoorasarah.com/id/id`, yang berpotensi membingungkan mesin pencari.

#### Rekomendasi
- Tetapkan satu tujuan utama homepage per periode kampanye: hero collection, best seller, atau campaign page.
- Buat collection page khusus untuk campaign yang sedang didorong dari sosial.
- Rapikan canonical dan hreflang agar struktur SEO lintas bahasa tidak ambigu.

### Instagram utama: `@yoora.sarah`

#### Yang sudah kuat
- Akun utama punya trust tinggi karena verified dan skala audiens besar.
- Bio sudah menghubungkan akun utama, kids, dan katalog.
- Highlight `PENIPUAN` adalah aset trust yang bagus.
- Akun ini paling cocok berfungsi sebagai pusat brand story, campaign, education, dan social proof.

#### Gap marketing
- Bio masih padat dan belum sangat tajam dalam menyampaikan satu CTA utama.
- User baru masih harus berpikir: mulai dari mana, beli di mana, dan kanal mana yang paling disarankan.
- Struktur highlight masih bisa lebih funnel-oriented.

#### Rekomendasi
- Susun ulang bio menjadi urutan: value proposition, trust, CTA.
- Gunakan highlight yang lebih sistematis: `Best Seller`, `How to Order`, `Size Guide`, `Promo`, `Testimoni`, `Anti Penipuan`.
- Jadikan akun ini pusat narasi brand, bukan tempat semua fungsi bercampur.

### Instagram katalog: `@yoorasarah.catalogue`

#### Yang sudah kuat
- Perannya jelas untuk mendukung conversion dan katalog cepat.
- Bio transaksional dan langsung ke intent beli.
- Cocok untuk audience yang sudah siap order.

#### Gap marketing
- Positioning belum cukup tegas agar berbeda jelas dari akun utama.
- Jika terlalu banyak informasi transaksi di bio, akun bisa terasa berat dan kurang elegan untuk first-touch branding.
- Bila akun ini dibiarkan tanpa sistem konten yang disiplin, ia berisiko menjadi duplikasi dari akun utama.

#### Rekomendasi
- Tegaskan fungsi akun ini: katalog update, stok, atau jalur order cepat.
- Standarkan template post, naming highlight, dan CTA.
- Pertimbangkan memindahkan informasi sensitif atau terlalu operasional ke landing page resmi, bukan bio.

### Instagram kids: `@yoorakids`

#### Yang sudah kuat
- Segmentasi lini anak sudah terlihat jelas.
- Hubungan dengan brand induk tetap kuat.
- Potensi storytelling untuk keluarga dan matching moments sangat besar.

#### Gap marketing
- Identitas kanal masih bisa dibuat lebih khas dan emosional.
- CTA belum sangat spesifik untuk parent audience.
- Potensi cross-sell dari akun utama ke kids masih bisa ditingkatkan.

#### Rekomendasi
- Bangun proposisi yang lebih khas: kenyamanan, bahan aman, family moments, dan matching looks.
- Tambahkan konten `size guide`, `UGC keluarga`, `review parent`, dan `how it fits`.
- Dorong cross-channel referral yang lebih aktif dari akun utama.

### TikTok: `@yoora_sarah`

#### Yang sudah kuat
- Ini kanal awareness paling besar.
- Jadwal live yang eksplisit bagus untuk mendorong habit audience.
- Potensi live commerce sangat tinggi.

#### Gap marketing
- Bio lebih menonjolkan jadwal live daripada value proposition dan CTA pasca-interest.
- Trafik besar dari TikTok berpotensi bocor ke banyak arah jika funnel tidak tegas.
- Konten viral dan konten konversi perlu dipisah lebih sadar.

#### Rekomendasi
- Gunakan satu CTA primer yang konsisten dari TikTok.
- Susun pinned videos dan playlist untuk `best seller`, `new arrivals`, `review`, `tutorial`, dan `live highlights`.
- Sinkronkan live schedule dengan promosi Instagram, website, dan Shopee.

### Shopee: `Yoora Sarah Official`

#### Yang sudah kuat
- Trust sangat kuat dari sisi rating, umur toko, dan performa chat.
- Marketplace ini adalah kanal konversi paling matang.
- Sangat bagus untuk menangkap demand yang sudah siap beli.

#### Gap marketing
- Perlu sinkronisasi lebih kuat antara naming produk dan kampanye dengan website serta sosial.
- User perlu dipandu ke halaman kategori atau produk yang tepat, bukan hanya ke homepage toko.
- Kategori toko masih bisa lebih disusun berdasarkan intent beli.

#### Rekomendasi
- Samakan naming produk dan hero visual dengan website/Instagram/TikTok.
- Arahkan traffic sosial ke kategori atau halaman produk spesifik.
- Gunakan kategori toko yang mendukung pencarian intent, bukan hanya tipe produk.

## C. Temuan Marketing Lintas Kanal

- Belum ada CTA primer yang konsisten per channel.
- Masih ada potensi tumpang tindih fungsi antara akun utama dan akun katalog.
- Naming campaign, kategori, dan story antar kanal masih bisa dibuat lebih sinkron.
- Belum terlihat satu pusat rujukan resmi untuk anti-scam, kanal resmi, dan alur order.
- Funnel besar sudah ada, tetapi orkestrasinya belum maksimal.

## D. Prioritas Marketing 30 Hari

1. Tetapkan CTA primer per kanal.
2. Buat landing page campaign dan collection page yang terhubung langsung dari sosial.
3. Rapikan bio dan highlight Instagram berdasarkan funnel.
4. Sinkronkan naming produk, visual cover, dan pesan promosi lintas kanal.
5. Tetapkan fungsi yang tegas untuk akun utama, katalog, dan kids.
6. Tambahkan parameter tracking lintas kanal agar kontribusi traffic ke conversion lebih mudah dibaca.

## 4. Security Audit

## A. Permukaan yang Ditinjau

Permukaan publik yang sempat diverifikasi pada 2026-04-20 meliputi:
- homepage `https://www.yoorasarah.com/id`
- request publik yang dimuat homepage ke `https://api.yoorasarah.com`
- header keamanan respons homepage
- data publik/operasional yang ditampilkan di kanal sosial

## B. Temuan Utama

### P1. Data exposure pada API publik produk

Observasi langsung pada request publik `https://api.yoorasarah.com/webstore/products/category/dress?page=1&limit=1` menunjukkan bahwa respons produk masih memuat field yang terlalu internal untuk storefront. Pada verifikasi 2026-04-20, objek produk publik masih mengandung field seperti:

- `created_by`
- `created_at`
- `updated_at`
- `approved_by`
- `approved_at`
- `created_by_user`

Objek `created_by_user` juga masih memuat metadata internal seperti:
- `email`
- `phone`
- `name`
- `email_verified`
- `phone_verified`
- `is_active`
- `last_login_at`
- `created_at`
- `updated_at`

#### Dampak
- Mempermudah social engineering dan phishing terhadap staf/internal.
- Membocorkan struktur operasional backend yang tidak perlu diketahui publik.
- Menambah risiko impersonation, spear phishing, dan pemetaan target internal.

#### Rekomendasi
- Pisahkan serializer/DTO publik dari model internal.
- Gunakan allowlist field publik yang ketat untuk seluruh endpoint storefront.
- Tambahkan test otomatis agar field internal tidak pernah lolos ke respons publik.

### P2. Content-Security-Policy masih permisif

Header keamanan dasar homepage sudah baik. Pada verifikasi 2026-04-20, homepage mengirim:
- `Strict-Transport-Security`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Permissions-Policy`

Namun `Content-Security-Policy` masih mengizinkan:
- `'unsafe-inline'`
- `'unsafe-eval'`

#### Dampak
- Tidak langsung berarti ada exploit aktif.
- Tetapi kebijakan ini mengurangi ketahanan jika suatu saat terjadi injeksi konten atau bug front-end lain.

#### Rekomendasi
- Audit dependensi/script yang memaksa CSP longgar.
- Pindahkan inline script/style ke pola yang lebih aman.
- Gunakan nonce atau hash bila memang ada kebutuhan khusus.

### P2. Paparan detail operasional publik di kanal sosial

Beberapa kanal sosial menampilkan detail operasional yang membantu conversion, tetapi juga memperbesar permukaan risiko. Contohnya:
- nomor kontak publik
- informasi pembayaran/perbankan di bio akun tertentu
- pola komunikasi operasional yang mudah ditiru akun palsu

#### Dampak
- Meningkatkan risiko spam, impersonation, fake CS, dan penipuan transfer.
- Mempermudah akun palsu meniru pola komunikasi brand.

#### Rekomendasi
- Gunakan hanya nomor bisnis yang memang didedikasikan untuk publik.
- Kurangi detail finansial sensitif di bio jika tidak mutlak perlu.
- Pusatkan informasi resmi pada satu landing page atau halaman verifikasi kanal resmi.

### P2. Risiko social engineering meningkat seiring skala brand

Brand dengan audiens besar secara alami lebih rentan terhadap:
- akun palsu
- order scam
- fake customer service
- penipuan transfer
- penyalahgunaan nama brand di WhatsApp, Instagram, dan marketplace

#### Dampak
- Kerugian reputasi bisa muncul bahkan tanpa kompromi teknis pada server.
- Customer bisa menyalahkan brand meski penipuan dilakukan pihak ketiga.

#### Rekomendasi
- Buat halaman `kanal resmi` dan `anti penipuan` di website.
- Samakan pesan anti-scam di website, Instagram, TikTok, dan Shopee.
- Cantumkan pola komunikasi resmi brand secara konsisten.

## C. Yang Belum Terbukti dari Audit Ini

- Tidak ada bukti account takeover atau server compromise.
- Tidak ada pengujian login, OTP, password reset, auth bypass, atau akses admin.
- Tidak ada penetration test atau exploitation attempt.

Artinya, kesimpulan security audit ini harus dibaca sebagai `defensive exposure review`, bukan penetration test.

## D. Prioritas Security 30 Hari

1. Hapus field internal dari seluruh respons API storefront.
2. Terapkan public response contract dan regression test untuk schema API.
3. Audit dan perketat `Content-Security-Policy`.
4. Buat halaman resmi `kanal resmi` dan `anti penipuan`.
5. Review ulang semua detail kontak/perbankan yang dipublikasikan di bio sosial.
6. Tambahkan review keamanan pada setiap perubahan response schema API publik.

## 5. Prioritas Terintegrasi 30 Hari

Urutan kerja yang paling masuk akal adalah:

1. Rapikan API publik website dan tutup kebocoran metadata internal.
2. Tetapkan CTA primer tiap kanal agar traffic besar diarahkan ke tujuan yang jelas.
3. Buat satu landing page resmi untuk `kanal resmi`, `cara order`, dan `anti penipuan`.
4. Samakan naming produk, kategori, dan story campaign lintas website, Instagram, TikTok, dan Shopee.
5. Audit ulang bio, highlight, dan aset trust di seluruh kanal.

## 6. Kesimpulan

Secara marketing, Yoora Sarah berada di posisi kuat. Brand awareness besar, trust marketplace tinggi, dan aset owned media sudah terbentuk. Ini adalah kondisi yang bagus untuk scale, selama funnel lintas kanal dibuat lebih tajam dan konsisten.

Secara security, fokus paling mendesak bukan indikasi serangan aktif, melainkan pengurangan paparan data publik yang tidak perlu. Jika API storefront dirapikan, CSP diperketat, dan pusat informasi resmi anti-scam dibuat lebih kuat, ekosistem digital Yoora Sarah akan jauh lebih aman sekaligus lebih efektif untuk conversion.
