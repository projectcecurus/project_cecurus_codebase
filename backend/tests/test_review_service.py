from pathlib import Path

from backend.schemas.claims import ClaimRecord, Provider, ServiceLine
from backend.schemas.detection import FlagStatus, RuleType
from backend.services.claim_repository import ClaimRepository
from backend.services.detection_service import DetectionService
from backend.services.flag_repository import FlagRepository
from backend.services.review_service import ReviewService


def make_claim(claim_id: str) -> ClaimRecord:
    return ClaimRecord(
        claim_id=claim_id,
        billing_provider=Provider(last_name_or_organization="Billing", id_code_qualifier="XX", id_code="111"),
        rendering_provider=Provider(last_name_or_organization="Render", id_code_qualifier="XX", id_code="222"),
        claim_segment={"raw": "CLM", "claim_amount": "100"},
        service_lines=[ServiceLine(line_type="SV1", raw="SV1*HC:99213:25*100", service_code="99213", modifiers=["25"], claim_amount="100")],
    )


def build_services(database_name: str) -> tuple[ClaimRepository, FlagRepository, ReviewService, DetectionService]:
    Path("scratch_verify").mkdir(exist_ok=True)
    database_path = Path(f"scratch_verify/{database_name}.db")
    if database_path.exists():
        database_path.unlink()
    db_path = str(database_path)
    claim_repository = ClaimRepository(db_path)
    flag_repository = FlagRepository(db_path)
    review_service = ReviewService(claim_repository=claim_repository, flag_repository=flag_repository)
    detection_service = DetectionService(flag_repository)
    return claim_repository, flag_repository, review_service, detection_service


def test_dashboard_metrics_and_flag_details() -> None:
    _, _, review_service, detection_service = build_services("review_metrics")
    claims = [make_claim("A100"), make_claim("B200")]

    review_service.store_claims(claims)
    flags = detection_service.run_detection(claims)

    dashboard = review_service.get_dashboard()

    assert dashboard.metrics.total_claims_processed == 2
    assert dashboard.metrics.total_flags_created >= 1
    assert RuleType.SAME_CONTENT_DIFFERENT_ID.value in dashboard.metrics.flags_by_rule_type

    details = review_service.get_flag_with_claims(flags[0].flag_id)

    assert details is not None
    assert len(details.claims) >= 1
    assert "CLM" in details.flag.matched_identifiers


def test_dashboard_filters_by_status() -> None:
    _, flag_repository, review_service, detection_service = build_services("review_status")
    review_service.store_claims([make_claim("A100"), make_claim("B200")])
    flags = detection_service.run_detection([make_claim("A100"), make_claim("B200")])
    flag_repository.update_status(flags[0].flag_id, FlagStatus.REVIEWED)

    dashboard = review_service.get_dashboard(status=FlagStatus.REVIEWED)

    assert len(dashboard.flags) == 1
    assert dashboard.flags[0].status == FlagStatus.REVIEWED
