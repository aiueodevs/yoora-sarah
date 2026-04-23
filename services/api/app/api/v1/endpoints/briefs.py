from typing import Annotated, Optional

from fastapi import APIRouter, Depends, status

from app.api.dependencies.auth import (
    InternalActor,
    require_design_workflow_access,
)
from app.schemas.brief import (
    Brief,
    BriefCreate,
    BriefUpdate,
)
from app.services.design_workflow_store import design_store

router = APIRouter(prefix="/briefs", tags=["briefs"])


@router.get("", response_model=list[Brief])
async def list_briefs(
    brand: Optional[str] = None,
    _: Annotated[InternalActor, Depends(require_design_workflow_access)] = None,
) -> list[Brief]:
    return design_store.list_briefs(brand_filter=brand)


@router.get("/{brief_id}", response_model=Brief)
async def get_brief(
    brief_id: str,
    _: Annotated[InternalActor, Depends(require_design_workflow_access)] = None,
) -> Brief:
    return design_store.get_brief(brief_id)


@router.post("", response_model=Brief, status_code=status.HTTP_201_CREATED)
async def create_brief(
    payload: BriefCreate,
    actor: Annotated[InternalActor, Depends(require_design_workflow_access)],
) -> Brief:
    return design_store.create_brief(payload, actor.actor_id)


@router.patch("/{brief_id}", response_model=Brief)
async def update_brief(
    brief_id: str,
    payload: BriefUpdate,
    _: Annotated[InternalActor, Depends(require_design_workflow_access)] = None,
) -> Brief:
    return design_store.update_brief(brief_id, payload)
