from typing import Literal, Optional
from threading import Thread

from fastapi import APIRouter, Query, status
from pydantic import BaseModel, Field

from app.schemas.commerce import SupportHandoffRecord
from app.services.ai_tools_service import (
    AIAssistantResponse,
    AILaunchPolicyResult,
    AIVariantAvailabilityResult,
    AIOrderStatusResult,
    AIProductLookupResult,
    AISizeGuidanceResult,
    AIStylistRecommendation,
    ai_tools_service,
)
from app.services.postgres_store import store

router = APIRouter(prefix="/ai-tools", tags=["ai-tools"])


class AIAssistantConversationMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=2000)


class AIAssistantRequest(BaseModel):
    query: str = Field(min_length=1, max_length=2000)
    messages: list[AIAssistantConversationMessage] = Field(default_factory=list, max_length=12)


def _record_ai_telemetry(**kwargs) -> None:
    def _runner() -> None:
        try:
            store.record_telemetry_event(**kwargs)
        except Exception:
            return

    Thread(target=_runner, daemon=True).start()


@router.get("/products/search")
async def ai_search_products(
    query: Optional[str] = Query(default=None, description="Search query"),
    category: Optional[str] = Query(default=None, description="Category slug filter"),
    limit: int = Query(default=5, ge=1, le=20),
    ) -> list[dict]:
    """Search products for AI assistant grounding."""
    items = ai_tools_service.search_products(query=query, category=category, limit=limit)
    _record_ai_telemetry(
        surface="web",
        event_name="buyer_ai_product_search",
        actor_type="buyer",
        route="/ai-tools/products/search",
        outcome="success",
        details={
            "query": query,
            "category": category,
            "limit": limit,
            "resultCount": len(items),
        },
    )
    return items


@router.get("/products/details")
async def ai_get_product_details(
    category_slug: str = Query(..., description="Category slug"),
    product_slug: str = Query(..., description="Product slug"),
) -> AIProductLookupResult:
    """Get detailed product information for AI assistant."""
    result = ai_tools_service.get_product_details(category_slug, product_slug)
    _record_ai_telemetry(
        surface="web",
        event_name="buyer_ai_product_detail_lookup",
        actor_type="buyer",
        route="/ai-tools/products/details",
        outcome="success" if result.found else "failure",
        reference_type="product",
        reference_id=f"{category_slug}/{product_slug}",
        details={"found": result.found},
    )
    return result


@router.get("/variants/availability")
async def ai_variant_availability(
    category_slug: str = Query(..., description="Category slug"),
    product_slug: str = Query(..., description="Product slug"),
    color: str = Query(..., description="Color name"),
    size: str = Query(..., description="Size code"),
) -> AIVariantAvailabilityResult:
    """Check specific variant availability for AI assistant."""
    result = ai_tools_service.get_variant_availability(
        category_slug, product_slug, color, size
    )
    _record_ai_telemetry(
        surface="web",
        event_name="buyer_ai_variant_lookup",
        actor_type="buyer",
        route="/ai-tools/variants/availability",
        outcome="success" if result.found else "failure",
        reference_type="product",
        reference_id=f"{category_slug}/{product_slug}",
        details={
            "color": color,
            "size": size,
            "found": result.found,
            "available": result.available,
        },
    )
    return result


@router.get("/orders/status")
async def ai_order_status(
    order_number: str = Query(..., description="Order number"),
) -> AIOrderStatusResult:
    """Get order status for AI assistant."""
    result = ai_tools_service.get_order_status(order_number)
    _record_ai_telemetry(
        surface="web",
        event_name="buyer_ai_order_status_lookup",
        actor_type="buyer",
        route="/ai-tools/orders/status",
        outcome="success" if result.found else "failure",
        reference_type="order",
        reference_id=order_number,
        details={"found": result.found},
    )
    return result


@router.get("/support/policies")
async def ai_support_policies(
    topic: Optional[str] = Query(default=None, description="Filter by topic"),
    ) -> list[dict]:
    """Retrieve support policy articles for AI assistant grounding."""
    items = ai_tools_service.get_support_policy(topic=topic)
    _record_ai_telemetry(
        surface="web",
        event_name="buyer_ai_support_policy_lookup",
        actor_type="buyer",
        route="/ai-tools/support/policies",
        outcome="success",
        reference_type="support_policy",
        reference_id=topic,
        details={"topic": topic, "resultCount": len(items)},
    )
    return items


