from pathlib import Path

from schemas.claims import ClaimRecord, Provider, ServiceLine
from schemas.detection import FlagStatus, RuleType
from services.detection_service import DetectionService
from services.flag_repository import FlagRepository


def build_claim(
    claim_id: str,
    service_lines: list[ServiceLine],
    billing_id: str = "BILLING|GROUP|XX|123",
    rendering_id: str = "DOE|JANE|XX|456",
) -> ClaimRecord:
    billing_last, billing_first, billing_qualifier, billing_code = billing_id.split("|")
    rendering_last, rendering_first, rendering_qualifier, rendering_code = rendering_id.split("|")
    return ClaimRecord(
        claim_id=claim_id,
        billing_provider=Provider(
            last_name_or_organization=billing_last,
            first_name=billing_first,
            id_code_qualifier=billing_qualifier,
            id_code=billing_code,
        ),
        rendering_provider=Provider(
            last_name_or_organization=rendering_last,
            first_name=rendering_first,
            id_code_qualifier=rendering_qualifier,
            id_code=rendering_code,
        ),
        claim_segment={"claim_amount": "150", "raw": "CLM"},
        service_lines=service_lines,
    )


def build_line(raw: str, line_type: str = "SV1", code: str = "99213", amount: str = "100") -> ServiceLine:
    return ServiceLine(raw=raw, line_type=line_type, service_code=code, modifiers=["25"], claim_amount=amount)


def test_detects_exact_claim_duplicates(tmp_path: Path) -> None:
    repository = FlagRepository(str(tmp_path / "flags.db"))
    service = DetectionService(repository)
    line = build_line("SV1*HC:99213:25*100")

    flags = service.run_detection(
        [
            build_claim("ABC123", [line]),
            build_claim("ABC123", [line]),
        ]
    )

    assert any(flag.rule_type == RuleType.EXACT_CLAIM_DUPLICATE for flag in flags)


def test_detects_duplicate_service_lines_within_claim(tmp_path: Path) -> None:
    repository = FlagRepository(str(tmp_path / "flags.db"))
    service = DetectionService(repository)
    line = build_line("SV1*HC:99213:25*100")

    flags = service.run_detection([build_claim("ABC123", [line, line])])

    assert any(flag.rule_type == RuleType.DUPLICATE_SERVICE_LINE_WITHIN_CLAIM for flag in flags)


def test_detects_same_content_different_claim_ids(tmp_path: Path) -> None:
    repository = FlagRepository(str(tmp_path / "flags.db"))
    service = DetectionService(repository)
    line = build_line("SV1*HC:99213:25*100")

    flags = service.run_detection(
        [
            build_claim("ABC123", [line]),
            build_claim("XYZ789", [line]),
        ]
    )

    assert any(flag.rule_type == RuleType.SAME_CONTENT_DIFFERENT_ID for flag in flags)


def test_updates_flag_status_in_repository(tmp_path: Path) -> None:
    repository = FlagRepository(str(tmp_path / "flags.db"))
    service = DetectionService(repository)
    line = build_line("SV1*HC:99213:25*100")
    flags = service.run_detection([build_claim("ABC123", [line, line])])

    updated = service.update_flag_status(flags[0].flag_id, FlagStatus.REVIEWED)

    assert updated is not None
    assert updated.status == FlagStatus.REVIEWED
