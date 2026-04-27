from __future__ import annotations

from dataclasses import asdict, dataclass, is_dataclass
import json
import re
import requests
import warnings

from app.core.config import get_settings
from app.schemas.commerce import SupportHandoffRecord, SupportHandoffRequest
from app.services.catalog_store import catalog_store
from app.services.commerce_store import commerce_store

warnings.filterwarnings(
    "ignore", category=requests.exceptions.RequestsDependencyWarning
)


AI_STYLIST_SYSTEM_PROMPT = """Anda adalah AI Stylist Premium dari Yoora Sarah. 
Tugas Anda membantu customer menemukan outfit yang tepat dengan:
1. Mix & Match - Mencari kombinasi dress + hijab + accessories yang cocok
2. Outfit Composer - Memberikan template outfit berdasarkan occasion
3. Style Advice - Memberikan tips styling berdasarkan foto customer

Katalog produk:
- Dress: Clara Dress, Yoora Dress, Bella Dress, Medina Dress, Safiyyah Sora Dress, Yume Striped Dress, Medina Poka Dress
- Abaya: PO Lianhua Abaya, Beyza Abaya, Talia Denim Abaya, Bloom Love Abaya, Bloom Flower Abaya, Zippa Abaya
- Hijab: Naura Oval, Bergo Syar'i
- Khimar: Khimar Medina, Madiha Square Ban, French Khimar Armuzna
- Pashmina: Serene Pashmina Curve
- Accessories: Bross Yoora Sarah, Tote Bag
- Footwear: Lilly Heels, Levine Boots
- Kids: Azalia Kids, Bella Kids Dress, Yume Striped Kids Dress

Setiap produk punya 13-22 warna (Cappucino, Camel, Black, Hazelnut, dll) dan ukuran S/M/L/XL.

Selalu ответ dalam Bahasa Indonesia yang natural dan friendly.
"""


@dataclass
class AIProductLookupResult:
    found: bool
    product_name: str | None = None
    category: str | None = None
    price: int | None = None
    in_stock: bool | None = None
    stock_summary: str | None = None
    variants: list[dict] | None = None
    message: str | None = None


@dataclass
class AIVariantAvailabilityResult:
    found: bool
    variant_name: str | None = None
    available: bool | None = None
    quantity: int | None = None
    message: str | None = None


@dataclass
class AIOrderStatusResult:
    found: bool
    order_number: str | None = None
    status: str | None = None
    status_label: str | None = None
    total: int | None = None
    item_count: int | None = None
    placed_at: str | None = None
    message: str | None = None


@dataclass
class AIStylistRecommendation:
    product_name: str
    category: str
    slug: str
    price: int
    image: str
    badge: str | None = None
    stock_summary: str | None = None
    confidence_label: str | None = None
    reason: str | None = None
    styling_note: str | None = None
    occasion: str | None = None


@dataclass
class AISizeGuidanceResult:
    found: bool
    product_name: str | None = None
    recommended_size: str | None = None
    confidence_label: str | None = None
    confidence_score: int | None = None
    fit_summary: str | None = None
    measurement_note: str | None = None
    alternative_sizes: list[str] | None = None
    handoff_recommended: bool = False
    handoff_reason: str | None = None
    message: str | None = None


@dataclass
class AILaunchPolicyResult:
    found: bool
    product_name: str | None = None
    stock_state: str | None = None
    title: str | None = None
    summary: str | None = None
    href: str | None = None
    message: str | None = None


@dataclass
class AIAssistantSource:
    title: str
    href: str


@dataclass
class AIAssistantAction:
    key: str
    label: str
    href: str | None = None
    kind: str = "link"


@dataclass
class AIAssistantResponse:
    content: str
    sources: list[AIAssistantSource] | None = None
    actions: list[AIAssistantAction] | None = None
    mode: str = "fallback"


