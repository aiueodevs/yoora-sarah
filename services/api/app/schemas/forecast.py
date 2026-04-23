from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# Forecast Run schemas
class ForecastRunBase(BaseModel):
    collection_id: int


class ForecastRunCreate(ForecastRunBase):
    pass


class ForecastRunUpdate(BaseModel):
    status: Optional[str] = None
    model_version: Optional[str] = None
    confidence_score: Optional[float] = None
    metadata: Optional[dict] = None


class ForecastRun(ForecastRunBase):
    forecast_run_id: int
    requested_by_user_id: int
    requested_by_email: Optional[str] = None
    status: str
    model_version: Optional[str] = None
    confidence_score: Optional[float] = None
    metadata: dict
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Forecast Recommendation schemas
class ForecastRecommendationBase(BaseModel):
    recommendation_summary: Optional[str] = None
    projected_total_units: Optional[int] = None
    rationale: Optional[str] = None


class ForecastRecommendationUpdate(BaseModel):
    recommendation_summary: Optional[str] = None
    projected_total_units: Optional[int] = None
    rationale: Optional[str] = None


class ForecastRecommendation(ForecastRecommendationBase):
    forecast_recommendation_id: int
    forecast_run_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Forecast Size Mix schemas
class ForecastSizeMixBase(BaseModel):
    size_code: str
    recommended_units: int


class ForecastSizeMix(ForecastSizeMixBase):
    forecast_size_mix_id: int
    forecast_recommendation_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Forecast Color Mix schemas
class ForecastColorMixBase(BaseModel):
    color_code: str
    recommended_units: int


class ForecastColorMix(ForecastColorMixBase):
    forecast_color_mix_id: int
    forecast_recommendation_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Allocation Recommendation schemas
class AllocationRecommendationBase(BaseModel):
    channel_code: str
    recommended_units: int


class AllocationRecommendation(AllocationRecommendationBase):
    allocation_recommendation_id: int
    forecast_recommendation_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Production Plan schemas
class ProductionPlanBase(BaseModel):
    forecast_run_id: int
    planner_notes: Optional[str] = None


class ProductionPlanCreate(ProductionPlanBase):
    pass


class ProductionPlanUpdate(BaseModel):
    status: Optional[str] = None
    planner_notes: Optional[str] = None


class ProductionPlan(ProductionPlanBase):
    production_plan_id: int
    created_by_user_id: int
    requested_by_email: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Production Plan Line schemas
class ProductionPlanLineBase(BaseModel):
    style_id: Optional[int] = None
    size_code: str
    color_code: str
    planned_units: int
    channel_code: Optional[str] = None


class ProductionPlanLineCreate(ProductionPlanLineBase):
    production_plan_id: int


class ProductionPlanLine(ProductionPlanLineBase):
    production_plan_line_id: int
    production_plan_id: int
    created_at: datetime

    class Config:
        from_attributes = True
