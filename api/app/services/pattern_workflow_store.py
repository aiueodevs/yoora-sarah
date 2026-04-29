from __future__ import annotations

from collections.abc import Iterator
from contextlib import contextmanager
from datetime import datetime

import psycopg
from fastapi import HTTPException, status
from psycopg.rows import dict_row

from app.schemas.pattern import PatternJob, PatternJobCreate, PatternOutput


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


class PatternWorkflowStore:
    @contextmanager
    def _connect(self) -> Iterator[psycopg.Connection]:
        from app.core.config import get_settings

        settings = get_settings()
        with psycopg.connect(settings.database_url, row_factory=dict_row) as conn:
            yield conn

    def create_pattern_job(
        self, payload: PatternJobCreate, actor_id: str
    ) -> PatternJob:
        design_option_id = _parse_external_id(payload.design_option_id, "design_option")
        size_chart_id = _parse_external_id(payload.size_chart_id, "size_chart")
        actor_user_id = self._resolve_actor_user_id(actor_id)

        with self._connect() as conn, conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO pattern_jobs (
                    design_option_id,
                    size_chart_id,
                    requested_by_user_id,
                    status
                )
                VALUES (%s, %s, %s, 'queued')
                RETURNING *;
                """,
                (design_option_id, size_chart_id, actor_user_id),
            )
            row = cursor.fetchone()
            conn.commit()

        return self.get_pattern_job(_external_id("pattern_job", row["pattern_job_id"]))

    def list_pattern_jobs(
        self,
        design_option_id: str | None = None,
        status_filter: str | None = None,
    ) -> list[PatternJob]:
        with self._connect() as conn, conn.cursor() as cursor:
            params = []
            conditions = []

            if design_option_id:
                doid = _parse_external_id(design_option_id, "design_option")
                conditions.append("pattern_jobs.design_option_id = %s")
                params.append(doid)

            if status_filter:
                conditions.append("pattern_jobs.status = %s")
                params.append(status_filter)

            where_clause = (
                f"WHERE {' AND '.join(conditions)}" if conditions else "WHERE 1=1"
            )

            cursor.execute(
                f"""
                SELECT
                    pattern_jobs.*,
                    design_options.title as design_option_title,
                    size_charts.name as size_chart_name,
                    users.email as requested_by_email
                FROM pattern_jobs
                JOIN design_options ON design_options.design_option_id = pattern_jobs.design_option_id
                JOIN size_charts ON size_charts.size_chart_id = pattern_jobs.size_chart_id
                JOIN users ON users.user_id = pattern_jobs.requested_by_user_id
                {where_clause}
                ORDER BY pattern_jobs.created_at DESC;
                """,
                params,
            )
            rows = cursor.fetchall()

        return [self._job_row_to_model(row) for row in rows]

    def get_pattern_job(self, job_id: str) -> PatternJob:
        jid = _parse_external_id(job_id, "pattern_job")

        with self._connect() as conn, conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    pattern_jobs.*,
                    design_options.title as design_option_title,
                    size_charts.name as size_chart_name,
                    users.email as requested_by_email
                FROM pattern_jobs
                JOIN design_options ON design_options.design_option_id = pattern_jobs.design_option_id
                JOIN size_charts ON size_charts.size_chart_id = pattern_jobs.size_chart_id
                JOIN users ON users.user_id = pattern_jobs.requested_by_user_id
                WHERE pattern_jobs.pattern_job_id = %s;
                """,
                (jid,),
            )
            row = cursor.fetchone()

        if row is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pattern job not found.",
            )

        return self._job_row_to_model(row)

    def update_job_status(self, job_id: str, new_status: str) -> PatternJob:
        jid = _parse_external_id(job_id, "pattern_job")

        with self._connect() as conn, conn.cursor() as cursor:
            cursor.execute(
                """
                UPDATE pattern_jobs
                SET status = %s, updated_at = %s
                WHERE pattern_job_id = %s
                RETURNING *;
                """,
                (new_status, datetime.now(), jid),
            )
            cursor.fetchone()
            conn.commit()

        return self.get_pattern_job(job_id)

    def list_outputs(self, job_id: str) -> list[PatternOutput]:
        jid = _parse_external_id(job_id, "pattern_job")

        with self._connect() as conn, conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT * FROM pattern_outputs
                WHERE pattern_job_id = %s
                ORDER BY created_at DESC;
                """,
                (jid,),
            )
            rows = cursor.fetchall()

        return [self._output_row_to_model(row) for row in rows]

    def create_output(
        self,
        job_id: str,
        output_type: str,
        file_url: str,
        fabric_estimate_m: float | None = None,
        grading_notes: str | None = None,
    ) -> PatternOutput:
        jid = _parse_external_id(job_id, "pattern_job")

        with self._connect() as conn, conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO pattern_outputs (
                    pattern_job_id,
                    output_type,
                    file_url,
                    fabric_estimate_m,
                    grading_notes
                )
                VALUES (%s, %s, %s, %s, %s)
                RETURNING *;
                """,
                (jid, output_type, file_url, fabric_estimate_m, grading_notes),
            )
            row = cursor.fetchone()
            conn.commit()

        return self._output_row_to_model(row)

    def _job_row_to_model(self, row: dict) -> PatternJob:
        return PatternJob(
            id=_external_id("pattern_job", row["pattern_job_id"]) or "",
            design_option_id=_external_id("design_option", row["design_option_id"])
            or "",
            design_option_title=row.get("design_option_title"),
            size_chart_id=_external_id("size_chart", row["size_chart_id"]) or "",
            size_chart_name=row.get("size_chart_name"),
            requested_by_user_id=_external_id("user", row["requested_by_user_id"])
            or "",
            requested_by_email=row.get("requested_by_email"),
            status=row["status"],
            metadata=row.get("metadata", {}),
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )

    def _output_row_to_model(self, row: dict) -> PatternOutput:
        return PatternOutput(
            id=_external_id("pattern_output", row["pattern_output_id"]) or "",
            pattern_job_id=_external_id("pattern_job", row["pattern_job_id"]) or "",
            output_type=row["output_type"],
            file_url=row["file_url"],
            fabric_estimate_m=float(row["fabric_estimate_m"])
            if row.get("fabric_estimate_m")
            else None,
            grading_notes=row.get("grading_notes"),
            created_at=row["created_at"],
        )

    def _resolve_actor_user_id(self, actor_id: str) -> int:
        ACTOR_EMAIL_BY_ALIAS = {
            "user_owner": "owner@yoora.local",
            "user_design_lead": "design.lead@yoora.local",
            "user_pattern_lead": "pattern.lead@yoora.local",
            "user_planner": "planner@yoora.local",
            "user_ops_qa": "ops.qa@yoora.local",
            "user_admin_tech": "admin.tech@yoora.local",
        }

        email = ACTOR_EMAIL_BY_ALIAS.get(
            actor_id, actor_id if "@" in actor_id else None
        )

        with self._connect() as conn, conn.cursor() as cursor:
            if email is not None:
                cursor.execute(
                    "SELECT user_id FROM users WHERE LOWER(email) = LOWER(%s);",
                    (email,),
                )
                row = cursor.fetchone()
                if row:
                    return row["user_id"]

            if actor_id.startswith("user_") and actor_id[5:].isdigit():
                cursor.execute(
                    "SELECT user_id FROM users WHERE user_id = %s;",
                    (int(actor_id[5:]),),
                )
                row = cursor.fetchone()
                if row:
                    return row["user_id"]

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actor user not found.",
        )


pattern_store = PatternWorkflowStore()
