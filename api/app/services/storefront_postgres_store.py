from __future__ import annotations

from collections.abc import Iterator
from contextlib import contextmanager
from datetime import UTC, datetime
from decimal import Decimal
from typing import Any
from urllib.parse import quote

import psycopg
from psycopg.rows import dict_row

from app.core.config import get_settings
from app.schemas.catalog import (
    CatalogCategory,
    CatalogProductColor,
    CatalogProductDetail,
    StorefrontAccountHighlight,
    StorefrontQuickLink,
)
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
    StorefrontCartItem,
    StorefrontCartPayload,
    SupportContact,
    SupportHandoffRecord,
    SupportHandoffRequest,
    SupportPolicyArticle,
)

_DEMO_CUSTOMER_EMAIL = "sarah.rahmawati@yoora.local"
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
_SUPPORT_CONTACT = SupportContact(
    whatsapp_number="6282315866088",
    whatsapp_href=f"https://wa.me/6282315866088?text={quote('Halo Yoora Sarah, saya ingin bantuan terkait pesanan saya.')}",
    default_message="Halo Yoora Sarah, saya ingin bantuan terkait pesanan saya.",
    confirmation_message="Setelah transfer selesai, kirim bukti pembayaran melalui WhatsApp agar pesanan dapat diproses lebih cepat.",
    business_hours="Senin - Sabtu, 08.00 - 17.00 WIB",
    response_window="Respon awal biasanya kurang dari 15 menit pada jam kerja.",
)
_ORDER_STATUS_LABELS = {
    "awaiting_payment": "Menunggu konfirmasi pembayaran",
    "processing": "Sedang diproses tim gudang",
    "ready_to_ship": "Siap dikirim",
    "shipped": "Sedang dalam pengiriman",
    "delivered": "Sudah diterima",
}


def _as_int(value: Decimal | int | None) -> int:
    if value is None:
        return 0
    return int(value)


def _as_iso(value: datetime | str | None) -> str:
    if value is None:
        return datetime.now(tz=UTC).isoformat()
    if isinstance(value, str):
        return value
    return value.isoformat()


