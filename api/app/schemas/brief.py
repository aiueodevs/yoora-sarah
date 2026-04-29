from datetime import datetime

from pydantic import BaseModel, Field


class BriefReference(BaseModel):
    brief_reference_id: int
    brief_id: int
    reference_type: str
    reference_url: str | None = None
    reference_note: str | None = None
    created_at: datetime


class BriefCreate(BaseModel):
    brand_id: str
    title: str
    category: str
    target_segment: str
    campaign_name: str | None = None
    notes: str | None = None


class BriefUpdate(BaseModel):
    title: str | None = None
    category: str | None = None
    target_segment: str | None = None
    campaign_name: str | None = None
    notes: str | None = None
    status: str | None = None


class Brief(BaseModel):
    id: str
    brand_id: str
    brand_name: str | None = None
    created_by_user_id: str
    created_by_email: str | None = None
    title: str
    category: str
    target_segment: str
    campaign_name: str | None = None
    notes: str | None = None
    status: str
    metadata: dict = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime


class DesignGenerationJobCreate(BaseModel):
    brief_id: str
    variation_count: int = Field(ge=1, le=10, default=3)
    prompt_version: str | None = None


class DesignGenerationJob(BaseModel):
    id: str
    brief_id: str
    brief_title: str | None = None
    requested_by_user_id: str
    requested_by_email: str | None = None
    variation_count: int
    status: str
    prompt_version: str | None = None
    metadata: dict = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime


class DesignOption(BaseModel):
    id: str
    design_generation_job_id: str
    brief_id: str
    candidate_code: str
    title: str
    status: str
    image_url: str | None = None
    material_notes: str | None = None
    rationale: str | None = None
    metadata: dict = Field(default_factory=dict)
    created_at: datetime


class DesignAnnotationCreate(BaseModel):
    annotation_type: str
    note: str


class DesignAnnotation(BaseModel):
    id: str
    design_option_id: str
    author_user_id: str
    author_email: str | None = None
    annotation_type: str
    note: str
    created_at: datetime


class DesignAnnotationCreateRequest(BaseModel):
    annotation_type: str
    note: str


class ShortlistRequest(BaseModel):
    status: str = Field(pattern="^(shortlisted|approved|rejected)$")
