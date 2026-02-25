"""Tests for municipality data isolation via scope_query middleware."""
import pytest
from tests.conftest import create_report_for_municipality


def _login(client, user_tuple):
    user, password = user_tuple
    resp = client.post("/api/auth/login", json={"email": user.email, "password": password})
    token = resp.get_json()["token"]
    return {"Authorization": f"Bearer {token}"}


class TestSuperAdminScope:
    def test_super_admin_sees_all_reports(
        self, client, admin_user, municipality, second_municipality, other_muni_admin, db
    ):
        r1 = create_report_for_municipality(db, municipality, admin_user, title="Muni1 report")
        r2 = create_report_for_municipality(db, second_municipality, other_muni_admin, title="Muni2 report")
        headers = _login(client, admin_user)
        resp = client.get("/api/reports", headers=headers)
        assert resp.status_code == 200
        ids = [r["id"] for r in resp.get_json()["reports"]]
        assert r1.id in ids
        assert r2.id in ids


class TestMunicipalityAdminScope:
    def test_muni_admin_sees_own_municipality(
        self, client, muni_admin, municipality, second_municipality, other_muni_admin, db, admin_user
    ):
        r1 = create_report_for_municipality(db, municipality, admin_user, title="Own report")
        r2 = create_report_for_municipality(db, second_municipality, other_muni_admin, title="Other report")
        headers = _login(client, muni_admin)
        resp = client.get("/api/reports", headers=headers)
        assert resp.status_code == 200
        ids = [r["id"] for r in resp.get_json()["reports"]]
        assert r1.id in ids
        assert r2.id not in ids

    def test_muni_admin_zero_from_other_municipality(
        self, client, muni_admin, second_municipality, other_muni_admin, db
    ):
        create_report_for_municipality(db, second_municipality, other_muni_admin, title="Other only")
        headers = _login(client, muni_admin)
        resp = client.get("/api/reports", headers=headers)
        assert resp.status_code == 200
        reports = resp.get_json()["reports"]
        for r in reports:
            assert r["municipality_id"] != second_municipality.id


class TestDepartmentManagerScope:
    def test_dept_manager_sees_own_dept_categories(
        self, client, dept_manager, municipality, db, admin_user
    ):
        # Public Works manages: pothole, street_light, traffic_light
        r_pothole = create_report_for_municipality(
            db, municipality, admin_user, category="pothole", title="Pothole report"
        )
        r_water = create_report_for_municipality(
            db, municipality, admin_user, category="water_leak", title="Water report"
        )
        headers = _login(client, dept_manager)
        resp = client.get("/api/reports", headers=headers)
        assert resp.status_code == 200
        ids = [r["id"] for r in resp.get_json()["reports"]]
        assert r_pothole.id in ids
        assert r_water.id not in ids


class TestFieldWorkerScope:
    def test_field_worker_sees_only_assigned(
        self, client, field_worker, municipality, db, admin_user
    ):
        worker, _ = field_worker
        r_assigned = create_report_for_municipality(
            db, municipality, admin_user, assigned_to=worker.id, title="Assigned"
        )
        r_other = create_report_for_municipality(
            db, municipality, admin_user, title="Not assigned"
        )
        headers = _login(client, field_worker)
        resp = client.get("/api/reports", headers=headers)
        assert resp.status_code == 200
        ids = [r["id"] for r in resp.get_json()["reports"]]
        assert r_assigned.id in ids
        assert r_other.id not in ids


class TestUnauthenticated:
    def test_unauthenticated_returns_401(self, client):
        resp = client.get("/api/reports")
        assert resp.status_code == 401