class AIToolsService:
    """Safe tool endpoints for Buyer AI - grounded search plus optional Groq response synthesis."""

    _size_order = ["XS", "S", "M", "L", "XL", "XXL", "3XL"]
    _sensitive_keywords = {
        "komplain",
        "refund",
        "kecewa",
        "marah",
        "cancel",
        "salah kirim",
        "rusak",
        "retur",
        "dibohongi",
        "bayar tapi",
    }
    _styling_keywords = {"styling", "rekomendasi", "padukan", "cocok", "look"}
    _size_keywords = {"ukuran", "size", "muat", "fit"}
    _product_keywords = {
        "produk",
        "baju",
        "dress",
        "celana",
        "kerudung",
        "jaket",
        "ada",
        "stock",
        "tersedia",
    }
    _policy_topic_keywords = {
        "shipping": ("kirim", "pengiriman", "resi", "preorder", "launch"),
        "payment": ("bayar", "pembayaran", "transfer", "virtual account"),
        "returns": ("tukar", "return", "refund", "retur", "rusak"),
        "size": ("ukuran", "size", "fit", "muat"),
    }

    def _tokenize(self, value: str | None) -> list[str]:
        if not value:
            return []
        return [token for token in re.split(r"[^a-z0-9]+", value.lower()) if token]

    def _stock_summary(self, stock_state: str | None) -> str:
        if stock_state == "in_stock":
            return "Siap kirim"
        if stock_state == "low_stock":
            return "Stok terbatas"
        if stock_state == "preorder":
            return "Preorder"
        return "Perlu konfirmasi stok"

    def _confidence_label(self, score: int) -> str:
        if score >= 80:
            return "high"
        if score >= 60:
            return "medium"
        return "low"

    def _query_contains(self, query: str, keywords: set[str]) -> bool:
        query_lower = query.lower()
        return any(keyword in query_lower for keyword in keywords)

    def _extract_order_number(self, query: str) -> str | None:
        match = re.search(r"YS-\d{4}-\d{4}-\d+", query, re.IGNORECASE)
        return match.group(0).upper() if match else None

    def _extract_selected_size(self, query: str) -> str | None:
        match = re.search(r"\b(XS|S|M|L|XL|XXL|3XL)\b", query.upper())
        return match.group(1) if match else None

    def _support_topic_from_query(self, query: str) -> str | None:
        query_lower = query.lower()
        for topic, keywords in self._policy_topic_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                return topic
        return None

    def _handoff_reason_from_query(self, query: str, topic: str | None) -> str:
        query_lower = query.lower()
        if any(
            keyword in query_lower for keyword in {"refund", "retur", "return", "rusak"}
        ):
            return "returns"
        if any(keyword in query_lower for keyword in {"ukuran", "size", "fit", "muat"}):
            return "size"
        if any(
            keyword in query_lower
            for keyword in {"kirim", "pengiriman", "resi", "preorder", "launch"}
        ):
            return "shipping"
        return topic or "order_status"

    def _serialize(self, value):
        if value is None:
            return None
        if hasattr(value, "model_dump"):
            return value.model_dump(by_alias=True)
        if is_dataclass(value):
            return asdict(value)
        if isinstance(value, list):
            return [self._serialize(item) for item in value]
        if isinstance(value, dict):
            return {key: self._serialize(item) for key, item in value.items()}
        return value

    def _source_from_product(self, product: dict) -> AIAssistantSource:
        return AIAssistantSource(
            title=product["name"],
            href=f"/{product['category']}/{product['slug']}",
        )

    def _normalize_source_href(self, href: str) -> str:
        trimmed = href.strip()
        for prefix in ("https://yoorasarah.com", "http://yoorasarah.com"):
            if trimmed.startswith(prefix):
                return trimmed[len(prefix) :] or "/"
        return trimmed

    def _validate_sources(
        self,
        raw_sources: list[dict] | None,
        allowed_sources: dict[str, str] | None = None,
    ) -> list[AIAssistantSource] | None:
        if not raw_sources:
            return None

        items: list[AIAssistantSource] = []
        for item in raw_sources[:3]:
            title = str(item.get("title", "")).strip()
            href = self._normalize_source_href(str(item.get("href", "")))
            if not href:
                continue
            if allowed_sources is not None and href not in allowed_sources:
                continue
            if not title and allowed_sources is not None:
                title = allowed_sources[href]
            if title:
                items.append(AIAssistantSource(title=title, href=href))

        return items or None

    def _build_allowed_sources(self, context: dict) -> dict[str, str]:
        allowed: dict[str, str] = {}

        for product in context.get("products") or []:
            href = f"/{product['category']}/{product['slug']}"
            allowed[href] = product["name"]

        for item in context.get("recommendations") or []:
            href = f"/{item['category']}/{item['slug']}"
            allowed[href] = item["product_name"]

        for policy in context.get("policies") or []:
            href = self._normalize_source_href(str(policy.get("href", "")))
            title = str(policy.get("title", "")).strip()
            if href and title:
                allowed[href] = title

        launch_policy = context.get("launch_policy") or {}
        launch_href = self._normalize_source_href(str(launch_policy.get("href", "")))
        launch_title = str(launch_policy.get("title", "")).strip()
        if launch_href and launch_title:
            allowed[launch_href] = launch_title

        handoff = context.get("handoff") or {}
        contact = handoff.get("contact") or {}
        whatsapp_href = str(contact.get("whatsappHref", "")).strip()
        if whatsapp_href:
            allowed[whatsapp_href] = "Lanjut ke WhatsApp support"

        order_status = context.get("order_status") or {}
        if order_status.get("found"):
            allowed["/profile"] = "Lihat pesanan saya"

        return allowed

    def _extract_json_object(self, raw_text: str) -> dict | None:
        text = raw_text.strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)

        start = text.find("{")
        end = text.rfind("}")
        if start == -1 or end == -1 or end <= start:
            return None

        try:
            return json.loads(text[start : end + 1])
        except json.JSONDecodeError:
            return None

    def _call_groq_json(self, *, system_prompt: str, user_prompt: str) -> dict | None:
        settings = get_settings()
        if not settings.groq_api_key:
            return None

        payload = {
            "model": settings.groq_model,
            "temperature": 0.2,
            "max_completion_tokens": 450,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        }
        try:
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.groq_api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=(5, 5),
            )
            response.raise_for_status()
            result = response.json()
        except (requests.RequestException, ValueError):
            return None

        content = result.get("choices", [{}])[0].get("message", {}).get("content")
        if not isinstance(content, str) or not content.strip():
            return None
        return self._extract_json_object(content)

    def search_products(
        self,
        query: str | None = None,
        category: str | None = None,
        limit: int = 5,
    ) -> list[dict]:
        """Search products by query or category."""
        products = catalog_store.list_product_details(category_slug=category)

        if query:
            query_lower = query.lower()
            query_tokens = {token for token in self._tokenize(query) if len(token) >= 3}
            scored_products: list[tuple[int, object]] = []
            for product in products:
                product_name = product.name.lower()
                product_slug = product.slug.replace("-", " ").lower()
                searchable = " ".join(
                    [
                        product.name,
                        product.category_slug,
                        product.badge or "",
                        " ".join(product.tags or []),
                        " ".join(product.description or []),
                    ]
                ).lower()
                score = sum(1 for token in query_tokens if token in searchable)
                if product_name in query_lower:
                    score += 12
                if product_slug in query_lower:
                    score += 10
                score += sum(
                    2 for token in query_tokens if token in self._tokenize(product.name)
                )
                if score > 0:
                    scored_products.append((score, product))

            scored_products.sort(
                key=lambda item: (
                    -item[0],
                    item[1].stock_state != "in_stock",
                    item[1].price,
                )
            )
            products = [product for _, product in scored_products][:limit]
        else:
            products = products[:limit]

        return [
            {
                "name": p.name,
                "slug": p.slug,
                "category": p.category_slug,
                "price": p.price,
                "image": p.image,
                "badge": p.badge,
            }
            for p in products
        ]

    def get_product_details(
        self,
        category_slug: str,
        product_slug: str,
    ) -> AIProductLookupResult:
        """Get detailed product info for AI grounding."""
        product = catalog_store.get_product_detail(category_slug, product_slug)

        if product is None:
            return AIProductLookupResult(
                found=False,
                message="Produk tidak ditemukan. Silakan coba kategori atau nama produk lain.",
            )

        stock_summary = (
            self._stock_summary(product.stock_state)
            if product.stock_state is not None
            else "Perlu konfirmasi stok"
        )

        variants = []
        for color in product.colors or []:
            for size in product.sizes or []:
                variants.append(
                    {
                        "color": color.name,
                        "color_hex": color.hex,
                        "size": size,
                    }
                )

        return AIProductLookupResult(
            found=True,
            product_name=product.name,
            category=product.category_slug,
            price=product.price,
            in_stock=product.stock_state in ("in_stock", "low_stock"),
            stock_summary=stock_summary,
            variants=variants,
            message=f"{product.name} - {stock_summary} dengan harga Rp {product.price:,}",
        )

    def get_variant_availability(
        self,
        category_slug: str,
        product_slug: str,
        color: str,
        size: str,
    ) -> AIVariantAvailabilityResult:
        """Check specific variant availability."""
        product = catalog_store.get_product_detail(category_slug, product_slug)

        if product is None:
            return AIVariantAvailabilityResult(
                found=False,
                message="Produk tidak ditemukan.",
            )

        color_obj = next(
            (c for c in (product.colors or []) if c.name.lower() == color.lower()),
            None,
        )

        if color_obj is None:
            return AIVariantAvailabilityResult(
                found=False,
                variant_name=f"{color} - {size}",
                message=f"Warna {color} tidak tersedia untuk produk ini.",
            )

        available_quantity = max(product.stock, 1)

        return AIVariantAvailabilityResult(
            found=True,
            variant_name=f"{product.name} - {color} ({size})",
            available=product.stock_state in ("in_stock", "low_stock", "preorder"),
            quantity=available_quantity,
            message=f"{product.name} dalam warna {color} dan ukuran {size} tersedia dengan status {self._stock_summary(product.stock_state)}.",
        )

    def get_order_status(self, order_number: str) -> AIOrderStatusResult:
        """Get order status - simplified for AI."""
        orders = commerce_store.list_orders()
        order = next(
            (o for o in orders if o.order_number == order_number),
            None,
        )

        if order is None:
            return AIOrderStatusResult(
                found=False,
                message=f"Pesanan dengan nomor {order_number} tidak ditemukan. Pastikan nomor pesanan benar.",
            )

        return AIOrderStatusResult(
            found=True,
            order_number=order.order_number,
            status=order.status,
            status_label=order.status_label,
            total=order.total,
            item_count=order.item_count,
            placed_at=order.placed_at,
            message=f"Pesanan {order.order_number} sedang dalam status: {order.status_label}. Total: Rp {order.total:,}",
        )

    def get_support_policy(self, topic: str | None = None) -> list[dict]:
        """Retrieve support policy articles for AI grounding."""
        articles = commerce_store.list_policy_articles(topic=topic)

        return [
            {
                "title": a.title,
                "summary": a.summary,
                "href": a.href,
                "topics": a.topics,
            }
            for a in articles
        ]

    def get_size_guidance(
        self,
        category_slug: str,
        product_slug: str,
        selected_size: str | None = None,
    ) -> AISizeGuidanceResult:
        product = catalog_store.get_product_detail(category_slug, product_slug)
        if product is None:
            return AISizeGuidanceResult(
                found=False,
                message="Produk tidak ditemukan untuk panduan ukuran.",
                handoff_recommended=True,
                handoff_reason="product_not_found",
            )

        available_sizes = [size.upper() for size in product.sizes]
        normalized_selected = selected_size.upper() if selected_size else None
        has_selected_size = (
            normalized_selected in available_sizes if normalized_selected else False
        )

        sorted_sizes = [
            size for size in self._size_order if size in available_sizes
        ] or available_sizes
        recommended_size = (
            normalized_selected
            if has_selected_size and normalized_selected is not None
            else sorted_sizes[len(sorted_sizes) // 2]
        )
        alternatives = [size for size in sorted_sizes if size != recommended_size][:2]
        confidence_score = 78 if has_selected_size else 62
        handoff_recommended = not has_selected_size and normalized_selected is not None
        fit_summary = f"Mulai dari ukuran {recommended_size} untuk menjaga jatuh kain tetap rapi dan aman dipakai."
        if recommended_size in ("S", "XS"):
            fit_summary = f"Ukuran {recommended_size} cocok bila Anda menyukai siluet yang lebih ringan dan dekat badan."
        if recommended_size in ("L", "XL", "XXL", "3XL"):
            fit_summary = f"Ukuran {recommended_size} lebih aman bila Anda ingin ruang gerak ekstra atau layering yang nyaman."

        return AISizeGuidanceResult(
            found=True,
            product_name=product.name,
            recommended_size=recommended_size,
            confidence_label=self._confidence_label(confidence_score),
            confidence_score=confidence_score,
            fit_summary=fit_summary,
            measurement_note=(
                f"Pilihan ukuran tersedia: {', '.join(sorted_sizes)}. Ini panduan awal, bukan pengganti fitting langsung."
            ),
            alternative_sizes=alternatives,
            handoff_recommended=handoff_recommended,
            handoff_reason="selected_size_not_available"
            if handoff_recommended
            else None,
            message=(
                f"Rekomendasi awal untuk {product.name}: mulai dari ukuran {recommended_size} "
                f"dengan confidence {self._confidence_label(confidence_score)}."
            ),
        )

    def get_stylist_recommendations(
        self,
        category_slug: str,
        product_slug: str,
        occasion: str | None = None,
        limit: int = 3,
    ) -> list[AIStylistRecommendation]:
        product = catalog_store.get_product_detail(category_slug, product_slug)
        if product is None:
            return []

        occasion_tokens = set(self._tokenize(occasion))
        base_tags = set(product.tags or [])
        base_tokens = set(self._tokenize(" ".join(product.description)))

        candidates = []
        for candidate in catalog_store.list_product_details():
            if (
                candidate.slug == product.slug
                and candidate.category_slug == product.category_slug
            ):
                continue

            score = 0
            candidate_tags = set(candidate.tags or [])
            candidate_tokens = set(self._tokenize(" ".join(candidate.description)))

            if candidate.category_slug == product.category_slug:
                score += 6
            score += len(base_tags.intersection(candidate_tags)) * 4
            score += len(base_tokens.intersection(candidate_tokens))
            if candidate.stock_state == "in_stock":
                score += 3
            elif candidate.stock_state == "low_stock":
                score += 1
            if abs(candidate.price - product.price) <= 150000:
                score += 2
            if occasion_tokens.intersection(candidate_tags.union(candidate_tokens)):
                score += 3
            if candidate.badge:
                score += 1

            candidates.append((score, candidate))

        candidates.sort(
            key=lambda item: (
                -item[0],
                item[1].stock_state != "in_stock",
                item[1].price,
            )
        )

        recommendations: list[AIStylistRecommendation] = []
        for score, candidate in candidates[:limit]:
            confidence_score = min(88, max(61, 60 + score * 3))
            reason_bits = []
            if candidate.category_slug == product.category_slug:
                reason_bits.append("siluet sejenis")
            if set(candidate.tags or []).intersection(base_tags):
                reason_bits.append("nuansa koleksi selaras")
            if abs(candidate.price - product.price) <= 150000:
                reason_bits.append("range harga masih seimbang")
            if not reason_bits:
                reason_bits.append("masih relevan untuk edit styling yang sama")

            recommendations.append(
                AIStylistRecommendation(
                    product_name=candidate.name,
                    category=candidate.category_slug,
                    slug=candidate.slug,
                    price=candidate.price,
                    image=candidate.image,
                    badge=candidate.badge,
                    stock_summary=self._stock_summary(candidate.stock_state),
                    confidence_label=self._confidence_label(confidence_score),
                    reason=", ".join(reason_bits),
                    styling_note=(
                        f"Pasangkan {candidate.name} sebagai alternatif kedua bila Anda ingin "
                        f"tampilan yang tetap refined tanpa keluar dari bahasa visual {product.name}."
                    ),
                    occasion=occasion or "general",
                )
            )

        return recommendations

    def get_launch_or_preorder_policy(
        self,
        category_slug: str,
        product_slug: str,
    ) -> AILaunchPolicyResult:
        product = catalog_store.get_product_detail(category_slug, product_slug)
        if product is None:
            return AILaunchPolicyResult(
                found=False,
                message="Produk tidak ditemukan untuk policy lookup.",
            )

        topic = "preorder" if product.stock_state == "preorder" else "shipping"
        article = commerce_store.list_policy_articles(topic=topic)[0]
        return AILaunchPolicyResult(
            found=True,
            product_name=product.name,
            stock_state=product.stock_state,
            title=article.title,
            summary=article.summary,
            href=article.href,
            message=(
                f"{product.name} saat ini memiliki status {self._stock_summary(product.stock_state)}. "
                f"Kebijakan relevan: {article.summary}"
            ),
        )

    def create_support_handoff(
        self,
        *,
        reason: str,
        context_summary: str,
        source: str = "buyer_ai",
        customer_id: str | None = None,
        order_id: str | None = None,
        requested_channel: str = "whatsapp",
    ) -> SupportHandoffRecord:
        payload = SupportHandoffRequest(
            customer_id=customer_id,
            order_id=order_id,
            reason=reason,
            context_summary=context_summary,
            requested_channel=requested_channel,
            source=source,
        )
        return commerce_store.create_handoff_preview(payload)

    def _build_assistant_context(
        self, query: str, messages: list[dict] | None = None
    ) -> dict:
        flags = {
            "is_sensitive": self._query_contains(query, self._sensitive_keywords),
            "is_size_query": self._query_contains(query, self._size_keywords),
            "is_styling_query": self._query_contains(query, self._styling_keywords),
            "is_product_query": self._query_contains(query, self._product_keywords),
            "is_policy_query": any(
                keyword in query.lower()
                for keyword in {
                    "kebijakan",
                    "pengiriman",
                    "pengembalian",
                    "pembayaran",
                    "preorder",
                    "launch",
                }
            ),
        }
        order_number = self._extract_order_number(query)
        order_status = self.get_order_status(order_number) if order_number else None
        support_topic = self._support_topic_from_query(query)
        policies = self.get_support_policy(topic=support_topic)[:3]
        selected_size = self._extract_selected_size(query)
        needs_product_grounding = (
            flags["is_size_query"]
            or flags["is_styling_query"]
            or flags["is_product_query"]
            or flags["is_policy_query"]
        )
        products = (
            self.search_products(query=query, limit=3)
            if needs_product_grounding
            else []
        )

        anchor_product = products[0] if products else None
        product_details = None
        size_guidance = None
        recommendations: list[AIStylistRecommendation] = []
        launch_policy = None
        if anchor_product is not None:
            if (
                flags["is_product_query"]
                or flags["is_styling_query"]
                or flags["is_size_query"]
            ):
                product_details = self.get_product_details(
                    anchor_product["category"], anchor_product["slug"]
                )
            if flags["is_size_query"]:
                size_guidance = self.get_size_guidance(
                    anchor_product["category"],
                    anchor_product["slug"],
                    selected_size=selected_size,
                )
            if flags["is_styling_query"]:
                recommendations = self.get_stylist_recommendations(
                    anchor_product["category"],
                    anchor_product["slug"],
                    limit=3,
                )
            if flags["is_policy_query"]:
                launch_policy = self.get_launch_or_preorder_policy(
                    anchor_product["category"],
                    anchor_product["slug"],
                )

        needs_handoff = flags["is_sensitive"] or bool(
            size_guidance and size_guidance.handoff_recommended
        )
        handoff = None
        if needs_handoff:
            handoff = self.create_support_handoff(
                reason=self._handoff_reason_from_query(query, support_topic),
                context_summary=f"Buyer query: {query.strip()}",
                order_id=order_status.order_number
                if order_status and order_status.found
                else None,
            )

        return {
            "query": query,
            "conversation": messages[-6:] if messages else [],
            "products": products,
            "anchor_product": anchor_product,
            "product_details": self._serialize(product_details),
            "order_status": self._serialize(order_status),
            "support_topic": support_topic,
            "policies": self._serialize(policies),
            "size_guidance": self._serialize(size_guidance),
            "recommendations": self._serialize(recommendations),
            "launch_policy": self._serialize(launch_policy),
            "handoff": self._serialize(handoff),
            "flags": flags,
        }

    def _compact_context_for_llm(self, context: dict) -> dict:
        size_guidance = context.get("size_guidance") or {}
        launch_policy = context.get("launch_policy") or {}
        handoff = context.get("handoff") or {}
        handoff_contact = handoff.get("contact") or {}

        return {
            "conversation": context.get("conversation") or [],
            "products": (context.get("products") or [])[:3],
            "product_details": context.get("product_details"),
            "order_status": context.get("order_status"),
            "policies": (context.get("policies") or [])[:3],
            "size_guidance": (
                {
                    "found": size_guidance.get("found"),
                    "recommended_size": size_guidance.get("recommended_size"),
                    "fit_summary": size_guidance.get("fit_summary"),
                    "measurement_note": size_guidance.get("measurement_note"),
                    "alternative_sizes": size_guidance.get("alternative_sizes"),
                    "handoff_recommended": size_guidance.get("handoff_recommended"),
                }
                if size_guidance
                else None
            ),
            "recommendations": [
                {
                    "product_name": item.get("product_name"),
                    "category": item.get("category"),
                    "slug": item.get("slug"),
                    "reason": item.get("reason"),
                    "styling_note": item.get("styling_note"),
                    "price": item.get("price"),
                }
                for item in (context.get("recommendations") or [])[:3]
            ],
            "launch_policy": (
                {
                    "found": launch_policy.get("found"),
                    "title": launch_policy.get("title"),
                    "summary": launch_policy.get("summary"),
                    "href": launch_policy.get("href"),
                    "message": launch_policy.get("message"),
                }
                if launch_policy
                else None
            ),
            "handoff": (
                {
                    "summary": handoff.get("summary"),
                    "nextAction": handoff.get("nextAction"),
                    "whatsappHref": handoff_contact.get("whatsappHref"),
                }
                if handoff
                else None
            ),
            "flags": context.get("flags") or {},
        }

    def _generate_assistant_response(
        self,
        *,
        query: str,
        fallback_response: AIAssistantResponse,
    ) -> AIAssistantResponse | None:
        system_prompt = (
            "Anda adalah Yoora Assistant untuk website Yoora Sarah. "
            "Tugas Anda hanya merapikan jawaban grounded yang sudah tersedia. "
            "Jangan menambah fakta baru, jangan mengganti nama produk, jangan membuat link baru, "
            "dan jangan mengubah makna status order, ukuran, atau kebijakan. "
            "Gunakan bahasa Indonesia yang natural, jelas, dan ringkas. "
            'Balas hanya JSON valid dengan shape: {"content":"string"}.'
        )
        user_prompt = (
            f"Buyer query:\n{query}\n\n"
            "Jawaban grounded yang harus dipertahankan faktanya:\n"
            f"{fallback_response.content}\n\n"
            "Tulis ulang agar terasa lebih natural untuk chat assistant, tanpa menambah informasi baru."
        )
        payload = self._call_groq_json(
            system_prompt=system_prompt, user_prompt=user_prompt
        )
        if payload is None:
            return None

        content = payload.get("content")
        if not isinstance(content, str) or not content.strip():
            return None

        return AIAssistantResponse(
            content=content.strip(),
            sources=fallback_response.sources,
            mode="groq",
        )

    def _fallback_assistant_response(
        self, query: str, context: dict
    ) -> AIAssistantResponse:
        query_lower = query.lower()
        handoff = context.get("handoff") or {}
        order_status = context.get("order_status") or {}
        size_guidance = context.get("size_guidance") or {}
        recommendations = context.get("recommendations") or []
        products = context.get("products") or []
        policies = context.get("policies") or []
        launch_policy = context.get("launch_policy") or {}
        anchor_product = context.get("anchor_product")

        if context["flags"]["is_sensitive"] and handoff:
            contact = handoff.get("contact") or {}
            return AIAssistantResponse(
                content=(
                    f"{handoff.get('summary', 'Kasus ini lebih aman ditangani support.')}\n\n"
                    f"{handoff.get('nextAction', 'Lanjutkan ke WhatsApp support untuk penanganan manual.')}\n\n"
                    "Saya sarankan lanjut ke tim support agar kasus ini ditangani manual dengan lebih aman."
                ),
                actions=[
                    AIAssistantAction(
                        key="whatsapp_handoff",
                        label="Chat CS via WhatsApp",
                        href=contact.get("whatsappHref", "/pages/hubungi-kami"),
                        kind="whatsapp"
                    )
                ] if contact.get("whatsappHref") else None,
                mode="fallback",
            )

        if order_status.get("found") and order_status.get("message"):
            return AIAssistantResponse(
                content=order_status["message"],
                sources=self._validate_sources(
                    [{"title": "Lihat pesanan saya", "href": "/profile"}]
                ),
                mode="fallback",
            )

        if context["flags"]["is_size_query"] and size_guidance.get("found"):
            chunks = [
                size_guidance.get("message"),
                size_guidance.get("fit_summary"),
                size_guidance.get("measurement_note"),
            ]
            alternative_sizes = size_guidance.get("alternative_sizes") or []
            if alternative_sizes:
                chunks.append(f"Alternatif aman: {', '.join(alternative_sizes)}.")
            sources = []
            if handoff and size_guidance.get("handoff_recommended"):
                contact = handoff.get("contact") or {}
                chunks.append(handoff.get("nextAction"))
                sources.append(
                    {
                        "title": "Lanjut ke WhatsApp support",
                        "href": contact.get("whatsappHref", "/pages/hubungi-kami"),
                    }
                )
            elif anchor_product is not None:
                sources.append(
                    {
                        "title": anchor_product["name"],
                        "href": f"/{anchor_product['category']}/{anchor_product['slug']}",
                    }
                )

            actions = None
            if handoff and size_guidance.get("handoff_recommended"):
                contact = handoff.get("contact") or {}
                if contact.get("whatsappHref"):
                    actions = [
                        AIAssistantAction(
                            key="whatsapp_handoff",
                            label="Chat CS via WhatsApp",
                            href=contact.get("whatsappHref", "/pages/hubungi-kami"),
                            kind="whatsapp"
                        )
                    ]

            return AIAssistantResponse(
                content="\n\n".join(chunk for chunk in chunks if chunk),
                sources=self._validate_sources(sources),
                actions=actions,
                mode="fallback",
            )

        if (
            context["flags"]["is_styling_query"]
            and anchor_product is not None
            and recommendations
        ):
            content = (
                f"Untuk {anchor_product['name']}, saya sarankan beberapa opsi yang masih satu bahasa visual:\n\n"
                + "\n".join(
                    f"• {item['product_name']} - {item['reason']}. {item['styling_note']}"
                    for item in recommendations[:3]
                )
            )
            return AIAssistantResponse(
                content=content,
                sources=self._validate_sources(
                    [
                        {
                            "title": item["product_name"],
                            "href": f"/{item['category']}/{item['slug']}",
                        }
                        for item in recommendations[:3]
                    ]
                ),
                mode="fallback",
            )

        if "preorder" in query_lower or "launch" in query_lower:
            if launch_policy.get("found"):
                sources = []
                if launch_policy.get("href"):
                    sources.append(
                        {
                            "title": launch_policy.get("title") or "Policy preorder",
                            "href": launch_policy["href"],
                        }
                    )
                return AIAssistantResponse(
                    content=launch_policy.get("message")
                    or "Policy preorder tersedia untuk produk ini.",
                    sources=self._validate_sources(sources),
                    mode="fallback",
                )

        if context["flags"]["is_product_query"] and products:
            content = (
                "Berikut beberapa produk yang mungkin sesuai dengan pencarian Anda:\n\n"
                + "\n".join(
                    f"• {item['name']} - Rp {item['price']:,}"
                    + (f" [{item['badge']}]" if item.get("badge") else "")
                    for item in products[:3]
                )
            )
            return AIAssistantResponse(
                content=content,
                sources=self._validate_sources(
                    [asdict(self._source_from_product(item)) for item in products[:3]]
                ),
                mode="fallback",
            )

        if policies:
            content = "Berikut informasi yang relevan:\n\n" + "\n".join(
                f"• {item['title']}: {item['summary']}" for item in policies[:3]
            )
            return AIAssistantResponse(
                content=content,
                sources=self._validate_sources(
                    [
                        {"title": item["title"], "href": item["href"]}
                        for item in policies[:3]
                    ]
                ),
                mode="fallback",
            )

        if any(keyword in query_lower for keyword in {"halo", "hai", "hi"}):
            return AIAssistantResponse(
                content="Halo! Saya bisa bantu cari produk, cek ukuran, lacak pesanan, atau jelaskan kebijakan toko.",
                mode="fallback",
            )

        if any(keyword in query_lower for keyword in {"terima kasih", "thanks"}):
            return AIAssistantResponse(
                content="Sama-sama. Kalau masih ada yang ingin dicek, tinggal tulis pertanyaannya.",
                mode="fallback",
            )

        return AIAssistantResponse(
            content=(
                "Saya bisa membantu mencari produk, menjelaskan ukuran, melacak pesanan, "
                "atau menunjukkan kebijakan pengiriman dan penukaran. Tulis pertanyaan Anda lebih spesifik, ya."
            ),
            mode="fallback",
        )

    def get_assistant_response(
        self,
        query: str,
        messages: list[dict] | None = None,
    ) -> AIAssistantResponse:
        context = self._build_assistant_context(query=query, messages=messages)
        fallback_response = self._fallback_assistant_response(
            query=query, context=context
        )
        if (
            context["flags"]["is_sensitive"]
            or context["flags"]["is_size_query"]
            or context["flags"]["is_styling_query"]
            or context["flags"]["is_product_query"]
            or context["flags"]["is_policy_query"]
            or (context.get("order_status") or {}).get("found")
        ):
            return fallback_response
        groq_response = self._generate_assistant_response(
            query=query,
            fallback_response=fallback_response,
        )
        if groq_response is not None:
            return groq_response
        return fallback_response


ai_tools_service = AIToolsService()
