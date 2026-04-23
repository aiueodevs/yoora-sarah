from __future__ import annotations

from contextlib import contextmanager
from datetime import datetime
from typing import Iterator, Optional

import psycopg
from psycopg.rows import dict_row

from app.schemas.forecast import (
    ForecastRun,
    ForecastRunCreate,
    ForecastRunUpdate,
    ForecastRecommendation,
    ForecastSizeMix,
    ForecastColorMix,
    AllocationRecommendation,
    ProductionPlan,
    ProductionPlanCreate,
    ProductionPlanUpdate,
    ProductionPlanLineCreate,
    ProductionPlanLine,
)


def _external_id(prefix: str, value: int | None) -> str | None:
    if value is None:
        return None
    return f"{prefix}_{value}"


class ForecastWorkflowStore:
    @contextmanager
    def _connect(self) -> Iterator[psycopg.Connection]:
        from app.core.config import get_settings

        settings = get_settings()
        conn = psycopg.connect(settings.database_url, row_factory=dict_row)
        try:
            yield conn
        finally:
            conn.close()

    # Forecast Runs
    def create_forecast_run(
        self,
        data: ForecastRunCreate,
        requested_by_user_id: int,
    ) -> ForecastRun:
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO forecast_runs (collection_id, requested_by_user_id, status, metadata)
                    VALUES (%s, %s, 'queued', %s)
                    RETURNING forecast_run_id, collection_id, requested_by_user_id, status, 
                             model_version, confidence_score, metadata, created_at, updated_at
                    """,
                    (
                        data.collection_id,
                        requested_by_user_id,
                        psycopg.types.json.Jsonb({}),
                    ),
                )
                row = cur.fetchone()
                conn.commit()

                user_email = self._get_user_email(requested_by_user_id)

                return ForecastRun(
                    forecast_run_id=row["forecast_run_id"],
                    collection_id=row["collection_id"],
                    requested_by_user_id=row["requested_by_user_id"],
                    requested_by_email=user_email,
                    status=row["status"],
                    model_version=row["model_version"],
                    confidence_score=row["confidence_score"],
                    metadata=row["metadata"] or {},
                    created_at=row["created_at"],
                    updated_at=row["updated_at"],
                )

    def get_forecast_run(self, forecast_run_id: int) -> Optional[ForecastRun]:
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT fr.forecast_run_id, fr.collection_id, fr.requested_by_user_id, 
                           fr.status, fr.model_version, fr.confidence_score, fr.metadata,
                           fr.created_at, fr.updated_at,
                           u.email as requested_by_email
                    FROM forecast_runs fr
                    JOIN users u ON fr.requested_by_user_id = u.user_id
                    WHERE fr.forecast_run_id = %s
                    """,
                    (forecast_run_id,),
                )
                row = cur.fetchone()
                if not row:
                    return None

                return ForecastRun(
                    forecast_run_id=row["forecast_run_id"],
                    collection_id=row["collection_id"],
                    requested_by_user_id=row["requested_by_user_id"],
                    requested_by_email=row.get("requested_by_email"),
                    status=row["status"],
                    model_version=row["model_version"],
                    confidence_score=row["confidence_score"],
                    metadata=row["metadata"] or {},
                    created_at=row["created_at"],
                    updated_at=row["updated_at"],
                )

    def list_forecast_runs(
        self,
        collection_id: Optional[int] = None,
        status: Optional[str] = None,
        limit: int = 50,
    ) -> list[ForecastRun]:
        with self._connect() as conn:
            with conn.cursor() as cur:
                conditions = []
                params = []

                if collection_id is not None:
                    conditions.append("fr.collection_id = %s")
                    params.append(collection_id)
                if status is not None:
                    conditions.append("fr.status = %s")
                    params.append(status)

                where_clause = " AND ".join(conditions) if conditions else "TRUE"
                params.append(limit)

                cur.execute(
                    f"""
                    SELECT fr.forecast_run_id, fr.collection_id, fr.requested_by_user_id, 
                           fr.status, fr.model_version, fr.confidence_score, fr.metadata,
                           fr.created_at, fr.updated_at,
                           u.email as requested_by_email
                    FROM forecast_runs fr
                    JOIN users u ON fr.requested_by_user_id = u.user_id
                    WHERE {where_clause}
                    ORDER BY fr.created_at DESC
                    LIMIT %s
                    """,
                    params,
                )
                rows = cur.fetchall()

                return [
                    ForecastRun(
                        forecast_run_id=row["forecast_run_id"],
                        collection_id=row["collection_id"],
                        requested_by_user_id=row["requested_by_user_id"],
                        requested_by_email=row.get("requested_by_email"),
                        status=row["status"],
                        model_version=row["model_version"],
                        confidence_score=row["confidence_score"],
                        metadata=row["metadata"] or {},
                        created_at=row["created_at"],
                        updated_at=row["updated_at"],
                    )
                    for row in rows
                ]

    def update_forecast_run(
        self, forecast_run_id: int, data: ForecastRunUpdate
    ) -> Optional[ForecastRun]:
        fields = []
        params = []

        if data.status is not None:
            fields.append("status = %s")
            params.append(data.status)
        if data.model_version is not None:
            fields.append("model_version = %s")
            params.append(data.model_version)
        if data.confidence_score is not None:
            fields.append("confidence_score = %s")
            params.append(data.confidence_score)
        if data.metadata is not None:
            fields.append("metadata = %s")
            params.append(data.metadata)

        if not fields:
            return self.get_forecast_run(forecast_run_id)

        fields.append("updated_at = CURRENT_TIMESTAMP")
        params.append(forecast_run_id)

        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    UPDATE forecast_runs
                    SET {", ".join(fields)}
                    WHERE forecast_run_id = %s
                    RETURNING forecast_run_id, collection_id, requested_by_user_id, status, 
                             model_version, confidence_score, metadata, created_at, updated_at
                    """,
                    params,
                )
                row = cur.fetchone()
                conn.commit()

                if not row:
                    return None

                user_email = self._get_user_email(row["requested_by_user_id"])

                return ForecastRun(
                    forecast_run_id=row["forecast_run_id"],
                    collection_id=row["collection_id"],
                    requested_by_user_id=row["requested_by_user_id"],
                    requested_by_email=user_email,
                    status=row["status"],
                    model_version=row["model_version"],
                    confidence_score=row["confidence_score"],
                    metadata=row["metadata"] or {},
                    created_at=row["created_at"],
                    updated_at=row["updated_at"],
                )

    # Forecast Recommendations
    def get_forecast_recommendation(
        self, forecast_run_id: int
    ) -> Optional[ForecastRecommendation]:
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT forecast_recommendation_id, forecast_run_id, recommendation_summary,
                           projected_total_units, rationale, created_at
                    FROM forecast_recommendations
                    WHERE forecast_run_id = %s
                    """,
                    (forecast_run_id,),
                )
                row = cur.fetchone()
                if not row:
                    return None

                return ForecastRecommendation(
                    forecast_recommendation_id=row["forecast_recommendation_id"],
                    forecast_run_id=row["forecast_run_id"],
                    recommendation_summary=row["recommendation_summary"],
                    projected_total_units=row["projected_total_units"],
                    rationale=row["rationale"],
                    created_at=row["created_at"],
                )

    def create_forecast_recommendation(
        self,
        forecast_run_id: int,
        recommendation_summary: Optional[str] = None,
        projected_total_units: Optional[int] = None,
        rationale: Optional[str] = None,
    ) -> ForecastRecommendation:
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO forecast_recommendations 
                    (forecast_run_id, recommendation_summary, projected_total_units, rationale)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (forecast_run_id) DO UPDATE SET
                        recommendation_summary = EXCLUDED.recommendation_summary,
                        projected_total_units = EXCLUDED.projected_total_units,
                        rationale = EXCLUDED.rationale
                    RETURNING forecast_recommendation_id, forecast_run_id, recommendation_summary,
                             projected_total_units, rationale, created_at
                    """,
                    (
                        forecast_run_id,
                        recommendation_summary,
                        projected_total_units,
                        rationale,
                    ),
                )
                row = cur.fetchone()
                conn.commit()

                return ForecastRecommendation(
                    forecast_recommendation_id=row["forecast_recommendation_id"],
                    forecast_run_id=row["forecast_run_id"],
                    recommendation_summary=row["recommendation_summary"],
                    projected_total_units=row["projected_total_units"],
                    rationale=row["rationale"],
                    created_at=row["created_at"],
                )

    # Forecast Size Mix
    def get_size_mix(self, forecast_recommendation_id: int) -> list[ForecastSizeMix]:
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT forecast_size_mix_id, forecast_recommendation_id, size_code,
                           recommended_units, created_at
                    FROM forecast_size_mix
                    WHERE forecast_recommendation_id = %s
                    ORDER BY recommended_units DESC
                    """,
                    (forecast_recommendation_id,),
                )
                rows = cur.fetchall()

                return [
                    ForecastSizeMix(
                        forecast_size_mix_id=row["forecast_size_mix_id"],
                        forecast_recommendation_id=row["forecast_recommendation_id"],
                        size_code=row["size_code"],
                        recommended_units=row["recommended_units"],
                        created_at=row["created_at"],
                    )
                    for row in rows
                ]

    def set_size_mix(
        self,
        forecast_recommendation_id: int,
        size_mix: list[dict],
    ) -> list[ForecastSizeMix]:
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    DELETE FROM forecast_size_mix 
                    WHERE forecast_recommendation_id = %s
                    """,
                    (forecast_recommendation_id,),
                )

                for item in size_mix:
                    cur.execute(
                        """
                        INSERT INTO forecast_size_mix 
                        (forecast_recommendation_id, size_code, recommended_units)
                        VALUES (%s, %s, %s)
                        """,
                        (
                            forecast_recommendation_id,
                            item["size_code"],
                            item["recommended_units"],
                        ),
                    )

                conn.commit()

                return self.get_size_mix(forecast_recommendation_id)

    # Forecast Color Mix
    def get_color_mix(self, forecast_recommendation_id: int) -> list[ForecastColorMix]:
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT forecast_color_mix_id, forecast_recommendation_id, color_code,
                           recommended_units, created_at
                    FROM forecast_color_mix
                    WHERE forecast_recommendation_id = %s
                    ORDER BY recommended_units DESC
                    """,
                    (forecast_recommendation_id,),
                )
                rows = cur.fetchall()

                return [
                    ForecastColorMix(
                        forecast_color_mix_id=row["forecast_color_mix_id"],
                        forecast_recommendation_id=row["forecast_recommendation_id"],
                        color_code=row["color_code"],
                        recommended_units=row["recommended_units"],
                        created_at=row["created_at"],
                    )
                    for row in rows
                ]

    def set_color_mix(
        self,
        forecast_recommendation_id: int,
        color_mix: list[dict],
    ) -> list[ForecastColorMix]:
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    DELETE FROM forecast_color_mix 
                    WHERE forecast_recommendation_id = %s
                    """,
                    (forecast_recommendation_id,),
                )

                for item in color_mix:
                    cur.execute(
                        """
                        INSERT INTO forecast_color_mix 
                        (forecast_recommendation_id, color_code, recommended_units)
                        VALUES (%s, %s, %s)
                        """,
                        (
                            forecast_recommendation_id,
                            item["color_code"],
                            item["recommended_units"],
                        ),
                    )

                conn.commit()

                return self.get_color_mix(forecast_recommendation_id)

    # Allocation Recommendations
    def get_allocations(
        self, forecast_recommendation_id: int
    ) -> list[AllocationRecommendation]:
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT allocation_recommendation_id, forecast_recommendation_id, channel_code,
                           recommended_units, created_at
                    FROM allocation_recommendations
                    WHERE forecast_recommendation_id = %s
                    ORDER BY recommended_units DESC
                    """,
                    (forecast_recommendation_id,),
                )
                rows = cur.fetchall()

                return [
                    AllocationRecommendation(
                        allocation_recommendation_id=row[
                            "allocation_recommendation_id"
                        ],
                        forecast_recommendation_id=row["forecast_recommendation_id"],
                        channel_code=row["channel_code"],
                        recommended_units=row["recommended_units"],
                        created_at=row["created_at"],
                    )
                    for row in rows
                ]

    # Production Plans
    def create_production_plan(
        self,
        data: ProductionPlanCreate,
        created_by_user_id: int,
    ) -> ProductionPlan:
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO production_plans (forecast_run_id, created_by_user_id, status, planner_notes)
                    VALUES (%s, %s, 'draft', %s)
                    RETURNING production_plan_id, forecast_run_id, created_by_user_id, status,
                             planner_notes, created_at, updated_at
                    """,
                    (data.forecast_run_id, created_by_user_id, data.planner_notes),
                )
                row = cur.fetchone()
                conn.commit()

                user_email = self._get_user_email(created_by_user_id)

                return ProductionPlan(
                    production_plan_id=row["production_plan_id"],
                    forecast_run_id=row["forecast_run_id"],
                    created_by_user_id=row["created_by_user_id"],
                    requested_by_email=user_email,
                    status=row["status"],
                    planner_notes=row["planner_notes"],
                    created_at=row["created_at"],
                    updated_at=row["updated_at"],
                )

    def get_production_plan(self, production_plan_id: int) -> Optional[ProductionPlan]:
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT pp.production_plan_id, pp.forecast_run_id, pp.created_by_user_id, 
                           pp.status, pp.planner_notes, pp.created_at, pp.updated_at,
                           u.email as requested_by_email
                    FROM production_plans pp
                    JOIN users u ON pp.created_by_user_id = u.user_id
                    WHERE pp.production_plan_id = %s
                    """,
                    (production_plan_id,),
                )
                row = cur.fetchone()
                if not row:
                    return None

                return ProductionPlan(
                    production_plan_id=row["production_plan_id"],
                    forecast_run_id=row["forecast_run_id"],
                    created_by_user_id=row["created_by_user_id"],
                    requested_by_email=row.get("requested_by_email"),
                    status=row["status"],
                    planner_notes=row["planner_notes"],
                    created_at=row["created_at"],
                    updated_at=row["updated_at"],
                )

    def list_production_plans(
        self,
        forecast_run_id: Optional[int] = None,
        status: Optional[str] = None,
        limit: int = 50,
    ) -> list[ProductionPlan]:
        with self._connect() as conn:
            with conn.cursor() as cur:
                conditions = []
                params = []

                if forecast_run_id is not None:
                    conditions.append("pp.forecast_run_id = %s")
                    params.append(forecast_run_id)
                if status is not None:
                    conditions.append("pp.status = %s")
                    params.append(status)

                where_clause = " AND ".join(conditions) if conditions else "TRUE"
                params.append(limit)

                cur.execute(
                    f"""
                    SELECT pp.production_plan_id, pp.forecast_run_id, pp.created_by_user_id, 
                           pp.status, pp.planner_notes, pp.created_at, pp.updated_at,
                           u.email as requested_by_email
                    FROM production_plans pp
                    JOIN users u ON pp.created_by_user_id = u.user_id
                    WHERE {where_clause}
                    ORDER BY pp.created_at DESC
                    LIMIT %s
                    """,
                    params,
                )
                rows = cur.fetchall()

                return [
                    ProductionPlan(
                        production_plan_id=row["production_plan_id"],
                        forecast_run_id=row["forecast_run_id"],
                        created_by_user_id=row["created_by_user_id"],
                        requested_by_email=row.get("requested_by_email"),
                        status=row["status"],
                        planner_notes=row["planner_notes"],
                        created_at=row["created_at"],
                        updated_at=row["updated_at"],
                    )
                    for row in rows
                ]

    def update_production_plan(
        self, production_plan_id: int, data: ProductionPlanUpdate
    ) -> Optional[ProductionPlan]:
        fields = []
        params = []

        if data.status is not None:
            fields.append("status = %s")
            params.append(data.status)
        if data.planner_notes is not None:
            fields.append("planner_notes = %s")
            params.append(data.planner_notes)

        if not fields:
            return self.get_production_plan(production_plan_id)

        fields.append("updated_at = CURRENT_TIMESTAMP")
        params.append(production_plan_id)

        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    UPDATE production_plans
                    SET {", ".join(fields)}
                    WHERE production_plan_id = %s
                    RETURNING production_plan_id, forecast_run_id, created_by_user_id, status,
                             planner_notes, created_at, updated_at
                    """,
                    params,
                )
                row = cur.fetchone()
                conn.commit()

                if not row:
                    return None

                user_email = self._get_user_email(row["created_by_user_id"])

                return ProductionPlan(
                    production_plan_id=row["production_plan_id"],
                    forecast_run_id=row["forecast_run_id"],
                    created_by_user_id=row["created_by_user_id"],
                    requested_by_email=user_email,
                    status=row["status"],
                    planner_notes=row["planner_notes"],
                    created_at=row["created_at"],
                    updated_at=row["updated_at"],
                )

    # Production Plan Lines
    def get_production_plan_lines(
        self, production_plan_id: int
    ) -> list[ProductionPlanLine]:
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT production_plan_line_id, production_plan_id, style_id,
                           size_code, color_code, planned_units, channel_code, created_at
                    FROM production_plan_lines
                    WHERE production_plan_id = %s
                    """,
                    (production_plan_id,),
                )
                rows = cur.fetchall()

                return [
                    ProductionPlanLine(
                        production_plan_line_id=row["production_plan_line_id"],
                        production_plan_id=row["production_plan_id"],
                        style_id=row["style_id"],
                        size_code=row["size_code"],
                        color_code=row["color_code"],
                        planned_units=row["planned_units"],
                        channel_code=row["channel_code"],
                        created_at=row["created_at"],
                    )
                    for row in rows
                ]

    def add_production_plan_line(
        self, data: ProductionPlanLineCreate
    ) -> ProductionPlanLine:
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO production_plan_lines 
                    (production_plan_id, style_id, size_code, color_code, planned_units, channel_code)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING production_plan_line_id, production_plan_id, style_id,
                             size_code, color_code, planned_units, channel_code, created_at
                    """,
                    (
                        data.production_plan_id,
                        data.style_id,
                        data.size_code,
                        data.color_code,
                        data.planned_units,
                        data.channel_code,
                    ),
                )
                row = cur.fetchone()
                conn.commit()

                return ProductionPlanLine(
                    production_plan_line_id=row["production_plan_line_id"],
                    production_plan_id=row["production_plan_id"],
                    style_id=row["style_id"],
                    size_code=row["size_code"],
                    color_code=row["color_code"],
                    planned_units=row["planned_units"],
                    channel_code=row["channel_code"],
                    created_at=row["created_at"],
                )

    def delete_production_plan_line(self, production_plan_line_id: int) -> bool:
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    DELETE FROM production_plan_lines
                    WHERE production_plan_line_id = %s
                    """,
                    (production_plan_line_id,),
                )
                deleted = cur.rowcount > 0
                conn.commit()
                return deleted

    # Helper
    def _get_user_email(self, user_id: int) -> Optional[str]:
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT email FROM users WHERE user_id = %s", (user_id,))
                row = cur.fetchone()
                return row["email"] if row else None


forecast_store = ForecastWorkflowStore()
