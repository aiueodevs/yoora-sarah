from __future__ import annotations

from collections import defaultdict
from contextlib import contextmanager
from datetime import UTC, datetime
from typing import Iterator

import psycopg
from fastapi import HTTPException, status
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb

from app.core.config import get_settings
from app.schemas.approval import ApprovalActionRequest, ApprovalActionResponse, ApprovalRecord
from app.schemas.audit import AuditEvent
from app.schemas.master_data import (
    Brand,
    Collection,
    CreateBrandRequest,
    CreateCollectionRequest,
    CreateFabricRequest,
    CreateSizeChartRequest,
    Fabric,
    SizeChart,
    SizeChartEntry,
)
from app.schemas.telemetry import TelemetryEventRecord, TelemetryOutcome, TelemetrySummary

ACTOR_EMAIL_BY_ALIAS = {
    "user_owner": "owner@yoora.local",
    "user_design_lead": "design.lead@yoora.local",
    "user_pattern_lead": "pattern.lead@yoora.local",
    "user_planner": "planner@yoora.local",
    "user_ops_qa": "ops.qa@yoora.local",
    "user_admin_tech": "admin.tech@yoora.local",
}

ACTOR_ALIAS_BY_EMAIL = {email: alias for alias, email in ACTOR_EMAIL_BY_ALIAS.items()}


def _external_id(prefix: str, value: int | None) -> str | None:
    if value is None:
        return None
    return f"{prefix}_{value}"


def _parse_external_id(value: str, prefix: str) -> int:
    candidate = value.strip()
    expected_prefix = f"{prefix}_"
    if candidate.startswith(expected_prefix):
        candidate = candidate[len(expected_prefix) :]

    if not candidate.isdigit():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{prefix} id must be numeric or use the `{expected_prefix}<id>` format.",
        )

    return int(candidate)


def _normalize_actor_id(email: str | None, user_id: int | None) -> str:
    if email:
        alias = ACTOR_ALIAS_BY_EMAIL.get(email.lower())
        if alias:
            return alias
    return _external_id("user", user_id) or "system"


