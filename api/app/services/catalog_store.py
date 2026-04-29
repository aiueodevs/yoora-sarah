from __future__ import annotations

import asyncio

import requests
from aiohttp import ClientSession

from app.schemas.catalog import (
    CatalogCategory,
    CatalogFeaturedStory,
    CatalogLink,
    CatalogProductColor,
    CatalogProductDetail,
    CatalogProductSummary,
    StorefrontAccountHighlight,
    StorefrontCatalogPayload,
    StorefrontFooterData,
    StorefrontQuickLink,
)
from app.services.storefront_postgres_store import storefront_postgres_store

YOORA_API_BASE = "https://api.yoorasarah.com/webstore"

_CATEGORIES: list[CatalogCategory] = [
    CatalogCategory(
        id="category_dress",
        name="Dress",
        slug="dress",
        description="Siluet anggun, warna cantik, dan potongan yang nyaman untuk menemani setiap momen.",
        hero_image="https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260315_051257_f6b48e00.png",
        eyebrow="Setiap Dress Memiliki Ceritanya",
    ),
    CatalogCategory(
        id="category_abaya_2481",
        name="Abaya",
        slug="abaya-2481",
        description="Siluet yang jatuh sempurna, menghadirkan ketenangan dan keanggunan yang terasa utuh.",
        hero_image="https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260327_070011_45df0414.PNG",
    ),
    CatalogCategory(
        id="category_khimar_5295",
        name="Khimar",
        slug="khimar-5295",
        description="Khimar dengan siluet anggun dan pilihan warna yang menenangkan, dirancang untuk melengkapi setiap langkahmu dengan nyaman.",
        hero_image="https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260314_064210_d2574db9.png",
    ),
    CatalogCategory(
        id="category_pashmina_2310",
        name="Pashmina",
        slug="pashmina-2310",
        description="Pashmina dengan tekstur lembut dan warna-warna cantik yang mudah dipadukan untuk melengkapi setiap penampilanmu.",
        hero_image="https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260314_064042_b9760498.png",
    ),
    CatalogCategory(
        id="category_hijab_1544",
        name="Hijab",
        slug="hijab-1544",
        description="Pilihan hijab refined dengan tone lembut yang terasa rapi, ringan, dan modern.",
        hero_image="https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260408_013541_7dddda2f.png",
    ),
    CatalogCategory(
        id="category_footwear_8675",
        name="Footwear",
        slug="footwear-8675",
        description="Langkah yang tegas dengan desain refined yang melengkapi tampilan secara effortless.",
        hero_image="https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260327_070356_9a2c7245.JPG",
    ),
    CatalogCategory(
        id="category_accessories_4472",
        name="Accessories",
        slug="accessories-4472",
        description="Detail elegan yang menyempurnakan tampilan dengan sentuhan berkelas yang halus.",
        hero_image="https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260327_070514_269aab7c.JPG",
    ),
    CatalogCategory(
        id="category_kids_9967",
        name="Kids",
        slug="kids-9967",
        description="Pilihan busana yang nyaman dan manis untuk si kecil, dengan warna-warna lembut yang siap menemani setiap langkah cerianya.",
        hero_image="https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260314_064253_e0f5f8fd.png",
    ),
    CatalogCategory(
        id="category_essentials_7002",
        name="Essentials",
        slug="essentials-7002",
        description="Essentials serbaguna untuk layering yang terasa bersih, ringkas, dan matang.",
        hero_image="https://yoorasarah-products.fly.storage.tigris.dev/banners/image/20260406_032345_f8da4608.png",
    ),
    CatalogCategory(
        id="category_one_set_5182",
        name="One Set",
        slug="one-set-5182",
        description="Edit komplit yang memudahkan styling dengan proporsi yang sudah selesai sejak awal.",
        hero_image="https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034512_610519bd.jpg",
    ),
]

