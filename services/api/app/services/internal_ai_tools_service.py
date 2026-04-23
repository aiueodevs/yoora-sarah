from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime

from app.services.catalog_store import catalog_store
from app.services.design_workflow_store import design_store
from app.services.forecast_workflow_store import forecast_store
from app.services.postgres_store import store


@dataclass
class BriefSummary:
    id: str
    title: str
    status: str
    created_by: str
    created_at: str
    summary: str


@dataclass
class ApprovalSummary:
    id: str
    artifact_type: str
    artifact_id: str
    status: str
    updated_at: str
    summary: str


@dataclass
class ForecastSummary:
    id: int
    run_id: str
    status: str
    period: str
    created_at: str
    summary: str


@dataclass
class ProductionPlanSummary:
    id: int
    plan_number: str
    status: str
    forecast_run_id: str | None
    created_at: str
    summary: str


@dataclass
class KnowledgeArticle:
    id: str
    title: str
    topic: str
    audience: str
    summary: str
    detail: str
    source_label: str
    updated_at: str
    next_action: str


@dataclass
class BriefCopilotNote:
    brief_id: str
    title: str
    summary: str
    concept_direction: str
    review_risk: str
    next_action: str
    source_timestamp: str


@dataclass
class ContentDraft:
    id: str
    title: str
    audience: str
    hook: str
    caption: str
    call_to_action: str
    source_context: str


@dataclass
class LeadershipInsight:
    id: str
    title: str
    summary: str
    risks: list[str]
    next_actions: list[str]
    generated_at: str


_KNOWLEDGE_ARTICLES: list[KnowledgeArticle] = [
    KnowledgeArticle(
        id="knowledge_brief_handoff",
        title="SOP brief ke design handoff",
        topic="sop",
        audience="design_and_marketing",
        summary="Brief harus memuat brand context, target segment, campaign intent, dan constraint sebelum design generation dimulai.",
        detail="Gunakan brief aktif sebagai sumber tunggal. Pastikan category, target segment, notes, dan campaign name sudah cukup jelas sebelum men-trigger design generation atau pattern work.",
        source_label="AI Strategy + Brief workflow",
        updated_at="2026-04-22T12:00:00+07:00",
        next_action="Pastikan brief berstatus active sebelum meminta review lanjutan.",
    ),
    KnowledgeArticle(
        id="knowledge_approval_policy",
        title="Policy approval dan escalation",
        topic="policy",
        audience="management_and_ops",
        summary="Approval support hanya memberi ringkasan dan risiko. Keputusan final tetap di owner atau lead yang berwenang.",
        detail="Untuk artifact yang berdampak ke launch, produksi, atau customer trust, AI harus memberi ringkasan, risiko, dan langkah berikutnya tanpa mengeksekusi keputusan final secara otomatis.",
        source_label="AI Strategy + BRD approval rule",
        updated_at="2026-04-22T12:00:00+07:00",
        next_action="Naikkan ke owner atau lead jika status approval masih review dan ada risiko komersial.",
    ),
    KnowledgeArticle(
        id="knowledge_planner_onboarding",
        title="Onboarding planner minggu pertama",
        topic="onboarding",
        audience="planner",
        summary="Planner baru harus memahami alur forecast, confidence review, recommendation rationale, lalu baru membuat production plan.",
        detail="Mulai dari membaca forecast run terbaru, cek confidence score dan rationale, review size mix, lalu konversi hanya run yang cukup jelas ke production plan dengan planner notes yang bisa diaudit.",
        source_label="Forecast workflow",
        updated_at="2026-04-22T12:00:00+07:00",
        next_action="Latih planner untuk membedakan recommendation dan keputusan final produksi.",
    ),
    KnowledgeArticle(
        id="knowledge_task_clarity",
        title="Task clarity untuk SDM dan ops",
        topic="task_clarity",
        audience="sdm_and_ops",
        summary="Gunakan alur kerja per modul agar handoff tidak bergantung pada chat informal atau ingatan personal.",
        detail="Dashboard dipakai untuk membaca queue pressure. Briefs untuk intake. Forecast untuk planning. Approvals untuk keputusan. Production plans untuk release state. Jika informasi tidak ada di modul yang benar, buat note dan naikkan sebagai gap data.",
        source_label="Portal workflow direction",
        updated_at="2026-04-22T12:00:00+07:00",
        next_action="Rujuk modul sumber sebelum meminta klarifikasi manual lewat chat.",
    ),
    KnowledgeArticle(
        id="knowledge_business_glossary",
        title="Glossary buyer, management, dan SDM",
        topic="glossary",
        audience="all_internal_roles",
        summary="Buyer AI melayani customer confidence, sedangkan portal AI melayani management speed, SDM productivity, dan workflow visibility.",
        detail="Support retrieval menjawab policy, order, dan stock. Knowledge assistant menjawab SOP, onboarding, policy, dan internal Q&A. Forecast recommendation harus diperlakukan sebagai saran reviewable, bukan perintah.",
        source_label="Business glossary",
        updated_at="2026-04-22T12:00:00+07:00",
        next_action="Pastikan bahasa UI dan operasional mengikuti glossary resmi ini.",
    ),
]


