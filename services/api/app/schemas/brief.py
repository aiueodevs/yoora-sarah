from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class BriefReference(BaseModel):
    brief_reference_id: int
    brief_id: int
    reference_type: str
    reference_url: Optional[str] = None
    reference_note: Optional[str] = None
    created_at: datetime


class BriefCreate(BaseModel):
    brand_id: str
    title: str
    category: str
    target_segment: str
    campaign_name: Optional[str] = None
    notes: Optional[str] = None


class BriefUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    target_segment: Optional[str] = None
    campaign_name: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class Brief(BaseModel):
    id: str
    brand_id: str
    brand_name: Optional[str] = None
    created_by_user_id: str
    created_by_email: Optional[str] = None
    title: str
    category: str
    target_segment: str
    campaign_name: Optional[str] = None
    notes: Optional[str] = None
    status: str
    metadata: dict = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime


class DesignGenerationJobCreate(BaseModel):
    brief_id: str
    variation_count: int = Field(ge=1, le=10, default=3)
    prompt_version: Optional[str] = None


class DesignGenerationJob(BaseModel):
    id: str
    brief_id: str
    brief_title: Optional[str] = None
    requested_by_user_id: str
    requested_by_email: Optional[str] = None
    variation_count: int
    status: str
    prompt_version: Optional[str] = None
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
    image_url: Optional[str] = None
    material_notes: Optional[str] = None
    rationale: Optional[str] = None
    metadata: dict = Field(default_factory=dict)
    created_at: datetime


class DesignAnnotationCreate(BaseModel):
    annotation_type: str
    note: str


class DesignAnnotation(BaseModel):
    id: str
    design_option_id: str
    author_user_id: str
    author_email: Optional[str] = None
    annotation_type: str
    note: str
    created_at: datetime


class DesignAnnotationCreateRequest(BaseModel):
    annotation_type: str
    note: str


class ShortlistRequest(BaseModel):
    status: str = Field(pattern="^(shortlisted|approved|rejected)$")