_FEATURED_STORIES: list[CatalogFeaturedStory] = [
    CatalogFeaturedStory(
        title="Safiyyah Sora Dress",
        subtitle="Editorial motion thumbnail",
        thumbnail="https://image.mux.com/74ImaAc01KFL02yvU9XO3QiiYSCrYnrDybRYgBnVdzvuU/thumbnail.webp?time=0&width=1280",
        href="/dress/safiyyah-sora-dress-5068",
    ),
    CatalogFeaturedStory(
        title="Yumee Dress",
        subtitle="Soft studio portrait",
        thumbnail="https://image.mux.com/84Jzf00uRQWSGCaFQ4aT5E9H6R3OG67sAAdUzlZkM2tc/thumbnail.webp?time=0&width=1280",
        href="/dress/yoora-dress-9662",
    ),
    CatalogFeaturedStory(
        title="Fania Dress",
        subtitle="Muted elegant silhouette",
        thumbnail="https://image.mux.com/Kc9GnZIO4hLlAzT2piO4t701hjWEAtrzNsZGiu5Y64js/thumbnail.webp?time=0&width=1280",
        href="/dress/bella-dress-4179",
    ),
]

_BASE_PRODUCTS: list[CatalogProductDetail] = [
    CatalogProductDetail(
        id="36e1c47d-1b90-43fc-a94c-eb12934d09b8",
        category_slug="dress",
        name="Clara Dress",
        slug="clara-dress-5254",
        price=199999,
        image="https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_064832_e5543942.jpg",
        swatch_count=13,
        sizes=["S", "M", "L", "XL"],
        stock=6,
        stock_state="low_stock",
        badge="Best Seller",
        is_featured=True,
        tags=["featured", "occasionwear"],
        colors=[
            CatalogProductColor(
                name="Cappucino",
                hex="#987d6f",
                gallery=[
                    "https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_064832_e5543942.jpg",
                    "https://yoorasarah-products.fly.storage.tigris.dev/products/20260409_081105_1eb842fd.JPG",
                ],
            ),
            CatalogProductColor(
                name="Camel",
                hex="#bdadab",
                gallery=[
                    "https://yoorasarah-products.fly.storage.tigris.dev/products/20260327_033421_e66544b5.jpg",
                ],
            ),
        ],
        description=[
            "Clara Dress dari Yoora Sarah hadir sebagai pilihan feminin dengan sentuhan glamor yang tetap sopan.",
            "Busui friendly dengan resleting depan, detail lengan balon berhias payet, serta pilihan ukuran lengkap untuk tampilan formal maupun momen spesial.",
        ],
        materials=[
            "Ceruty Babydoll dengan jatuh kain yang lembut dan flowy.",
            "Full puring premium berbahan jersey agar lebih adem di kulit.",
        ],
        care=[
            "Cuci tangan atau gunakan mode lembut dengan air dingin.",
            "Setrika suhu rendah dari sisi dalam atau gunakan steamer.",
        ],
        trust_badges=["Stok terbatas", "Busui friendly", "Bantuan ukuran tersedia"],
    ),
    CatalogProductDetail(
        id="yoora-dress",
        category_slug="dress",
        name="Yoora Dress",
        slug="yoora-dress-9662",
        price=199999,
        image="https://yoorasarah-products.fly.storage.tigris.dev/products/20260326_031815_9bb48e29.jpeg",
        swatch_count=10,
        sizes=["S", "M", "L"],
        stock=8,
        stock_state="in_stock",
        colors=[
            CatalogProductColor(
                name="Mauve",
                hex="#8d6f78",
                gallery=[
                    "https://yoorasarah-products.fly.storage.tigris.dev/products/20260326_031815_9bb48e29.jpeg",
                ],
            )
        ],
        description=[
            "Yoora Dress mengedepankan garis potong yang bersih dan jatuh kain yang rapi.",
            "Proporsinya dibuat ringan untuk dipakai dari agenda sehari-hari hingga acara semi-formal.",
        ],
        materials=[
            "Ceruty ringan dengan inner nyaman.",
            "Finishing halus pada area lengan dan badan.",
        ],
        care=["Cuci dengan warna serupa.", "Gunakan suhu rendah saat menyetrika."],
        trust_badges=["Siap kirim", "Panduan ukuran tersedia"],
    ),
    CatalogProductDetail(
        id="bella-dress",
        category_slug="dress",
        name="Bella Dress",
        slug="bella-dress-4179",
        price=419000,
        image="https://yoorasarah-products.fly.storage.tigris.dev/products/20260314_082635_51d02692.png",
        swatch_count=18,
        sizes=["S", "M", "L", "XL"],
        stock=4,
        stock_state="low_stock",
        colors=[
            CatalogProductColor(
                name="Rose Taupe",
                hex="#8f7275",
                gallery=[
                    "https://yoorasarah-products.fly.storage.tigris.dev/products/20260314_082635_51d02692.png",
                ],
            )
        ],
        description=[
            "Bella Dress menonjolkan detail tekstur dan volume yang lebih dramatis.",
            "Siluetnya tetap modest namun memberi kesan formal yang kuat.",
        ],
        materials=[
            "Outer ringan dengan tekstur lembut.",
            "Furing halus agar nyaman sepanjang hari.",
        ],
        care=[
            "Simpan dengan hanger lebar.",
            "Hindari panas tinggi langsung pada detail tekstur.",
        ],
        trust_badges=["Pilihan acara formal", "Butuh bantuan styling?"],
    ),
    CatalogProductDetail(
        id="medina-dress",
        category_slug="dress",
        name="Medina Dress",
        slug="medina-dress-8751",
        price=179999,
        image="https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034512_610519bd.jpg",
        swatch_count=10,
        sizes=["S", "M", "L", "XL"],
        stock=12,
        stock_state="in_stock",
        colors=[
            CatalogProductColor(
                name="Blush Rose",
                hex="#b897a0",
                gallery=[
                    "https://yoorasarah-products.fly.storage.tigris.dev/products/20260328_034512_610519bd.jpg",
                ],
            )
        ],
        description=[
            "Medina Dress memberi karakter lembut dengan proporsi yang ramping dan refined.",
            "Cocok untuk tampilan sehari-hari yang tetap polished.",
        ],
        materials=[
            "Kain ringan dengan gerak yang luwes.",
            "Inner nyaman untuk pemakaian lama.",
        ],
        care=["Cuci lembut.", "Steamer dianjurkan untuk hasil paling rapi."],
        trust_badges=["Ready stock", "Tersedia bantuan warna"],
    ),
]

