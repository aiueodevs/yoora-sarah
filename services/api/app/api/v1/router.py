from fastapi import APIRouter

from app.api.v1.endpoints.ai_tools import router as ai_tools_router
from app.api.v1.endpoints.ai_stylist import router as ai_stylist_router
from app.api.v1.endpoints.approvals import router as approvals_router
from app.api.v1.endpoints.audit import router as audit_router
from app.api.v1.endpoints.briefs import router as briefs_router
from app.api.v1.endpoints.catalog import router as catalog_router
from app.api.v1.endpoints.customers import router as customers_router
from app.api.v1.endpoints.design_jobs import router as design_jobs_router
from app.api.v1.endpoints.forecast import router as forecast_router
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.internal_ai import router as internal_ai_router
from app.api.v1.endpoints.master_data import router as master_data_router
from app.api.v1.endpoints.orders import router as orders_router
from app.api.v1.endpoints.pattern_jobs import router as pattern_jobs_router
from app.api.v1.endpoints.support import router as support_router
from app.api.v1.endpoints.system import router as system_router
from app.api.v1.endpoints.telemetry import router as telemetry_router

router = APIRouter()
router.include_router(health_router, tags=["health"])
router.include_router(catalog_router, tags=["catalog"])
router.include_router(customers_router, tags=["customers"])
router.include_router(orders_router, tags=["orders"])
router.include_router(support_router, tags=["support"])
router.include_router(master_data_router, tags=["master-data"])
router.include_router(briefs_router, tags=["briefs"])
router.include_router(design_jobs_router, tags=["design-jobs"])
router.include_router(pattern_jobs_router, tags=["pattern-jobs"])
router.include_router(forecast_router, tags=["forecast"])
router.include_router(approvals_router, tags=["approvals"])
router.include_router(audit_router, tags=["audit"])
router.include_router(telemetry_router, tags=["telemetry"])
router.include_router(ai_tools_router, tags=["ai-tools"])
router.include_router(ai_stylist_router, tags=["ai-stylist"])
router.include_router(internal_ai_router, tags=["internal-ai"])
router.include_router(system_router, prefix="/system", tags=["system"])
