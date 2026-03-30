from __future__ import annotations

from dataclasses import dataclass

from fastapi import UploadFile

from backend.config import settings
from backend.schemas.claims import ClaimRecord, ValidationResult
from backend.services.claim_service import ClaimIngestionService
from backend.services.detection_service import DetectionService


ALLOWED_CONTENT_TYPES = {"text/plain", "application/octet-stream", "application/edi-x12", "application/x-edi"}
ALLOWED_SUFFIXES = {".txt", ".x12", ".837"}


@dataclass
class ProcessedFileResult:
    file_type: str
    claims: list[ClaimRecord]
    flags: list


class FileProcessingService:
    def __init__(self) -> None:
        self.claim_service = ClaimIngestionService()
        self.detection_service = DetectionService()

    async def process_upload(self, file: UploadFile) -> ProcessedFileResult:
        self._validate_file_metadata(file)
        text = await self._read_validated_upload(file)
        claims = self.claim_service.parse_text(text)
        flags = self.detection_service.run_detection(claims)
        file_type = self._infer_file_type(text)
        return ProcessedFileResult(file_type=file_type, claims=claims, flags=flags)

    async def validate_upload(self, file: UploadFile) -> ValidationResult:
        self._validate_file_metadata(file)
        text = await self._read_validated_upload(file)
        return self.claim_service.validate_text(text)

    def _validate_file_metadata(self, file: UploadFile) -> None:
        filename = (file.filename or "").lower()
        if not any(filename.endswith(suffix) for suffix in ALLOWED_SUFFIXES):
            raise ValueError("Unsupported file type. Upload a .837, .x12, or .txt file.")
        if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES:
            raise ValueError("Unsupported content type for EDI processing.")

    async def _read_validated_upload(self, file: UploadFile) -> str:
        payload = await file.read()
        try:
            await file.close()
        finally:
            pass
        # Uploaded EDI is processed strictly in memory and discarded immediately after parsing.
        if len(payload) > settings.max_upload_bytes:
            raise ValueError(f"File exceeds the {settings.max_upload_bytes} byte limit.")
        try:
            text = payload.decode("utf-8")
        except UnicodeDecodeError as exc:
            raise ValueError("Uploaded file must be UTF-8 text.") from exc
        validation = self.claim_service.validate_text(text)
        if not validation.is_valid:
            raise ValueError(validation.errors[0] if validation.errors else "Malformed EDI input.")
        return text

    def _infer_file_type(self, text: str) -> str:
        if "SV2" in text:
            return "837I"
        if "SV1" in text:
            return "837P"
        return "837"
