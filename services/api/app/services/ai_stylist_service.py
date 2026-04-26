from __future__ import annotations

import base64
from dataclasses import dataclass
from html import escape
import json
import logging
import mimetypes
import re
from urllib.parse import quote
from uuid import uuid4
from typing import Any

import requests

from app.core.config import get_settings
from app.schemas.catalog import CatalogProductDetail
from app.services.catalog_store import catalog_store


BASE_CATEGORIES = {"dress", "abaya-2481", "one-set-5182", "essentials-7002"}
HEADWEAR_CATEGORIES = {"hijab-1544", "khimar-5295", "pashmina-2310"}
ACCENT_CATEGORIES = {"accessories-4472", "footwear-8675"}
VALID_MODES = {"brief", "outfit", "match-item", "product-to-model"}

CATEGORY_LABELS = {
    "dress": "Dress",
    "abaya-2481": "Abaya",
    "one-set-5182": "One Set",
    "essentials-7002": "Essentials",
    "hijab-1544": "Hijab",
    "khimar-5295": "Khimar",
    "pashmina-2310": "Pashmina",
    "accessories-4472": "Aksesori",
    "footwear-8675": "Footwear",
    "kids-9967": "Kids",
}

OCCASION_KEYWORDS = {
    "event": {"kondangan", "acara", "pesta", "party", "resepsi", "wedding"},
    "office": {"kantor", "office", "meeting", "kerja", "formal"},
    "daily": {"harian", "casual", "daily", "santai", "sehari", "kuliah"},
    "travel": {"travel", "liburan", "mudik", "perjalanan", "airport"},
}

OCCASION_PRIORITIES = {
    "event": ["dress", "abaya-2481", "one-set-5182"],
    "office": ["abaya-2481", "dress", "essentials-7002"],
    "daily": ["one-set-5182", "dress", "essentials-7002"],
    "travel": ["essentials-7002", "one-set-5182", "dress"],
    "general": ["dress", "one-set-5182", "abaya-2481"],
}

STYLE_KEYWORDS = {
    "formal": {"formal", "elegan", "mewah", "luxury", "rapi"},
    "casual": {"casual", "santai", "daily", "ringan", "simple"},
    "soft": {"feminin", "soft", "lembut", "romantis"},
    "bold": {"statement", "bold", "tegas", "kontras"},
}
REFINEMENT_KEYWORDS = {
    "lebih",
    "versi",
    "sesuaikan",
    "refine",
    "alternatif",
    "yang tadi",
    "yang sebelumnya",
    "budget",
    "hemat",
    "formal",
    "casual",
    "malam",
    "siang",
    "tone",
    "warna",
    "item",
    "tas",
    "sepatu",
    "upload",
}
RESET_CONTEXT_KEYWORDS = {
    "mulai ulang",
    "dari awal",
    "brief baru",
    "abaikan sebelumnya",
    "lupakan sebelumnya",
    "reset sesi",
}

logger = logging.getLogger(__name__)


@dataclass
class OutfitMatch:
    dress: CatalogProductDetail | None
    hijab: CatalogProductDetail | None
    accessories: list[CatalogProductDetail]
    total_price: int
    styling_notes: list[str]
    alternatives: list[dict[str, Any]]


@dataclass
class ProductToModelResult:
    status: str
    provider: str
    prediction_id: str | None
    image_url: str | None
    error: str | None
    prompt: str
    source_image: str
    metadata: dict[str, Any]


class ColorMatcher:
    COLOR_GROUPS = {
        "neutral": {
            "black",
            "white",
            "broken white",
            "cream",
            "ivory",
            "charcoal",
            "grey",
            "gray",
            "taupe",
        },
        "earth": {
            "cappucino",
            "cappuccino",
            "camel",
            "hazelnut",
            "caramel",
            "bitter coklat",
            "brown",
            "mocha",
            "choco",
            "tan",
            "nude",
            "khaki",
        },
        "soft": {
            "rose",
            "blush",
            "mauve",
            "taupe",
            "dusty pink",
            "pink",
            "lilac",
            "sage",
        },
        "cool": {
            "blue",
            "navy",
            "denim",
            "teal",
            "sea storm",
            "emerald",
        },
        "warm": {
            "maroon",
            "burgundy",
            "terracotta",
            "olive",
            "mustard",
            "gold",
        },
    }

    @classmethod
    def normalize(cls, value: str | None) -> str:
        if not value:
            return ""
        return re.sub(r"[^a-z0-9\s]+", " ", value.lower()).strip()

    @classmethod
    def group_for(cls, value: str | None) -> str:
        normalized = cls.normalize(value)
        for group, names in cls.COLOR_GROUPS.items():
            if any(name in normalized for name in names):
                return group
        return "neutral"

    @classmethod
    def are_compatible(cls, left: str | None, right: str | None) -> bool:
        left_group = cls.group_for(left)
        right_group = cls.group_for(right)
        if left_group == right_group:
            return True
        if "neutral" in {left_group, right_group}:
            return True
        return {left_group, right_group} in (
            {"earth", "soft"},
            {"cool", "neutral"},
            {"warm", "earth"},
        )


