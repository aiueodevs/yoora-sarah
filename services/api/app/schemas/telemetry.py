from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

TelemetrySurface = Literal["web", "portal", "api"]
TelemetryActorType = Literal["buyer", "internal", "system"]
TelemetryOutcome = Literal["info", "success", "failure"]


class TelemetrySchema(BaseModel):
    model_config = ConfigDict(populate_by_name=True)


class TelemetryEventCreateRequest(TelemetrySchema):
    surface: TelemetrySurface
    event_name: str = Field(serialization_alias="eventName", min_length=1)
    actor_type: TelemetryActorType = Field(serialization_alias="actorType")
    actor_id: str | None = Field(default=None, serialization_alias="actorId")
    route: str | None = None
    outcome: TelemetryOutcome = "info"
    reference_type: str | None = Field(default=None, serialization_alias="referenceType")
    reference_id: str | None = Field(default=None, serialization_alias="referenceId")
    details: dict[str, Any] = Field(default_factory=dict)


class TelemetryEventRecord(TelemetrySchema):
    id: str
    surface: TelemetrySurface
    event_name: str = Field(serialization_alias="eventName")
    actor_type: TelemetryActorType = Field(serialization_alias="actorType")
    actor_id: str | None = Field(default=None, serialization_alias="actorId")
    route: str | None = None
    outcome: TelemetryOutcome
    reference_type: str | None = Field(default=None, serialization_alias="referenceType")
    reference_id: str | None = Field(default=None, serialization_alias="referenceId")
    details: dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime


class TelemetryEventList(TelemetrySchema):
    items: list[TelemetryEventRecord]
    count: int


class TelemetrySummary(TelemetrySchema):
    window_hours: int = Field(serialization_alias="windowHours")
    total: int
    by_surface: dict[str, int] = Field(serialization_alias="bySurface")
    by_outcome: dict[str, int] = Field(serialization_alias="byOutcome")
    by_event_name: dict[str, int] = Field(serialization_alias="byEventName")


class TelemetryIngestResponse(TelemetrySchema):
    recorded: bool
    event_id: str | None = Field(default=None, serialization_alias="eventId")
