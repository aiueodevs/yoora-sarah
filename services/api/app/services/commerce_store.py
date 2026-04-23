from __future__ import annotations

from datetime import UTC, datetime
from urllib.parse import quote

from app.schemas.catalog import CatalogProductDetail, StorefrontAccountHighlight, StorefrontQuickLink
from app.schemas.commerce import (
    AddCartItemPayload,
    CheckoutPaymentSummary,
    CheckoutRecipient,
    CheckoutSummaryPayload,
    CustomerAddress,
    CustomerProfilePayload,
    CustomerWishlistPayload,
    OrderSummary,
    OrderTotals,
    StorefrontCartPayload,
    StorefrontCartItem,
    SupportContact,
    SupportHandoffRecord,
    SupportHandoffRequest,
    SupportPolicyArticle,
)
from app.services.catalog_store import catalog_store
from app.services.storefront_postgres_store import storefront_postgres_store

_CUSTOMER_ID = "customer_sarah_rahmawati"

_ADDRESSES: list[CustomerAddress] = [
    CustomerAddress(
        id="address_subang_home",
        label="Rumah Subang",
        recipient_name="Sarah Rahmawati",
        phone="+62 823-1586-6088",
        line1="Jl. Otto Iskandardinata No.271, Karanganyar",
        city="Subang",
        province="Jawa Barat",
        postal_code="41211",
        is_primary=True,
    ),
    CustomerAddress(
        id="address_bandung_office",
        label="Studio Bandung",
        recipient_name="Sarah Rahmawati",
        phone="+62 823-1586-6088",
        line1="Jl. Ciumbuleuit No.112, Hegarmanah",
        city="Bandung",
        province="Jawa Barat",
        postal_code="40141",
        is_primary=False,
    ),
    CustomerAddress(
        id="address_jakarta_family",
        label="Keluarga Jakarta",
        recipient_name="Sarah Rahmawati",
        phone="+62 823-1586-6088",
        line1="Jl. Tebet Barat Dalam VIII No.5, Tebet",
        city="Jakarta Selatan",
        province="DKI Jakarta",
        postal_code="12810",
        is_primary=False,
    ),
]

_SUPPORT_CONTACT = SupportContact(
    whatsapp_number="6282315866088",
    whatsapp_href=f"https://wa.me/6282315866088?text={quote('Halo Yoora Sarah, saya ingin bantuan terkait pesanan saya.')}",
    default_message="Halo Yoora Sarah, saya ingin bantuan terkait pesanan saya.",
    confirmation_message="Setelah transfer selesai, kirim bukti pembayaran melalui WhatsApp agar pesanan dapat diproses lebih cepat.",
    business_hours="Senin - Sabtu, 08.00 - 17.00 WIB",
    response_window="Respon awal biasanya kurang dari 15 menit pada jam kerja.",
)

_SUPPORT_POLICY_ARTICLES: list[SupportPolicyArticle] = [
    SupportPolicyArticle(
        id="policy_payment_confirmation",
        title="Konfirmasi pembayaran",
        summary="Pembayaran virtual account atau transfer manual perlu dibuktikan agar tim dapat memulai verifikasi dan proses pesanan.",
        href="/pages/metode-pembayaran",
        topics=["payment", "order_status"],
    ),
    SupportPolicyArticle(
        id="policy_shipping_updates",
        title="Pembaruan pengiriman",
        summary="Nomor resi dibagikan setelah paket masuk tahap kirim, dan pembaruan status mengikuti mitra logistik yang dipilih.",
        href="/pages/pengiriman",
        topics=["shipping", "order_status"],
    ),
    SupportPolicyArticle(
        id="policy_preorder_launch",
        title="Preorder dan item launch terbatas",
        summary="Item preorder atau launch terbatas dapat membutuhkan waktu persiapan tambahan. Estimasi kirim akan dikonfirmasi kembali melalui WhatsApp bila stok siap kirim belum tersedia.",
        href="/pages/pengiriman",
        topics=["preorder", "shipping"],
    ),
    SupportPolicyArticle(
        id="policy_returns_exchange",
        title="Pengembalian dan penukaran",
        summary="Penukaran mengikuti syarat kondisi produk, periode pengajuan, dan ketersediaan stok pengganti.",
        href="/pages/pengembalian-penukaran-produk",
        topics=["returns", "size"],
    ),
]


def _get_storefront_shell() -> tuple[list[StorefrontQuickLink], list[str], list[str]]:
    storefront = catalog_store.get_storefront_catalog()
    return storefront.utility_quick_links, storefront.checkout_steps, storefront.trust_signals


def _get_product(category_slug: str, product_slug: str) -> CatalogProductDetail:
    product = catalog_store.get_product_detail(category_slug, product_slug)
    if product is None:
        raise ValueError(f"Missing catalog fixture for {category_slug}/{product_slug}")
    return product