class OutfitMatcher:
    TEMPLATE_DEFINITIONS = [
        {
            "id": "daily-look",
            "name": "Daily Look",
            "description": "Padu padan aman untuk aktivitas harian yang tetap terlihat rapi.",
            "icon": "DL",
            "occasion": "daily",
            "categories": ["one-set-5182", "pashmina-2310", "accessories-4472"],
            "prompt": "Buatkan outfit harian yang ringan, rapi, dan mudah dipakai seharian.",
        },
        {
            "id": "office-ready",
            "name": "Office Ready",
            "description": "Siluet tegas dan refined untuk kerja, meeting, atau presentasi.",
            "icon": "OF",
            "occasion": "office",
            "categories": ["abaya-2481", "hijab-1544", "footwear-8675"],
            "prompt": "Saya butuh outfit office-ready yang formal, tenang, dan profesional.",
        },
        {
            "id": "party-glam",
            "name": "Party Glam",
            "description": "Look kondangan dengan tone anggun dan detail yang terasa selesai.",
            "icon": "EV",
            "occasion": "event",
            "categories": ["dress", "khimar-5295", "accessories-4472"],
            "prompt": "Buatkan outfit kondangan yang elegan dengan sentuhan premium.",
        },
        {
            "id": "travel-edit",
            "name": "Travel Edit",
            "description": "Kombinasi nyaman untuk perjalanan dengan layering yang tetap rapi.",
            "icon": "TR",
            "occasion": "travel",
            "categories": ["essentials-7002", "pashmina-2310", "footwear-8675"],
            "prompt": "Saya ingin outfit travel yang nyaman, praktis, dan tetap polished.",
        },
    ]

    FOLLOW_UP_PROMPTS = [
        "Buatkan opsi tone nude untuk acara formal.",
        "Sesuaikan outfit dengan tas atau sepatu yang saya upload.",
        "Cari versi yang lebih hemat tetapi tetap terlihat premium.",
    ]

    PRODUCT_TO_MODEL_MODEL_DIRECTIONS = {
        "studio-catalog": "model berdiri clean dengan pose studio untuk katalog premium",
        "soft-editorial": "model dengan editorial pose yang lembut dan refined",
        "campaign-close": "half-body crop yang tetap menonjolkan detail busana",
    }

    PRODUCT_TO_MODEL_BACKGROUNDS = {
        "soft-stone": "latar studio warna stone yang tenang dan premium",
        "warm-ivory": "latar warm ivory yang bersih dan terang",
        "editorial-shadow": "latar editorial netral dengan bayangan halus",
    }

    def __init__(self) -> None:
        self.catalog = catalog_store
        self._product_to_model_predictions: dict[str, ProductToModelResult] = {}

    def _normalize(self, value: str | None) -> str:
        if not value:
            return ""
        return re.sub(r"[^a-z0-9\s]+", " ", value.lower()).strip()

    def _tokens(self, value: str | None) -> set[str]:
        normalized = self._normalize(value)
        return {token for token in normalized.split() if token}

    def _product_text(self, product: CatalogProductDetail) -> str:
        return " ".join(
            [
                product.name,
                product.slug,
                product.category_slug,
                " ".join(product.tags or []),
                " ".join(product.description or []),
                " ".join(color.name for color in product.colors),
            ]
        ).lower()

    def _color_palette(self, value: str | None) -> list[str]:
        normalized = self._normalize(value)
        if not normalized:
            return []

        palette: list[str] = []
        all_colors = {
            self._normalize(color.name)
            for product in self.catalog.list_product_details()
            for color in product.colors
        }
        for color in sorted(all_colors, key=len, reverse=True):
            if color and color in normalized and color not in palette:
                palette.append(color)

        extra_matches = [
            "black",
            "white",
            "cream",
            "nude",
            "brown",
            "navy",
            "mauve",
            "blush",
            "maroon",
        ]
        for color in extra_matches:
            if color in normalized and color not in palette:
                palette.append(color)

        alias_matches = {
            "hitam": "black",
            "putih": "white",
            "broken white": "broken white",
            "krem": "cream",
            "cream": "cream",
            "coklat": "brown",
            "abu": "gray",
            "abu abu": "gray",
            "biru": "blue",
            "navy": "navy",
            "merah": "maroon",
            "emas": "gold",
            "hijau": "olive",
        }
        for alias, canonical in alias_matches.items():
            if alias in normalized and canonical not in palette:
                palette.append(canonical)
        return palette

    def _style_direction(self, message: str) -> str:
        normalized = self._normalize(message)
        for label, keywords in STYLE_KEYWORDS.items():
            if any(keyword in normalized for keyword in keywords):
                return label
        return "refined"

    def _occasion(self, message: str | None) -> str:
        normalized = self._normalize(message)
        for occasion, keywords in OCCASION_KEYWORDS.items():
            if any(keyword in normalized for keyword in keywords):
                return occasion
        return "general"

    def _dedupe_products(
        self, products: list[CatalogProductDetail], limit: int | None = None
    ) -> list[CatalogProductDetail]:
        seen: set[str] = set()
        deduped: list[CatalogProductDetail] = []
        for product in products:
            key = f"{product.category_slug}/{product.slug}"
            if key in seen:
                continue
            seen.add(key)
            deduped.append(product)
            if limit is not None and len(deduped) >= limit:
                break
        return deduped

    def _score_base_product(
        self,
        product: CatalogProductDetail,
        *,
        message: str,
        palette: list[str],
        occasion: str,
        style_direction: str,
    ) -> int:
        score = 0
        normalized = self._normalize(message)
        product_text = self._product_text(product)
        product_tokens = self._tokens(product_text)
        query_tokens = self._tokens(message)

        if product.category_slug in OCCASION_PRIORITIES.get(occasion, []):
            score += 8 - OCCASION_PRIORITIES[occasion].index(product.category_slug)
        if product.stock_state == "in_stock":
            score += 5
        elif product.stock_state == "low_stock":
            score += 2
        elif product.stock_state == "out_of_stock":
            score -= 100

        if product.is_featured:
            score += 3
        if product.badge:
            score += 2

        if any(token in product_tokens for token in query_tokens):
            score += 4
        if product.name.lower() in normalized:
            score += 6
        if any(product.category_slug.startswith(category) for category in query_tokens):
            score += 3

        if palette:
            if any(
                any(ColorMatcher.are_compatible(color.name, desired) for desired in palette)
                for color in product.colors
            ):
                score += 6
        if style_direction in {"formal", "refined"} and any(
            token in product_text for token in {"formal", "occasionwear", "best"}
        ):
            score += 2
        if style_direction == "casual" and "daily" in product_text:
            score += 2

        return score

    def _score_companion(
        self,
        anchor: CatalogProductDetail,
        candidate: CatalogProductDetail,
        *,
        palette: list[str],
    ) -> int:
        if candidate.stock_state == "out_of_stock":
            return -100

        score = 0
        if candidate.stock_state == "in_stock":
            score += 4
        if candidate.badge:
            score += 1

        anchor_colors = anchor.colors or []
        candidate_colors = candidate.colors or []
        if anchor_colors and candidate_colors:
            compatible_hits = 0
            for anchor_color in anchor_colors[:2]:
                for candidate_color in candidate_colors[:2]:
                    if ColorMatcher.are_compatible(anchor_color.name, candidate_color.name):
                        compatible_hits += 1
            score += compatible_hits * 3

        if palette and any(
            any(ColorMatcher.are_compatible(color.name, desired) for desired in palette)
            for color in candidate.colors
        ):
            score += 4

        if candidate.category_slug in HEADWEAR_CATEGORIES:
            if candidate.price <= anchor.price:
                score += 2
        else:
            if candidate.price <= max(anchor.price * 0.45, 150000):
                score += 3
        return score

    def _serialize_product(
        self,
        product: CatalogProductDetail | None,
        *,
        role: str | None = None,
        reason: str | None = None,
    ) -> dict[str, Any] | None:
        if product is None:
            return None
        image = product.colors[0].gallery[0] if product.colors and product.colors[0].gallery else product.image
        payload: dict[str, Any] = {
            "id": product.id,
            "name": product.name,
            "slug": product.slug,
            "category": product.category_slug,
            "categoryLabel": CATEGORY_LABELS.get(product.category_slug, product.category_slug),
            "price": product.price,
            "image": image,
            "colors": [color.name for color in product.colors[:3]],
            "badge": product.badge,
            "stockSummary": product.stock_state,
        }
        if role:
            payload["role"] = role
        if reason:
            payload["reason"] = reason
        return payload

    def _resolve_product_image(self, product: CatalogProductDetail) -> str:
        if product.colors and product.colors[0].gallery:
            return product.colors[0].gallery[0]
        return product.image

    def _default_product_to_model_prompt(
        self,
        *,
        product: CatalogProductDetail,
        model_direction: str,
        background: str,
        custom_prompt: str | None = None,
    ) -> str:
        direction_copy = self.PRODUCT_TO_MODEL_MODEL_DIRECTIONS.get(
            model_direction,
            self.PRODUCT_TO_MODEL_MODEL_DIRECTIONS["studio-catalog"],
        )
        background_copy = self.PRODUCT_TO_MODEL_BACKGROUNDS.get(
            background,
            self.PRODUCT_TO_MODEL_BACKGROUNDS["soft-stone"],
        )
        base_prompt = (
            "Create a photorealistic modest-fashion product-to-model image for Yoora Sarah. "
            f"The model wears the exact garment from the reference product image: {product.name}. "
            "Preserve silhouette, coverage, fabric tone, trims, and product identity. "
            f"Use a {direction_copy}. "
            f"Place the model in a {background_copy}. "
            "Do not replace the garment with a different design."
        )
        if custom_prompt:
            return f"{base_prompt} Additional direction: {custom_prompt.strip()}"
        return base_prompt

    def _extract_image_output(self, payload: Any) -> str | None:
        if isinstance(payload, str):
            return payload
        if isinstance(payload, list):
            for item in payload:
                image = self._extract_image_output(item)
                if image:
                    return image
            return None
        if isinstance(payload, dict):
            for key in ("image", "url", "output", "src"):
                value = payload.get(key)
                image = self._extract_image_output(value)
                if image:
                    return image
        return None

    def _render_replicate_input_template(self, *, template_raw: str | None, values: dict[str, str]) -> dict[str, Any]:
        template_payload: Any
        if template_raw:
            try:
                template_payload = json.loads(template_raw)
            except json.JSONDecodeError as exc:
                raise ValueError("Template input Replicate tidak valid JSON.") from exc
        else:
            template_payload = {
                "product_image": "{{product_image}}",
                "prompt": "{{prompt}}",
                "model_direction": "{{model_direction}}",
                "background": "{{background}}",
            }

        def replace_placeholders(node: Any) -> Any:
            if isinstance(node, str):
                rendered = node
                for key, value in values.items():
                    rendered = rendered.replace(f"{{{{{key}}}}}", value)
                return rendered
            if isinstance(node, list):
                return [replace_placeholders(item) for item in node]
            if isinstance(node, dict):
                return {key: replace_placeholders(value) for key, value in node.items()}
            return node

        rendered = replace_placeholders(template_payload)
        if not isinstance(rendered, dict):
            raise ValueError("Template input Replicate harus menghasilkan object JSON.")
        return rendered

    def _build_mock_product_to_model_preview(
        self,
        *,
        product: CatalogProductDetail,
        product_image: str,
        prompt: str,
        model_direction: str,
        background: str,
    ) -> str:
        direction_label = escape(
            self.PRODUCT_TO_MODEL_MODEL_DIRECTIONS.get(
                model_direction,
                self.PRODUCT_TO_MODEL_MODEL_DIRECTIONS["studio-catalog"],
            )
        )
        background_label = escape(
            self.PRODUCT_TO_MODEL_BACKGROUNDS.get(
                background,
                self.PRODUCT_TO_MODEL_BACKGROUNDS["soft-stone"],
            )
        )
        prompt_label = escape(prompt[:180])
        product_name = escape(product.name)
        category_name = escape(CATEGORY_LABELS.get(product.category_slug, product.category_slug))
        image_url = escape(product_image, quote=True)
        svg = f"""
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="1280" viewBox="0 0 960 1280">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#f8f1eb" />
      <stop offset="100%" stop-color="#efe3d8" />
    </linearGradient>
  </defs>
  <rect width="960" height="1280" rx="52" fill="url(#bg)" />
  <rect x="56" y="56" width="848" height="1168" rx="38" fill="#fffaf6" stroke="#dbc8ba" />
  <text x="96" y="120" fill="#9c8375" font-size="24" font-family="Arial, sans-serif" letter-spacing="8">YOORA SARAH MOCK PRODUCT TO MODEL</text>
  <text x="96" y="190" fill="#241915" font-size="54" font-family="Georgia, serif">{product_name}</text>
  <text x="96" y="236" fill="#6f5b52" font-size="26" font-family="Arial, sans-serif">{category_name}</text>
  <rect x="96" y="286" width="768" height="640" rx="30" fill="#f4ede7" />
  <image href="{image_url}" x="126" y="316" width="708" height="580" preserveAspectRatio="xMidYMid meet" />
  <rect x="96" y="956" width="768" height="92" rx="24" fill="#f7efe9" stroke="#dbc8ba" />
  <text x="126" y="1012" fill="#3a2822" font-size="28" font-family="Arial, sans-serif">Direction: {direction_label}</text>
  <rect x="96" y="1074" width="768" height="110" rx="24" fill="#f7efe9" stroke="#dbc8ba" />
  <text x="126" y="1120" fill="#3a2822" font-size="28" font-family="Arial, sans-serif">Background: {background_label}</text>
  <text x="126" y="1162" fill="#6f5b52" font-size="22" font-family="Arial, sans-serif">Prompt: {prompt_label}</text>
</svg>
"""
        return f"data:image/svg+xml;charset=utf-8,{quote(svg)}"

    def _mock_product_to_model(
        self,
        *,
        product: CatalogProductDetail,
        product_image: str,
        prompt: str,
        model_direction: str,
        background: str,
    ) -> ProductToModelResult:
        preview_url = self._build_mock_product_to_model_preview(
            product=product,
            product_image=product_image,
            prompt=prompt,
            model_direction=model_direction,
            background=background,
        )
        result = ProductToModelResult(
            status="succeeded",
            provider="mock",
            prediction_id=f"mock-{uuid4().hex[:12]}",
            image_url=preview_url,
            error=None,
            prompt=prompt,
            source_image=product_image,
            metadata={
                "isMock": True,
                "productName": product.name,
                "category": CATEGORY_LABELS.get(product.category_slug, product.category_slug),
                "note": "Provider eksternal belum aktif, jadi sistem menampilkan studio preview mock.",
            },
        )
        if result.prediction_id:
            self._product_to_model_predictions[result.prediction_id] = result
        return result

    def _replicate_headers(self, token: str) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Prefer": "wait=45",
        }

    def _resolve_image_asset(self, image_ref: str) -> tuple[str, bytes, str]:
        if not image_ref:
            raise ValueError("Source image product-to-model tidak tersedia.")

        if image_ref.startswith("data:"):
            try:
                header, payload = image_ref.split(",", 1)
            except ValueError as exc:
                raise ValueError("Format data URL untuk source image tidak valid.") from exc
            mime_type = header.split(":", 1)[1].split(";", 1)[0] or "image/png"
            extension = mimetypes.guess_extension(mime_type) or ".png"
            try:
                content = base64.b64decode(payload)
            except ValueError as exc:
                raise ValueError("Source image base64 tidak valid.") from exc
            return f"product-source{extension}", content, mime_type

        response = requests.get(image_ref, timeout=(8, 30))
        response.raise_for_status()
        mime_type = response.headers.get("Content-Type", "image/jpeg").split(";", 1)[0]
        extension = mimetypes.guess_extension(mime_type) or ".jpg"
        return f"product-source{extension}", response.content, mime_type

    def _extract_openai_image_output(self, data: dict[str, Any]) -> str | None:
        outputs = data.get("data") or []
        if not outputs:
            return None
        first_output = outputs[0] or {}
        if first_output.get("url"):
            return first_output["url"]

        image_base64 = first_output.get("b64_json")
        if not image_base64:
            return None

        output_format = data.get("output_format") or "png"
        return f"data:image/{output_format};base64,{image_base64}"

    def _extract_gemini_image_output(self, data: dict[str, Any]) -> str | None:
        candidates = data.get("candidates") or []
        if not candidates:
            return None

        for candidate in candidates:
            content = (candidate or {}).get("content") or {}
            for part in content.get("parts") or []:
                inline_data = (part or {}).get("inline_data") or {}
                image_base64 = inline_data.get("data")
                mime_type = inline_data.get("mime_type") or "image/png"
                if image_base64:
                    return f"data:{mime_type};base64,{image_base64}"
        return None

    def _provider_request_error_message(
        self, provider: str, exc: requests.RequestException
    ) -> str:
        response = exc.response
        if response is not None:
            try:
                payload = response.json()
            except ValueError:
                payload = None

            if isinstance(payload, dict):
                error_payload = payload.get("error")
                if isinstance(error_payload, dict):
                    message = error_payload.get("message") or error_payload.get("status")
                    if message:
                        return f"{provider} error {response.status_code}: {message}"
                message = payload.get("message") or payload.get("detail")
                if isinstance(message, str) and message.strip():
                    return f"{provider} error {response.status_code}: {message.strip()}"

            text = response.text.strip()
            if text:
                return f"{provider} error {response.status_code}: {text[:400]}"
            return f"{provider} error {response.status_code}."

        return f"{provider} request gagal."

    def _submit_openai_product_to_model(
        self,
        *,
        product: CatalogProductDetail,
        product_image: str,
        prompt: str,
        model_direction: str,
        background: str,
    ) -> ProductToModelResult:
        settings = get_settings()
        if not settings.openai_api_key:
            raise ValueError("OpenAI API key belum diisi.")

        filename, image_bytes, mime_type = self._resolve_image_asset(product_image)
        request_data = {
            "model": settings.stylist_product_to_model_openai_model,
            "prompt": prompt,
            "size": settings.stylist_product_to_model_openai_size,
            "quality": settings.stylist_product_to_model_openai_quality,
            "background": "opaque",
            "output_format": "png",
            "n": "1",
        }
        if settings.stylist_product_to_model_openai_model == "gpt-image-1":
            request_data["input_fidelity"] = settings.stylist_product_to_model_openai_input_fidelity

        response = requests.post(
            "https://api.openai.com/v1/images/edits",
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
            },
            data=request_data,
            files=[
                ("image", (filename, image_bytes, mime_type)),
            ],
            timeout=(12, 180),
        )
        response.raise_for_status()
        data = response.json()
        image_url = self._extract_openai_image_output(data)
        if not image_url:
            raise ValueError("OpenAI tidak mengembalikan output image.")

        result = ProductToModelResult(
            status="succeeded",
            provider="openai",
            prediction_id=f"openai-{uuid4().hex[:12]}",
            image_url=image_url,
            error=None,
            prompt=prompt,
            source_image=product_image,
            metadata={
                "isMock": False,
                "productName": product.name,
                "category": CATEGORY_LABELS.get(product.category_slug, product.category_slug),
                "model": settings.stylist_product_to_model_openai_model,
                "size": settings.stylist_product_to_model_openai_size,
                "quality": settings.stylist_product_to_model_openai_quality,
                "direction": model_direction,
                "background": background,
                "note": "Render disubmit ke OpenAI Images Edit agar produk katalog bisa jadi preview model lebih cepat tanpa deployment tambahan.",
            },
        )
        if result.prediction_id:
            self._product_to_model_predictions[result.prediction_id] = result
        return result

    def _submit_gemini_product_to_model(
        self,
        *,
        product: CatalogProductDetail,
        product_image: str,
        prompt: str,
        model_direction: str,
        background: str,
    ) -> ProductToModelResult:
        settings = get_settings()
        if not settings.gemini_api_key:
            raise ValueError("Gemini API key belum diisi.")

        _, image_bytes, mime_type = self._resolve_image_asset(product_image)
        image_base64 = base64.b64encode(image_bytes).decode("ascii")
        response = requests.post(
            (
                "https://generativelanguage.googleapis.com/v1beta/models/"
                f"{settings.stylist_product_to_model_gemini_model}:generateContent"
            ),
            params={"key": settings.gemini_api_key},
            headers={"Content-Type": "application/json"},
            json={
                "contents": [
                    {
                        "parts": [
                            {"text": prompt},
                            {
                                "inline_data": {
                                    "mime_type": mime_type,
                                    "data": image_base64,
                                }
                            },
                        ]
                    }
                ],
                "generationConfig": {
                    "responseModalities": ["TEXT", "IMAGE"],
                },
            },
            timeout=(12, 180),
        )
        response.raise_for_status()
        data = response.json()
        image_url = self._extract_gemini_image_output(data)
        if not image_url:
            raise ValueError("Gemini tidak mengembalikan output image.")

        result = ProductToModelResult(
            status="succeeded",
            provider="gemini",
            prediction_id=f"gemini-{uuid4().hex[:12]}",
            image_url=image_url,
            error=None,
            prompt=prompt,
            source_image=product_image,
            metadata={
                "isMock": False,
                "productName": product.name,
                "category": CATEGORY_LABELS.get(product.category_slug, product.category_slug),
                "model": settings.stylist_product_to_model_gemini_model,
                "direction": model_direction,
                "background": background,
                "note": "Render disubmit ke Gemini image generation agar produk katalog bisa diedit langsung dari reference image.",
            },
        )
        if result.prediction_id:
            self._product_to_model_predictions[result.prediction_id] = result
        return result

    def _submit_replicate_product_to_model(
        self,
        *,
        product: CatalogProductDetail,
        product_image: str,
        prompt: str,
        model_direction: str,
        background: str,
    ) -> ProductToModelResult:
        settings = get_settings()
        if (
            not settings.replicate_api_token
            or not settings.stylist_product_to_model_replicate_owner
            or not settings.stylist_product_to_model_replicate_deployment
        ):
            raise ValueError("Konfigurasi Replicate belum lengkap.")

        payload = self._render_replicate_input_template(
            template_raw=settings.stylist_product_to_model_replicate_input_template,
            values={
                "product_image": product_image,
                "prompt": prompt,
                "model_direction": model_direction,
                "background": background,
                "product_name": product.name,
            },
        )
        response = requests.post(
            (
                "https://api.replicate.com/v1/deployments/"
                f"{settings.stylist_product_to_model_replicate_owner}/"
                f"{settings.stylist_product_to_model_replicate_deployment}/predictions"
            ),
            headers=self._replicate_headers(settings.replicate_api_token),
            json={"input": payload},
            timeout=(8, 60),
        )
        response.raise_for_status()
        data = response.json()
        return ProductToModelResult(
            status=data.get("status") or "starting",
            provider="replicate",
            prediction_id=data.get("id"),
            image_url=self._extract_image_output(data.get("output")),
            error=data.get("error"),
            prompt=prompt,
            source_image=product_image,
            metadata={
                "isMock": False,
                "productName": product.name,
                "category": CATEGORY_LABELS.get(product.category_slug, product.category_slug),
                "logs": data.get("logs"),
            },
        )

    def create_product_to_model(
        self,
        *,
        category_slug: str,
        product_slug: str,
        prompt: str | None = None,
        model_direction: str = "studio-catalog",
        background: str = "soft-stone",
    ) -> ProductToModelResult:
        product = self.catalog.get_product_detail(category_slug, product_slug)
        if product is None:
            raise ValueError("Produk tidak ditemukan.")

        product_image = self._resolve_product_image(product)
        final_prompt = self._default_product_to_model_prompt(
            product=product,
            model_direction=model_direction,
            background=background,
            custom_prompt=prompt,
        )
        provider = get_settings().stylist_product_to_model_provider.lower().strip()

        if provider == "replicate":
            try:
                return self._submit_replicate_product_to_model(
                    product=product,
                    product_image=product_image,
                    prompt=final_prompt,
                    model_direction=model_direction,
                    background=background,
                )
            except requests.RequestException as exc:
                return self._build_product_to_model_fallback(
                    provider="replicate",
                    product=product,
                    product_image=product_image,
                    prompt=final_prompt,
                    model_direction=model_direction,
                    background=background,
                    reason=self._provider_request_error_message("Replicate", exc),
                )
            except ValueError as exc:
                return self._build_product_to_model_fallback(
                    provider="replicate",
                    product=product,
                    product_image=product_image,
                    prompt=final_prompt,
                    model_direction=model_direction,
                    background=background,
                    reason=str(exc),
                )

        if provider == "openai":
            try:
                return self._submit_openai_product_to_model(
                    product=product,
                    product_image=product_image,
                    prompt=final_prompt,
                    model_direction=model_direction,
                    background=background,
                )
            except requests.RequestException as exc:
                return self._build_product_to_model_fallback(
                    provider="openai",
                    product=product,
                    product_image=product_image,
                    prompt=final_prompt,
                    model_direction=model_direction,
                    background=background,
                    reason=self._provider_request_error_message("OpenAI", exc),
                )
            except ValueError as exc:
                return self._build_product_to_model_fallback(
                    provider="openai",
                    product=product,
                    product_image=product_image,
                    prompt=final_prompt,
                    model_direction=model_direction,
                    background=background,
                    reason=str(exc),
                )

        if provider == "gemini":
            try:
                return self._submit_gemini_product_to_model(
                    product=product,
                    product_image=product_image,
                    prompt=final_prompt,
                    model_direction=model_direction,
                    background=background,
                )
            except requests.RequestException as exc:
                return self._build_product_to_model_fallback(
                    provider="gemini",
                    product=product,
                    product_image=product_image,
                    prompt=final_prompt,
                    model_direction=model_direction,
                    background=background,
                    reason=self._provider_request_error_message("Gemini", exc),
                )
            except ValueError as exc:
                return self._build_product_to_model_fallback(
                    provider="gemini",
                    product=product,
                    product_image=product_image,
                    prompt=final_prompt,
                    model_direction=model_direction,
                    background=background,
                    reason=str(exc),
                )

        return self._mock_product_to_model(
            product=product,
            product_image=product_image,
            prompt=final_prompt,
            model_direction=model_direction,
            background=background,
        )

    def get_product_to_model_prediction(self, prediction_id: str) -> ProductToModelResult:
        settings = get_settings()
        if settings.stylist_product_to_model_provider.lower().strip() != "replicate":
            cached_result = self._product_to_model_predictions.get(prediction_id)
            if cached_result is not None:
                return cached_result
            raise ValueError("Prediction product-to-model tidak ditemukan.")
        if not settings.replicate_api_token:
            raise ValueError("Replicate token belum diisi.")

        response = requests.get(
            f"https://api.replicate.com/v1/predictions/{prediction_id}",
            headers={
                "Authorization": f"Bearer {settings.replicate_api_token}",
                "Content-Type": "application/json",
            },
            timeout=(8, 30),
        )
        response.raise_for_status()
        data = response.json()
        image_url = self._extract_image_output(data.get("output"))
        input_payload = data.get("input") or {}
        source_image = (
            input_payload.get("product_image")
            or input_payload.get("image")
            or input_payload.get("garment_image")
            or ""
        )
        return ProductToModelResult(
            status=data.get("status") or "starting",
            provider="replicate",
            prediction_id=data.get("id"),
            image_url=image_url,
            error=data.get("error"),
            prompt=input_payload.get("prompt") or "",
            source_image=source_image,
            metadata={
                "isMock": False,
                "logs": data.get("logs"),
            },
        )

    def _headwear_candidates(
        self, anchor: CatalogProductDetail, palette: list[str]
    ) -> list[CatalogProductDetail]:
        candidates = [
            product
            for product in self.catalog.list_product_details()
            if product.category_slug in HEADWEAR_CATEGORIES and product.slug != anchor.slug
        ]
        scored = sorted(
            candidates,
            key=lambda product: self._score_companion(anchor, product, palette=palette),
            reverse=True,
        )
        return self._dedupe_products(scored, limit=4)

    def _accent_candidates(
        self, anchor: CatalogProductDetail, palette: list[str]
    ) -> list[CatalogProductDetail]:
        candidates = [
            product
            for product in self.catalog.list_product_details()
            if product.category_slug in ACCENT_CATEGORIES and product.slug != anchor.slug
        ]
        scored = sorted(
            candidates,
            key=lambda product: self._score_companion(anchor, product, palette=palette),
            reverse=True,
        )
        return self._dedupe_products(scored, limit=4)

    def _base_candidates(
        self, message: str, palette: list[str], occasion: str, style_direction: str
    ) -> list[CatalogProductDetail]:
        candidates = [
            product
            for product in self.catalog.list_product_details()
            if product.category_slug in BASE_CATEGORIES
        ]
        scored = sorted(
            candidates,
            key=lambda product: self._score_base_product(
                product,
                message=message,
                palette=palette,
                occasion=occasion,
                style_direction=style_direction,
            ),
            reverse=True,
        )
        return self._dedupe_products(scored, limit=6)

    def create_outfit(
        self, dress: CatalogProductDetail, occasion: str | None = None
    ) -> OutfitMatch:
        palette = [self._normalize(color.name) for color in dress.colors[:2]]
        selected_headwear = self._headwear_candidates(dress, palette)[:1]
        selected_accents = self._accent_candidates(dress, palette)[:2]
        total_price = dress.price + sum(item.price for item in selected_headwear + selected_accents)

        notes = [
            f"{dress.name} menjadi fondasi look karena siluetnya sudah paling siap untuk occasion ini.",
        ]
        if selected_headwear:
            notes.append(
                f"{selected_headwear[0].name} menjaga transisi warna tetap halus dan menyelesaikan framing wajah."
            )
        if selected_accents:
            notes.append(
                "Tambahkan "
                + ", ".join(item.name for item in selected_accents)
                + " untuk memberi detail akhir tanpa membuat styling terasa berat."
            )
        notes.append(f"Estimasi total look: Rp {total_price:,}.")

        alternatives = self.get_alternative_looks(
            message=f"{occasion or 'general'} {dress.name}",
            limit=2,
            exclude_slug=dress.slug,
        )

        return OutfitMatch(
            dress=dress,
            hijab=selected_headwear[0] if selected_headwear else None,
            accessories=selected_accents,
            total_price=total_price,
            styling_notes=notes,
            alternatives=alternatives,
        )

    def get_outfit_templates(self) -> list[dict[str, Any]]:
        return list(self.TEMPLATE_DEFINITIONS)

    def get_template_products(self, template_id: str) -> dict[str, Any] | None:
        template = next(
            (item for item in self.TEMPLATE_DEFINITIONS if item["id"] == template_id),
            None,
        )
        if template is None:
            return None

        products: list[CatalogProductDetail] = []
        for category in template["categories"]:
            items = self.catalog.list_product_details(category)
            if not items:
                continue
            products.append(items[0])

        return {
            "template": template,
            "products": [self._serialize_product(product) for product in products],
        }

    def get_alternative_looks(
        self,
        *,
        message: str,
        limit: int = 3,
        exclude_slug: str | None = None,
    ) -> list[dict[str, Any]]:
        occasion = self._occasion(message)
        palette = self._color_palette(message)
        style_direction = self._style_direction(message)
        base_candidates = self._base_candidates(message, palette, occasion, style_direction)
        looks: list[dict[str, Any]] = []

        for index, anchor in enumerate(base_candidates):
            if exclude_slug and anchor.slug == exclude_slug:
                continue

            headwear = self._headwear_candidates(anchor, palette)[:1]
            accents = self._accent_candidates(anchor, palette)[:2]
            products = [anchor] + headwear + accents
            total_price = sum(product.price for product in products)
            looks.append(
                {
                    "id": f"look-{index + 1}",
                    "title": [
                        "Look Signature",
                        "Look Alternatif",
                        "Look Kontras Halus",
                    ][min(index, 2)],
                    "occasion": occasion,
                    "note": (
                        f"Fokus utama pada {anchor.name} dengan layering yang tetap sopan, "
                        "proporsional, dan mudah langsung dipakai."
                    ),
                    "totalPrice": total_price,
                    "products": [
                        self._serialize_product(anchor, role="main", reason="Base piece utama."),
                        *[
                            self._serialize_product(
                                product,
                                role="headwear",
                                reason="Menyeimbangkan warna dan framing wajah.",
                            )
                            for product in headwear
                        ],
                        *[
                            self._serialize_product(
                                product,
                                role="accent",
                                reason="Menutup styling dengan detail pelengkap.",
                            )
                            for product in accents
                        ],
                    ],
                }
            )
            if len(looks) >= limit:
                break

        return looks

    def analyze_image(
        self, image: str | None, message: str | None = None
    ) -> dict[str, Any] | None:
        if not image:
            return None

        vision_failure: str | None = None
        if self._gemini_vision_api_key():
            analyzed, vision_failure = self._call_gemini_vision(
                image=image,
                message=message or "",
            )
            if analyzed is not None:
                return analyzed

        palette = self._color_palette(message or "")
        style_direction = self._style_direction(message or "")
        item_type = "item"
        normalized = self._normalize(message)
        for candidate in ("tas", "bag", "sepatu", "heels", "boots", "sneakers", "hijab"):
            if candidate in normalized:
                item_type = candidate
                break

        note = (
            "Gambar diterima. Analisa visual otomatis akan lebih akurat jika provider vision aktif, "
            "tetapi sistem masih bisa menyusun look berdasarkan konteks yang Anda tulis."
        )
        if vision_failure:
            note = (
                f"Vision Gemini belum berhasil dipakai ({vision_failure}), "
                "jadi sistem sementara memakai konteks teks untuk menyusun look."
            )
        if palette:
            note = (
                f"Sistem menangkap preferensi warna {', '.join(palette[:3])}. "
                "Look akan diarahkan ke warna yang tidak bentrok dengan item referensi Anda."
            )

        return {
            "itemType": item_type,
            "dominantColors": palette,
            "styleDirection": style_direction,
            "compatibilityNote": note,
        }

    def _gemini_vision_api_key(self) -> str | None:
        settings = get_settings()
        return settings.stylist_image_analysis_gemini_api_key or settings.gemini_api_key

    def _sanitize_provider_error_text(self, text: str | None) -> str:
        if not text:
            return ""
        compact = re.sub(r"\s+", " ", text).strip()
        compact = re.sub(r"AIza[0-9A-Za-z\\-_]{20,}", "[redacted-api-key]", compact)
        return compact[:220]

    def _gemini_vision_failure_message(self, exc: Exception) -> str:
        if isinstance(exc, requests.Timeout):
            return "timeout provider"
        if isinstance(exc, requests.ConnectionError):
            return "gagal terhubung ke provider"
        if isinstance(exc, requests.HTTPError) and exc.response is not None:
            status_code = exc.response.status_code
            response_text = self._sanitize_provider_error_text(exc.response.text)
            if response_text:
                return f"HTTP {status_code}: {response_text}"
            return f"HTTP {status_code}"
        return self._sanitize_provider_error_text(str(exc)) or exc.__class__.__name__

    def _call_gemini_vision(self, *, image: str, message: str) -> tuple[dict[str, Any] | None, str | None]:
        api_key = self._gemini_vision_api_key()
        if not api_key:
            return None, "API key vision belum diisi"

        settings = get_settings()
        base64_data = image
        mime_type = "image/jpeg"
        if image.startswith("data:"):
            header, payload = image.split(",", 1)
            base64_data = payload
            mime_type = header.split(":")[1].split(";")[0]

        prompt = (
            "Anda adalah analis visual untuk AI Stylist Yoora Sarah. "
            "Baca item pada gambar lalu jawab hanya dengan JSON valid: "
            '{"itemType":"string","dominantColors":["string"],'
            '"styleDirection":"string","compatibilityNote":"string"}. '
            "Jika tidak yakin, gunakan jawaban yang hati-hati dan singkat."
        )
        try:
            response = requests.post(
                (
                    "https://generativelanguage.googleapis.com/v1beta/models/"
                    f"{settings.stylist_image_analysis_gemini_model}:generateContent"
                ),
                params={"key": api_key},
                headers={"Content-Type": "application/json"},
                json={
                    "system_instruction": {"parts": [{"text": prompt}]},
                    "contents": [
                        {
                            "role": "user",
                            "parts": [
                                {
                                    "text": message
                                    or "Analisa item pada gambar ini untuk kebutuhan styling.",
                                },
                                {
                                    "inline_data": {
                                        "mime_type": mime_type,
                                        "data": base64_data,
                                    }
                                },
                            ],
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.2,
                        "responseMimeType": "application/json",
                    },
                },
                timeout=(5, 30),
            )
            response.raise_for_status()
            data = response.json()
            content = (
                data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
            )
            parsed = self._extract_json(content)
            if isinstance(parsed, list):
                parsed = next((item for item in parsed if isinstance(item, dict)), None)
            if not isinstance(parsed, dict):
                raw_preview = self._sanitize_provider_error_text(content)
                message = (
                    f"respons tidak bisa diparsing: {raw_preview}"
                    if raw_preview
                    else "respons tidak bisa diparsing"
                )
                logger.warning("Gemini vision parse failure: %s", message)
                return None, message
            return (
                {
                    "itemType": parsed.get("itemType") or "item",
                    "dominantColors": parsed.get("dominantColors") or [],
                    "styleDirection": parsed.get("styleDirection") or "refined",
                    "compatibilityNote": parsed.get("compatibilityNote")
                    or "Look diarahkan agar tetap harmonis dengan item referensi Anda.",
                },
                None,
            )
        except (requests.RequestException, ValueError, KeyError) as exc:
            failure = self._gemini_vision_failure_message(exc)
            logger.warning("Gemini vision request failed: %s", failure)
            return None, failure

    def _extract_json(self, raw_text: str | None) -> Any | None:
        if not raw_text:
            return None
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

    def _history_user_messages(self, history: list[dict[str, Any]] | None) -> list[str]:
        if not history:
            return []

        messages: list[str] = []
        for item in history:
            if not isinstance(item, dict) or item.get("role") != "user":
                continue
            content = str(item.get("content") or "").strip()
            if content:
                messages.append(content)
        return messages

    def _should_reset_context(self, message: str) -> bool:
        normalized = self._normalize(message)
        return any(keyword in normalized for keyword in RESET_CONTEXT_KEYWORDS)

    def _is_refinement_request(self, message: str) -> bool:
        normalized = self._normalize(message)
        tokens = self._tokens(message)
        if len(tokens) <= 8:
            return True
        return any(keyword in normalized for keyword in REFINEMENT_KEYWORDS)

    def _normalize_mode(self, mode: str | None) -> str:
        if not mode:
            return "brief"
        normalized = self._normalize(mode).replace(" ", "-")
        if normalized in VALID_MODES:
            return normalized
        return "brief"

    def _build_conversation_context(
        self, *, message: str, history: list[dict[str, Any]] | None
    ) -> tuple[str, list[str]]:
        current_message = message.strip()
        previous_user_messages = self._history_user_messages(history)
        if not previous_user_messages or self._should_reset_context(current_message):
            return current_message, []

        if self._is_refinement_request(current_message):
            context_sources = previous_user_messages[-3:]
        else:
            context_sources = previous_user_messages[-1:]

        combined_parts: list[str] = []
        seen: set[str] = set()
        for part in [*context_sources, current_message]:
            normalized = self._normalize(part)
            if not normalized or normalized in seen:
                continue
            seen.add(normalized)
            combined_parts.append(part.strip())

        return " ".join(combined_parts), context_sources

    def _build_product_to_model_fallback(
        self,
        *,
        provider: str,
        product: CatalogProductDetail,
        product_image: str,
        prompt: str,
        model_direction: str,
        background: str,
        reason: str,
    ) -> ProductToModelResult:
        result = self._mock_product_to_model(
            product=product,
            product_image=product_image,
            prompt=prompt,
            model_direction=model_direction,
            background=background,
        )
        result.metadata.update(
            {
                "fallbackProvider": provider,
                "providerError": reason,
                "note": (
                    f"Provider {provider} belum berhasil dipakai, jadi sistem menampilkan "
                    f"mock studio preview agar workflow tetap jalan. Detail: {reason}"
                ),
            }
        )
        return result

    def build_chat_response(
        self,
        *,
        message: str,
        history: list[dict[str, Any]] | None = None,
        image: str | None = None,
        mode: str = "brief",
    ) -> dict[str, Any]:
        active_mode = self._normalize_mode(mode)
        contextual_message, prior_context = self._build_conversation_context(
            message=message,
            history=history,
        )
        occasion = self._occasion(contextual_message)
        analysis = self.analyze_image(image=image, message=contextual_message)
        palette = self._color_palette(contextual_message)
        if analysis and analysis.get("dominantColors"):
            palette = list(dict.fromkeys([*palette, *analysis["dominantColors"]]))
        style_direction = (
            analysis.get("styleDirection")
            if analysis
            else self._style_direction(contextual_message)
        ) or "refined"

        looks = self.get_alternative_looks(
            message=f"{contextual_message} {' '.join(palette)} {style_direction}",
            limit=3,
        )
        primary_products: list[dict[str, Any]] = []
        if looks:
            for item in looks[0]["products"]:
                primary_products.append(item)
        primary_products = primary_products[:4]

        session_summary = {
            "brief": "Session dimulai dari brief untuk menghasilkan hero look dan alternatif yang siap dipakai.",
            "outfit": "Session difokuskan pada penyusunan outfit lengkap dari katalog Yoora Sarah.",
            "match-item": "Session difokuskan pada pencocokan item referensi pribadi dengan look dari katalog.",
            "product-to-model": "Session difokuskan pada visual hero product dan kelanjutan styling dari produk tersebut.",
        }[active_mode]

        if looks:
            first_look = looks[0]
            content = (
                f"Saya siapkan {len(looks)} opsi styling. Fokus utama saya ada pada {first_look['title'].lower()} "
                "agar Anda langsung mendapat outfit siap pakai, bukan sekadar daftar produk. "
                "Silakan lihat susunan main piece, headwear, dan aksen pelengkapnya."
            )
        else:
            content = (
                "Saya belum menemukan kombinasi yang cukup kuat. Beri tahu occasion, warna, atau item yang ingin dipadukan agar saya bisa menyusun look yang lebih presisi."
            )

        if active_mode == "match-item" and analysis:
            content = (
                "Saya membaca item referensi Anda lebih dulu, lalu menyusun look yang tidak bentrok dengan warna dan arahnya. "
                + content
            )
        elif active_mode == "product-to-model":
            content = (
                "Saya menjaga fokus sesi ini pada hero product agar visual preview dan styling recommendation tetap saling terhubung. "
                + content
            )
        elif active_mode == "outfit":
            content = (
                "Saya menyusun sesi ini sebagai outfit lengkap, bukan rekomendasi produk lepas. "
                + content
            )

        if prior_context:
            content = (
                "Saya menyesuaikan brief terbaru dengan preferensi dari sesi sebelumnya. "
                + content
            )
        if analysis and analysis.get("compatibilityNote"):
            content = (
                f"{content} Saya memakai pembacaan item referensi untuk mengubah arah ranking dan menjaga output tetap selaras. "
                f"{analysis['compatibilityNote']}"
            )

        return {
            "content": content,
            "products": primary_products,
            "looks": looks,
            "analysis": analysis,
            "followUpPrompts": self.FOLLOW_UP_PROMPTS,
            "mode": "grounded-stylist",
            "activeMode": active_mode,
            "sessionSummary": session_summary,
        }


ai_stylist_service = OutfitMatcher()