_FOOTER = StorefrontFooterData(
    company="PT Yoora Sarah Sentosa",
    address="Jl. Otto Iskandardinata No.271, Karanganyar, Kec. Subang, Kabupaten Subang, Jawa Barat 41211 KAB. SUBANG - SUBANG JAWA BARAT ID 41211",
    phone="+6282315866088",
    shopping_help=[
        CatalogLink(label="Cara Pemesanan", href="/pages/cara-belanja"),
        CatalogLink(label="Cara Pembayaran", href="/pages/metode-pembayaran"),
        CatalogLink(label="Pengiriman & Ongkos Kirim", href="/pages/pengiriman"),
        CatalogLink(
            label="Pengembalian & Penukaran",
            href="/pages/pengembalian-penukaran-produk",
        ),
        CatalogLink(label="Panduan Ukuran", href="/pages/panduan-ukuran"),
    ],
    about=[
        CatalogLink(label="Tentang Yoora Sarah", href="/pages/tentang-yoora-sarah"),
        CatalogLink(label="Hubungi Kami", href="/pages/hubungi-kami"),
        CatalogLink(label="Karir", href="/pages/karir"),
    ],
    policy=[
        CatalogLink(label="Syarat & Ketentuan", href="/pages/syarat-dan-ketentuan"),
        CatalogLink(label="Kebijakan Privasi", href="/pages/kebijakan-privasi"),
        CatalogLink(label="Kebijakan Cookie", href="/pages/kebijakan-cookie"),
    ],
    social=[
        CatalogLink(label="Instagram", href="https://www.instagram.com/yoora.sarah"),
        CatalogLink(label="TikTok", href="https://www.tiktok.com/@yoora_sarah"),
        CatalogLink(label="Shopee", href="https://shopee.co.id/yoora.sarah"),
    ],
)

_UTILITY_QUICK_LINKS: list[StorefrontQuickLink] = [
    StorefrontQuickLink(
        eyebrow="Akun",
        title="Buka profil",
        description="Lihat pesanan, alamat, dan koleksi favorit dalam satu halaman yang rapi.",
        href="/profile",
    ),
    StorefrontQuickLink(
        eyebrow="Wishlist",
        title="Simpan favorit",
        description="Kumpulkan produk yang ingin dibandingkan sebelum lanjut belanja.",
        href="/wishlist",
    ),
    StorefrontQuickLink(
        eyebrow="Checkout",
        title="Lanjut checkout",
        description="Lihat ringkasan belanja dan teruskan ke pengiriman serta pembayaran.",
        href="/checkout",
    ),
]

