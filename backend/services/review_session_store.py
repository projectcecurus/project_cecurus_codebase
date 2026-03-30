from __future__ import annotations

from collections import Counter
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from threading import Lock
from uuid import uuid4

from backend.config import settings
from backend.schemas.claims import ClaimRecord
from backend.schemas.detection import DetectionFlag, FlagStatus
from backend.schemas.processing import ProcessingAggregateSummary, ReviewSessionMetadata


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class ReviewSessionState:
    session_id: str
    organization_id: str
    user_id: str
    created_at: datetime
    expires_at: datetime
    claims: list[ClaimRecord]
    flags: dict[str, DetectionFlag]
    aggregates: ProcessingAggregateSummary


@dataclass
class ReviewSessionStore:
    # Claim-level data only lives inside this in-memory store and expires automatically.
    ttl_minutes: int = settings.review_session_minutes
    _sessions: dict[str, ReviewSessionState] = field(default_factory=dict)
    _lock: Lock = field(default_factory=Lock)

    def create_session(self, *, organization_id: str, user_id: str, claims: list[ClaimRecord], flags: list[DetectionFlag], file_type: str) -> ReviewSessionState:
        with self._lock:
            self._purge_expired_locked()
            session_id = str(uuid4())
            aggregates = self._build_aggregates(file_type=file_type, claims=claims, flags=flags)
            state = ReviewSessionState(
                session_id=session_id,
                organization_id=organization_id,
                user_id=user_id,
                created_at=_utcnow(),
                expires_at=_utcnow() + timedelta(minutes=self.ttl_minutes),
                claims=claims,
                flags={flag.flag_id: flag.model_copy(deep=True) for flag in flags},
                aggregates=aggregates,
            )
            self._sessions[session_id] = state
            return state

    def get_session(self, session_id: str, organization_id: str) -> ReviewSessionState | None:
        with self._lock:
            self._purge_expired_locked()
            state = self._sessions.get(session_id)
            if state is None or state.organization_id != organization_id:
                return None
            return state

    def update_flag_status(self, session_id: str, organization_id: str, flag_id: str, status: FlagStatus) -> DetectionFlag | None:
        with self._lock:
            self._purge_expired_locked()
            state = self._sessions.get(session_id)
            if state is None or state.organization_id != organization_id:
                return None
            flag = state.flags.get(flag_id)
            if flag is None:
                return None
            flag.status = status
            state.aggregates = self._build_aggregates(
                file_type=state.aggregates.file_type,
                claims=state.claims,
                flags=list(state.flags.values()),
            )
            return flag

    def discard_session(self, session_id: str, organization_id: str) -> bool:
        with self._lock:
            state = self._sessions.get(session_id)
            if state is None or state.organization_id != organization_id:
                return False
            del self._sessions[session_id]
            return True

    def metadata(self, state: ReviewSessionState) -> ReviewSessionMetadata:
        return ReviewSessionMetadata(
            session_id=state.session_id,
            organization_id=state.organization_id,
            created_at=state.created_at,
            expires_at=state.expires_at,
            aggregates=state.aggregates,
        )

    def _build_aggregates(self, *, file_type: str, claims: list[ClaimRecord], flags: list[DetectionFlag]) -> ProcessingAggregateSummary:
        rule_counts = Counter(flag.rule_type.value for flag in flags)
        severity_counts = {
            "high": sum(1 for flag in flags if len(flag.claim_ids) > 1),
            "medium": sum(1 for flag in flags if len(flag.claim_ids) == 1),
            "low": 0,
        }
        return ProcessingAggregateSummary(
            file_type=file_type,
            total_claims_processed=len(claims),
            total_duplicate_flags_detected=len(flags),
            severity_counts=severity_counts,
            estimated_total_financial_exposure=len(flags) * 1150,
            rule_frequency_counts=dict(rule_counts),
            processing_status="Completed",
        )

    def _purge_expired_locked(self) -> None:
        now = _utcnow()
        expired = [session_id for session_id, session in self._sessions.items() if session.expires_at <= now]
        for session_id in expired:
            del self._sessions[session_id]
