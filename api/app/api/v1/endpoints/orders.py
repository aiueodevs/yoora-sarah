from fastapi import APIRouter

from app.schemas.commerce import (
    AddCartItemPayload,
    CartItemQuantityUpdatePayload,
    CheckoutSummaryPayload,
    OrderSummary,
    StorefrontCartPayload,
)
from app.services.commerce_store import commerce_store

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("/me", response_model=list[OrderSummary])
async def list_customer_orders() -> list[OrderSummary]:
    return commerce_store.list_orders()


@router.get("/me/cart", response_model=StorefrontCartPayload)
async def get_customer_cart() -> StorefrontCartPayload:
    return commerce_store.get_cart()


@router.post("/me/cart/items", response_model=StorefrontCartPayload)
async def add_customer_cart_item(payload: AddCartItemPayload) -> StorefrontCartPayload:
    return commerce_store.add_cart_item(payload)


@router.patch("/me/cart/items/{item_id}", response_model=StorefrontCartPayload)
async def update_customer_cart_item(item_id: str, payload: CartItemQuantityUpdatePayload) -> StorefrontCartPayload:
    return commerce_store.update_cart_item_quantity(item_id, payload.quantity)


@router.delete("/me/cart/items/{item_id}", response_model=StorefrontCartPayload)
async def remove_customer_cart_item(item_id: str) -> StorefrontCartPayload:
    return commerce_store.remove_cart_item(item_id)


@router.get("/me/checkout-summary", response_model=CheckoutSummaryPayload)
async def get_checkout_summary() -> CheckoutSummaryPayload:
    return commerce_store.get_checkout_summary()