class InternalAIToolsService:
    """Safe tool endpoints for Internal AI - provides grounded summaries for portal workflows."""

    def summarize_briefs(self, actor_email: str | None = None) -> list[BriefSummary]:
        """Summarize briefs for quick review."""
        try:
            briefs = design_store.list_briefs()
            return [
                BriefSummary(
                    id=b.id,
                    title=b.title,
                    status=b.status,
                    created_by=b.created_by_email or "Unknown",
                    created_at=b.created_at.isoformat() if b.created_at else "",
                    summary=(
                        f"Brief '{b.title}' berstatus '{b.status}' untuk {b.target_segment}"
                        + (f" dalam campaign {b.campaign_name}." if b.campaign_name else ".")
                    ),
                )
                for b in briefs[:10]
            ]
        except Exception:
            return []

    def summarize_approvals(
        self, actor_email: str | None = None
    ) -> list[ApprovalSummary]:
        """Summarize approvals for quick review."""
        try:
            approvals = store.list_approvals()
            return [
                ApprovalSummary(
                    id=f"approval_{a.id}",
                    artifact_type=a.artifact_type,
                    artifact_id=a.artifact_id,
                    status=a.current_status,
                    updated_at=a.updated_at.isoformat() if a.updated_at else "",
                    summary=f"Approval untuk {a.artifact_type} ({a.artifact_id}): {a.current_status}",
                )
                for a in approvals[:10]
            ]
        except Exception:
            return []

    def summarize_forecast_runs(
        self, actor_email: str | None = None
    ) -> list[ForecastSummary]:
        """Summarize forecast runs for quick review."""
        try:
            runs = forecast_store.list_forecast_runs()
            return [
                ForecastSummary(
                    id=run.id,
                    run_id=run.run_id,
                    status=run.status,
                    period=run.period,
                    created_at=run.created_at.isoformat() if run.created_at else "",
                    summary=f"Forecast {run.run_id} - {run.status} untuk periode {run.period}",
                )
                for run in runs[:10]
            ]
        except Exception:
            return []

    def summarize_production_plans(
        self, actor_email: str | None = None
    ) -> list[ProductionPlanSummary]:
        """Summarize production plans for quick review."""
        try:
            plans = forecast_store.list_production_plans()
            return [
                ProductionPlanSummary(
                    id=plan.id,
                    plan_number=plan.plan_number,
                    status=plan.status,
                    forecast_run_id=plan.forecast_run_id,
                    created_at=plan.created_at.isoformat() if plan.created_at else "",
                    summary=f"Production Plan {plan.plan_number} - {plan.status}",
                )
                for plan in plans[:10]
            ]
        except Exception:
            return []

    def generate_brief_copilot_note(
        self, brief_id: str | None = None, actor_email: str | None = None
    ) -> BriefCopilotNote | None:
        try:
            briefs = design_store.list_briefs()
        except Exception:
            return None

        if not briefs:
            return None

        target = next((brief for brief in briefs if brief.id == brief_id), briefs[0])
        campaign = target.campaign_name or "campaign yang belum dinamai"
        summary = (
            f"{target.title} mengarah ke {target.category} untuk {target.target_segment} "
            f"dengan konteks {campaign}."
        )
        return BriefCopilotNote(
            brief_id=target.id,
            title=target.title,
            summary=summary,
            concept_direction=(
                f"Pertahankan konsep yang refined dan reviewable. Fokuskan visual pada "
                f"{target.category}, buyer intent {target.target_segment}, dan tone campaign {campaign}."
            ),
            review_risk=(
                "Risiko utama ada pada brief yang terlalu umum, campaign tanpa batasan, atau notes yang belum cukup untuk handoff design."
            ),
            next_action=(
                "Lengkapi notes dengan silhouette intent, warna prioritas, dan constraint produksi sebelum lanjut ke design generation."
            ),
            source_timestamp=target.updated_at.isoformat() if target.updated_at else "",
        )

    def retrieve_knowledge_articles(
        self,
        query: str | None = None,
        topic: str | None = None,
        actor_email: str | None = None,
    ) -> list[KnowledgeArticle]:
        query_tokens = [
            token for token in (query or "").lower().replace("-", " ").split() if token
        ]
        items = []
        for article in _KNOWLEDGE_ARTICLES:
            if topic and article.topic != topic:
                continue
            haystack = " ".join(
                [article.title, article.summary, article.detail, article.topic, article.audience]
            ).lower()
            if query_tokens and not all(token in haystack for token in query_tokens):
                continue
            items.append(article)

        return items or _KNOWLEDGE_ARTICLES[:3]

    def get_onboarding_guidance(
        self, role: str | None = None, actor_email: str | None = None
    ) -> list[KnowledgeArticle]:
        role_query = role or "onboarding"
        return self.retrieve_knowledge_articles(query=role_query, topic="onboarding", actor_email=actor_email)

    def generate_content_draft(
        self, brief_id: str | None = None, actor_email: str | None = None
    ) -> ContentDraft | None:
        brief_note = self.generate_brief_copilot_note(brief_id=brief_id, actor_email=actor_email)
        if brief_note is None:
            return None

        return ContentDraft(
            id=f"content_{brief_note.brief_id}",
            title=f"Content draft for {brief_note.title}",
            audience="marketing",
            hook=f"{brief_note.title}: modest look yang terasa rapi, premium, dan mudah dipakai.",
            caption=(
                f"{brief_note.title} dirancang untuk memberi transisi yang halus dari momen harian ke agenda spesial. "
                "Tekankan rasa aman, refined, dan mudah dipadukan saat menyusun caption launch."
            ),
            call_to_action="Arahkan buyer ke product detail, size guidance, dan support path bila masih ragu.",
            source_context=brief_note.summary,
        )

    def get_launch_readiness_insight(
        self, actor_email: str | None = None
    ) -> LeadershipInsight:
        brief_summaries = self.summarize_briefs(actor_email)
        approval_summaries = self.summarize_approvals(actor_email)
        forecast_summaries = self.summarize_forecast_runs(actor_email)
        plan_summaries = self.summarize_production_plans(actor_email)

        pending_approvals = [item for item in approval_summaries if item.status == "review"]
        running_forecasts = [item for item in forecast_summaries if item.status in {"queued", "running"}]
        draft_plans = [item for item in plan_summaries if item.status in {"draft", "review"}]

        risks = []
        if pending_approvals:
            risks.append(f"{len(pending_approvals)} approval masih menunggu keputusan.")
        if running_forecasts:
            risks.append(f"{len(running_forecasts)} forecast belum selesai sehingga planning belum final.")
        if draft_plans:
            risks.append(f"{len(draft_plans)} production plan belum masuk release-ready state.")
        if not risks:
            risks.append("Tidak ada bottleneck besar yang terlihat dari approval, forecast, dan production plan saat ini.")

        next_actions = [
            "Naikkan item approval review ke owner atau lead bila berdampak ke launch.",
            "Konversi hanya forecast dengan rationale yang cukup jelas ke production plan.",
            "Pastikan brief aktif yang paling penting punya handoff context yang lengkap.",
        ]

        return LeadershipInsight(
            id="launch_readiness",
            title="Launch readiness assistant",
            summary=(
                f"Launch readiness dibaca dari {len(brief_summaries)} brief, {len(approval_summaries)} approval, "
                f"{len(forecast_summaries)} forecast, dan {len(plan_summaries)} production plan."
            ),
            risks=risks,
            next_actions=next_actions,
            generated_at=datetime.now(tz=UTC).isoformat(),
        )

    def get_performance_summary(
        self, actor_email: str | None = None
    ) -> LeadershipInsight:
        telemetry = store.summarize_telemetry_events(168)
        top_events = list(telemetry.by_event_name.items())[:3]
        top_summary = ", ".join(f"{name}: {count}" for name, count in top_events) or "Belum ada event dominan."

        return LeadershipInsight(
            id="performance_summary",
            title="Performance summary assistant",
            summary=(
                f"Dalam {telemetry.window_hours} jam terakhir tercatat {telemetry.total} event telemetry. "
                f"Event paling aktif: {top_summary}."
            ),
            risks=[
                "Telemetry tinggi tanpa review funnel dapat menyembunyikan friction point.",
                "Event AI perlu dibaca bersama outcome agar tidak hanya menjadi vanity volume.",
            ],
            next_actions=[
                "Review buyer AI query volume dan outcome failure untuk containment rate.",
                "Bandingkan event portal workflow dengan approval bottleneck sebelum sprint berikutnya.",
            ],
            generated_at=datetime.now(tz=UTC).isoformat(),
        )

    def get_merchandising_insight(
        self, actor_email: str | None = None
    ) -> LeadershipInsight:
        featured_products = catalog_store.list_product_summaries(featured_only=True, limit=6)
        low_stock_featured = [
            product.name for product in featured_products if product.stock_state == "low_stock"
        ]
        assortment = {}
        for product in catalog_store.list_product_summaries(limit=12):
            assortment[product.category_slug] = assortment.get(product.category_slug, 0) + 1

        leading_categories = ", ".join(
            f"{category}: {count}" for category, count in sorted(assortment.items(), key=lambda item: (-item[1], item[0]))[:3]
        )

        return LeadershipInsight(
            id="merchandising_insight",
            title="Merchandising insight assistant",
            summary=(
                f"Featured assortment saat ini menonjol di {leading_categories or 'kategori utama belum terbaca'}."
            ),
            risks=[
                "Featured products dengan stok rendah perlu prioritas review agar tidak menciptakan demand tanpa supply.",
                "Assortment perlu dijaga tetap explainable terhadap kategori yang paling sering dibuka buyer.",
            ],
            next_actions=[
                f"Pantau produk low-stock: {', '.join(low_stock_featured) if low_stock_featured else 'tidak ada item featured low-stock saat ini'}.",
                "Sinkronkan product recommendation dengan kategori yang benar-benar siap jual.",
            ],
            generated_at=datetime.now(tz=UTC).isoformat(),
        )

    def get_workflow_status_summary(self, actor_email: str | None = None) -> dict:
        """Get overall workflow status for dashboard summary."""
        briefs = self.summarize_briefs(actor_email)
        approvals = self.summarize_approvals(actor_email)
        forecasts = self.summarize_forecast_runs(actor_email)
        plans = self.summarize_production_plans(actor_email)

        return {
            "briefs_count": len(briefs),
            "briefs_by_status": self._count_by_status([b.status for b in briefs]),
            "approvals_count": len(approvals),
            "approvals_by_status": self._count_by_status([a.status for a in approvals]),
            "forecasts_count": len(forecasts),
            "forecasts_by_status": self._count_by_status([f.status for f in forecasts]),
            "plans_count": len(plans),
            "plans_by_status": self._count_by_status([p.status for p in plans]),
        }

    def _count_by_status(self, statuses: list[str]) -> dict[str, int]:
        counts: dict[str, int] = {}
        for status in statuses:
            counts[status] = counts.get(status, 0) + 1
        return counts


internal_ai_tools_service = InternalAIToolsService()
