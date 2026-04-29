from __future__ import annotations

import base64
import binascii

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.catalog import CatalogProductDetail
from app.services.ai_stylist_service import ai_stylist_service
from app.services.catalog_store import catalog_store

router = APIRouter(prefix="/ai/stylist", tags=["ai-stylist"])
MAX_HISTORY_ITEMS = 12
MAX_HISTORY_MESSAGE_CHARS = 1200
MAX_IMAGE_BYTES = 5 * 1024 * 1024


class ProductCard(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str | None = None
    name: str
    slug: str | None = None
    category: str
    category_label: str | None = Field(
        default=None,
        alias="categoryLabel",
        serialization_alias="categoryLabel",
    )
    price: int
    image: str
    colors: list[str] = Field(default_factory=list)
    badge: str | None = None
    stock_summary: str | None = Field(
        default=None,
        alias="stockSummary",
        serialization_alias="stockSummary",
    )
    role: str | None = None
    reason: str | None = None


class LookCard(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    title: str
    note: str
    occasion: str | None = None
    total_price: int | None = Field(
        default=None,
        alias="totalPrice",
        serialization_alias="totalPrice",
    )
    products: list[ProductCard] = Field(default_factory=list)


class ImageAnalysisResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    item_type: str | None = Field(default=None, alias="itemType", serialization_alias="itemType")
    dominant_colors: list[str] = Field(
        default_factory=list,
        alias="dominantColors",
        serialization_alias="dominantColors",
    )
    style_direction: str | None = Field(
        default=None,
        alias="styleDirection",
        serialization_alias="styleDirection",
    )
    compatibility_note: str | None = Field(
        default=None,
        alias="compatibilityNote",
        serialization_alias="compatibilityNote",
    )


class MixMatchRequest(BaseModel):
    category_slug: str
    product_slug: str
    occasion: str | None = None


class MixMatchResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    dress: ProductCard | None = None
    hijab: ProductCard | None = None
    accessories: list[ProductCard] = Field(default_factory=list)
    total_price: int = Field(alias="totalPrice", serialization_alias="totalPrice")
    styling_notes: list[str] = Field(
        default_factory=list,
        alias="stylingNotes",
        serialization_alias="stylingNotes",
    )
    alternatives: list[LookCard] = Field(default_factory=list)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=3000)
    history: list[dict] | None = None
    image: str | None = None
    mode: str = Field(default="brief", pattern="^(brief|outfit|match-item|product-to-model)$")

    @field_validator("history")
    @classmethod
    def validate_history(cls, value: list[dict] | None) -> list[dict] | None:
        if value is None:
            return None
        if len(value) > MAX_HISTORY_ITEMS:
            raise ValueError(f"History maksimal {MAX_HISTORY_ITEMS} pesan.")

        normalized_history: list[dict] = []
        for index, item in enumerate(value, start=1):
            if not isinstance(item, dict):
                raise ValueError(f"History item ke-{index} tidak valid.")

            role = item.get("role")
            content = item.get("content")
            if role not in {"user", "assistant"}:
                raise ValueError(f"Role history item ke-{index} tidak valid.")
            if not isinstance(content, str):
                raise ValueError(f"Content history item ke-{index} harus berupa teks.")

            cleaned_content = content.strip()
            if not cleaned_content:
                continue
            if len(cleaned_content) > MAX_HISTORY_MESSAGE_CHARS:
                raise ValueError(
                    f"Content history item ke-{index} melebihi {MAX_HISTORY_MESSAGE_CHARS} karakter."
                )
            normalized_history.append({"role": role, "content": cleaned_content})

        return normalized_history

    @field_validator("image")
    @classmethod
    def validate_image(cls, value: str | None) -> str | None:
        if value is None:
            return None

        if not isinstance(value, str) or not value.startswith("data:image/"):
            raise ValueError("Image harus berupa data URL gambar.")

        try:
            header, payload = value.split(",", 1)
        except ValueError as exc:
            raise ValueError("Format image data URL tidak valid.") from exc

        if ";base64" not in header:
            raise ValueError("Image data URL harus menggunakan base64.")

        try:
            decoded = base64.b64decode(payload, validate=True)
        except (ValueError, binascii.Error) as exc:
            raise ValueError("Image base64 tidak valid.") from exc

        if len(decoded) > MAX_IMAGE_BYTES:
            raise ValueError("Ukuran image maksimal 5MB.")

        return value


class ChatResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    content: str
    products: list[ProductCard] = Field(default_factory=list)
    looks: list[LookCard] = Field(default_factory=list)
    analysis: ImageAnalysisResponse | None = None
    follow_up_prompts: list[str] = Field(
        default_factory=list,
        alias="followUpPrompts",
        serialization_alias="followUpPrompts",
    )
    mode: str = "grounded-stylist"
    active_mode: str = Field(default="brief", alias="activeMode", serialization_alias="activeMode")
    session_summary: str | None = Field(default=None, alias="sessionSummary", serialization_alias="sessionSummary")


class AnalyzeImageRequest(BaseModel):
    image: str
    message: str | None = None


class ProductToModelRequest(BaseModel):
    category_slug: str
    product_slug: str
    prompt: str | None = Field(default=None, max_length=1200)
    model_direction: str = Field(default="studio-catalog", alias="modelDirection")
    background: str = "soft-stone"


class ProductToModelResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: str
    provider: str
    prediction_id: str | None = Field(default=None, alias="predictionId", serialization_alias="predictionId")
    image_url: str | None = Field(default=None, alias="imageUrl", serialization_alias="imageUrl")
    error: str | None = None
    prompt: str
    source_image: str = Field(alias="sourceImage", serialization_alias="sourceImage")
    metadata: dict = Field(default_factory=dict)


def serialize_product(product: CatalogProductDetail | dict | None, **extra) -> ProductCard | None:
    if product is None:
        return None

    if isinstance(product, dict):
        payload = {**product, **extra}
        return ProductCard.model_validate(payload)

    image = product.colors[0].gallery[0] if product.colors and product.colors[0].gallery else product.image
    payload = {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "category": product.category_slug,
        "price": product.price,
        "image": image,
        "colors": [color.name for color in product.colors[:3]],
        **extra,
    }
    return ProductCard.model_validate(payload)


def serialize_look(look: dict) -> LookCard:
    products = [
        ProductCard.model_validate(product)
        for product in look.get("products", [])
        if product
    ]
    return LookCard.model_validate({**look, "products": products})


def serialize_product_to_model(result) -> ProductToModelResponse:
    return ProductToModelResponse.model_validate(
        {
            "status": result.status,
            "provider": result.provider,
            "predictionId": result.prediction_id,
            "imageUrl": result.image_url,
            "error": result.error,
            "prompt": result.prompt,
            "sourceImage": result.source_image,
            "metadata": result.metadata,
        }
    )


@router.post("/mix-match", response_model=MixMatchResponse)
async def mix_match(request: MixMatchRequest) -> MixMatchResponse:
    dress = catalog_store.get_product_detail(request.category_slug, request.product_slug)
    if dress is None:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")

    outfit = ai_stylist_service.create_outfit(dress, request.occasion)
    return MixMatchResponse(
        dress=serialize_product(outfit.dress, role="main"),
        hijab=serialize_product(outfit.hijab, role="headwear"),
        accessories=[
            serialize_product(accessory, role="accent")
            for accessory in outfit.accessories
            if accessory is not None
        ],
        total_price=outfit.total_price,
        styling_notes=outfit.styling_notes,
        alternatives=[serialize_look(look) for look in outfit.alternatives],
    )


@router.get("/products/{category_slug}")
async def get_category_products(category_slug: str) -> list[ProductCard]:
    products = catalog_store.list_product_details(category_slug)
    return [serialize_product(product) for product in products if product is not None]


@router.post("/chat", response_model=ChatResponse)
async def stylist_chat(request: ChatRequest) -> ChatResponse:
    result = ai_stylist_service.build_chat_response(
        message=request.message,
        history=request.history,
        image=request.image,
        mode=request.mode,
    )
    return ChatResponse.model_validate(result)


@router.get("/templates")
async def get_outfit_templates() -> list[dict]:
    return ai_stylist_service.get_outfit_templates()


@router.get("/templates/{template_id}/products")
async def get_template_products(template_id: str) -> dict:
    bundle = ai_stylist_service.get_template_products(template_id)
    if bundle is None:
        raise HTTPException(status_code=404, detail="Template tidak ditemukan")
    return bundle


@router.post("/analyze-image")
async def analyze_image(request: AnalyzeImageRequest) -> dict:
    analysis = ai_stylist_service.analyze_image(request.image, request.message)
    looks = ai_stylist_service.get_alternative_looks(
        message=f"{request.message or ''} {' '.join((analysis or {}).get('dominantColors', []))}",
        limit=2,
    )
    products = looks[0]["products"] if looks else []
    return {
        "analysis": analysis,
        "looks": looks,
        "products": products,
    }


@router.post("/product-to-model", response_model=ProductToModelResponse)
async def product_to_model(request: ProductToModelRequest) -> ProductToModelResponse:
    try:
        result = ai_stylist_service.create_product_to_model(
            category_slug=request.category_slug,
            product_slug=request.product_slug,
            prompt=request.prompt,
            model_direction=request.model_direction,
            background=request.background,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return serialize_product_to_model(result)


@router.get("/product-to-model/{prediction_id}", response_model=ProductToModelResponse)
async def get_product_to_model_prediction(prediction_id: str) -> ProductToModelResponse:
    try:
        result = ai_stylist_service.get_product_to_model_prediction(prediction_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Provider product-to-model tidak tersedia.") from exc

    return serialize_product_to_model(result)