class StorefrontPostgresStore:
    @contextmanager
    def _connect(self) -> Iterator[psycopg.Connection]:
        settings = get_settings()
        with psycopg.connect(settings.database_url, row_factory=dict_row) as connection:
            yield connection

    def _tables_ready(self, table_names: list[str]) -> bool:
        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT rel_name, to_regclass('public.' || rel_name) IS NOT NULL AS exists
                    FROM unnest(%s::text[]) AS rel_name;
                    """,
                    (table_names,),
                )
                rows = cursor.fetchall()
        except psycopg.Error:
            return False
        return all(row["exists"] for row in rows)

    def list_categories(self) -> list[CatalogCategory] | None:
        if not self._tables_ready(["categories"]):
            return None

        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, slug, name, description, hero_image, eyebrow
                    FROM categories
                    ORDER BY created_at, slug;
                    """
                )
                rows = cursor.fetchall()
        except psycopg.Error:
            return None

        if not rows:
            return None

        return [
            CatalogCategory(
                id=str(row["id"]),
                slug=row["slug"],
                name=row["name"],
                description=row["description"] or "",
                hero_image=row["hero_image"] or "",
                eyebrow=row["eyebrow"],
            )
            for row in rows
        ]

    def list_product_details(self, category_slug: str) -> list[CatalogProductDetail] | None:
        if not self._tables_ready(["products", "categories", "product_variants"]):
            return None

        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT
                      products.id,
                      products.slug,
                      products.name,
                      products.description_blocks,
                      products.materials,
                      products.care_instructions,
                      products.price,
                      products.compare_price,
                      products.image,
                      products.badge,
                      products.is_featured,
                      products.swatch_count,
                      products.stock_state,
                      products.trust_badges,
                      products.tags,
                      categories.slug AS category_slug
                    FROM products
                    JOIN categories
                      ON categories.id = products.category_id
                    WHERE products.is_active = true
                      AND categories.slug = %s
                    ORDER BY products.created_at, products.slug;
                    """,
                    (category_slug,),
                )
                product_rows = cursor.fetchall()

                if not product_rows:
                    return None

                product_ids = [str(row["id"]) for row in product_rows]
                cursor.execute(
                    """
                    SELECT
                      product_id,
                      color_name,
                      color_hex,
                      size_code,
                      stock,
                      image_urls,
                      position
                    FROM product_variants
                    WHERE product_id = ANY(%s::uuid[])
                      AND is_active = true
                    ORDER BY product_id, position, color_name, size_code;
                    """,
                    (product_ids,),
                )
                variant_rows = cursor.fetchall()
        except psycopg.Error:
            return None

        variants_by_product: dict[str, list[dict[str, Any]]] = {}
        for row in variant_rows:
            variants_by_product.setdefault(str(row["product_id"]), []).append(row)

        items: list[CatalogProductDetail] = []
        for row in product_rows:
            product_id = str(row["id"])
            variants = variants_by_product.get(product_id, [])

            colors: list[CatalogProductColor] = []
            sizes: list[str] = []
            total_stock = 0
            color_seen: dict[tuple[str, str], CatalogProductColor] = {}

            for variant in variants:
                size_code = variant["size_code"]
                if size_code not in sizes:
                    sizes.append(size_code)

                total_stock += int(variant["stock"] or 0)
                color_key = (variant["color_name"], variant["color_hex"])
                existing = color_seen.get(color_key)
                galleries = [image for image in (variant["image_urls"] or []) if image]
                if existing is None:
                    color = CatalogProductColor(
                        name=variant["color_name"],
                        hex=variant["color_hex"],
                        gallery=galleries or [row["image"]],
                    )
                    color_seen[color_key] = color
                    colors.append(color)
                else:
                    for image in galleries:
                        if image not in existing.gallery:
                            existing.gallery.append(image)

            stock_state = row["stock_state"] or ("low_stock" if total_stock <= 6 else "in_stock")
            items.append(
                CatalogProductDetail(
                    id=product_id,
                    category_slug=row["category_slug"],
                    name=row["name"],
                    slug=row["slug"],
                    price=_as_int(row["price"]),
                    compare_price=_as_int(row["compare_price"]) if row["compare_price"] is not None else None,
                    image=row["image"],
                    swatch_count=row["swatch_count"] or len(colors),
                    sizes=sizes or ["M"],
                    badge=row["badge"],
                    stock=total_stock,
                    stock_state=stock_state,
                    is_featured=row["is_featured"],
                    tags=list(row["tags"] or []),
                    colors=colors or [CatalogProductColor(name="Signature Tone", hex="#baa39d", gallery=[row["image"]])],
                    description=list(row["description_blocks"] or []),
                    materials=list(row["materials"] or []),
                    care=list(row["care_instructions"] or []),
                    trust_badges=list(row["trust_badges"] or []),
                )
            )

        return items

    def _get_demo_customer(self) -> dict[str, Any] | None:
        if not self._tables_ready(["customers"]):
            return None

        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, email, name, phone, member_state
                    FROM customers
                    WHERE LOWER(email) = LOWER(%s)
                    LIMIT 1;
                    """,
                    (_DEMO_CUSTOMER_EMAIL,),
                )
                return cursor.fetchone()
        except psycopg.Error:
            return None

    def _list_order_rows(self, customer_id: str) -> list[dict[str, Any]] | None:
        if not self._tables_ready(["orders", "order_items"]):
            return None

        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT
                      orders.id,
                      orders.order_number,
                      orders.status,
                      orders.total,
                      orders.placed_at,
                      COALESCE(SUM(order_items.quantity), 0) AS item_count
                    FROM orders
                    LEFT JOIN order_items
                      ON order_items.order_id = orders.id
                    WHERE orders.customer_id = %s::uuid
                    GROUP BY orders.id
                    ORDER BY orders.placed_at DESC, orders.order_number DESC;
                    """,
                    (customer_id,),
                )
                rows = cursor.fetchall()
        except psycopg.Error:
            return None

        return rows

    def list_orders(self) -> list[OrderSummary] | None:
        customer = self._get_demo_customer()
        if customer is None:
            return None

        rows = self._list_order_rows(str(customer["id"]))
        if rows is None:
            return None

        return [
            OrderSummary(
                id=str(row["id"]),
                order_number=row["order_number"],
                status=row["status"],
                status_label=_ORDER_STATUS_LABELS.get(row["status"], row["status"]),
                total=_as_int(row["total"]),
                item_count=int(row["item_count"] or 0),
                placed_at=_as_iso(row["placed_at"]),
            )
            for row in rows
        ]

    def _load_addresses(self, customer_id: str) -> list[CustomerAddress] | None:
        if not self._tables_ready(["customer_addresses"]):
            return None

        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, label, recipient_name, phone, address_line, city, province, postal_code, is_default
                    FROM customer_addresses
                    WHERE customer_id = %s::uuid
                    ORDER BY is_default DESC, created_at ASC;
                    """,
                    (customer_id,),
                )
                rows = cursor.fetchall()
        except psycopg.Error:
            return None

        return [
            CustomerAddress(
                id=str(row["id"]),
                label=row["label"],
                recipient_name=row["recipient_name"],
                phone=row["phone"],
                line1=row["address_line"],
                city=row["city"],
                province=row["province"],
                postal_code=row["postal_code"],
                is_primary=row["is_default"],
            )
            for row in rows
        ]

    def _load_products_by_ids(self, product_ids: list[str]) -> list[CatalogProductDetail]:
        if not product_ids:
            return []

        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT products.id, categories.slug AS category_slug
                    FROM products
                    JOIN categories
                      ON categories.id = products.category_id
                    WHERE products.id = ANY(%s::uuid[]);
                    """,
                    (product_ids,),
                )
                rows = cursor.fetchall()
        except psycopg.Error:
            return []

        if not rows:
            return []

        category_slugs: list[str] = []
        for row in rows:
            category_slug = row["category_slug"]
            if category_slug not in category_slugs:
                category_slugs.append(category_slug)

        product_by_id: dict[str, CatalogProductDetail] = {}
        for category_slug in category_slugs:
            for product in self.list_product_details(category_slug) or []:
                product_by_id[product.id] = product

        return [product_by_id[product_id] for product_id in product_ids if product_id in product_by_id]

    def _get_active_cart_row(self, customer_id: str) -> dict[str, Any] | None:
        if not self._tables_ready(["carts"]):
            return None

        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, customer_id, status, shipping_cost, service_fee, created_at, updated_at
                    FROM carts
                    WHERE customer_id = %s::uuid
                      AND status = 'active'
                    ORDER BY updated_at DESC, created_at DESC
                    LIMIT 1;
                    """,
                    (customer_id,),
                )
                return cursor.fetchone()
        except psycopg.Error:
            return None

    def _ensure_active_cart_row(self, customer_id: str) -> dict[str, Any] | None:
        existing = self._get_active_cart_row(customer_id)
        if existing is not None:
            return existing

        if not self._tables_ready(["carts"]):
            return None

        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO carts (customer_id, status, shipping_cost, service_fee)
                    VALUES (%s::uuid, 'active', 18000, 2000)
                    RETURNING id, customer_id, status, shipping_cost, service_fee, created_at, updated_at;
                    """,
                    (customer_id,),
                )
                row = cursor.fetchone()
                connection.commit()
                return row
        except psycopg.Error:
            return None

    def _load_cart_item_rows(self, cart_id: str) -> list[dict[str, Any]] | None:
        if not self._tables_ready(["cart_items", "products", "categories"]):
            return None

        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT
                      cart_items.id,
                      cart_items.quantity,
                      cart_items.unit_price,
                      products.slug AS product_slug,
                      products.name,
                      products.image,
                      categories.slug AS category_slug,
                      product_variants.color_name,
                      product_variants.size_code,
                      product_variants.image_urls
                    FROM cart_items
                    JOIN products
                      ON products.id = cart_items.product_id
                    JOIN categories
                      ON categories.id = products.category_id
                    LEFT JOIN product_variants
                      ON product_variants.id = cart_items.variant_id
                    WHERE cart_items.cart_id = %s::uuid
                    ORDER BY cart_items.created_at, cart_items.id;
                    """,
                    (cart_id,),
                )
                return cursor.fetchall()
        except psycopg.Error:
            return None

    def _resolve_variant_row(
        self,
        *,
        product_id: str | None,
        category_slug: str,
        product_slug: str,
        color: str | None,
        size: str | None,
    ) -> dict[str, Any] | None:
        if not self._tables_ready(["products", "categories", "product_variants"]):
            return None

        clauses = ["products.slug = %s", "categories.slug = %s", "product_variants.is_active = true"]
        params: list[Any] = [product_slug, category_slug]

        if product_id:
            clauses.append("products.id = %s::uuid")
            params.append(product_id)
        if color:
            clauses.append("product_variants.color_name = %s")
            params.append(color)
        if size:
            clauses.append("product_variants.size_code = %s")
            params.append(size)

        where_clause = " AND ".join(clauses)

        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    f"""
                    SELECT
                      product_variants.id,
                      products.id AS product_id,
                      products.price,
                      product_variants.color_name,
                      product_variants.size_code
                    FROM product_variants
                    JOIN products
                      ON products.id = product_variants.product_id
                    JOIN categories
                      ON categories.id = products.category_id
                    WHERE {where_clause}
                    ORDER BY product_variants.position, product_variants.created_at
                    LIMIT 1;
                    """,
                    tuple(params),
                )
                row = cursor.fetchone()
                if row is not None:
                    return row

                cursor.execute(
                    """
                    SELECT
                      product_variants.id,
                      products.id AS product_id,
                      products.price,
                      product_variants.color_name,
                      product_variants.size_code
                    FROM product_variants
                    JOIN products
                      ON products.id = product_variants.product_id
                    JOIN categories
                      ON categories.id = products.category_id
                    WHERE products.slug = %s
                      AND categories.slug = %s
                      AND product_variants.is_active = true
                    ORDER BY product_variants.position, product_variants.created_at
                    LIMIT 1;
                    """,
                    (product_slug, category_slug),
                )
                return cursor.fetchone()
        except psycopg.Error:
            return None

    def _build_cart_items(self, item_rows: list[dict[str, Any]]) -> list[StorefrontCartItem]:
        return [
            StorefrontCartItem(
                id=str(row["id"]),
                category_slug=row["category_slug"],
                product_slug=row["product_slug"],
                name=row["name"],
                price=_as_int(row.get("unit_price", row.get("price"))),
                image=(row["image_urls"] or [row["image"]])[0],
                quantity=int(row["quantity"]),
                color=row["color_name"] or "Signature Tone",
                size=row["size_code"] or "M",
            )
            for row in item_rows
        ]

    def get_cart(self) -> StorefrontCartPayload | None:
        customer = self._get_demo_customer()
        if customer is None:
            return None

        cart_row = self._get_active_cart_row(str(customer["id"]))
        if cart_row is None:
            return None

        item_rows = self._load_cart_item_rows(str(cart_row["id"]))
        if item_rows is None:
            return None

        return StorefrontCartPayload(
            customer_id=str(customer["id"]),
            cart_id=str(cart_row["id"]),
            status=cart_row["status"],
            trust_signals=_TRUST_SIGNALS,
            cart_items=self._build_cart_items(item_rows),
            updated_at=_as_iso(cart_row["updated_at"] or cart_row["created_at"]),
        )

    def add_cart_item(self, payload: AddCartItemPayload) -> StorefrontCartPayload | None:
        customer = self._get_demo_customer()
        if customer is None or not self._tables_ready(["carts", "cart_items", "products", "product_variants", "categories"]):
            return None

        cart_row = self._ensure_active_cart_row(str(customer["id"]))
        if cart_row is None:
            return None

        variant_row = self._resolve_variant_row(
            product_id=payload.product_id,
            category_slug=payload.category_slug,
            product_slug=payload.product_slug,
            color=payload.color,
            size=payload.size,
        )
        if variant_row is None:
            return None

        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, quantity
                    FROM cart_items
                    WHERE cart_id = %s::uuid
                      AND variant_id = %s::uuid
                    LIMIT 1;
                    """,
                    (str(cart_row["id"]), str(variant_row["id"])),
                )
                existing = cursor.fetchone()

                if existing is None:
                    cursor.execute(
                        """
                        INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, unit_price)
                        VALUES (%s::uuid, %s::uuid, %s::uuid, %s, %s)
                        RETURNING id;
                        """,
                        (
                            str(cart_row["id"]),
                            str(variant_row["product_id"]),
                            str(variant_row["id"]),
                            payload.quantity,
                            variant_row["price"],
                        ),
                    )
                else:
                    cursor.execute(
                        """
                        UPDATE cart_items
                        SET quantity = quantity + %s, updated_at = now()
                        WHERE id = %s::uuid
                        RETURNING id;
                        """,
                        (payload.quantity, str(existing["id"])),
                    )

                cursor.execute(
                    """
                    UPDATE carts
                    SET updated_at = now()
                    WHERE id = %s::uuid;
                    """,
                    (str(cart_row["id"]),),
                )
                connection.commit()
        except psycopg.Error:
            return None

        return self.get_cart()

    def get_customer_profile(self) -> CustomerProfilePayload | None:
        customer = self._get_demo_customer()
        if customer is None:
            return None

        orders = self.list_orders()
        addresses = self._load_addresses(str(customer["id"]))
        wishlist = self.get_customer_wishlist()
        if orders is None or addresses is None or wishlist is None:
            return None

        active_orders = [order for order in orders if order.status != "delivered"]
        account_highlights = [
            StorefrontAccountHighlight(
                label="Status Member",
                value="Member Aktif" if customer["member_state"] == "member_active" else customer["member_state"],
                description="Siap menerima info koleksi baru, promo pilihan, dan pengingat restock.",
            ),
            StorefrontAccountHighlight(
                label="Pesanan Aktif",
                value=f"{len(active_orders):02d}",
                description="Pesanan aktif mencakup transaksi yang masih menunggu pembayaran atau sedang diproses.",
            ),
            StorefrontAccountHighlight(
                label="Alamat Tersimpan",
                value=f"{len(addresses):02d}",
                description="Alamat Subang, Bandung, dan Jakarta siap dipakai ulang saat checkout.",
            ),
        ]

        return CustomerProfilePayload(
            customer_id=str(customer["id"]),
            full_name=customer["name"],
            phone=customer["phone"] or "",
            member_state=customer["member_state"],
            account_highlights=account_highlights,
            utility_quick_links=_UTILITY_QUICK_LINKS,
            wishlist_preview=wishlist.wishlist_products[:2],
            addresses=addresses,
            recent_orders=orders,
        )

    def get_customer_wishlist(self) -> CustomerWishlistPayload | None:
        customer = self._get_demo_customer()
        if customer is None or not self._tables_ready(["wishlists"]):
            return None

        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT product_id, created_at
                    FROM wishlists
                    WHERE customer_id = %s::uuid
                    ORDER BY created_at ASC;
                    """,
                    (str(customer["id"]),),
                )
                rows = cursor.fetchall()
        except psycopg.Error:
            return None

        product_ids = [str(row["product_id"]) for row in rows]
        products = self._load_products_by_ids(product_ids)
        updated_at = _as_iso(rows[-1]["created_at"]) if rows else datetime.now(tz=UTC).isoformat()

        return CustomerWishlistPayload(
            customer_id=str(customer["id"]),
            utility_quick_links=_UTILITY_QUICK_LINKS,
            wishlist_products=products,
            updated_at=updated_at,
        )

    def get_checkout_summary(self) -> CheckoutSummaryPayload | None:
        customer = self._get_demo_customer()
        if customer is None:
            return None

        addresses = self._load_addresses(str(customer["id"]))
        if addresses is None:
            return None

        cart_row = self._get_active_cart_row(str(customer["id"]))
        if cart_row is not None:
            item_rows = self._load_cart_item_rows(str(cart_row["id"]))
            if item_rows is None:
                return None

            cart_items = self._build_cart_items(item_rows)
            subtotal = sum(item.price * item.quantity for item in cart_items)
            shipping = _as_int(cart_row["shipping_cost"])
            service_fee = _as_int(cart_row["service_fee"])
            primary_address = next((address for address in addresses if address.is_primary), addresses[0] if addresses else None)

            return CheckoutSummaryPayload(
                order=OrderSummary(
                    id=str(cart_row["id"]),
                    order_number=f"YS-CART-{str(cart_row['id'])[:8].upper()}",
                    status="awaiting_payment",
                    status_label="Menunggu konfirmasi pembayaran",
                    total=subtotal + shipping + service_fee,
                    item_count=sum(item.quantity for item in cart_items),
                    placed_at=_as_iso(cart_row["updated_at"] or cart_row["created_at"]),
                ),
                checkout_steps=_CHECKOUT_STEPS,
                cart_items=cart_items,
                recipient=CheckoutRecipient(
                    recipient_name=primary_address.recipient_name if primary_address else customer["name"],
                    phone=primary_address.phone if primary_address else customer["phone"] or "",
                    address_line=(
                        f"{primary_address.line1}, {primary_address.city}, {primary_address.province} {primary_address.postal_code}"
                        if primary_address
                        else ""
                    ),
                ),
                payment=CheckoutPaymentSummary(
                    method_code="virtual_account_bca",
                    method_label="Virtual Account BCA",
                    confirmation_instruction=_SUPPORT_CONTACT.confirmation_message,
                    due_label="Bayar maksimal 24 jam setelah checkout dikonfirmasi.",
                ),
                totals=OrderTotals(
                    subtotal=subtotal,
                    shipping=shipping,
                    service_fee=service_fee,
                    total=subtotal + shipping + service_fee,
                ),
                support=_SUPPORT_CONTACT,
            )

        orders = self.list_orders()
        if not orders or not self._tables_ready(["orders", "order_items", "customer_addresses", "products"]):
            return None

        latest_order = orders[0]
        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT
                      orders.id,
                      orders.subtotal,
                      orders.shipping_cost,
                      orders.service_fee,
                      orders.total,
                      orders.payment_method,
                      orders.payment_due_at,
                      customer_addresses.recipient_name,
                      customer_addresses.phone,
                      customer_addresses.address_line,
                      customer_addresses.city,
                      customer_addresses.province,
                      customer_addresses.postal_code
                    FROM orders
                    LEFT JOIN customer_addresses
                      ON customer_addresses.id = orders.shipping_address_id
                    WHERE orders.id = %s::uuid
                    LIMIT 1;
                    """,
                    (latest_order.id,),
                )
                order_row = cursor.fetchone()
                if order_row is None:
                    return None

                cursor.execute(
                    """
                    SELECT
                      order_items.id,
                      order_items.quantity,
                      order_items.price,
                      products.slug AS product_slug,
                      products.name,
                      products.image,
                      categories.slug AS category_slug,
                      product_variants.color_name,
                      product_variants.size_code,
                      product_variants.image_urls
                    FROM order_items
                    JOIN products
                      ON products.id = order_items.product_id
                    JOIN categories
                      ON categories.id = products.category_id
                    LEFT JOIN product_variants
                      ON product_variants.id = order_items.variant_id
                    WHERE order_items.order_id = %s::uuid
                    ORDER BY order_items.created_at, order_items.id;
                    """,
                    (latest_order.id,),
                )
                item_rows = cursor.fetchall()
        except psycopg.Error:
            return None

        cart_items = self._build_cart_items(item_rows)

        return CheckoutSummaryPayload(
            order=latest_order,
            checkout_steps=_CHECKOUT_STEPS,
            cart_items=cart_items,
            recipient=CheckoutRecipient(
                recipient_name=order_row["recipient_name"] or customer["name"],
                phone=order_row["phone"] or customer["phone"] or "",
                address_line=(
                    f"{order_row['address_line']}, {order_row['city']}, {order_row['province']} {order_row['postal_code']}"
                    if order_row["address_line"]
                    else ""
                ),
            ),
            payment=CheckoutPaymentSummary(
                method_code=order_row["payment_method"],
                method_label="Virtual Account BCA" if order_row["payment_method"] == "virtual_account_bca" else order_row["payment_method"],
                confirmation_instruction=_SUPPORT_CONTACT.confirmation_message,
                due_label=f"Bayar maksimal {_as_iso(order_row['payment_due_at'])}." if order_row["payment_due_at"] else "Bayar sesuai instruksi checkout.",
            ),
            totals=OrderTotals(
                subtotal=_as_int(order_row["subtotal"]),
                shipping=_as_int(order_row["shipping_cost"]),
                service_fee=_as_int(order_row["service_fee"]),
                total=_as_int(order_row["total"]),
            ),
            support=_SUPPORT_CONTACT,
        )

    def _touch_cart(self, cart_id: str) -> None:
        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE carts
                    SET updated_at = now()
                    WHERE id = %s::uuid;
                    """,
                    (cart_id,),
                )
                connection.commit()
        except psycopg.Error:
            return None

    def update_cart_item_quantity(self, item_id: str, quantity: int) -> StorefrontCartPayload | None:
        customer = self._get_demo_customer()
        if customer is None or not self._tables_ready(["carts", "cart_items"]):
            return None

        cart_row = self._get_active_cart_row(str(customer["id"]))
        if cart_row is None:
            return None

        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE cart_items
                    SET quantity = %s, updated_at = now()
                    WHERE id = %s::uuid
                      AND cart_id = %s::uuid
                    RETURNING id;
                    """,
                    (quantity, item_id, str(cart_row["id"])),
                )
                row = cursor.fetchone()
                if row is None:
                    connection.rollback()
                    return self.get_cart()
                connection.commit()
        except psycopg.Error:
            return None

        self._touch_cart(str(cart_row["id"]))
        return self.get_cart()

    def remove_cart_item(self, item_id: str) -> StorefrontCartPayload | None:
        customer = self._get_demo_customer()
        if customer is None or not self._tables_ready(["carts", "cart_items"]):
            return None

        cart_row = self._get_active_cart_row(str(customer["id"]))
        if cart_row is None:
            return None

        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    DELETE FROM cart_items
                    WHERE id = %s::uuid
                      AND cart_id = %s::uuid
                    RETURNING id;
                    """,
                    (item_id, str(cart_row["id"])),
                )
                row = cursor.fetchone()
                if row is None:
                    connection.rollback()
                    return self.get_cart()
                connection.commit()
        except psycopg.Error:
            return None

        self._touch_cart(str(cart_row["id"]))
        return self.get_cart()

    def list_policy_articles(self, topic: str | None = None) -> list[SupportPolicyArticle] | None:
        if not self._tables_ready(["support_policy_articles"]):
            return None

        try:
            with self._connect() as connection, connection.cursor() as cursor:
                if topic:
                    cursor.execute(
                        """
                        SELECT id, title, summary, href, topics
                        FROM support_policy_articles
                        WHERE is_active = true
                          AND %s = ANY(topics)
                        ORDER BY created_at, slug;
                        """,
                        (topic,),
                    )
                else:
                    cursor.execute(
                        """
                        SELECT id, title, summary, href, topics
                        FROM support_policy_articles
                        WHERE is_active = true
                        ORDER BY created_at, slug;
                        """
                    )
                rows = cursor.fetchall()
        except psycopg.Error:
            return None

        if not rows:
            return None

        return [
            SupportPolicyArticle(
                id=str(row["id"]),
                title=row["title"],
                summary=row["summary"],
                href=row["href"],
                topics=list(row["topics"] or []),
            )
            for row in rows
        ]

    def create_support_handoff_preview(self, payload: SupportHandoffRequest) -> SupportHandoffRecord | None:
        if not self._tables_ready(["support_handoffs"]):
            return None

        policy_articles = self.list_policy_articles(topic=payload.reason) or self.list_policy_articles() or []
        next_action = "Hubungi customer care melalui WhatsApp dengan ringkasan konteks dan nomor order jika tersedia."

        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO support_handoffs (
                      customer_reference,
                      order_reference,
                      reason,
                      context_summary,
                      requested_channel,
                      source,
                      status,
                      next_action,
                      contact_whatsapp_number,
                      contact_whatsapp_href
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, 'ready', %s, %s, %s)
                    RETURNING id;
                    """,
                    (
                        payload.customer_id,
                        payload.order_id,
                        payload.reason,
                        payload.context_summary,
                        payload.requested_channel,
                        payload.source,
                        next_action,
                        _SUPPORT_CONTACT.whatsapp_number,
                        _SUPPORT_CONTACT.whatsapp_href,
                    ),
                )
                row = cursor.fetchone()
                connection.commit()
        except psycopg.Error:
            return None

        return SupportHandoffRecord(
            id=str(row["id"]),
            status="ready",
            next_action=next_action,
            summary=(
                f"Handoff dari {payload.source} untuk alasan '{payload.reason}'. "
                f"Ringkasan konteks: {payload.context_summary}"
            ),
            contact=_SUPPORT_CONTACT,
            policy_articles=policy_articles[:2],
        )


storefront_postgres_store = StorefrontPostgresStore()
