from uuid import uuid4

from fastapi.testclient import TestClient

from backend.main import app


VALID_837_SNIPPET = (
    "NM1*85*2*BILLING PROVIDER*****XX*1234567893~"
    "NM1*82*1*DOE*JANE****XX*9876543210~"
    "CLM*ABC123*150***11:B:1*Y*A*Y*I~"
    "SV1*HC:99213:25*100*UN*1***1~"
    "CLM*XYZ789*150***11:B:1*Y*A*Y*I~"
    "SV1*HC:99213:25*100*UN*1***1~"
)


def test_zero_storage_review_flow() -> None:
    client = TestClient(app)
    suffix = uuid4().hex[:8]
    onboarding = client.post(
        "/api/onboarding/register",
        json={
            "organization_name": f"Cecurus Test {suffix}",
            "facility_type": "Hospital",
            "facility_address": "123 Integrity Way",
            "city": "Atlanta",
            "state": "GA",
            "zipcode": "30303",
            "primary_email": f"admin-{suffix}@example.com",
            "primary_phone": "555-0100",
            "admin_full_name": "Admin User",
            "admin_password": "SecurePass123!",
            "contacts": [{"full_name": "Admin User", "title": "Compliance Lead", "email": f"admin-{suffix}@example.com", "phone": "555-0100", "is_primary": True}],
        },
    )
    assert onboarding.status_code == 201

    files = {"file": ("claims.837", VALID_837_SNIPPET, "text/plain")}
    process = client.post("/api/files/process", files=files)
    assert process.status_code == 200
    payload = process.json()
    assert payload["metadata"]["aggregates"]["total_claims_processed"] == 2
    assert payload["metadata"]["aggregates"]["total_duplicate_flags_detected"] >= 1

    session_id = payload["metadata"]["session_id"]
    flag_id = payload["flags"][0]["flag_id"]
    update = client.patch(f"/api/files/process/{session_id}/flags/{flag_id}", json={"status": "Reviewed"})
    assert update.status_code == 200
    assert any(flag["status"] == "Reviewed" for flag in update.json()["flags"])

    runs = client.get("/api/reports/aggregate-runs")
    assert runs.status_code == 200
    assert runs.json()[0]["aggregates"]["rule_frequency_counts"]
    assert "claim_id" not in str(runs.json()[0]).lower()

    audit_logs = client.get("/api/audit-logs")
    assert audit_logs.status_code == 200
    assert all("claim_id" not in str(row).lower() for row in audit_logs.json())


def test_auth_login_and_password_reset_flow() -> None:
    client = TestClient(app)
    suffix = uuid4().hex[:8]
    email = f"admin-{suffix}@example.com"
    password = "SecurePass123!"
    new_password = "ResetPass123!"

    onboarding = client.post(
        "/api/onboarding/register",
        json={
            "organization_name": f"Cecurus Auth {suffix}",
            "facility_type": "Hospital",
            "facility_address": "123 Integrity Way",
            "city": "Atlanta",
            "state": "GA",
            "zipcode": "30303",
            "primary_email": email,
            "primary_phone": "555-0100",
            "admin_full_name": "Admin User",
            "admin_password": password,
            "contacts": [{"full_name": "Admin User", "title": "Compliance Lead", "email": email, "phone": "555-0100", "is_primary": True}],
        },
    )
    assert onboarding.status_code == 201

    logout = client.post("/api/auth/logout")
    assert logout.status_code == 200

    login = client.post("/api/auth/login", json={"email": f"  {email.upper()}  ", "password": password})
    assert login.status_code == 200
    assert login.json()["email"] == email

    reset_request = client.post("/api/auth/password-reset/request", json={"email": f"  {email}  "})
    assert reset_request.status_code == 200
    reset_token = reset_request.json()["reset_token"]
    assert reset_token

    reset_confirm = client.post("/api/auth/password-reset/confirm", json={"token": reset_token, "new_password": new_password})
    assert reset_confirm.status_code == 200

    stale_session = client.post("/api/auth/logout")
    assert stale_session.status_code == 401

    old_login = client.post("/api/auth/login", json={"email": email, "password": password})
    assert old_login.status_code == 401

    new_login = client.post("/api/auth/login", json={"email": email, "password": new_password})
    assert new_login.status_code == 200
