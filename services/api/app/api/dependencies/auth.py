from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status

from app.core.config import get_settings
from app.services.postgres_store import store


@dataclass(frozen=True)
class InternalActor:
    email: str | None
    roles: frozenset[str]
    auth_mode: str
    actor_id: str
    user_id: int | None


def _normalize_actor_id(email: str | None, user_id: int | None) -> str:
    if email:
        return email

    if user_id is not None:
        return f"user_{user_id}"

    return "system"


def _internal_api_auth_secret() -> str:
    return get_settings().internal_api_shared_secret.strip()


def require_internal_actor(
    internal_key: str | None = Header(default=None, alias="x-yoora-internal-key"),
    actor_email: str | None = Header(default=None, alias="x-yoora-actor-email"),
) -> InternalActor:
    configured_secret = _internal_api_auth_secret()
    normalized_email = actor_email.strip().lower() if actor_email else None
    user_id = store.find_user_id_by_email(normalized_email) if normalized_email else None

    if not configured_secret:
        return InternalActor(
            email=normalized_email,
            roles=frozenset(),
            auth_mode="open",
            actor_id=_normalize_actor_id(normalized_email, user_id),
            user_id=user_id,
        )

    if internal_key != configured_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid internal API key.",
        )

    if not normalized_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="x-yoora-actor-email is required when internal API auth is enabled.",
        )

    roles = frozenset(store.list_user_roles(normalized_email))
    if not roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Actor email is not assigned to an internal role.",
        )

    return InternalActor(
        email=normalized_email,
        roles=roles,
        auth_mode="enforced",
        actor_id=_normalize_actor_id(normalized_email, user_id),
        user_id=user_id,
    )


def require_actor_user_id(actor: InternalActor) -> int:
    if actor.user_id is not None:
        return actor.user_id

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Actor email must map to an internal user for this endpoint.",
    )


def require_roles(*allowed_roles: str) -> Callable[[InternalActor], InternalActor]:
    allowed = frozenset(allowed_roles)

    def dependency(
        actor: Annotated[InternalActor, Depends(require_internal_actor)],
    ) -> InternalActor:
        if actor.auth_mode == "open":
            return actor

        if actor.roles.intersection(allowed):
            return actor

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Actor role is not allowed for this endpoint.",
        )

    return dependency


require_master_data_read_access = require_roles(
    "owner",
    "design_lead",
    "pattern_lead",
    "planner",
    "ops_qa",
    "admin_data_tech",
)

require_master_data_write_access = require_roles(
    "owner",
    "ops_qa",
    "admin_data_tech",
)

require_design_workflow_access = require_roles(
    "owner",
    "design_lead",
    "pattern_lead",
    "admin_data_tech",
)

require_forecast_access = require_roles(
    "owner",
    "planner",
    "admin_data_tech",
)

require_approval_access = require_roles(
    "owner",
    "design_lead",
    "pattern_lead",
    "planner",
    "ops_qa",
    "admin_data_tech",
)

require_production_access = require_roles(
    "owner",
    "planner",
    "ops_qa",
    "admin_data_tech",
)

get_current_user = require_internal_actor
require_planner_access = require_forecast_access
