from typing import Annotated, Optional

from fastapi import APIRouter, Depends, status

from app.api.dependencies.auth import (
    InternalActor,
    require_design_workflow_access,
)
from app.schemas.pattern import PatternJob, PatternJobCreate, PatternOutput
from app.services.pattern_workflow_store import pattern_store

router = APIRouter(prefix="/pattern-jobs", tags=["pattern-jobs"])


@router.get("", response_model=list[PatternJob])
async def list_pattern_jobs(
    design_option_id: Optional[str] = None,
    job_status: Optional[str] = None,
    _: Annotated[InternalActor, Depends(require_design_workflow_access)] = None,
) -> list[PatternJob]:
    return pattern_store.list_pattern_jobs(
        design_option_id=design_option_id, status_filter=job_status
    )


@router.get("/{job_id}", response_model=PatternJob)
async def get_pattern_job(
    job_id: str,
    _: Annotated[InternalActor, Depends(require_design_workflow_access)] = None,
) -> PatternJob:
    return pattern_store.get_pattern_job(job_id)


@router.post("", response_model=PatternJob, status_code=status.HTTP_201_CREATED)
async def create_pattern_job(
    payload: PatternJobCreate,
    actor: Annotated[InternalActor, Depends(require_design_workflow_access)],
) -> PatternJob:
    return pattern_store.create_pattern_job(payload, actor.actor_id)


@router.patch("/{job_id}/status", response_model=PatternJob)
async def update_pattern_job_status(
    job_id: str,
    new_status: str,
    _: Annotated[InternalActor, Depends(require_design_workflow_access)] = None,
) -> PatternJob:
    return pattern_store.update_job_status(job_id, new_status)


@router.get("/{job_id}/outputs", response_model=list[PatternOutput])
async def list_pattern_outputs(
    job_id: str,
    _: Annotated[InternalActor, Depends(require_design_workflow_access)] = None,
) -> list[PatternOutput]:
    return pattern_store.list_outputs(job_id)
