from __future__ import annotations

from collections import Counter

from schemas.claims import ClaimRecord
from schemas.detection import DashboardMetrics, DetectionFlag, FlagStatus, FlagWithClaims, ReviewDashboardResponse, RuleType
from services.claim_repository import ClaimRepository
from services.flag_repository import FlagRepository


class ReviewService:
    def __init__(
        self,
        claim_repository: ClaimRepository | None = None,
        flag_repository: FlagRepository | None = None,
    ) -> None:
        self.claim_repository = claim_repository or ClaimRepository()
        self.flag_repository = flag_repository or FlagRepository()

    def store_claims(self, claims: list[ClaimRecord]) -> None:
        self.claim_repository.save_claims(claims)

    def get_dashboard(self, rule_type: RuleType | None = None, status: FlagStatus | None = None) -> ReviewDashboardResponse:
        flags = self._filter_flags(rule_type=rule_type, status=status)
        metrics = self._build_metrics()
        return ReviewDashboardResponse(metrics=metrics, flags=flags)

    def get_flag_with_claims(self, flag_id: str) -> FlagWithClaims | None:
        flag = self.flag_repository.get_flag(flag_id)
        if flag is None:
            return None
        claims: list[ClaimRecord] = []
        for claim_id in flag.claim_ids:
            claims.extend(self.claim_repository.get_claims_by_claim_id(claim_id))
        return FlagWithClaims(flag=flag, claims=claims)

    def list_claims(self) -> list[ClaimRecord]:
        return self.claim_repository.list_claims()

    def _filter_flags(self, rule_type: RuleType | None, status: FlagStatus | None) -> list[DetectionFlag]:
        flags = self.flag_repository.list_flags()
        return [
            flag
            for flag in flags
            if (rule_type is None or flag.rule_type == rule_type) and (status is None or flag.status == status)
        ]

    def _build_metrics(self) -> DashboardMetrics:
        claims = self.claim_repository.list_claims()
        flags = self.flag_repository.list_flags()
        rule_counts = Counter(flag.rule_type.value for flag in flags)
        status_counts = Counter(flag.status.value for flag in flags)
        return DashboardMetrics(
            total_claims_processed=len(claims),
            total_flags_created=len(flags),
            flags_by_rule_type=dict(rule_counts),
            flags_by_workflow_status=dict(status_counts),
        )
