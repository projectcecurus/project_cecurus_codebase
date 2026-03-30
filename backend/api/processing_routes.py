from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select

from backend.dependencies import DatabaseSession, get_current_user, require_permission, require_role
from backend.models import AggregateProcessingRun, AuditLog, ProcessingStatus, User, UserRole
from backend.schemas.claims import FileValidationResponse
from backend.schemas.processing import AggregateRunResponse, ReviewFlagStatusUpdateRequest, ReviewSessionResponse
from backend.services.audit_service import AuditService
from backend.services.file_processing_service import FileProcessingService
from backend.services.review_session_store import ReviewSessionStore


router = APIRouter(prefix="/api")
audit_service = AuditService()
file_processing_service = FileProcessingService()
review_session_store = ReviewSessionStore()


@router.post("/files/validate", response_model=FileValidationResponse)
async def validate_837_file(
    db: DatabaseSession,
    current_user: Annotated[User, Depends(require_permission("processing:run"))],
    file: UploadFile = File(...),
) -> FileValidationResponse:
    try:
        validation = await file_processing_service.validate_upload(file)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    audit_service.log(db, action_type="processing.file.validated", user=current_user, safe_metadata={"valid": validation.is_valid})
    return FileValidationResponse(**validation.model_dump())


@router.post("/files/process", response_model=ReviewSessionResponse)
async def process_837_file(
    db: DatabaseSession,
    current_user: Annotated[User, Depends(require_permission("processing:run"))],
    file: UploadFile = File(...),
) -> ReviewSessionResponse:
    # The response can include current-session review detail, but only aggregate metadata is persisted.
    try:
        result = await file_processing_service.process_upload(file)
    except ValueError as exc:
        audit_service.log(db, action_type="processing.file.failed", user=current_user, safe_metadata={"reason": "validation_error"})
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    session = review_session_store.create_session(
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        claims=result.claims,
        flags=result.flags,
        file_type=result.file_type,
    )
    run = AggregateProcessingRun(
        organization_id=current_user.organization_id,
        processed_by_user_id=current_user.id,
        file_type=session.aggregates.file_type,
        total_claims_processed=session.aggregates.total_claims_processed,
        total_duplicate_flags_detected=session.aggregates.total_duplicate_flags_detected,
        severity_counts=session.aggregates.severity_counts,
        estimated_total_financial_exposure=session.aggregates.estimated_total_financial_exposure,
        rule_frequency_counts=session.aggregates.rule_frequency_counts,
        processing_status=ProcessingStatus.COMPLETED,
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    audit_service.log(
        db,
        action_type="processing.file.completed",
        user=current_user,
        safe_metadata={
            "file_type": session.aggregates.file_type,
            "total_claims_processed": session.aggregates.total_claims_processed,
            "total_duplicate_flags_detected": session.aggregates.total_duplicate_flags_detected,
        },
    )
    return ReviewSessionResponse(
        metadata=review_session_store.metadata(session),
        flags=list(session.flags.values()),
        claims=session.claims,
    )


@router.get("/files/process/{session_id}", response_model=ReviewSessionResponse)
def get_review_session(session_id: str, current_user: Annotated[User, Depends(get_current_user)]) -> ReviewSessionResponse:
    session = review_session_store.get_session(session_id, current_user.organization_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Review session not found or expired.")
    return ReviewSessionResponse(metadata=review_session_store.metadata(session), flags=list(session.flags.values()), claims=session.claims)


@router.patch("/files/process/{session_id}/flags/{flag_id}", response_model=ReviewSessionResponse)
def update_flag_status(
    session_id: str,
    flag_id: str,
    payload: ReviewFlagStatusUpdateRequest,
    db: DatabaseSession,
    current_user: Annotated[User, Depends(require_permission("review:update"))],
) -> ReviewSessionResponse:
    flag = review_session_store.update_flag_status(session_id, current_user.organization_id, flag_id, payload.status)
    if flag is None:
        raise HTTPException(status_code=404, detail="Flag or review session not found.")
    session = review_session_store.get_session(session_id, current_user.organization_id)
    assert session is not None
    audit_service.log(db, action_type="review.flag_status.updated", user=current_user, safe_metadata={"session_id": session_id, "flag_id": flag_id, "status": payload.status.value})
    return ReviewSessionResponse(metadata=review_session_store.metadata(session), flags=list(session.flags.values()), claims=session.claims)


@router.delete("/files/process/{session_id}")
def discard_session(session_id: str, db: DatabaseSession, current_user: Annotated[User, Depends(get_current_user)]) -> dict[str, str]:
    if not review_session_store.discard_session(session_id, current_user.organization_id):
        raise HTTPException(status_code=404, detail="Review session not found.")
    audit_service.log(db, action_type="review.session.discarded", user=current_user, safe_metadata={"session_id": session_id})
    return {"message": "Review session discarded from memory."}


@router.get("/reports/aggregate-runs", response_model=list[AggregateRunResponse])
def list_aggregate_runs(
    db: DatabaseSession,
    current_user: Annotated[User, Depends(require_permission("reports:view"))],
) -> list[AggregateRunResponse]:
    runs = db.scalars(
        select(AggregateProcessingRun)
        .where(AggregateProcessingRun.organization_id == current_user.organization_id)
        .order_by(AggregateProcessingRun.created_at.desc())
    ).all()
    return [
        AggregateRunResponse(
            run_id=run.id,
            created_at=run.created_at,
            aggregates={
                "file_type": run.file_type,
                "total_claims_processed": run.total_claims_processed,
                "total_duplicate_flags_detected": run.total_duplicate_flags_detected,
                "severity_counts": run.severity_counts,
                "estimated_total_financial_exposure": run.estimated_total_financial_exposure,
                "rule_frequency_counts": run.rule_frequency_counts,
                "processing_status": run.processing_status.value,
            },
        )
        for run in runs
    ]


@router.get("/audit-logs", response_model=list[dict[str, object]])
def list_audit_logs(
    db: DatabaseSession,
    current_user: Annotated[User, Depends(require_role(UserRole.ADMIN))],
) -> list[dict[str, object]]:
    logs = db.scalars(select(AuditLog).where(AuditLog.organization_id == current_user.organization_id).order_by(AuditLog.created_at.desc())).all()
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "organization_id": log.organization_id,
            "action_type": log.action_type,
            "safe_metadata": log.safe_metadata,
            "created_at": log.created_at.isoformat(),
        }
        for log in logs
    ]
