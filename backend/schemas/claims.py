from __future__ import annotations

from pydantic import BaseModel, Field


class Provider(BaseModel):
    entity_identifier_code: str = ""
    entity_type_qualifier: str = ""
    last_name_or_organization: str = ""
    first_name: str = ""
    middle_name: str = ""
    id_code_qualifier: str = ""
    id_code: str = ""

    def normalized_identity(self) -> str:
        parts = [
            self.last_name_or_organization.strip().upper(),
            self.first_name.strip().upper(),
            self.id_code_qualifier.strip().upper(),
            self.id_code.strip().upper(),
        ]
        return "|".join(parts)


class ServiceLine(BaseModel):
    line_type: str
    raw: str
    service_code: str = ""
    modifiers: list[str] = Field(default_factory=list)
    claim_amount: str = ""

    def normalized_signature(self) -> str:
        return "|".join(
            [
                self.line_type.strip().upper(),
                self.service_code.strip().upper(),
                ",".join(modifier.strip().upper() for modifier in self.modifiers),
                self.claim_amount.strip(),
                self.raw.strip().upper(),
            ]
        )


class ClaimRecord(BaseModel):
    claim_id: str
    billing_provider: Provider
    rendering_provider: Provider
    claim_segment: dict[str, str]
    service_lines: list[ServiceLine] = Field(default_factory=list)


class ValidationResult(BaseModel):
    is_valid: bool
    errors: list[str] = Field(default_factory=list)


class FileUploadResponse(BaseModel):
    filename: str
    content_type: str | None = None
    size_bytes: int


class FileValidationResponse(ValidationResult):
    pass


class FileParseResponse(BaseModel):
    filename: str
    claim_count: int
    claims: list[ClaimRecord]
