from backend.schemas.claims import ClaimRecord, Provider, ServiceLine
from backend.schemas.detection import FlagStatus, RuleType
from backend.services.detection_service import DetectionService
from backend.services.review_service import ReviewService
from backend.services.review_session_store import ReviewSessionStore


def make_claim(claim_id: str) -> ClaimRecord:
    return ClaimRecord(
        claim_id=claim_id,
        billing_provider=Provider(last_name_or_organization="Billing", id_code_qualifier="XX", id_code="111"),
        rendering_provider=Provider(last_name_or_organization="Render", id_code_qualifier="XX", id_code="222"),
        claim_segment={"raw": "CLM", "claim_amount": "100"},
        service_lines=[ServiceLine(line_type="SV1", raw="SV1*HC:99213:25*100", service_code="99213", modifiers=["25"], claim_amount="100")],
    )


def test_dashboard_metrics_reflect_in_memory_session() -> None:
    claims = [make_claim("A100"), make_claim("B200")]
    flags = DetectionService().run_detection(claims)
    store = ReviewSessionStore(ttl_minutes=20)
    session = store.create_session(organization_id="org-1", user_id="user-1", claims=claims, flags=flags, file_type="837P")

    dashboard = ReviewService().get_dashboard(session)

    assert dashboard.metrics.total_claims_processed == 2
    assert dashboard.metrics.total_flags_created >= 1
    assert RuleType.SAME_CONTENT_DIFFERENT_ID.value in dashboard.metrics.flags_by_rule_type


def test_session_store_updates_flag_status_without_persistence() -> None:
    claims = [make_claim("A100"), make_claim("B200")]
    flags = DetectionService().run_detection(claims)
    store = ReviewSessionStore(ttl_minutes=20)
    session = store.create_session(organization_id="org-1", user_id="user-1", claims=claims, flags=flags, file_type="837P")

    updated = store.update_flag_status(session.session_id, "org-1", flags[0].flag_id, FlagStatus.REVIEWED)

    assert updated is not None
    assert updated.status == FlagStatus.REVIEWED
