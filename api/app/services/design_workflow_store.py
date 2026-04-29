from __future__ import annotations

from collections.abc import Iterator
from contextlib import contextmanager
from datetime import datetime

import psycopg
from fastapi import HTTPException, status
from psycopg.rows import dict_row

from app.schemas.brief import (
    Brief,
    BriefCreate,
    BriefUpdate,
    DesignAnnotation,
    DesignAnnotationCreateRequest,
    DesignGenerationJob,
    DesignGenerationJobCreate,
    DesignOption,
)


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


class DesignWorkflowStore:
    @contextmanager
    def _connect(self) -> Iterator[psycopg.Connection]:
        from app.core.config import get_settings

        settings = get_settings()
        with psycopg.connect(settings.database_url, row_factory=dict_row) as conn:
            yield conn

    # ===== BRIEFS =====

    def create_brief(self, payload: BriefCreate, actor_id: str) -> Brief:
        brand_id = _parse_external_id(payload.brand_id, "brand")
        actor_user_id = self._resolve_actor_user_id(actor_id)

        try:
            with self._connect() as conn, conn.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO briefs (
                        brand_id,
                        created_by_user_id,
                        title,
                        category,
                        target_segment,
                        campaign_name,
                        notes,
                        status
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, 'draft')
                    RETURNING *;
                    """,
                    (
                        brand_id,
                        actor_user_id,
                        payload.title,
                        payload.category,
                        payload.target_segment,
                        payload.campaign_name,
                        payload.notes,
                    ),
                )
                row = cursor.fetchone()
                conn.commit()
        except psycopg.errors.ForeignKeyViolation as exc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Brand not found.",
            ) from exc

        return self._brief_row_to_model(row)

    def list_briefs(self, brand_filter: str | None = None) -> list[Brief]:
        with self._connect() as conn, conn.cursor() as cursor:
            params = []
            where_clause = ""
            if brand_filter:
                brand_id = _parse_external_id(brand_filter, "brand")
                where_clause = "WHERE briefs.brand_id = %s"
                params.append(brand_id)

            cursor.execute(
                f"""
                SELECT
                    briefs.*,
                    brands.name as brand_name,
                    users.email as created_by_email
                FROM briefs
                JOIN brands ON brands.brand_id = briefs.brand_id
                JOIN users ON users.user_id = briefs.created_by_user_id
                {where_clause}
                ORDER BY briefs.created_at DESC;
                """,
                params,
            )
            rows = cursor.fetchall()

        return [self._brief_row_to_model(row) for row in rows]

    def get_brief(self, brief_id: str) -> Brief:
        bid = _parse_external_id(brief_id, "brief")

        with self._connect() as conn, conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    briefs.*,
                    brands.name as brand_name,
                    users.email as created_by_email
                FROM briefs
                JOIN brands ON brands.brand_id = briefs.brand_id
                JOIN users ON users.user_id = briefs.created_by_user_id
                WHERE briefs.brief_id = %s;
                """,
                (bid,),
            )
            row = cursor.fetchone()

        if row is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Brief not found.",
            )

        return self._brief_row_to_model(row)

    def update_brief(self, brief_id: str, payload: BriefUpdate) -> Brief:
        bid = _parse_external_id(brief_id, "brief")

        updates = []
        values = []
        for field, value in payload.model_dump(exclude_unset=True).items():
            if value is not None:
                updates.append(f"{field} = %s")
                values.append(value)

        if not updates:
            return self.get_brief(brief_id)

        values.append(datetime.now())
        updates.append("updated_at = %s")
        values.append(bid)

        try:
            with self._connect() as conn, conn.cursor() as cursor:
                cursor.execute(
                    f"""
                    UPDATE briefs
                    SET {", ".join(updates)}
                    WHERE brief_id = %s
                    RETURNING *;
                    """,
                    values,
                )
                cursor.fetchone()
                conn.commit()
        except psycopg.errors.CheckViolation as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid status value.",
            ) from exc

        return self.get_brief(brief_id)

    def _brief_row_to_model(self, row: dict) -> Brief:
        return Brief(
            id=_external_id("brief", row["brief_id"]) or "",
            brand_id=_external_id("brand", row["brand_id"]) or "",
            brand_name=row.get("brand_name"),
            created_by_user_id=_external_id("user", row["created_by_user_id"]) or "",
            created_by_email=row.get("created_by_email"),
            title=row["title"],
            category=row["category"],
            target_segment=row["target_segment"],
            campaign_name=row.get("campaign_name"),
            notes=row.get("notes"),
            status=row["status"],
            metadata=row.get("metadata", {}),
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )

    # ===== DESIGN GENERATION JOBS =====

    def create_design_job(
        self, payload: DesignGenerationJobCreate, actor_id: str
    ) -> DesignGenerationJob:
        brief_id = _parse_external_id(payload.brief_id, "brief")
        actor_user_id = self._resolve_actor_user_id(actor_id)

        with self._connect() as conn, conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO design_generation_jobs (
                    brief_id,
                    requested_by_user_id,
                    variation_count,
                    status,
                    prompt_version
                )
                VALUES (%s, %s, %s, 'queued', %s)
                RETURNING *;
                """,
                (
                    brief_id,
                    actor_user_id,
                    payload.variation_count,
                    payload.prompt_version,
                ),
            )
            row = cursor.fetchone()
            conn.commit()

        return self._job_row_to_model(row)

    def list_design_jobs(
        self, brief_id: str | None = None, status_filter: str | None = None
    ) -> list[DesignGenerationJob]:
        with self._connect() as conn, conn.cursor() as cursor:
            params = []
            conditions = []

            if brief_id:
                bid = _parse_external_id(brief_id, "brief")
                conditions.append("design_generation_jobs.brief_id = %s")
                params.append(bid)

            if status_filter:
                conditions.append("design_generation_jobs.status = %s")
                params.append(status_filter)

            where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

            cursor.execute(
                f"""
                SELECT
                    design_generation_jobs.*,
                    briefs.title as brief_title,
                    users.email as requested_by_email
                FROM design_generation_jobs
                JOIN briefs ON briefs.brief_id = design_generation_jobs.brief_id
                JOIN users ON users.user_id = design_generation_jobs.requested_by_user_id
                {where_clause}
                ORDER BY design_generation_jobs.created_at DESC;
                """,
                params,
            )
            rows = cursor.fetchall()

        return [self._job_row_to_model(row) for row in rows]

    def get_design_job(self, job_id: str) -> DesignGenerationJob:
        jid = _parse_external_id(job_id, "design_generation_job")

        with self._connect() as conn, conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    design_generation_jobs.*,
                    briefs.title as brief_title,
                    users.email as requested_by_email
                FROM design_generation_jobs
                JOIN briefs ON briefs.brief_id = design_generation_jobs.brief_id
                JOIN users ON users.user_id = design_generation_jobs.requested_by_user_id
                WHERE design_generation_jobs.design_generation_job_id = %s;
                """,
                (jid,),
            )
            row = cursor.fetchone()

        if row is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Design job not found.",
            )

        return self._job_row_to_model(row)

    def update_job_status(self, job_id: str, new_status: str) -> DesignGenerationJob:
        jid = _parse_external_id(job_id, "design_generation_job")

        with self._connect() as conn, conn.cursor() as cursor:
            cursor.execute(
                """
                UPDATE design_generation_jobs
                SET status = %s, updated_at = %s
                WHERE design_generation_job_id = %s
                RETURNING *;
                """,
                (new_status, datetime.now(), jid),
            )
            cursor.fetchone()
            conn.commit()

        return self.get_design_job(job_id)

    def _job_row_to_model(self, row: dict) -> DesignGenerationJob:
        return DesignGenerationJob(
            id=_external_id("design_generation_job", row["design_generation_job_id"])
            or "",
            brief_id=_external_id("brief", row["brief_id"]) or "",
            brief_title=row.get("brief_title"),
            requested_by_user_id=_external_id("user", row["requested_by_user_id"])
            or "",
            requested_by_email=row.get("requested_by_email"),
            variation_count=row["variation_count"],
            status=row["status"],
            prompt_version=row.get("prompt_version"),
            metadata=row.get("metadata", {}),
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )

    # ===== DESIGN OPTIONS =====

    def list_design_options(
        self, brief_id: str | None = None, job_id: str | None = None
    ) -> list[DesignOption]:
        with self._connect() as conn, conn.cursor() as cursor:
            params = []
            conditions = []

            if brief_id:
                bid = _parse_external_id(brief_id, "brief")
                conditions.append("design_options.brief_id = %s")
                params.append(bid)

            if job_id:
                jid = _parse_external_id(job_id, "design_generation_job")
                conditions.append("design_options.design_generation_job_id = %s")
                params.append(jid)

            where_clause = (
                f"WHERE {' AND '.join(conditions)}" if conditions else "WHERE 1=1"
            )

            cursor.execute(
                f"""
                SELECT design_options.*
                FROM design_options
                {where_clause}
                ORDER BY design_options.created_at DESC;
                """,
                params,
            )
            rows = cursor.fetchall()

        return [self._option_row_to_model(row) for row in rows]

    def get_design_option(self, option_id: str) -> DesignOption:
        oid = _parse_external_id(option_id, "design_option")

        with self._connect() as conn, conn.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM design_options WHERE design_option_id = %s;",
                (oid,),
            )
            row = cursor.fetchone()

        if row is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Design option not found.",
            )

        return self._option_row_to_model(row)

    def create_design_option(
        self,
        job_id: str,
        candidate_code: str,
        title: str,
        image_url: str | None = None,
        material_notes: str | None = None,
        rationale: str | None = None,
    ) -> DesignOption:
        jid = _parse_external_id(job_id, "design_generation_job")

        with self._connect() as conn, conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO design_options (
                    design_generation_job_id,
                    brief_id,
                    candidate_code,
                    title,
                    status,
                    image_url,
                    material_notes,
                    rationale
                )
                SELECT 
                    %s,
                    brief_id,
                    %s,
                    %s,
                    'generated',
                    %s,
                    %s,
                    %s
                FROM design_generation_jobs
                WHERE design_generation_job_id = %s
                RETURNING *;
                """,
                (
                    jid,
                    candidate_code,
                    title,
                    image_url,
                    material_notes,
                    rationale,
                    jid,
                ),
            )
            row = cursor.fetchone()
            conn.commit()

        return self._option_row_to_model(row)

    def update_option_status(self, option_id: str, new_status: str) -> DesignOption:
        oid = _parse_external_id(option_id, "design_option")

        with self._connect() as conn, conn.cursor() as cursor:
            cursor.execute(
                """
                UPDATE design_options
                SET status = %s
                WHERE design_option_id = %s
                RETURNING *;
                """,
                (new_status, oid),
            )
            cursor.fetchone()
            conn.commit()

        return self.get_design_option(option_id)

    def _option_row_to_model(self, row: dict) -> DesignOption:
        return DesignOption(
            id=_external_id("design_option", row["design_option_id"]) or "",
            design_generation_job_id=_external_id(
                "design_generation_job", row["design_generation_job_id"]
            )
            or "",
            brief_id=_external_id("brief", row["brief_id"]) or "",
            candidate_code=row["candidate_code"],
            title=row["title"],
            status=row["status"],
            image_url=row.get("image_url"),
            material_notes=row.get("material_notes"),
            rationale=row.get("rationale"),
            metadata=row.get("metadata", {}),
            created_at=row["created_at"],
        )

    # ===== DESIGN ANNOTATIONS =====

    def add_annotation(
        self, option_id: str, payload: DesignAnnotationCreateRequest, actor_id: str
    ) -> DesignAnnotation:
        oid = _parse_external_id(option_id, "design_option")
        actor_user_id = self._resolve_actor_user_id(actor_id)

        with self._connect() as conn, conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO design_annotations (
                    design_option_id,
                    author_user_id,
                    annotation_type,
                    note
                )
                VALUES (%s, %s, %s, %s)
                RETURNING *;
                """,
                (oid, actor_user_id, payload.annotation_type, payload.note),
            )
            row = cursor.fetchone()
            conn.commit()

        return self._annotation_row_to_model(row)

    def list_annotations(self, option_id: str) -> list[DesignAnnotation]:
        oid = _parse_external_id(option_id, "design_option")

        with self._connect() as conn, conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    design_annotations.*,
                    users.email as author_email
                FROM design_annotations
                JOIN users ON users.user_id = design_annotations.author_user_id
                WHERE design_annotations.design_option_id = %s
                ORDER BY design_annotations.created_at ASC;
                """,
                (oid,),
            )
            rows = cursor.fetchall()

        return [self._annotation_row_to_model(row) for row in rows]

    def _annotation_row_to_model(self, row: dict) -> DesignAnnotation:
        return DesignAnnotation(
            id=_external_id("design_annotation", row["design_annotation_id"]) or "",
            design_option_id=_external_id("design_option", row["design_option_id"])
            or "",
            author_user_id=_external_id("user", row["author_user_id"]) or "",
            author_email=row.get("author_email"),
            annotation_type=row["annotation_type"],
            note=row["note"],
            created_at=row["created_at"],
        )

    # ===== HELPER =====

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


design_store = DesignWorkflowStore()
