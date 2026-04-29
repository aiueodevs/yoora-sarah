from fastapi import APIRouter, HTTPException, status

from app.services.postgres_store import store

router = APIRouter()


@router.get("/health")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok", "service": "api"}


@router.get("/ready")
async def readiness_check() -> dict[str, str]:
    try:
        store.check_connection()
    except Exception as exc:  # pragma: no cover - defensive path for runtime health probes
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection check failed.",
        ) from exc

    return {"status": "ready", "service": "api", "database": "ok"}
