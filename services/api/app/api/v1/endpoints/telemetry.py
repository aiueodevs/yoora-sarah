from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies.auth import (
    InternalActor,
    require_approval_access,
    require_internal_actor,
)
from app.schemas.telemetry import (
    TelemetryActorType,
    TelemetryEventCreateRequest,
    TelemetryEventList,
    TelemetryIngestResponse,
    TelemetryOutcome,
    TelemetrySummary,
)
from app.services.postgres_store import store

router = APIRouter(prefix="/telemetry", tags=["telemetry"])


@router.post("/events", response_model=TelemetryIngestResponse, status_code=status.HTTP_202_ACCEPTED)
async def capture_public_telemetry_event(
    payload: TelemetryEventCreateRequest,
) -> TelemetryIngestResponse:
    if payload.actor_type == "internal":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Public telemetry endpoint does not accept internal actor events.",
        )

    event = store.record_telemetry_event(
        surface=payload.surface,
        event_name=payload.event_name,
        actor_type=payload.actor_type,
        actor_id=payload.actor_id,
        route=payload.route,
        outcome=payload.outcome,
        reference_type=payload.reference_type,
        reference_id=payload.reference_id,
        details=payload.details,
    )
    return TelemetryIngestResponse(recorded=event is not None, event_id=event.id if event else None)


@router.post("/internal/events", response_model=TelemetryIngestResponse, status_code=status.HTTP_202_ACCEPTED)
async def capture_internal_telemetry_event(
    payload: TelemetryEventCreateRequest,
    actor: Annotated[InternalActor, Depends(require_internal_actor)],
) -> TelemetryIngestResponse:
    event = store.record_telemetry_event(
        surface=payload.surface,
        event_name=payload.event_name,
        actor_type="internal",
        actor_id=actor.actor_id,
        route=payload.route,
        outcome=payload.outcome,
        reference_type=payload.reference_type,
        reference_id=payload.reference_id,
        details={
            **payload.details,
            "actorEmail": actor.email,
            "authMode": actor.auth_mode,
        },
    )
    return TelemetryIngestResponse(recorded=event is not None, event_id=event.id if event else None)


@router.get("/events", response_model=TelemetryEventList)
async def list_telemetry_events(
    _: Annotated[InternalActor, Depends(require_approval_access)],
    limit: int = Query(default=100, ge=1, le=250),
    surface: str | None = Query(default=None),
    actor_type: TelemetryActorType | None = Query(default=None, alias="actorType"),
    outcome: TelemetryOutcome | None = Query(default=None),
) -> TelemetryEventList:
    items = store.list_telemetry_events(
        limit=limit,
        surface=surface,
        actor_type=actor_type,
        outcome=outcome,
    )
    return TelemetryEventList(items=items, count=len(items))


@router.get("/summary", response_model=TelemetrySummary)
async def summarize_telemetry_events(
    _: Annotated[InternalActor, Depends(require_approval_access)],
    window_hours: int = Query(default=24, ge=1, le=168, alias="windowHours"),
) -> TelemetrySummary:
    return store.summarize_telemetry_events(window_hours)
