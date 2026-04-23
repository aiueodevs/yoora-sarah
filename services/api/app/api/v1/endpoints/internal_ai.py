from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.api.dependencies.auth import (
    InternalActor,
    require_approval_access,
    require_design_workflow_access,
    require_forecast_access,
    require_production_access,
)
from app.services.internal_ai_tools_service import (
    ApprovalSummary,
    BriefSummary,
    BriefCopilotNote,
    ContentDraft,
    ForecastSummary,
    KnowledgeArticle,
    LeadershipInsight,
    ProductionPlanSummary,
    internal_ai_tools_service,
)
from app.services.postgres_store import store

router = APIRouter(prefix="/internal-ai", tags=["internal-ai"])


@router.get("/briefs/summaries")
async def get_brief_summaries(
    actor: Annotated[InternalActor, Depends(require_approval_access)],
) -> list[BriefSummary]:
    """Get brief summaries for internal AI copilot."""
    items = internal_ai_tools_service.summarize_briefs(actor.email)
    store.record_telemetry_event(
        surface="portal",
        event_name="portal_copilot_brief_summary",
        actor_type="internal",
        actor_id=actor.actor_id,
        route="/internal-ai/briefs/summaries",
        outcome="success",
        details={"resultCount": len(items)},
    )
    return items


@router.get("/briefs/copilot")
async def get_brief_copilot_note(
    actor: Annotated[InternalActor, Depends(require_design_workflow_access)],
    brief_id: str | None = Query(default=None, alias="briefId"),
) -> BriefCopilotNote | None:
    note = internal_ai_tools_service.generate_brief_copilot_note(
        brief_id=brief_id,
        actor_email=actor.email,
    )
    store.record_telemetry_event(
        surface="portal",
        event_name="portal_copilot_brief_copilot_note",
        actor_type="internal",
        actor_id=actor.actor_id,
        route="/internal-ai/briefs/copilot",
        outcome="success" if note else "failure",
        details={"briefId": brief_id},
    )
    return note


@router.get("/approvals/summaries")
async def get_approval_summaries(
    actor: Annotated[InternalActor, Depends(require_approval_access)],
) -> list[ApprovalSummary]:
    """Get approval summaries for internal AI copilot."""
    items = internal_ai_tools_service.summarize_approvals(actor.email)
    store.record_telemetry_event(
        surface="portal",
        event_name="portal_copilot_approval_summary",
        actor_type="internal",
        actor_id=actor.actor_id,
        route="/internal-ai/approvals/summaries",
        outcome="success",
        details={"resultCount": len(items)},
    )
    return items


@router.get("/knowledge/articles")
async def get_knowledge_articles(
    actor: Annotated[InternalActor, Depends(require_approval_access)],
    query: str | None = Query(default=None),
    topic: str | None = Query(default=None),
) -> list[KnowledgeArticle]:
    items = internal_ai_tools_service.retrieve_knowledge_articles(
        query=query,
        topic=topic,
        actor_email=actor.email,
    )
    store.record_telemetry_event(
        surface="portal",
        event_name="portal_copilot_knowledge_lookup",
        actor_type="internal",
        actor_id=actor.actor_id,
        route="/internal-ai/knowledge/articles",
        outcome="success",
        details={"query": query, "topic": topic, "resultCount": len(items)},
    )
    return items


@router.get("/knowledge/onboarding")
async def get_onboarding_guidance(
    actor: Annotated[InternalActor, Depends(require_approval_access)],
    role: str | None = Query(default=None),
) -> list[KnowledgeArticle]:
    items = internal_ai_tools_service.get_onboarding_guidance(role=role, actor_email=actor.email)
    store.record_telemetry_event(
        surface="portal",
        event_name="portal_copilot_onboarding_lookup",
        actor_type="internal",
        actor_id=actor.actor_id,
        route="/internal-ai/knowledge/onboarding",
        outcome="success",
        details={"role": role, "resultCount": len(items)},
    )
    return items


