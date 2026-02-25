"""Tests for role-based access control on protected endpoints."""
import pytest
from tests.conftest import create_report_for_municipality


def _login(client, user_tuple):
    user, password = user_tuple
    resp = client.post("/api/auth/login", json={"email": user.email, "password": password})
    return {"Authorization": f"Bearer {resp.get_json()['token']}"}


class TestSLAConfigAccess:
    def test_field_worker_rejected_from_sla_config(self, client, field_worker, municipality):
        headers = _login(client, field_worker)
        resp = client.post("/api/sla/config", headers=headers, json={
            "municipality_id": municipality.id,
            "category": "pothole",
            "response_hours": 72,
        })
        assert resp.status_code == 403

    def test_dept_manager_rejected_from_sla_config(self, client, dept_manager, municipality):
        headers = _login(client, dept_manager)
        resp = client.post("/api/sla/config", headers=headers, json={
            "municipality_id": municipality.id,
            "category": "pothole",
            "response_hours": 72,
        })
        assert resp.status_code == 403


class TestExportAccess:
    def test_field_worker_rejected_from_export(self, client, field_worker):
        headers = _login(client, field_worker)
        resp = client.get("/api/reports/export", headers=headers)
        assert resp.status_code == 403


class TestBulkAccess:
    def test_field_worker_rejected_from_bulk(self, client, field_worker, db, municipality, admin_user):
        r = create_report_for_municipality(
            db, municipality, admin_user,
            report_number="CW-ROLE-001",
            assigned_to=field_worker[0].id,
        )
        headers = _login(client, field_worker)
        resp = client.post("/api/reports/bulk", headers=headers, json={
            "report_ids": [r.id],
            "action": "status",
            "value": "in_progress",
        })
        assert resp.status_code == 403


class TestSLADashboardAccess:
    def test_muni_admin_can_access_sla_dashboard(self, client, muni_admin):
        headers = _login(client, muni_admin)
        resp = client.get("/api/sla/dashboard", headers=headers)
        assert resp.status_code == 200

    def test_dept_manager_can_access_sla_dashboard(self, client, dept_manager):
        headers = _login(client, dept_manager)
        resp = client.get("/api/sla/dashboard", headers=headers)
        assert resp.status_code == 200


class TestUnauthenticatedAccess:
    def test_sla_config_401(self, client):
        resp = client.post("/api/sla/config", json={
            "municipality_id": 1, "category": "pothole", "response_hours": 72,
        })
        assert resp.status_code == 401

    def test_export_401(self, client):
        resp = client.get("/api/reports/export")
        assert resp.status_code == 401

    def test_bulk_401(self, client):
        resp = client.post("/api/reports/bulk", json={
            "report_ids": [1], "action": "status", "value": "resolved",
        })
        assert resp.status_code == 401

    def test_sla_dashboard_401(self, client):
        resp = client.get("/api/sla/dashboard")
        assert resp.status_code == 401
