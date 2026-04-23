from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies.auth import InternalActor, require_approval_access
from app.schemas.audit import AuditEventList
from app.services.postgres_store import store

router = APIRouter(prefix="/audit")


@router.get("/events", response_model=AuditEventList)
async def list_audit_events(
    _: Annotated[InternalActor, Depends(require_approval_access)],
) -> AuditEventList:
    items = store.list_audit_events()
    return AuditEventList(items=items, count=len(items))