_ACCOUNT_HIGHLIGHTS: list[StorefrontAccountHighlight] = [
    StorefrontAccountHighlight(
        label="Status Member",
        value="Member Aktif",
        description="Siap menerima info koleksi baru, promo pilihan, dan pengingat restock.",
    ),
    StorefrontAccountHighlight(
        label="Pesanan Aktif",
        value="02",
        description="Satu pesanan sedang diproses dan satu pesanan menunggu konfirmasi pembayaran.",
    ),
    StorefrontAccountHighlight(
        label="Alamat Tersimpan",
        value="03",
        description="Alamat di Subang, Bandung, dan Jakarta siap dipakai saat checkout.",
    ),
]

_SEARCH_PROMPTS = [
    "dress pesta warna moka",
    "abaya warna netral",
    "khimar untuk harian",
    "pashmina ringan",
]

_CHECKOUT_STEPS = [
    "Lengkapi nama penerima, alamat, dan nomor WhatsApp aktif.",
    "Pilih layanan pengiriman yang paling sesuai dengan kebutuhan Anda.",
    "Cek ulang ukuran, warna, dan total pembayaran sebelum konfirmasi.",
]

_TRUST_SIGNALS = [
    "Pengiriman diproses dari Jawa Barat dengan pembaruan status melalui WhatsApp.",
    "Informasi bahan, warna, dan ukuran ditulis ringkas agar lebih mudah dibandingkan.",
    "Panduan ukuran, kebijakan tukar, dan bantuan belanja tersedia untuk dibuka kapan saja.",
]


class CatalogStore:
    def list_categories(self) -> list[CatalogCategory]:
        database_categories = storefront_postgres_store.list_categories()
        if database_categories:
            return database_categories
        return _CATEGORIES

    def list_product_details(
        self, category_slug: str | None = None
    ) -> list[CatalogProductDetail]:
        if category_slug is None:
            generated: list[CatalogProductDetail] = []
            for category in _CATEGORIES:
                if category.slug != "one-set-5182":
                    generated.extend(self.list_product_details(category.slug))
            return generated

        try:
            products_sync = yoora_api_sync.fetch_products_sync(category_slug)
            return [yoora_api_sync.transform_product(p) for p in products_sync]
        except Exception:
            pass

        products = list(_BASE_PRODUCTS)
        if category_slug == "dress":
            return products

        database_products = storefront_postgres_store.list_product_details(
            category_slug
        )
        if database_products:
            return database_products

        category = self.get_category(category_slug)
        if category is None:
            return []

        generated_products: list[CatalogProductDetail] = []
        for index, product in enumerate(products[:4], start=1):
            generated_products.append(
                CatalogProductDetail(
                    id=f"{category.slug}-{product.id}",
                    category_slug=category.slug,
                    name=f"{category.name} {index}",
                    slug=f"{category.slug}-look-{index}",
                    price=product.price,
                    compare_price=product.compare_price,
                    image=category.hero_image,
                    swatch_count=1,
                    sizes=product.sizes,
                    badge=product.badge,
                    stock=4 + index,
                    stock_state="in_stock",
                    is_featured=index == 1,
                    tags=[category.slug, "generated-storefront-fixture"],
                    colors=[
                        CatalogProductColor(
                            name="Signature Tone",
                            hex=["#baa39d", "#938188", "#d1c2c0", "#84706f"][
                                (index - 1) % 4
                            ],
                            gallery=[category.hero_image],
                        )
                    ],
                    description=[category.description],
                    materials=product.materials,
                    care=product.care,
                    trust_badges=[
                        "Fixture category contract",
                        "Needs live catalog backing",
                    ],
                )
            )

        return generated_products

    def list_product_summaries(
        self,
        category_slug: str | None = None,
        featured_only: bool | None = None,
        limit: int | None = None,
    ) -> list[CatalogProductSummary]:
        products = self.list_product_details(category_slug)
        if featured_only is True:
            products = [product for product in products if product.is_featured]
        if limit is not None:
            products = products[:limit]

        return [
            CatalogProductSummary.model_validate(product.model_dump())
            for product in products
        ]

    def get_category(self, slug: str) -> CatalogCategory | None:
        return next(
            (category for category in _CATEGORIES if category.slug == slug), None
        )

    def get_product_detail(
        self, category_slug: str, product_slug: str
    ) -> CatalogProductDetail | None:
        return next(
            (
                product
                for product in self.list_product_details(category_slug)
                if product.slug == product_slug
            ),
            None,
        )

    def get_storefront_catalog(self) -> StorefrontCatalogPayload:
        return StorefrontCatalogPayload(
            categories=self.list_categories(),
            featured_stories=_FEATURED_STORIES,
            products=self.list_product_details(),
            search_prompts=_SEARCH_PROMPTS,
            utility_quick_links=_UTILITY_QUICK_LINKS,
            account_highlights=_ACCOUNT_HIGHLIGHTS,
            checkout_steps=_CHECKOUT_STEPS,
            trust_signals=_TRUST_SIGNALS,
            footer=_FOOTER,
        )


