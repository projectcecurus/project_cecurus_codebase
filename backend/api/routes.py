from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from backend.schemas.claims import (
    ClaimRecord,
    FileParseResponse,
    FileUploadResponse,
    FileValidationResponse,
)
from backend.schemas.detection import (
    DetectionFlag,
    DetectionRunResponse,
    FlagListResponse,
    FlagStatus,
    FlagStatusUpdateRequest,
    FlagWithClaims,
    ReviewDashboardResponse,
    RuleType,
)
from backend.services.claim_service import ClaimIngestionService
from backend.services.detection_service import DetectionService
from backend.services.review_service import ReviewService


router = APIRouter(prefix="/api/files", tags=["claims"])
service = ClaimIngestionService()
detection_service = DetectionService()
review_service = ReviewService()


async def _read_upload_or_400(file: UploadFile) -> str:
    try:
        return await service.read_upload(file)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


async def _read_and_validate_upload(file: UploadFile) -> str:
    content = await _read_upload_or_400(file)
    validation = service.validate_text(content)
    if not validation.is_valid:
        raise HTTPException(status_code=400, detail=validation.errors)
    return content


async def _read_validate_and_parse_claims(file: UploadFile) -> list[ClaimRecord]:
    content = await _read_and_validate_upload(file)
    claims = service.parse_text(content)
    review_service.store_claims(claims)
    return claims


@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(file: UploadFile = File(...)) -> FileUploadResponse:
    content = await _read_upload_or_400(file)
    return FileUploadResponse(
        filename=file.filename or "uploaded-file",
        content_type=file.content_type,
        size_bytes=len(content.encode("utf-8")),
    )


@router.post("/validate", response_model=FileValidationResponse)
async def validate_file(file: UploadFile = File(...)) -> FileValidationResponse:
    validation = service.validate_text(await _read_upload_or_400(file))
    return FileValidationResponse(**validation.model_dump())


@router.post("/parse", response_model=FileParseResponse)
async def parse_file(file: UploadFile = File(...)) -> FileParseResponse:
    claims = await _read_validate_and_parse_claims(file)
    return FileParseResponse(
        filename=file.filename or "uploaded-file",
        claim_count=len(claims),
        claims=claims,
    )


@router.post("/detect-duplicates", response_model=DetectionRunResponse)
async def detect_duplicates(file: UploadFile = File(...)) -> DetectionRunResponse:
    claims = await _read_validate_and_parse_claims(file)
    flags = detection_service.run_detection(claims)
    return DetectionRunResponse(
        filename=file.filename or "uploaded-file",
        claim_count=len(claims),
        flag_count=len(flags),
        flags=flags,
    )


@router.get("/flags", response_model=FlagListResponse)
def list_flags() -> FlagListResponse:
    return FlagListResponse(flags=detection_service.list_flags())


@router.get("/flags/{flag_id}", response_model=DetectionFlag)
def get_flag(flag_id: str) -> DetectionFlag:
    flag = detection_service.get_flag(flag_id)
    if flag is None:
        raise HTTPException(status_code=404, detail="Flag not found")
    return flag


@router.patch("/flags/{flag_id}", response_model=DetectionFlag)
def update_flag_status(flag_id: str, request: FlagStatusUpdateRequest) -> DetectionFlag:
    flag = detection_service.update_flag_status(flag_id, request.status)
    if flag is None:
        raise HTTPException(status_code=404, detail="Flag not found")
    return flag


@router.get("/review/dashboard", response_model=ReviewDashboardResponse)
def get_review_dashboard(
    rule_type: RuleType | None = Query(default=None),
    status: FlagStatus | None = Query(default=None),
) -> ReviewDashboardResponse:
    return review_service.get_dashboard(rule_type=rule_type, status=status)


@router.get("/review/flags/{flag_id}", response_model=FlagWithClaims)
def get_review_flag_details(flag_id: str) -> FlagWithClaims:
    details = review_service.get_flag_with_claims(flag_id)
    if details is None:
        raise HTTPException(status_code=404, detail="Flag not found")
    return details