def _build_cart_item(
    product: CatalogProductDetail,
    *,
    quantity: int,
    color_index: int = 0,
    size_index: int = 0,
) -> StorefrontCartItem:
    color = product.colors[min(color_index, len(product.colors) - 1)] if product.colors else None
    size = product.sizes[min(size_index, len(product.sizes) - 1)] if product.sizes else "M"
    return StorefrontCartItem(
        id=f"cart-{product.slug}",
        category_slug=product.category_slug,
        product_slug=product.slug,
        name=product.name,
        price=product.price,
        image=color.gallery[0] if color and color.gallery else product.image,
        quantity=quantity,
        color=color.name if color else "Signature Tone",
        size=size,
    )


class CommerceStore:
    def __init__(self) -> None:
        yoora = _get_product("dress", "yoora-dress-9662")
        bella = _get_product("dress", "bella-dress-4179")
        clara = _get_product("dress", "clara-dress-5254")

        self._wishlist_products = [clara, bella, yoora]
        self._checkout_items = [
            _build_cart_item(clara, quantity=1, color_index=0, size_index=1),
            _build_cart_item(bella, quantity=1, color_index=0, size_index=2),
        ]
        self._orders = [
            OrderSummary(
                id="order_ys_20260419_182",
                order_number="YS-2026-0419-182",
                status="awaiting_payment",
                status_label="Menunggu konfirmasi pembayaran",
                total=sum(item.price * item.quantity for item in self._checkout_items) + 18000 + 2000,
                item_count=sum(item.quantity for item in self._checkout_items),
                placed_at="2026-04-19T09:45:00+07:00",
            ),
            OrderSummary(
                id="order_ys_20260417_145",
                order_number="YS-2026-0417-145",
                status="processing",
                status_label="Sedang diproses tim gudang",
                total=yoora.price + 18000 + 2000,
                item_count=1,
                placed_at="2026-04-17T14:20:00+07:00",
            ),
        ]

    def list_orders(self) -> list[OrderSummary]:
        database_orders = storefront_postgres_store.list_orders()
        if database_orders is not None:
            return database_orders
        return self._orders

    def _get_fallback_cart_payload(self) -> StorefrontCartPayload:
        _, _, trust_signals = _get_storefront_shell()
        return StorefrontCartPayload(
            customer_id=_CUSTOMER_ID,
            cart_id="cart_preview_sarah",
            status="active",
            trust_signals=trust_signals,
            cart_items=self._checkout_items,
            updated_at="2026-04-22T09:16:00+07:00",
        )

    def get_cart(self) -> StorefrontCartPayload:
        database_cart = storefront_postgres_store.get_cart()
        if database_cart is not None:
            return database_cart
        return self._get_fallback_cart_payload()

    def add_cart_item(self, payload: AddCartItemPayload) -> StorefrontCartPayload:
        database_cart = storefront_postgres_store.add_cart_item(payload)
        if database_cart is not None:
            return database_cart

        product = _get_product(payload.category_slug, payload.product_slug)
        color_index = next(
            (index for index, color in enumerate(product.colors) if color.name == payload.color),
            0,
        )
        size_index = next(
            (index for index, size in enumerate(product.sizes) if size == payload.size),
            0,
        )
        fallback_item = _build_cart_item(
            product,
            quantity=max(1, payload.quantity),
            color_index=color_index,
            size_index=size_index,
        )

        existing_index = next(
            (
                index
                for index, item in enumerate(self._checkout_items)
                if item.product_slug == fallback_item.product_slug
                and item.color == fallback_item.color
                and item.size == fallback_item.size
            ),
            None,
        )
        if existing_index is None:
            self._checkout_items.append(fallback_item)
        else:
            existing = self._checkout_items[existing_index]
            self._checkout_items[existing_index] = existing.model_copy(
                update={"quantity": existing.quantity + fallback_item.quantity}
            )

        return self._get_fallback_cart_payload()

    def update_cart_item_quantity(self, item_id: str, quantity: int) -> StorefrontCartPayload:
        database_cart = storefront_postgres_store.update_cart_item_quantity(item_id, quantity)
        if database_cart is not None:
            return database_cart

        self._checkout_items = [
            item.model_copy(update={"quantity": max(1, quantity)}) if item.id == item_id else item
            for item in self._checkout_items
        ]
        return self._get_fallback_cart_payload()

    def remove_cart_item(self, item_id: str) -> StorefrontCartPayload:
        database_cart = storefront_postgres_store.remove_cart_item(item_id)
        if database_cart is not None:
            return database_cart

        self._checkout_items = [item for item in self._checkout_items if item.id != item_id]
        return self._get_fallback_cart_payload()

    def get_customer_profile(self) -> CustomerProfilePayload:
        database_profile = storefront_postgres_store.get_customer_profile()
        if database_profile is not None:
            return database_profile

        utility_quick_links, _, _ = _get_storefront_shell()
        active_orders = [order for order in self._orders if order.status != "delivered"]
        account_highlights: list[StorefrontAccountHighlight] = [
            StorefrontAccountHighlight(
                label="Status Member",
                value="Member Aktif",
                description="Siap menerima info koleksi baru, promo pilihan, dan pengingat restock.",
            ),
            StorefrontAccountHighlight(
                label="Pesanan Aktif",
                value=f"{len(active_orders):02d}",
                description="Pesanan aktif mencakup transaksi yang masih menunggu pembayaran atau sedang diproses.",
            ),
            StorefrontAccountHighlight(
                label="Alamat Tersimpan",
                value=f"{len(_ADDRESSES):02d}",
                description="Alamat Subang, Bandung, dan Jakarta siap dipakai ulang saat checkout.",
            ),
        ]

        return CustomerProfilePayload(
            customer_id=_CUSTOMER_ID,
            full_name="Sarah Rahmawati",
            phone="+62 823-1586-6088",
            member_state="member_active",
            account_highlights=account_highlights,
            utility_quick_links=utility_quick_links,
            wishlist_preview=self._wishlist_products[:2],
            addresses=_ADDRESSES,
            recent_orders=self._orders,
        )

    def get_customer_wishlist(self) -> CustomerWishlistPayload:
        database_wishlist = storefront_postgres_store.get_customer_wishlist()
        if database_wishlist is not None:
            return database_wishlist

        utility_quick_links, _, _ = _get_storefront_shell()
        return CustomerWishlistPayload(
            customer_id=_CUSTOMER_ID,
            utility_quick_links=utility_quick_links,
            wishlist_products=self._wishlist_products,
            updated_at="2026-04-22T09:00:00+07:00",
        )

    def get_checkout_summary(self) -> CheckoutSummaryPayload:
        database_checkout = storefront_postgres_store.get_checkout_summary()
        if database_checkout is not None:
            return database_checkout

        _, checkout_steps, _ = _get_storefront_shell()
        subtotal = sum(item.price * item.quantity for item in self._checkout_items)
        shipping = 18000
        service_fee = 2000
        totals = OrderTotals(
            subtotal=subtotal,
            shipping=shipping,
            service_fee=service_fee,
            total=subtotal + shipping + service_fee,
        )
        return CheckoutSummaryPayload(
            order=self._orders[0],
            checkout_steps=checkout_steps,
            cart_items=self._checkout_items,
            recipient=CheckoutRecipient(
                recipient_name="Sarah Rahmawati",
                phone="+62 823-1586-6088",
                address_line="Jl. Otto Iskandardinata No.271, Karanganyar, Subang, Jawa Barat 41211",
            ),
            payment=CheckoutPaymentSummary(
                method_code="virtual_account_bca",
                method_label="Virtual Account BCA",
                confirmation_instruction=_SUPPORT_CONTACT.confirmation_message,
                due_label="Bayar maksimal 24 jam setelah checkout dikonfirmasi.",
            ),
            totals=totals,
            support=_SUPPORT_CONTACT,
        )

    def get_support_contact(self) -> SupportContact:
        return _SUPPORT_CONTACT

    def list_policy_articles(self, topic: str | None = None) -> list[SupportPolicyArticle]:
        database_articles = storefront_postgres_store.list_policy_articles(topic=topic)
        if database_articles is not None:
            return database_articles

        if topic is None:
            return _SUPPORT_POLICY_ARTICLES

        filtered = [article for article in _SUPPORT_POLICY_ARTICLES if topic in article.topics]
        return filtered or _SUPPORT_POLICY_ARTICLES

    def create_handoff_preview(self, payload: SupportHandoffRequest) -> SupportHandoffRecord:
        database_record = storefront_postgres_store.create_support_handoff_preview(payload)
        if database_record is not None:
            return database_record

        relevant_articles = self.list_policy_articles(topic=payload.reason)
        return SupportHandoffRecord(
            id=f"handoff_preview_{datetime.now(tz=UTC).strftime('%Y%m%d%H%M%S')}",
            status="ready",
            next_action="Hubungi customer care melalui WhatsApp dengan ringkasan konteks dan nomor order jika tersedia.",
            summary=(
                f"Handoff dari {payload.source} untuk alasan '{payload.reason}'. "
                f"Ringkasan konteks: {payload.context_summary}"
            ),
            contact=_SUPPORT_CONTACT,
            policy_articles=relevant_articles[:2],
        )


commerce_store = CommerceStore()
