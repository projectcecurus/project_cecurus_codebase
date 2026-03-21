from pathlib import Path

from fastapi.testclient import TestClient

from backend import main
from backend.api import routes
from backend.services.claim_repository import ClaimRepository
from backend.services.flag_repository import FlagRepository


VALID_837_SNIPPET = (
    "NM1*85*2*BILLING PROVIDER*****XX*1234567893~"
    "NM1*82*1*DOE*JANE****XX*9876543210~"
    "CLM*ABC123*150***11:B:1*Y*A*Y*I~"
    "SV1*HC:99213:25*100*UN*1***1~"
    "CLM*XYZ789*150***11:B:1*Y*A*Y*I~"
    "SV1*HC:99213:25*100*UN*1***1~"
)


def _configure_repositories(database_dir: Path) -> None:
    database_dir.mkdir(parents=True, exist_ok=True)
    db_path = str(database_dir / "integration.db")
    claim_repository = ClaimRepository(db_path)
    flag_repository = FlagRepository(db_path)
    routes.detection_service.repository = flag_repository
    routes.review_service.claim_repository = claim_repository
    routes.review_service.flag_repository = flag_repository


def test_end_to_end_file_review_flow() -> None:
    database_dir = Path("scratch_verify")
    database_path = database_dir / "integration.db"
    if database_path.exists():
        database_path.unlink()

    _configure_repositories(database_dir)
    client = TestClient(main.app)
    files = {"file": ("claims.837", VALID_837_SNIPPET, "text/plain")}

    health_response = client.get("/health")
    assert health_response.status_code == 200
    assert health_response.json() == {"status": "ok"}

    upload_response = client.post("/api/files/upload", files=files)
    assert upload_response.status_code == 200
    assert upload_response.json()["filename"] == "claims.837"

    parse_response = client.post("/api/files/parse", files=files)
    assert parse_response.status_code == 200
    assert parse_response.json()["claim_count"] == 2

    detect_response = client.post("/api/files/detect-duplicates", files=files)
    assert detect_response.status_code == 200
    assert detect_response.json()["flag_count"] >= 1

    dashboard_response = client.get("/api/files/review/dashboard")
    assert dashboard_response.status_code == 200
    dashboard = dashboard_response.json()
    assert dashboard["metrics"]["total_claims_processed"] >= 2
    assert len(dashboard["flags"]) >= 1

    first_flag_id = dashboard["flags"][0]["flag_id"]
    details_response = client.get(f"/api/files/review/flags/{first_flag_id}")
    assert details_response.status_code == 200
    assert details_response.json()["flag"]["flag_id"] == first_flag_id

    update_response = client.patch(
        f"/api/files/flags/{first_flag_id}",
        json={"status": "Reviewed"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["status"] == "Reviewed"

    filtered_dashboard = client.get(
        "/api/files/review/dashboard",
        params={"status": "Reviewed"},
    )
    assert filtered_dashboard.status_code == 200
    assert len(filtered_dashboard.json()["flags"]) == 1
