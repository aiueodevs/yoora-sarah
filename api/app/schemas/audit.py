from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AuditEvent(BaseModel):
    id: str
    actor_id: str = Field(serialization_alias="actorId")
    event_type: str = Field(serialization_alias="eventType")
    reference_type: str = Field(serialization_alias="referenceType")
    reference_id: str = Field(serialization_alias="referenceId")
    notes: str | None = None
    timestamp: datetime

    model_config = ConfigDict(populate_by_name=True)


class AuditEventList(BaseModel):
    items: list[AuditEvent]
    count: int
