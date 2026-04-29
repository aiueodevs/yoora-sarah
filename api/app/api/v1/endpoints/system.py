from pathlib import Path

from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter()


@router.get("/meta")
async def system_meta() -> dict[str, object]:
    settings = get_settings()
    contract_path = Path(__file__).resolve().parents[6] / "sdlc" / "api" / "openapi-internal-v1.yaml"
    return {
        "project": settings.project_name,
        "environment": settings.environment,
        "api_base_path": settings.api_v1_prefix,
        "api_contract": {
            "source": str(contract_path),
            "exists": contract_path.exists(),
        },
        "modules": [
            "portal",
            "api",
            "workers",
            "ai",
            "db",
        ],
    }
