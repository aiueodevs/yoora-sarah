# AI Buyer Premium Concierge Design

## Context

AI Buyer saat ini sudah bisa menjawab pertanyaan dasar tentang produk, size, order, policy, dan handoff ke WhatsApp, tetapi masih terasa seperti helper sempit. Tujuan berikutnya adalah mengubahnya menjadi **Yoora Sarah Premium Concierge**: asisten yang terasa human, elegant, professional, dan powerful; mampu melayani seluruh pengunjung website dari discovery sampai support, dengan product knowledge yang kuat dan handoff ke CS yang seamless.

Asisten ini harus menjadi entry point utama interaksi pelanggan di website. WhatsApp bukan lagi kanal terpisah yang berdiri sendiri, tetapi menjadi bagian dari alur concierge: muncul hanya ketika benar-benar dibutuhkan, dan tetap dibingkai sebagai pengalaman premium.

## Product Goal

Membangun **all-in-one premium concierge** yang:
- membantu user menemukan produk, gaya, dan kombinasi outfit yang relevan,
- menjawab pertanyaan produk, stok, warna, size, policy, dan order,
- memahami konteks percakapan multi-turn,
- menjaga tone brand Yoora Sarah yang luxury namun hangat,
- dan melakukan handoff ke CS WhatsApp secara cerdas ketika AI sudah mencapai batas terbaiknya.

## Success Criteria

AI concierge dianggap berhasil bila:
1. User bisa memakai satu jendela chat untuk seluruh kebutuhan utama customer journey.
2. Jawaban AI terasa grounded ke data Yoora Sarah, bukan generik atau halusinatif.
3. AI bisa membedakan intent sales/styling vs support/order dengan baik.
4. Handoff ke WhatsApp muncul sebagai CTA yang natural dan tepat konteks.
5. UI chat terasa premium, bukan sekadar bubble text biasa.

## Scope

### In scope
- Evolusi `BuyerAssistant` menjadi concierge utama untuk seluruh website.
- Intent routing untuk product discovery, styling, size/fit, policy, order, dan sensitive support.
- Response synthesis dengan persona premium Yoora Sarah.
- Structured response payload dari backend ke frontend.
- Rich UI di chat: CTA actions, product cards/sources, dan support handoff.
- Penghapusan WhatsApp floating button global sebagai entry point utama.

### Out of scope
- Penggantian model AI provider secara besar-besaran.
- Voice assistant, speech-to-text, atau multimodal vision untuk BuyerAssistant tahap awal.
- Full CRM/ticketing integration selain handoff WhatsApp.
- Personalization berbasis akun/login mendalam di fase pertama.

## Recommended Approach

Pendekatan terbaik adalah **balanced concierge, sales-first**:
- sales/styling/discovery menjadi persona utama,
- support/order/policy tetap sama kuatnya,
- namun setiap jawaban tetap terasa seperti luxury shopping concierge, bukan chatbot customer service biasa.

Kenapa ini pendekatan terbaik:
- paling cocok dengan karakter brand modest premium,
- membantu conversion sekaligus mengurangi friction support,
- menjaga satu entry point tunggal bagi semua jenis user intent.

## Architecture

### 1. Intent Router Layer
Backend harus menilai intent setiap query sebelum menyusun jawaban.

Intent utama:
- `discovery` — cari produk, kategori, warna, budget, occasion
- `styling` — padu padan, rekomendasi look, cocokkan item
- `size_fit` — ukuran, fit, alternatif size
- `order_support` — lacak order, status pembayaran/pengiriman
- `policy_support` — shipping, retur, refund, preorder, launch policy
- `sensitive_support` — komplain, marah, refund sensitif, salah kirim, kasus yang perlu manusia
- `general_brand` — sapaan, FAQ umum, edukasi ringan tentang Yoora Sarah

Backend saat ini sudah punya basis logic di `services/api/app/services/ai_tools_service.py` melalui:
- keyword flags
- grounded lookups
- support handoff preview

Rute upgrade:
- mempertahankan fondasi grounded lookup yang ada,
- tetapi membuat orchestration lebih eksplisit dan lebih kaya dalam output.

### 2. Grounded Knowledge Layer
AI tidak boleh menjawab dari imajinasi bebas. Jawaban harus disusun dari sumber yang benar-benar tersedia di codebase/platform.

Primary knowledge sources:
- product catalog / storefront catalog
- product detail, price, stock, variant, size guidance
- policy articles
- order status
- stylist recommendations
- support handoff preview

Knowledge categories yang harus dikuasai concierge:
- brand & collection knowledge
- product knowledge per category
- styling guidance dan pairing logic
- stock/availability & size reasoning
- order/policy/support knowledge

### 3. Response Composer Layer
Setelah intent dan data diketahui, backend menyusun jawaban ke format structured response.

Response tidak lagi cukup berisi:
- `content`
- `sources`

Response perlu berkembang menjadi bentuk seperti:
- `content`
- `sources`
- `actions`
- `mode`
- opsional `productCards` / `recommendations` / `handoff`

Contoh bentuk action:
- `Chat CS via WhatsApp`
- `Lihat Produk`
- `Lihat Pesanan Saya`
- `Buka Kebijakan Pengiriman`

### 4. Premium Persona Layer
Nada jawaban harus:
- hangat
- percaya diri
- personal
- refined
- luxury tetapi tidak kaku

Karakter suara yang diinginkan:
- seperti personal shopping concierge boutique
- bukan robot call center
- bukan influencer berlebihan
- tidak terlalu santai
- tetap efisien dan informatif

