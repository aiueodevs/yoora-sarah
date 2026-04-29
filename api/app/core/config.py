from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    project_name: str = "Yoora Sarah Production Intelligence System"
    environment: str = "cloud"
    api_v1_prefix: str = "/api/v1"
    database_url: str
    internal_api_shared_secret: str = ""
    redis_url: str | None = None
    groq_api_key: str | None = None
    groq_model: str = "llama-3.1-8b-instant"

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[3] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