class PostgresStore:
    @contextmanager
    def _connect(self) -> Iterator[psycopg.Connection]:
        settings = get_settings()
        with psycopg.connect(settings.database_url, row_factory=dict_row) as connection:
            yield connection

    def check_connection(self) -> None:
        with self._connect() as connection, connection.cursor() as cursor:
            cursor.execute("SELECT 1;")
            cursor.fetchone()

    def list_brands(self) -> list[Brand]:
        with self._connect() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT brand_id, code, name, brand_type, parent_brand_id, is_active
                FROM brands
                ORDER BY brand_id;
                """
            )
            rows = cursor.fetchall()

        return [
            Brand(
                id=_external_id("brand", row["brand_id"]),
                code=row["code"],
                name=row["name"],
                brand_type=row["brand_type"],
                parent_brand_id=_external_id("brand", row["parent_brand_id"]),
                is_active=row["is_active"],
            )
            for row in rows
        ]

    def list_user_roles(self, email: str) -> list[str]:
        with self._connect() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT roles.code
                FROM users
                JOIN user_role_assignments
                  ON user_role_assignments.user_id = users.user_id
                JOIN roles
                  ON roles.role_id = user_role_assignments.role_id
                WHERE LOWER(users.email) = LOWER(%s)
                ORDER BY roles.code;
                """,
                (email,),
            )
            rows = cursor.fetchall()

        return [row["code"] for row in rows]

    def find_user_id_by_email(self, email: str) -> int | None:
        with self._connect() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT user_id
                FROM users
                WHERE LOWER(email) = LOWER(%s);
                """,
                (email,),
            )
            row = cursor.fetchone()

        return row["user_id"] if row else None

    def create_brand(self, payload: CreateBrandRequest) -> Brand:
        parent_brand_id = (
            _parse_external_id(payload.parent_brand_id, "brand") if payload.parent_brand_id else None
        )

        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO brands (code, name, brand_type, parent_brand_id)
                    VALUES (%s, %s, %s, %s)
                    RETURNING brand_id, code, name, brand_type, parent_brand_id, is_active;
                    """,
                    (payload.code, payload.name, payload.brand_type, parent_brand_id),
                )
                row = cursor.fetchone()
                connection.commit()
        except psycopg.errors.UniqueViolation as exc:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Brand code already exists.") from exc
        except psycopg.errors.ForeignKeyViolation as exc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent brand was not found.") from exc

        return Brand(
            id=_external_id("brand", row["brand_id"]),
            code=row["code"],
            name=row["name"],
            brand_type=row["brand_type"],
            parent_brand_id=_external_id("brand", row["parent_brand_id"]),
            is_active=row["is_active"],
        )

    def list_collections(self) -> list[Collection]:
        with self._connect() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT collection_id, brand_id, name, campaign_name, status
                FROM collections
                ORDER BY collection_id;
                """
            )
            rows = cursor.fetchall()

        return [
            Collection(
                id=_external_id("collection", row["collection_id"]),
                brand_id=_external_id("brand", row["brand_id"]) or "",
                name=row["name"],
                campaign_name=row["campaign_name"],
                status=row["status"],
            )
            for row in rows
        ]

    def create_collection(self, payload: CreateCollectionRequest) -> Collection:
        brand_id = _parse_external_id(payload.brand_id, "brand")

        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO collections (brand_id, name, campaign_name, status)
                    VALUES (%s, %s, %s, %s)
                    RETURNING collection_id, brand_id, name, campaign_name, status;
                    """,
                    (brand_id, payload.name, payload.campaign_name, payload.status),
                )
                row = cursor.fetchone()
                connection.commit()
        except psycopg.errors.ForeignKeyViolation as exc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand was not found.") from exc

        return Collection(
            id=_external_id("collection", row["collection_id"]),
            brand_id=_external_id("brand", row["brand_id"]) or "",
            name=row["name"],
            campaign_name=row["campaign_name"],
            status=row["status"],
        )

    def list_fabrics(self) -> list[Fabric]:
        with self._connect() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT fabric_id, code, name, composition, notes
                FROM fabrics
                ORDER BY fabric_id;
                """
            )
            rows = cursor.fetchall()

        return [
            Fabric(
                id=_external_id("fabric", row["fabric_id"]) or "",
                code=row["code"],
                name=row["name"],
                composition=row["composition"],
                notes=row["notes"],
            )
            for row in rows
        ]

    def create_fabric(self, payload: CreateFabricRequest) -> Fabric:
        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO fabrics (code, name, composition, notes)
                    VALUES (%s, %s, %s, %s)
                    RETURNING fabric_id, code, name, composition, notes;
                    """,
                    (payload.code, payload.name, payload.composition, payload.notes),
                )
                row = cursor.fetchone()
                connection.commit()
        except psycopg.errors.UniqueViolation as exc:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Fabric code already exists.") from exc

        return Fabric(
            id=_external_id("fabric", row["fabric_id"]) or "",
            code=row["code"],
            name=row["name"],
            composition=row["composition"],
            notes=row["notes"],
        )

    def list_size_charts(self) -> list[SizeChart]:
        with self._connect() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT size_chart_id, brand_id, code, name, gender_scope
                FROM size_charts
                ORDER BY size_chart_id;
                """
            )
            charts = cursor.fetchall()

            cursor.execute(
                """
                SELECT size_chart_id, size_code, bust_cm, waist_cm, hip_cm, length_cm
                FROM size_chart_entries
                ORDER BY size_chart_id, size_chart_entry_id;
                """
            )
            entries = cursor.fetchall()

        entries_by_chart: dict[int, list[SizeChartEntry]] = defaultdict(list)
        for row in entries:
            entries_by_chart[row["size_chart_id"]].append(
                SizeChartEntry(
                    size_code=row["size_code"],
                    bust_cm=float(row["bust_cm"]) if row["bust_cm"] is not None else None,
                    waist_cm=float(row["waist_cm"]) if row["waist_cm"] is not None else None,
                    hip_cm=float(row["hip_cm"]) if row["hip_cm"] is not None else None,
                    length_cm=float(row["length_cm"]) if row["length_cm"] is not None else None,
                )
            )

        return [
            SizeChart(
                id=_external_id("size_chart", row["size_chart_id"]) or "",
                brand_id=_external_id("brand", row["brand_id"]) or "",
                code=row["code"],
                name=row["name"],
                gender_scope=row["gender_scope"],
                entries=entries_by_chart[row["size_chart_id"]],
            )
            for row in charts
        ]

    def create_size_chart(self, payload: CreateSizeChartRequest) -> SizeChart:
        brand_id = _parse_external_id(payload.brand_id, "brand")

        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO size_charts (brand_id, code, name, gender_scope)
                    VALUES (%s, %s, %s, %s)
                    RETURNING size_chart_id, brand_id, code, name, gender_scope;
                    """,
                    (brand_id, payload.code, payload.name, payload.gender_scope),
                )
                chart = cursor.fetchone()

                entries: list[SizeChartEntry] = []
                for entry in payload.entries:
                    cursor.execute(
                        """
                        INSERT INTO size_chart_entries (
                          size_chart_id,
                          size_code,
                          bust_cm,
                          waist_cm,
                          hip_cm,
                          length_cm
                        )
                        VALUES (%s, %s, %s, %s, %s, %s);
                        """,
                        (
                            chart["size_chart_id"],
                            entry.size_code,
                            entry.bust_cm,
                            entry.waist_cm,
                            entry.hip_cm,
                            entry.length_cm,
                        ),
                    )
                    entries.append(entry)

                connection.commit()
        except psycopg.errors.UniqueViolation as exc:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Size chart code or size code already exists for this brand.",
            ) from exc
        except psycopg.errors.ForeignKeyViolation as exc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand was not found.") from exc

        return SizeChart(
            id=_external_id("size_chart", chart["size_chart_id"]) or "",
            brand_id=_external_id("brand", chart["brand_id"]) or "",
            code=chart["code"],
            name=chart["name"],
            gender_scope=chart["gender_scope"],
            entries=entries,
        )

    def list_approvals(self) -> list[ApprovalRecord]:
        with self._connect() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT approval_id, reference_type, reference_id, current_status, updated_at
                FROM approvals
                ORDER BY updated_at DESC, approval_id DESC;
                """
            )
            rows = cursor.fetchall()

        return [
            ApprovalRecord(
                id=_external_id("approval", row["approval_id"]) or "",
                artifact_type=row["reference_type"],
                artifact_id=row["reference_id"],
                current_status=row["current_status"],
                updated_at=row["updated_at"],
            )
            for row in rows
        ]

    def list_audit_events(self) -> list[AuditEvent]:
        with self._connect() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                  audit_events.audit_event_id,
                  audit_events.event_type,
                  audit_events.reference_type,
                  audit_events.reference_id,
                  audit_events.event_payload,
                  audit_events.created_at,
                  users.user_id,
                  users.email
                FROM audit_events
                LEFT JOIN users
                  ON users.user_id = audit_events.actor_user_id
                ORDER BY audit_events.created_at DESC, audit_events.audit_event_id DESC;
                """
            )
            rows = cursor.fetchall()

        items: list[AuditEvent] = []
        for row in rows:
            event_payload = row["event_payload"] or {}
            notes = event_payload.get("reason") or event_payload.get("notes")
            items.append(
                AuditEvent(
                    id=_external_id("audit", row["audit_event_id"]) or "",
                    actor_id=_normalize_actor_id(row["email"], row["user_id"]),
                    event_type=row["event_type"],
                    reference_type=row["reference_type"],
                    reference_id=row["reference_id"],
                    notes=notes,
                    timestamp=row["created_at"],
                )
            )
        return items

    def record_telemetry_event(
        self,
        *,
        surface: str,
        event_name: str,
        actor_type: str,
        actor_id: str | None = None,
        route: str | None = None,
        outcome: TelemetryOutcome = "info",
        reference_type: str | None = None,
        reference_id: str | None = None,
        details: dict | None = None,
    ) -> TelemetryEventRecord | None:
        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO telemetry_events (
                      surface,
                      event_name,
                      actor_type,
                      actor_id,
                      route,
                      outcome,
                      reference_type,
                      reference_id,
                      details
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb)
                    RETURNING
                      telemetry_event_id,
                      surface,
                      event_name,
                      actor_type,
                      actor_id,
                      route,
                      outcome,
                      reference_type,
                      reference_id,
                      details,
                      created_at;
                    """,
                    (
                        surface,
                        event_name,
                        actor_type,
                        actor_id,
                        route,
                        outcome,
                        reference_type,
                        reference_id,
                        Jsonb(details or {}),
                    ),
                )
                row = cursor.fetchone()
                connection.commit()
        except psycopg.Error:
            return None

        return TelemetryEventRecord(
            id=_external_id("telemetry", row["telemetry_event_id"]) or "",
            surface=row["surface"],
            event_name=row["event_name"],
            actor_type=row["actor_type"],
            actor_id=row["actor_id"],
            route=row["route"],
            outcome=row["outcome"],
            reference_type=row["reference_type"],
            reference_id=row["reference_id"],
            details=row["details"] or {},
            timestamp=row["created_at"],
        )

    def list_telemetry_events(
        self,
        *,
        limit: int = 100,
        surface: str | None = None,
        actor_type: str | None = None,
        outcome: TelemetryOutcome | None = None,
    ) -> list[TelemetryEventRecord]:
        clauses = ["TRUE"]
        params: list[object] = []

        if surface:
            clauses.append("surface = %s")
            params.append(surface)
        if actor_type:
            clauses.append("actor_type = %s")
            params.append(actor_type)
        if outcome:
            clauses.append("outcome = %s")
            params.append(outcome)

        params.append(limit)
        where_clause = " AND ".join(clauses)

        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    f"""
                    SELECT
                      telemetry_event_id,
                      surface,
                      event_name,
                      actor_type,
                      actor_id,
                      route,
                      outcome,
                      reference_type,
                      reference_id,
                      details,
                      created_at
                    FROM telemetry_events
                    WHERE {where_clause}
                    ORDER BY created_at DESC, telemetry_event_id DESC
                    LIMIT %s;
                    """,
                    params,
                )
                rows = cursor.fetchall()
        except psycopg.Error:
            return []

        return [
            TelemetryEventRecord(
                id=_external_id("telemetry", row["telemetry_event_id"]) or "",
                surface=row["surface"],
                event_name=row["event_name"],
                actor_type=row["actor_type"],
                actor_id=row["actor_id"],
                route=row["route"],
                outcome=row["outcome"],
                reference_type=row["reference_type"],
                reference_id=row["reference_id"],
                details=row["details"] or {},
                timestamp=row["created_at"],
            )
            for row in rows
        ]

    def summarize_telemetry_events(self, window_hours: int = 24) -> TelemetrySummary:
        total = 0
        by_surface: dict[str, int] = {}
        by_outcome: dict[str, int] = {}
        by_event_name: dict[str, int] = {}

        try:
            with self._connect() as connection, connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT COUNT(*) AS count
                    FROM telemetry_events
                    WHERE created_at >= now() - (%s * INTERVAL '1 hour');
                    """,
                    (window_hours,),
                )
                total_row = cursor.fetchone()
                total = int(total_row["count"]) if total_row else 0

                cursor.execute(
                    """
                    SELECT surface, COUNT(*) AS count
                    FROM telemetry_events
                    WHERE created_at >= now() - (%s * INTERVAL '1 hour')
                    GROUP BY surface
                    ORDER BY count DESC, surface ASC;
                    """,
                    (window_hours,),
                )
                by_surface = {row["surface"]: int(row["count"]) for row in cursor.fetchall()}

                cursor.execute(
                    """
                    SELECT outcome, COUNT(*) AS count
                    FROM telemetry_events
                    WHERE created_at >= now() - (%s * INTERVAL '1 hour')
                    GROUP BY outcome
                    ORDER BY count DESC, outcome ASC;
                    """,
                    (window_hours,),
                )
                by_outcome = {row["outcome"]: int(row["count"]) for row in cursor.fetchall()}

                cursor.execute(
                    """
                    SELECT event_name, COUNT(*) AS count
                    FROM telemetry_events
                    WHERE created_at >= now() - (%s * INTERVAL '1 hour')
                    GROUP BY event_name
                    ORDER BY count DESC, event_name ASC
                    LIMIT 20;
                    """,
                    (window_hours,),
                )
                by_event_name = {
                    row["event_name"]: int(row["count"]) for row in cursor.fetchall()
                }
        except psycopg.Error:
            pass

        return TelemetrySummary(
            window_hours=window_hours,
            total=total,
            by_surface=by_surface,
            by_outcome=by_outcome,
            by_event_name=by_event_name,
        )

    def submit_approval_action(self, payload: ApprovalActionRequest) -> ApprovalActionResponse:
        actor_user_id = self._resolve_actor_user_id(payload.actor_id)
        now = datetime.now(UTC)
        current_status = {
            "approve": "approved",
            "reject": "rejected",
            "request_changes": "changes_requested",
        }[payload.action]

        with self._connect() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT approval_id
                FROM approvals
                WHERE reference_type = %s AND reference_id = %s;
                """,
                (payload.artifact_type, payload.artifact_id),
            )
            existing = cursor.fetchone()

            if existing is None:
                cursor.execute(
                    """
                    INSERT INTO approvals (reference_type, reference_id, current_status, updated_at)
                    VALUES (%s, %s, %s, %s)
                    RETURNING approval_id;
                    """,
                    (payload.artifact_type, payload.artifact_id, current_status, now),
                )
                approval_id = cursor.fetchone()["approval_id"]
            else:
                approval_id = existing["approval_id"]
                cursor.execute(
                    """
                    UPDATE approvals
                    SET current_status = %s, updated_at = %s
                    WHERE approval_id = %s;
                    """,
                    (current_status, now, approval_id),
                )

            cursor.execute(
                """
                INSERT INTO approval_actions (approval_id, actor_user_id, action, reason, created_at)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING approval_action_id, created_at;
                """,
                (approval_id, actor_user_id, payload.action, payload.reason, now),
            )
            action_row = cursor.fetchone()

            cursor.execute(
                """
                INSERT INTO audit_events (
                  actor_user_id,
                  event_type,
                  reference_type,
                  reference_id,
                  event_payload,
                  created_at
                )
                VALUES (%s, %s, %s, %s, %s::jsonb, %s);
                """,
                (
                    actor_user_id,
                    f"approval_{payload.action}",
                    payload.artifact_type,
                    payload.artifact_id,
                    Jsonb({"reason": payload.reason}),
                    now,
                ),
            )
            connection.commit()

        return ApprovalActionResponse(
            id=_external_id("approval_action", action_row["approval_action_id"]) or "",
            artifact_type=payload.artifact_type,
            artifact_id=payload.artifact_id,
            action=payload.action,
            actor_id=payload.actor_id,
            timestamp=action_row["created_at"],
        )

    def _resolve_actor_user_id(self, actor_id: str) -> int:
        email = ACTOR_EMAIL_BY_ALIAS.get(actor_id, actor_id if "@" in actor_id else None)

        with self._connect() as connection, connection.cursor() as cursor:
            if email is not None:
                cursor.execute(
                    """
                    SELECT user_id
                    FROM users
                    WHERE LOWER(email) = LOWER(%s);
                    """,
                    (email,),
                )
                row = cursor.fetchone()
                if row:
                    return row["user_id"]

            if actor_id.startswith("user_") and actor_id[5:].isdigit():
                cursor.execute("SELECT user_id FROM users WHERE user_id = %s;", (int(actor_id[5:]),))
                row = cursor.fetchone()
                if row:
                    return row["user_id"]

        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Actor user was not found.")


store = PostgresStore()
