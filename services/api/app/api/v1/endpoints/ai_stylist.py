from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests

from app.services.ai_stylist_service import ai_stylist_service, OutfitMatcher
from app.services.catalog_store import catalog_store
from app.services.ai_tools_service import AI_STYLIST_SYSTEM_PROMPT
from app.schemas.catalog import CatalogProductDetail
from app.core.config import get_settings


router = APIRouter(prefix="/ai/stylist", tags=["ai-stylist"])


class MixMatchRequest(BaseModel):
    category_slug: str
    product_slug: str
    occasion: str | None = None


class MixMatchResponse(BaseModel):
    dress: dict | None
    hijab: dict | None
    accessories: list[dict]
    total_price: int
    styling_notes: list[str]


class ChatRequest(BaseModel):
    message: str
    history: list[dict] | None = None


class ChatResponse(BaseModel):
    content: str
    products: list[dict]


OUTFIT_TEMPLATES = [
    {
        "id": "daily-look",
        "name": "Daily Look",
        "description": "Tampilan sehari-hari yang nyaman dan praktis",
        "icon": "☀️",
        "suggestions": ["dress", "pashmina"],
    },
    {
        "id": "office-ready",
        "name": "Office Ready",
        "description": "Tampilan profesional untuk kantor",
        "icon": "💼",
        "suggestions": ["abaya", "hijab"],
    },
    {
        "id": "party-glam",
        "name": "Party Glam",
        "description": "Tampilan glamor untuk pesta",
        "icon": "✨",
        "suggestions": ["dress", "accessories"],
    },
    {
        "id": "weekend-casual",
        "name": "Weekend Casual",
        "description": "Tampilan rileks untuk akhir pekan",
        "icon": "🌸",
        "suggestions": ["dress", "khimar"],
    },
    {
        "id": "modest-elegant",
        "name": "Modest Elegant",
        "description": "Tampilan sopan elegan",
        "icon": "🕌",
        "suggestions": ["abaya", "khimar", "accessories"],
    },
]


def product_to_dict(product: CatalogProductDetail | None) -> dict | None:
    if product is None:
        return None
    return {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "category": product.category_slug,
        "price": product.price,
        "image": product.image,
        "colors": [{"name": c.name, "hex": c.hex} for c in product.colors[:3]],
        "sizes": product.sizes,
    }


@router.post("/mix-match", response_model=MixMatchResponse)
async def mix_match(request: MixMatchRequest) -> MixMatchResponse:
    dress = catalog_store.get_product_detail(
        request.category_slug, request.product_slug
    )
    if dress is None:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")

    outfit = ai_stylist_service.create_outfit(dress, request.occasion)

    return MixMatchResponse(
        dress=product_to_dict(outfit.dress),
        hijab=product_to_dict(outfit.hijab),
        accessories=[product_to_dict(a) for a in outfit.accessories],
        total_price=outfit.total_price,
        styling_notes=outfit.styling_notes,
    )


@router.get("/products/{category_slug}")
async def get_category_products(category_slug: str) -> list[dict]:
    products = catalog_store.list_product_details(category_slug)
    return [product_to_dict(p) for p in products]


@router.post("/chat", response_model=ChatResponse)
async def stylist_chat(request: ChatRequest) -> ChatResponse:
    settings = get_settings()
    message = request.message
    history = request.history or []

    if not message:
        return ChatResponse(
            content="Silakan tulis pesan untuk memulai percakapan.", products=[]
        )

    messages = [{"role": "system", "content": AI_STYLIST_SYSTEM_PROMPT}]
    for msg in history[-5:]:
        messages.append(
            {"role": msg.get("role", "user"), "content": msg.get("content", "")}
        )
    messages.append({"role": "user", "content": message})

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.groq_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.groq_model,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 500,
            },
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]

        return ChatResponse(content=content, products=[])
    except Exception as e:
        return ChatResponse(
            content=f"Maaf, ada gangguan teknis. Silakan coba lagi.", products=[]
        )


@router.get("/templates")
async def get_outfit_templates() -> list[dict]:
    return OUTFIT_TEMPLATES


@router.get("/templates/{template_id}/products")
async def get_template_products(template_id: str) -> dict:
    template = next((t for t in OUTFIT_TEMPLATES if t["id"] == template_id), None)
    if template is None:
        raise HTTPException(status_code=404, detail="Template tidak ditemukan")

    products = []
    for cat in template["suggestions"]:
        prods = catalog_store.list_product_details(cat)[:2]
        products.extend(prods)

    return {
        "template": template,
        "products": [
            {
                "id": p.id,
                "name": p.name,
                "category": p.category_slug,
                "price": p.price,
                "image": p.image,
            }
            for p in products
        ],
    }