@router.get("/content/draft")
async def get_content_draft(
    actor: Annotated[InternalActor, Depends(require_design_workflow_access)],
    brief_id: str | None = Query(default=None, alias="briefId"),
) -> ContentDraft | None:
    draft = internal_ai_tools_service.generate_content_draft(
        brief_id=brief_id,
        actor_email=actor.email,
    )
    store.record_telemetry_event(
        surface="portal",
        event_name="portal_copilot_content_draft",
        actor_type="internal",
        actor_id=actor.actor_id,
        route="/internal-ai/content/draft",
        outcome="success" if draft else "failure",
        details={"briefId": brief_id},
    )
    return draft


@router.get("/forecast/summaries")
async def get_forecast_summaries(
    actor: Annotated[InternalActor, Depends(require_forecast_access)],
) -> list[ForecastSummary]:
    """Get forecast summaries for internal AI copilot."""
    items = internal_ai_tools_service.summarize_forecast_runs(actor.email)
    store.record_telemetry_event(
        surface="portal",
        event_name="portal_copilot_forecast_summary",
        actor_type="internal",
        actor_id=actor.actor_id,
        route="/internal-ai/forecast/summaries",
        outcome="success",
        details={"resultCount": len(items)},
    )
    return items


@router.get("/production-plans/summaries")
async def get_production_plan_summaries(
    actor: Annotated[InternalActor, Depends(require_production_access)],
) -> list[ProductionPlanSummary]:
    """Get production plan summaries for internal AI copilot."""
    items = internal_ai_tools_service.summarize_production_plans(actor.email)
    store.record_telemetry_event(
        surface="portal",
        event_name="portal_copilot_production_plan_summary",
        actor_type="internal",
        actor_id=actor.actor_id,
        route="/internal-ai/production-plans/summaries",
        outcome="success",
        details={"resultCount": len(items)},
    )
    return items


@router.get("/insights/performance")
async def get_performance_summary(
    actor: Annotated[InternalActor, Depends(require_approval_access)],
) -> LeadershipInsight:
    insight = internal_ai_tools_service.get_performance_summary(actor.email)
    store.record_telemetry_event(
        surface="portal",
        event_name="portal_copilot_performance_summary",
        actor_type="internal",
        actor_id=actor.actor_id,
        route="/internal-ai/insights/performance",
        outcome="success",
    )
    return insight


@router.get("/insights/launch-readiness")
async def get_launch_readiness_summary(
    actor: Annotated[InternalActor, Depends(require_approval_access)],
) -> LeadershipInsight:
    insight = internal_ai_tools_service.get_launch_readiness_insight(actor.email)
    store.record_telemetry_event(
        surface="portal",
        event_name="portal_copilot_launch_readiness_summary",
        actor_type="internal",
        actor_id=actor.actor_id,
        route="/internal-ai/insights/launch-readiness",
        outcome="success",
    )
    return insight


@router.get("/insights/merchandising")
async def get_merchandising_summary(
    actor: Annotated[InternalActor, Depends(require_approval_access)],
) -> LeadershipInsight:
    insight = internal_ai_tools_service.get_merchandising_insight(actor.email)
    store.record_telemetry_event(
        surface="portal",
        event_name="portal_copilot_merchandising_summary",
        actor_type="internal",
        actor_id=actor.actor_id,
        route="/internal-ai/insights/merchandising",
        outcome="success",
    )
    return insight


@router.get("/workflow-status")
async def get_workflow_status_summary(
    actor: Annotated[InternalActor, Depends(require_approval_access)],
) -> dict:
    """Get overall workflow status summary for dashboard."""
    summary = internal_ai_tools_service.get_workflow_status_summary(actor.email)
    store.record_telemetry_event(
        surface="portal",
        event_name="portal_copilot_workflow_status",
        actor_type="internal",
        actor_id=actor.actor_id,
        route="/internal-ai/workflow-status",
        outcome="success",
        details={
            "briefsCount": summary.get("briefs_count", 0),
            "approvalsCount": summary.get("approvals_count", 0),
            "forecastsCount": summary.get("forecasts_count", 0),
            "plansCount": summary.get("plans_count", 0),
        },
    )
    return summary
