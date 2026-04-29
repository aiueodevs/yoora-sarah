
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies.auth import (
    InternalActor,
    require_actor_user_id,
    require_forecast_access,
    require_planner_access,
    require_production_access,
)
from app.schemas.forecast import (
    AllocationRecommendation,
    ForecastColorMix,
    ForecastRecommendation,
    ForecastRun,
    ForecastRunCreate,
    ForecastRunUpdate,
    ForecastSizeMix,
    ProductionPlan,
    ProductionPlanCreate,
    ProductionPlanLine,
    ProductionPlanLineCreate,
    ProductionPlanUpdate,
)
from app.services.forecast_workflow_store import forecast_store

router = APIRouter(prefix="/forecast", tags=["forecast"])


@router.post("/runs", response_model=ForecastRun, status_code=status.HTTP_201_CREATED)
async def create_forecast_run(
    data: ForecastRunCreate,
    current_user: Annotated[InternalActor, Depends(require_planner_access)],
):
    return forecast_store.create_forecast_run(data, require_actor_user_id(current_user))


@router.get("/runs", response_model=list[ForecastRun])
async def list_forecast_runs(
    current_user: Annotated[InternalActor, Depends(require_forecast_access)],
    collection_id: int | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    limit: int = Query(50, le=100),
):
    return forecast_store.list_forecast_runs(
        collection_id=collection_id, status=status_filter, limit=limit
    )


@router.get("/runs/{forecast_run_id}", response_model=ForecastRun)
async def get_forecast_run(
    forecast_run_id: int,
    current_user: Annotated[InternalActor, Depends(require_forecast_access)],
):
    run = forecast_store.get_forecast_run(forecast_run_id)
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Forecast run not found"
        )
    return run


@router.patch("/runs/{forecast_run_id}", response_model=ForecastRun)
async def update_forecast_run(
    forecast_run_id: int,
    data: ForecastRunUpdate,
    current_user: Annotated[InternalActor, Depends(require_planner_access)],
):
    run = forecast_store.update_forecast_run(forecast_run_id, data)
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Forecast run not found"
        )
    return run


@router.get(
    "/runs/{forecast_run_id}/recommendations", response_model=ForecastRecommendation
)
async def get_forecast_recommendation(
    forecast_run_id: int,
    current_user: Annotated[InternalActor, Depends(require_forecast_access)],
):
    rec = forecast_store.get_forecast_recommendation(forecast_run_id)
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found"
        )
    return rec


@router.post(
    "/runs/{forecast_run_id}/recommendations", response_model=ForecastRecommendation
)
async def create_forecast_recommendation(
    forecast_run_id: int,
    current_user: Annotated[InternalActor, Depends(require_planner_access)],
    recommendation_summary: str | None = None,
    projected_total_units: int | None = None,
    rationale: str | None = None,
):
    run = forecast_store.get_forecast_run(forecast_run_id)
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Forecast run not found"
        )
    return forecast_store.create_forecast_recommendation(
        forecast_run_id, recommendation_summary, projected_total_units, rationale
    )


@router.get(
    "/recommendations/{forecast_recommendation_id}/size-mix",
    response_model=list[ForecastSizeMix],
)
async def get_size_mix(
    forecast_recommendation_id: int,
    current_user: Annotated[InternalActor, Depends(require_forecast_access)],
):
    return forecast_store.get_size_mix(forecast_recommendation_id)


@router.post(
    "/recommendations/{forecast_recommendation_id}/size-mix",
    response_model=list[ForecastSizeMix],
)
async def set_size_mix(
    forecast_recommendation_id: int,
    size_mix: list[dict],
    current_user: Annotated[InternalActor, Depends(require_planner_access)],
):
    return forecast_store.set_size_mix(forecast_recommendation_id, size_mix)


@router.get(
    "/recommendations/{forecast_recommendation_id}/color-mix",
    response_model=list[ForecastColorMix],
)
async def get_color_mix(
    forecast_recommendation_id: int,
    current_user: Annotated[InternalActor, Depends(require_forecast_access)],
):
    return forecast_store.get_color_mix(forecast_recommendation_id)


@router.post(
    "/recommendations/{forecast_recommendation_id}/color-mix",
    response_model=list[ForecastColorMix],
)
async def set_color_mix(
    forecast_recommendation_id: int,
    color_mix: list[dict],
    current_user: Annotated[InternalActor, Depends(require_planner_access)],
):
    return forecast_store.set_color_mix(forecast_recommendation_id, color_mix)


@router.get(
    "/recommendations/{forecast_recommendation_id}/allocations",
    response_model=list[AllocationRecommendation],
)
async def get_allocations(
    forecast_recommendation_id: int,
    current_user: Annotated[InternalActor, Depends(require_forecast_access)],
):
    return forecast_store.get_allocations(forecast_recommendation_id)


# Production Plans endpoints
@router.post(
    "/plans", response_model=ProductionPlan, status_code=status.HTTP_201_CREATED
)
async def create_production_plan(
    data: ProductionPlanCreate,
    current_user: Annotated[InternalActor, Depends(require_production_access)],
):
    return forecast_store.create_production_plan(data, require_actor_user_id(current_user))


@router.get("/plans", response_model=list[ProductionPlan])
async def list_production_plans(
    current_user: Annotated[InternalActor, Depends(require_production_access)],
    forecast_run_id: int | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    limit: int = Query(50, le=100),
):
    return forecast_store.list_production_plans(
        forecast_run_id=forecast_run_id, status=status_filter, limit=limit
    )


@router.get("/plans/{production_plan_id}", response_model=ProductionPlan)
async def get_production_plan(
    production_plan_id: int,
    current_user: Annotated[InternalActor, Depends(require_production_access)],
):
    plan = forecast_store.get_production_plan(production_plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Production plan not found"
        )
    return plan


@router.patch("/plans/{production_plan_id}", response_model=ProductionPlan)
async def update_production_plan(
    production_plan_id: int,
    data: ProductionPlanUpdate,
    current_user: Annotated[InternalActor, Depends(require_production_access)],
):
    plan = forecast_store.update_production_plan(production_plan_id, data)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Production plan not found"
        )
    return plan


@router.get(
    "/plans/{production_plan_id}/lines", response_model=list[ProductionPlanLine]
)
async def get_production_plan_lines(
    production_plan_id: int,
    current_user: Annotated[InternalActor, Depends(require_production_access)],
):
    return forecast_store.get_production_plan_lines(production_plan_id)


@router.post(
    "/plans/{production_plan_id}/lines",
    response_model=ProductionPlanLine,
    status_code=status.HTTP_201_CREATED,
)
async def add_production_plan_line(
    production_plan_id: int,
    data: ProductionPlanLineCreate,
    current_user: Annotated[InternalActor, Depends(require_production_access)],
):
    plan = forecast_store.get_production_plan(production_plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Production plan not found"
        )
    data.production_plan_id = production_plan_id
    return forecast_store.add_production_plan_line(data)


@router.delete(
    "/plan-lines/{production_plan_line_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_production_plan_line(
    production_plan_line_id: int,
    current_user: Annotated[InternalActor, Depends(require_production_access)],
):
    deleted = forecast_store.delete_production_plan_line(production_plan_line_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Plan line not found"
        )
