from fastapi import UploadFile

from backend.parsers.x12_837_parser import X12ClaimParser
from backend.schemas.claims import ClaimRecord, ValidationResult


class ClaimIngestionService:
    def __init__(self) -> None:
        self.parser = X12ClaimParser()

    async def read_upload(self, file: UploadFile) -> str:
        payload = await file.read()
        try:
            return payload.decode("utf-8")
        except UnicodeDecodeError as exc:
            raise ValueError("Uploaded file must be UTF-8 text") from exc

    def validate_text(self, text: str) -> ValidationResult:
        return self.parser.validate(text)

    def parse_text(self, text: str) -> list[ClaimRecord]:
        return self.parser.parse(text)
