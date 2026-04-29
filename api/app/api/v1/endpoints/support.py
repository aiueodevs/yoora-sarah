from fastapi import APIRouter, Query, status

from app.schemas.commerce import (
    SupportContact,
    SupportHandoffRecord,
    SupportHandoffRequest,
    SupportPolicyArticle,
)
from app.services.commerce_store import commerce_store

router = APIRouter(prefix="/support", tags=["support"])


@router.get("/contact", response_model=SupportContact)
async def get_support_contact() -> SupportContact:
    return commerce_store.get_support_contact()


@router.get("/policies", response_model=list[SupportPolicyArticle])
async def list_support_policies(
    topic: str | None = Query(default=None),
) -> list[SupportPolicyArticle]:
    return commerce_store.list_policy_articles(topic=topic)


@router.post("/handoffs/preview", response_model=SupportHandoffRecord, status_code=status.HTTP_201_CREATED)
async def create_support_handoff_preview(payload: SupportHandoffRequest) -> SupportHandoffRecord:
    return commerce_store.create_handoff_preview(payload)
