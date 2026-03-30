from __future__ import annotations

from collections import Counter

from backend.schemas.detection import DashboardMetrics, DetectionFlag, FlagStatus, ReviewDashboardResponse, RuleType
from backend.services.review_session_store import ReviewSessionState


class ReviewService:
    def get_dashboard(
        self,
        session: ReviewSessionState,
        *,
        rule_type: RuleType | None = None,
        status: FlagStatus | None = None,
    ) -> ReviewDashboardResponse:
        flags = self._filter_flags(list(session.flags.values()), rule_type=rule_type, status=status)
        metrics = self._build_metrics(session)
        return ReviewDashboardResponse(metrics=metrics, flags=flags)

    def _filter_flags(self, flags: list[DetectionFlag], rule_type: RuleType | None, status: FlagStatus | None) -> list[DetectionFlag]:
        return [
            flag
            for flag in flags
            if (rule_type is None or flag.rule_type == rule_type) and (status is None or flag.status == status)
        ]

    def _build_metrics(self, session: ReviewSessionState) -> DashboardMetrics:
        flags = list(session.flags.values())
        return DashboardMetrics(
            total_claims_processed=len(session.claims),
            total_flags_created=len(flags),
            flags_by_rule_type=dict(Counter(flag.rule_type.value for flag in flags)),
            flags_by_workflow_status=dict(Counter(flag.status.value for flag in flags)),
        )
