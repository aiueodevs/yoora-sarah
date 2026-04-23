from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.router import router as api_router
from app.core.config import get_settings


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield


settings = get_settings()

app = FastAPI(
    title=settings.project_name,
    version="0.1.0",
    lifespan=lifespan,
)
app.include_router(api_router, prefix="/api")
