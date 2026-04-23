from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PatternJobCreate(BaseModel):
    design_option_id: str
    size_chart_id: str


class PatternJob(BaseModel):
    id: str
    design_option_id: str
    design_option_title: Optional[str] = None
    size_chart_id: str
    size_chart_name: Optional[str] = None
    requested_by_user_id: str
    requested_by_email: Optional[str] = None
    status: str
    metadata: dict = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime


class PatternOutput(BaseModel):
    id: str
    pattern_job_id: str
    output_type: str
    file_url: str
    fabric_estimate_m: Optional[float] = None
    grading_notes: Optional[str] = None
    created_at: datetime