class YooraAPISync:
    """Service untuk sync data dari API Yoora Sarah."""

    def __init__(self):
        self.base_url = YOORA_API_BASE
        self._cache: dict = {}

    def fetch_products_sync(self, category_slug: str) -> list[dict]:
        """Fetch produk berdasarkan kategori secara sync."""
        cache_key = f"products_{category_slug}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        url = f"{self.base_url}/products/category/{category_slug}?page=1&limit=50"
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        products = data.get("data", [])
        self._cache[cache_key] = products
        return products

    async def fetch_json(self, session: ClientSession, url: str) -> dict:
        async with session.get(url) as resp:
            resp.raise_for_status()
            return await resp.json()

    async def list_categories(self) -> list[dict]:
        """Fetch semua kategori dari API."""
        if "categories" in self._cache:
            return self._cache["categories"]

        async with ClientSession() as session:
            data = await self.fetch_json(session, f"{self.base_url}/categories")
            categories = data.get("data", [])
            self._cache["categories"] = categories
            return categories

    async def list_products_by_category(self, category_slug: str) -> list[dict]:
        """Fetch produk berdasarkan kategori dari API."""
        cache_key = f"products_{category_slug}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        async with ClientSession() as session:
            url = f"{self.base_url}/products/category/{category_slug}?page=1&limit=50"
            data = await self.fetch_json(session, url)
            products = data.get("data", [])
            self._cache[cache_key] = products
            return products

    async def list_all_products(self) -> list[dict]:
        """Fetch semua produk dari semua kategori."""
        categories = await self.list_categories()
        all_products = []

        async with ClientSession() as session:
            tasks = []
            for cat in categories:
                if cat.get("coming_soon"):
                    continue
                url = f"{self.base_url}/products/category/{cat['slug']}?page=1&limit=50"
                tasks.append(self.fetch_json(session, url))

            results = await asyncio.gather(*tasks)
            for result in results:
                all_products.extend(result.get("data", []))

        return all_products

    def transform_product(self, api_product: dict) -> CatalogProductDetail:
        """Transform data produk API ke format CatalogProductDetail."""
        category = api_product.get("category", {})
        category_slug = category.get("slug", "")

        colors = []
        for pc in api_product.get("product_colors", []):
            color = pc.get("color", {})
            images = pc.get("images", [])
            gallery = [
                img.get("image_url", "") for img in images if img.get("image_url")
            ]
            if gallery:
                colors.append(
                    CatalogProductColor(
                        name=color.get("name", "Unknown"),
                        hex=color.get("hex", "#000000"),
                        gallery=gallery,
                    )
                )

        sizes = []
        for ps in api_product.get("product_sizes", []):
            size = ps.get("size", {})
            sizes.append(size.get("name", ""))

        stocks = api_product.get("product_stocks", [])
        total_stock = sum(s.get("quantity", 0) for s in stocks)

        stock_state = "out_of_stock"
        if total_stock > 10:
            stock_state = "in_stock"
        elif total_stock > 0:
            stock_state = "low_stock"

        tags = []
        if api_product.get("total_sold", 0) > 20:
            tags.append("best_seller")

        return CatalogProductDetail(
            id=api_product.get("id", ""),
            category_slug=category_slug,
            name=api_product.get("name", ""),
            slug=api_product.get("slug", ""),
            price=api_product.get("price", 0),
            compare_price=api_product.get("discount_price"),
            image=colors[0].gallery[0] if colors and colors[0].gallery else "",
            swatch_count=len(colors),
            sizes=sizes,
            stock=total_stock,
            stock_state=stock_state,
            is_featured=api_product.get("total_sold", 0) > 10,
            tags=tags,
            colors=colors,
            description=[api_product.get("description", "")],
            materials=[],
            care=[],
            trust_badges=[
                "Ready stock" if stock_state == "in_stock" else "Stok terbatas"
            ],
        )


catalog_store = CatalogStore()
yoora_api_sync = YooraAPISync()
