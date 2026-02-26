"""Tests for resident role access control and report scoping."""
import pytest
from app.models.user import User
from app.models.report import Report
from app.models.report_sub import ReportHistory


@pytest.fixture
def resident_user(db, municipality):
    """Create a resident user and return (user, password)."""
    u = User(
        email="access.resident@test.co.za",
        first_name="Access",
        last_name="Resident",
        role="resident",
        municipality_id=municipality.id,
    )
    u.set_password("resident123")
    db.session.add(u)
    db.session.commit()
    return u, "resident123"


@pytest.fixture
def resident_auth_headers(client, resident_user):
    """Log in as resident and return auth headers."""
    user, password = resident_user
    resp = client.post("/api/auth/login", json={
        "email": user.email,
        "password": password,
    })
    token = resp.get_json()["token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def resident_reports(db, municipality, admin_user, resident_user):
    """Create reports: 2 belonging to resident, 1 belonging to someone else."""
    user, _ = admin_user
    resident, _ = resident_user

    own_report_1 = Report(
        report_number="CW-RES-00001",
        category="pothole",
        title="My pothole report",
        description="Resident's own report",
        status="received",
        priority="medium",
        location_address="Resident Street",
        location_lat=-33.92,
        location_lng=18.42,
        ward="Ward 1",
        citizen_name=f"{resident.first_name} {resident.last_name}",
        citizen_phone="+27820000000",
        citizen_email=resident.email,
        municipality_id=municipality.id,
    )
    own_report_2 = Report(
        report_number="CW-RES-00002",
        category="water_leak",
        title="My water leak report",
        description="Another resident report",
        status="under_review",
        priority="high",
        location_address="Resident Avenue",
        location_lat=-33.93,
        location_lng=18.43,
        ward="Ward 2",
        citizen_name=f"{resident.first_name} {resident.last_name}",
        citizen_phone="+27820000000",
        citizen_email=resident.email,
        municipality_id=municipality.id,
    )
    other_report = Report(
        report_number="CW-OTHER-00001",
        category="garbage",
        title="Someone else's report",
        description="Not the resident's report",
        status="received",
        priority="low",
        location_address="Other Street",
        location_lat=-33.94,
        location_lng=18.44,
        ward="Ward 3",
        citizen_name="Other Citizen",
        citizen_phone="+27821111111",
        citizen_email="other.citizen@test.com",
        municipality_id=municipality.id,
    )

    db.session.add_all([own_report_1, own_report_2, other_report])
    db.session.flush()

    for r in [own_report_1, own_report_2, other_report]:
        h = ReportHistory(
            report_id=r.id, user_id=user.id,
            action="created", new_value="received",
        )
        db.session.add(h)

    db.session.commit()
    return {
        "own": [own_report_1, own_report_2],
        "other": other_report,
    }


class TestResidentReportScoping:
    def test_resident_sees_only_own_reports(self, client, resident_auth_headers, resident_reports):
        resp = client.get("/api/reports", headers=resident_auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        reports = data["reports"]
        assert len(reports) == 2
        emails = {r["citizen_email"] for r in reports}
        assert emails == {"access.resident@test.co.za"}

    def test_resident_cannot_see_other_reports(self, client, resident_auth_headers, resident_reports):
        resp = client.get("/api/reports", headers=resident_auth_headers)
        data = resp.get_json()
        report_numbers = [r["report_number"] for r in data["reports"]]
        assert "CW-OTHER-00001" not in report_numbers


class TestResidentAdminEndpointAccess:
    def test_resident_cannot_access_dashboard_metrics(self, client, resident_auth_headers):
        resp = client.get("/api/dashboard/metrics", headers=resident_auth_headers)
        assert resp.status_code == 403

    def test_resident_cannot_access_users(self, client, resident_auth_headers):
        resp = client.get("/api/users", headers=resident_auth_headers)
        assert resp.status_code == 403

    def test_resident_cannot_access_analytics_trends(self, client, resident_auth_headers):
        resp = client.get("/api/analytics/trends", headers=resident_auth_headers)
        assert resp.status_code == 403

    def test_resident_cannot_access_sla_dashboard(self, client, resident_auth_headers):
        resp = client.get("/api/sla/dashboard", headers=resident_auth_headers)
        assert resp.status_code == 403


class TestAdminAccessUnchanged:
    def test_admin_can_access_dashboard_metrics(self, client, auth_headers, sample_report):
        resp = client.get("/api/dashboard/metrics", headers=auth_headers)
        assert resp.status_code == 200

    def test_admin_can_access_users(self, client, auth_headers):
        resp = client.get("/api/users", headers=auth_headers)
        assert resp.status_code == 200

    def test_admin_can_access_analytics_trends(self, client, auth_headers, sample_report):
        resp = client.get("/api/analytics/trends", headers=auth_headers)
        assert resp.status_code == 200

    def test_admin_can_access_sla_dashboard(self, client, auth_headers):
        resp = client.get("/api/sla/dashboard", headers=auth_headers)
        assert resp.status_code == 200