Guideline tone:
- gunakan Bahasa Indonesia natural
- hindari jawaban generik seperti “silakan cek link berikut” tanpa framing
- selalu beri konteks kenapa rekomendasi itu cocok
- ketika handoff diperlukan, framing-nya harus reassuring dan premium, bukan seolah gagal

## UX / UI Design

### 1. Entry Point
AI Buyer tetap menjadi satu floating entry point utama.
- ikonnya tetap bisa diwakili Sparkles/assistant button
- tombol WhatsApp global dihilangkan

### 2. Chat Window
Chat berubah dari assistant bubble sederhana menjadi **concierge panel** yang lebih kaya namun tetap compact.

UI minimum yang harus didukung:
- assistant/user bubbles
- structured CTA buttons di dalam assistant reply
- sources/links bila relevan
- ruang untuk future rich cards

### 3. WhatsApp Handoff UX
WhatsApp tidak lagi tampil sebagai floating shortcut.
Sebaliknya, AI akan menawarkan handoff hanya ketika cocok, misalnya:
- kasus sensitif
- ukuran tidak pasti dan perlu konfirmasi manusia
- order/refund/komplain kompleks
- user meminta bicara dengan admin langsung

Handoff appearance:
- tombol CTA di bawah chat bubble assistant
- label premium seperti:
  - `Lanjut ke CS via WhatsApp`
  - `Butuh bantuan langsung? Hubungi tim kami`
- membuka `wa.me` dengan prefilled context message bila tersedia

### 4. Rich Commerce Responses
Untuk intent discovery/styling, AI sebaiknya bisa menampilkan:
- produk relevan sebagai cards atau linked suggestions
- alasan pemilihan produk
- opsi alternatif
- upsell/cross-sell halus

Tahap pertama bisa tetap memakai `sources`, tetapi arsitektur harus siap untuk upgrade ke `productCards`.

## Data Flow

1. User mengirim pesan dari `BuyerAssistant`.
2. Frontend mengirim `query + messages` ke API helper `buyer-ai-api.ts`.
3. Backend `ai_tools_service.py`:
   - mendeteksi intent,
   - mengumpulkan grounded context,
   - memutuskan apakah perlu handoff,
   - menyusun structured response.
4. Frontend menerima response dan me-render:
   - assistant text
   - CTA actions
   - supporting links/sources
5. Jika user klik WhatsApp CTA, browser membuka handoff URL.

## Core File Targets

### Frontend
- `apps/web/components/buyer-assistant.tsx`
- `apps/web/app/lib/buyer-ai-api.ts`
- `apps/web/app/layout.tsx`
- `apps/web/components/layout/route-shell.tsx`

### Backend
- `services/api/app/services/ai_tools_service.py`
- `services/api/app/api/v1/endpoints/ai_tools.py`

### Optional future files
- dedicated prompt/persona modules
- structured response renderer components
- product card renderer for assistant responses

## Error Handling

- Jika AI provider gagal, tetap fallback ke grounded response sederhana bila context tersedia.
- Jika tidak ada jawaban grounded yang kuat, berikan jawaban jujur + arahkan user ke CTA relevan.
- Jika handoff tersedia tapi URL rusak/tidak ada, fallback ke halaman kontak.
- AI tidak boleh pura-pura tahu informasi yang tidak ditemukan.

## Testing Strategy

### Backend
- unit test untuk intent routing
- unit test untuk fallback response sensitive/support/size cases
- test bahwa handoff menghasilkan `actions` yang benar
- test bahwa `sources` dan `actions` tidak saling konflik

### Frontend
- test render assistant message dengan `actions`
- test render tombol WhatsApp CTA
- test bahwa chat tetap jalan tanpa actions
- test bahwa floating WhatsApp global tidak lagi muncul

### Manual Verification
- query styling → jawab recommendation tone premium
- query order → jawab status atau policy terkait
- query sensitif → muncul CTA WhatsApp
- query size ambiguous → muncul handoff bila perlu
- query umum → tetap dijawab natural tanpa CTA berlebihan

## Rollout Strategy

### Phase 1
- Tambah structured `actions` di response backend
- Render CTA button di `BuyerAssistant`
- Hapus floating WhatsApp global
- Gunakan handoff hanya untuk sensitive/support cases

### Phase 2
- Perkuat persona premium + richer response composition
- Tambah intent coverage untuk styling/discovery yang lebih cerdas
- Tambah commerce-oriented prompts dan reusable response builders

### Phase 3
- Upgrade ke product cards / richer UI payload
- Tambah personalized flows jika account/order context tersedia

## Trade-offs

### Why not keep WhatsApp as separate floating entry?
Karena itu memecah pengalaman. User jadi harus memilih kanal terlalu cepat. Dengan concierge-first design, website terasa lebih premium dan terkurasi.

### Why not make the AI only sales-focused?
Karena user real di e-commerce sering bercampur antara discovery dan support. Concierge yang powerful harus sanggup menangani keduanya, lalu tahu kapan mengalihkan ke manusia.

### Why not make one giant prompt only?
Karena prompt besar tanpa intent orchestration membuat jawaban lebih rapuh, lebih generik, dan lebih sulit dikontrol kualitasnya.

## Recommendation

Lanjutkan implementasi dengan arsitektur **All-in-One Premium Concierge** berbasis:
- grounded commerce tools
- explicit intent routing
- premium persona synthesis
- structured actions in chat
- WhatsApp as contextual escalation, not floating shortcut

Itu adalah pendekatan yang paling premium, elegant, luxury, professional, dan powerful untuk Yoora Sarah.
