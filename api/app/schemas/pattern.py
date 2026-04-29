from datetime import datetime

from pydantic import BaseModel, Field


class PatternJobCreate(BaseModel):
    design_option_id: str
    size_chart_id: str


class PatternJob(BaseModel):
    id: str
    design_option_id: str
    design_option_title: str | None = None
    size_chart_id: str
    size_chart_name: str | None = None
    requested_by_user_id: str
    requested_by_email: str | None = None
    status: str
    metadata: dict = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime


class PatternOutput(BaseModel):
    id: str
    pattern_job_id: str
    output_type: str
    file_url: str
    fabric_estimate_m: float | None = None
    grading_notes: str | None = None
    created_at: datetime
