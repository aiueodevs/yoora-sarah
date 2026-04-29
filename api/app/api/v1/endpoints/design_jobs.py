from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.dependencies.auth import (
    InternalActor,
    require_design_workflow_access,
)
from app.schemas.brief import (
    DesignAnnotation,
    DesignAnnotationCreateRequest,
    DesignGenerationJob,
    DesignGenerationJobCreate,
    DesignOption,
    ShortlistRequest,
)
from app.services.design_workflow_store import design_store

router = APIRouter(prefix="/design-jobs", tags=["design-jobs"])


# ===== DESIGN GENERATION JOBS =====


@router.get("", response_model=list[DesignGenerationJob])
async def list_design_jobs(
    brief_id: str | None = None,
    job_status: str | None = None,
    _: Annotated[InternalActor, Depends(require_design_workflow_access)] = None,
) -> list[DesignGenerationJob]:
    return design_store.list_design_jobs(brief_id=brief_id, status_filter=job_status)


@router.get("/{job_id}", response_model=DesignGenerationJob)
async def get_design_job(
    job_id: str,
    _: Annotated[InternalActor, Depends(require_design_workflow_access)] = None,
) -> DesignGenerationJob:
    return design_store.get_design_job(job_id)


@router.post(
    "", response_model=DesignGenerationJob, status_code=status.HTTP_201_CREATED
)
async def create_design_job(
    payload: DesignGenerationJobCreate,
    actor: Annotated[InternalActor, Depends(require_design_workflow_access)],
) -> DesignGenerationJob:
    return design_store.create_design_job(payload, actor.actor_id)


# ===== DESIGN OPTIONS =====


@router.get("/options", response_model=list[DesignOption])
async def list_design_options(
    brief_id: str | None = None,
    job_id: str | None = None,
    _: Annotated[InternalActor, Depends(require_design_workflow_access)] = None,
) -> list[DesignOption]:
    return design_store.list_design_options(brief_id=brief_id, job_id=job_id)


@router.get("/options/{option_id}", response_model=DesignOption)
async def get_design_option(
    option_id: str,
    _: Annotated[InternalActor, Depends(require_design_workflow_access)] = None,
) -> DesignOption:
    return design_store.get_design_option(option_id)


@router.patch("/options/{option_id}/status", response_model=DesignOption)
async def update_option_status(
    option_id: str,
    payload: ShortlistRequest,
    _: Annotated[InternalActor, Depends(require_design_workflow_access)] = None,
) -> DesignOption:
    return design_store.update_option_status(option_id, payload.status)


# ===== DESIGN ANNOTATIONS =====


@router.get("/options/{option_id}/annotations", response_model=list[DesignAnnotation])
async def list_annotations(
    option_id: str,
    _: Annotated[InternalActor, Depends(require_design_workflow_access)] = None,
) -> list[DesignAnnotation]:
    return design_store.list_annotations(option_id)


@router.post(
    "/options/{option_id}/annotations",
    response_model=DesignAnnotation,
    status_code=status.HTTP_201_CREATED,
)
async def add_annotation(
    option_id: str,
    payload: DesignAnnotationCreateRequest,
    actor: Annotated[InternalActor, Depends(require_design_workflow_access)],
) -> DesignAnnotation:
    return design_store.add_annotation(option_id, payload, actor.actor_id)