@router.get("/products/recommendations")
async def ai_product_recommendations(
    category_slug: str = Query(..., description="Category slug"),
    product_slug: str = Query(..., description="Product slug"),
    occasion: Optional[str] = Query(default=None, description="Optional occasion cue"),
    limit: int = Query(default=3, ge=1, le=6),
) -> list[AIStylistRecommendation]:
    items = ai_tools_service.get_stylist_recommendations(
        category_slug=category_slug,
        product_slug=product_slug,
        occasion=occasion,
        limit=limit,
    )
    _record_ai_telemetry(
        surface="web",
        event_name="buyer_ai_stylist_recommendation_lookup",
        actor_type="buyer",
        route="/ai-tools/products/recommendations",
        outcome="success" if items else "failure",
        reference_type="product",
        reference_id=f"{category_slug}/{product_slug}",
        details={
            "occasion": occasion,
            "limit": limit,
            "resultCount": len(items),
        },
    )
    return items


@router.get("/products/size-guidance")
async def ai_size_guidance(
    category_slug: str = Query(..., description="Category slug"),
    product_slug: str = Query(..., description="Product slug"),
    selected_size: Optional[str] = Query(default=None, description="Selected size"),
) -> AISizeGuidanceResult:
    result = ai_tools_service.get_size_guidance(
        category_slug=category_slug,
        product_slug=product_slug,
        selected_size=selected_size,
    )
    _record_ai_telemetry(
        surface="web",
        event_name="buyer_ai_size_guidance_lookup",
        actor_type="buyer",
        route="/ai-tools/products/size-guidance",
        outcome="success" if result.found else "failure",
        reference_type="product",
        reference_id=f"{category_slug}/{product_slug}",
        details={
            "selectedSize": selected_size,
            "recommendedSize": result.recommended_size,
            "handoffRecommended": result.handoff_recommended,
        },
    )
    return result


@router.get("/products/launch-policy")
async def ai_launch_policy(
    category_slug: str = Query(..., description="Category slug"),
    product_slug: str = Query(..., description="Product slug"),
) -> AILaunchPolicyResult:
    result = ai_tools_service.get_launch_or_preorder_policy(category_slug, product_slug)
    _record_ai_telemetry(
        surface="web",
        event_name="buyer_ai_launch_policy_lookup",
        actor_type="buyer",
        route="/ai-tools/products/launch-policy",
        outcome="success" if result.found else "failure",
        reference_type="product",
        reference_id=f"{category_slug}/{product_slug}",
        details={"stockState": result.stock_state},
    )
    return result


@router.post(
    "/support/handoffs/preview",
    response_model=SupportHandoffRecord,
    status_code=status.HTTP_201_CREATED,
)
async def ai_support_handoff_preview(
    reason: str = Query(..., description="Support handoff reason"),
    context_summary: str = Query(..., description="Short context summary"),
    order_id: Optional[str] = Query(default=None, description="Optional order id"),
) -> SupportHandoffRecord:
    record = ai_tools_service.create_support_handoff(
        reason=reason,
        context_summary=context_summary,
        order_id=order_id,
    )
    _record_ai_telemetry(
        surface="web",
        event_name="buyer_ai_handoff_preview_created",
        actor_type="buyer",
        route="/ai-tools/support/handoffs/preview",
        outcome="success",
        reference_type="support_handoff",
        reference_id=record.id,
        details={"reason": reason, "orderId": order_id},
    )
    return record


@router.post("/assistant/respond")
async def ai_assistant_respond(payload: AIAssistantRequest) -> AIAssistantResponse:
    result = ai_tools_service.get_assistant_response(
        payload.query,
        messages=[{"role": item.role, "content": item.content} for item in payload.messages],
    )
    _record_ai_telemetry(
        surface="web",
        event_name="buyer_ai_assistant_response_generated",
        actor_type="buyer",
        route="/ai-tools/assistant/respond",
        outcome="success" if result.content else "failure",
        details={
            "queryLength": len(payload.query),
            "messageCount": len(payload.messages),
            "mode": result.mode,
            "sourceCount": len(result.sources or []),
        },
    )
    return result
