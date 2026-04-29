from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies.auth import InternalActor, require_approval_access
from app.schemas.approval import ApprovalActionRequest, ApprovalActionResponse, ApprovalRecord
from app.services.postgres_store import store

router = APIRouter()


@router.get("/approvals", response_model=list[ApprovalRecord])
async def list_approvals(
    _: Annotated[InternalActor, Depends(require_approval_access)] = None,
) -> list[ApprovalRecord]:
    return store.list_approvals()


@router.post("/approvals", response_model=ApprovalActionResponse)
async def submit_approval_action(
    payload: ApprovalActionRequest,
    actor: Annotated[InternalActor, Depends(require_approval_access)] = None,
) -> ApprovalActionResponse:
    effective_payload = payload.model_copy(update={"actor_id": actor.actor_id if actor else payload.actor_id})
    return store.submit_approval_action(effective_payload)
