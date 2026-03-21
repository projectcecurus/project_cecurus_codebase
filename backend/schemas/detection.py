from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field

from backend.schemas.claims import ClaimRecord


class FlagStatus(str, Enum):
    NEW = "New"
    REVIEWED = "Reviewed"
    RESOLVED = "Resolved"
    IGNORED = "Ignored"


class RuleType(str, Enum):
    EXACT_CLAIM_DUPLICATE = "ExactClaimDuplicate"
    DUPLICATE_SERVICE_LINE_WITHIN_CLAIM = "DuplicateServiceLinesWithinClaim"
    SAME_CONTENT_DIFFERENT_ID = "SameClaimContentDifferentIds"


class DetectionFlag(BaseModel):
    flag_id: str
    rule_type: RuleType
    claim_ids: list[str] = Field(default_factory=list)
    billing_provider: str = ""
    rendering_provider: str = ""
    matched_identifiers: list[str] = Field(default_factory=list)
    explanation: str
    status: FlagStatus = FlagStatus.NEW


class DetectionRunResponse(BaseModel):
    filename: str
    claim_count: int
    flag_count: int
    flags: list[DetectionFlag]


class FlagListResponse(BaseModel):
    flags: list[DetectionFlag]


class FlagStatusUpdateRequest(BaseModel):
    status: FlagStatus


class DetectionRequest(BaseModel):
    claims: list[ClaimRecord]


class DashboardMetrics(BaseModel):
    total_claims_processed: int
    total_flags_created: int
    flags_by_rule_type: dict[str, int]
    flags_by_workflow_status: dict[str, int]


class FlagWithClaims(BaseModel):
    flag: DetectionFlag
    claims: list[ClaimRecord]


class ReviewDashboardResponse(BaseModel):
    metrics: DashboardMetrics
    flags: list[DetectionFlag]
