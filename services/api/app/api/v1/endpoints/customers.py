from fastapi import APIRouter

from app.schemas.commerce import CustomerProfilePayload, CustomerWishlistPayload
from app.services.commerce_store import commerce_store

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("/me/profile", response_model=CustomerProfilePayload)
async def get_customer_profile() -> CustomerProfilePayload:
    return commerce_store.get_customer_profile()


@router.get("/me/wishlist", response_model=CustomerWishlistPayload)
async def get_customer_wishlist() -> CustomerWishlistPayload:
    return commerce_store.get_customer_wishlist()
