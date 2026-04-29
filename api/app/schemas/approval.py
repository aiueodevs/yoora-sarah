from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ApprovalActionRequest(BaseModel):
    artifact_type: str = Field(validation_alias="artifactType")
    artifact_id: str = Field(validation_alias="artifactId")
    action: str
    reason: str | None = None
    actor_id: str = Field(default="user_admin_tech", validation_alias="actorId")

    model_config = ConfigDict(populate_by_name=True)


class ApprovalActionResponse(BaseModel):
    id: str
    artifact_type: str = Field(serialization_alias="artifactType")
    artifact_id: str = Field(serialization_alias="artifactId")
    action: str
    actor_id: str = Field(serialization_alias="actorId")
    timestamp: datetime

    model_config = ConfigDict(populate_by_name=True)


class ApprovalRecord(BaseModel):
    id: str
    artifact_type: str = Field(serialization_alias="artifactType")
    artifact_id: str = Field(serialization_alias="artifactId")
    current_status: str = Field(serialization_alias="currentStatus")
    updated_at: datetime = Field(serialization_alias="updatedAt")

    model_config = ConfigDict(populate_by_name=True)
