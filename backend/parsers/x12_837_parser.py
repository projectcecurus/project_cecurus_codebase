from __future__ import annotations

from dataclasses import dataclass

from backend.schemas.claims import ClaimRecord, Provider, ServiceLine, ValidationResult


ELEMENT_SEPARATOR = "*"
SUBELEMENT_SEPARATOR = ":"
SEGMENT_TERMINATOR = "~"
SUPPORTED_SEGMENTS = {"CLM", "SV1", "SV2", "NM1"}


@dataclass(frozen=True)
class ParsedSegment:
    raw: str
    elements: list[object]

    @property
    def identifier(self) -> str:
        return str(self.elements[0]) if self.elements else ""


class X12ClaimParser:
    def validate(self, text: str) -> ValidationResult:
        errors: list[str] = []
        stripped = text.strip()

        if not stripped:
            errors.append("File content is empty.")
        if SEGMENT_TERMINATOR not in stripped:
            errors.append("Missing X12 segment terminator '~'.")
        if ELEMENT_SEPARATOR not in stripped:
            errors.append("Missing X12 data element separator '*'.")

        segments = self._tokenize(stripped) if not errors else []
        if segments and not any(segment.identifier == "CLM" for segment in segments):
            errors.append("No CLM segment found.")
        if segments and not any(
            segment.identifier == "NM1" and len(segment.elements) > 1 and segment.elements[1] in {"85", "82"}
            for segment in segments
        ):
            errors.append("No supported NM1 provider segment found.")

        return ValidationResult(is_valid=not errors, errors=errors)

    def parse(self, text: str) -> list[ClaimRecord]:
        segments = self._tokenize(text)
        claims: list[ClaimRecord] = []
        current_claim: ClaimRecord | None = None
        latest_billing_provider: Provider | None = None
        latest_rendering_provider: Provider | None = None

        for segment in segments:
            if segment.identifier == "NM1" and len(segment.elements) > 1:
                entity_code = segment.elements[1]
                provider = self._parse_provider(segment)
                if entity_code == "85":
                    latest_billing_provider = provider
                elif entity_code == "82":
                    latest_rendering_provider = provider
            elif segment.identifier == "CLM":
                if current_claim is not None:
                    claims.append(current_claim)
                current_claim = ClaimRecord(
                    claim_id=self._string_at(segment.elements, 1),
                    billing_provider=latest_billing_provider or Provider(),
                    rendering_provider=latest_rendering_provider or Provider(),
                    claim_segment={
                        "raw": segment.raw,
                        "claim_amount": self._string_at(segment.elements, 2),
                    },
                    service_lines=[],
                )
            elif segment.identifier in {"SV1", "SV2"} and current_claim is not None:
                current_claim.service_lines.append(self._parse_service_line(segment))

        if current_claim is not None:
            claims.append(current_claim)

        return claims

    def _tokenize(self, text: str) -> list[ParsedSegment]:
        segments: list[ParsedSegment] = []
        for raw_segment in text.split(SEGMENT_TERMINATOR):
            cleaned = raw_segment.strip()
            if not cleaned:
                continue
            elements: list[object] = []
            for element in cleaned.split(ELEMENT_SEPARATOR):
                if SUBELEMENT_SEPARATOR in element:
                    elements.append([part.strip() for part in element.split(SUBELEMENT_SEPARATOR)])
                else:
                    elements.append(element.strip())
            if elements and str(elements[0]) in SUPPORTED_SEGMENTS:
                segments.append(ParsedSegment(raw=cleaned, elements=elements))
        return segments

    def _parse_provider(self, segment: ParsedSegment) -> Provider:
        return Provider(
            entity_identifier_code=self._string_at(segment.elements, 1),
            entity_type_qualifier=self._string_at(segment.elements, 2),
            last_name_or_organization=self._string_at(segment.elements, 3),
            first_name=self._string_at(segment.elements, 4),
            middle_name=self._string_at(segment.elements, 5),
            id_code_qualifier=self._string_at(segment.elements, 8),
            id_code=self._string_at(segment.elements, 9),
        )

    def _parse_service_line(self, segment: ParsedSegment) -> ServiceLine:
        composite_index = 1 if segment.identifier == "SV1" else 2
        charge_index = 2 if segment.identifier == "SV1" else 3
        composite = self._composite_at(segment.elements, composite_index)
        service_code = composite[1] if len(composite) > 1 else ""
        modifiers = composite[2:] if len(composite) > 2 else []

        return ServiceLine(
            line_type=segment.identifier,
            raw=segment.raw,
            service_code=service_code,
            modifiers=modifiers,
            claim_amount=self._string_at(segment.elements, charge_index),
        )

    def _string_at(self, elements: list[object], index: int) -> str:
        if index >= len(elements):
            return ""
        value = elements[index]
        if isinstance(value, list):
            return SUBELEMENT_SEPARATOR.join(str(item) for item in value)
        return str(value)

    def _composite_at(self, elements: list[object], index: int) -> list[str]:
        if index >= len(elements):
            return []
        value = elements[index]
        if isinstance(value, list):
            return [str(item) for item in value]
        return [str(value)]
