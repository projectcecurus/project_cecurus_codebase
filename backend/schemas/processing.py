from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from backend.schemas.claims import ClaimRecord
from backend.schemas.detection import DetectionFlag, FlagStatus


class ProcessingAggregateSummary(BaseModel):
    file_type: str
    total_claims_processed: int
    total_duplicate_flags_detected: int
    severity_counts: dict[str, int]
    estimated_total_financial_exposure: int
    rule_frequency_counts: dict[str, int]
    processing_status: str


class ReviewSessionMetadata(BaseModel):
    session_id: str
    organization_id: str
    created_at: datetime
    expires_at: datetime
    aggregates: ProcessingAggregateSummary


class ReviewSessionResponse(BaseModel):
    metadata: ReviewSessionMetadata
    flags: list[DetectionFlag]
    claims: list[ClaimRecord]


class AggregateRunResponse(BaseModel):
    run_id: str
    created_at: datetime
    aggregates: ProcessingAggregateSummary


class ReviewFlagStatusUpdateRequest(BaseModel):
    status: FlagStatus


class FileValidationErrorResponse(BaseModel):
    detail: str | list[str]
