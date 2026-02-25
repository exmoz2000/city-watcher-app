"""Tests for bulk action endpoint."""
import pytest
from app.models.report_sub import ReportHistory
from app.models.notification import Notification
from app.models.report import Report
from tests.conftest import create_report_for_municipality


def _login(client, user_tuple):
    user, password = user_tuple
    resp = client.post("/api/auth/login", json={"email": user.email, "password": password})
    return {"Authorization": f"Bearer {resp.get_json()['token']}"}


class TestBulkStatusUpdate:
    def test_bulk_status_update(self, client, admin_user, db, municipality):
        r1 = create_report_for_municipality(db, municipality, admin_user, report_number="CW-BULK-001")
        r2 = create_report_for_municipality(db, municipality, admin_user, report_number="CW-BULK-002")
        headers = _login(client, admin_user)
        resp = client.post("/api/reports/bulk", headers=headers, json={
            "report_ids": [r1.id, r2.id],
            "action": "status",
            "value": "in_progress",
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["count"] == 2
        db.session.refresh(r1)
        db.session.refresh(r2)
        assert r1.status == "in_progress"
        assert r2.status == "in_progress"

    def test_bulk_status_sets_completed_at(self, client, admin_user, db, municipality):
        r = create_report_for_municipality(db, municipality, admin_user, report_number="CW-BULK-003")
        headers = _login(client, admin_user)
        resp = client.post("/api/reports/bulk", headers=headers, json={
            "report_ids": [r.id],
            "action": "status",
            "value": "resolved",
        })
        assert resp.status_code == 200
        db.session.refresh(r)
        assert r.completed_at is not None


class TestBulkAssignment:
    def test_bulk_assign(self, client, admin_user, field_worker, db, municipality):
        worker, _ = field_worker
        r = create_report_for_municipality(db, municipality, admin_user, report_number="CW-BULK-004")
        headers = _login(client, admin_user)
        resp = client.post("/api/reports/bulk", headers=headers, json={
            "report_ids": [r.id],
            "action": "assign",
            "value": worker.id,
        })
        assert resp.status_code == 200
        db.session.refresh(r)
        assert r.assigned_to == worker.id


class TestBulkHistory:
    def test_creates_report_history(self, client, admin_user, db, municipality):
        r = create_report_for_municipality(db, municipality, admin_user, report_number="CW-BULK-005")
        initial_count = ReportHistory.query.filter_by(report_id=r.id).count()
        headers = _login(client, admin_user)
        client.post("/api/reports/bulk", headers=headers, json={
            "report_ids": [r.id],
            "action": "status",
            "value": "under_review",
        })
        new_count = ReportHistory.query.filter_by(report_id=r.id).count()
        assert new_count == initial_count + 1

    def test_assign_creates_notification(self, client, admin_user, field_worker, db, municipality):
        worker, _ = field_worker
        r = create_report_for_municipality(db, municipality, admin_user, report_number="CW-BULK-006")
        headers = _login(client, admin_user)
        client.post("/api/reports/bulk", headers=headers, json={
            "report_ids": [r.id],
            "action": "assign",
            "value": worker.id,
        })
        notif = Notification.query.filter_by(user_id=worker.id, type="report_assigned").first()
        assert notif is not None


class TestBulkScopeEnforcement:
    def test_skips_out_of_scope(
        self, client, muni_admin, municipality, second_municipality,
        other_muni_admin, db, admin_user
    ):
        r_own = create_report_for_municipality(db, municipality, admin_user, report_number="CW-BULK-007")
        r_other = create_report_for_municipality(db, second_municipality, other_muni_admin, report_number="CW-BULK-008")
        headers = _login(client, muni_admin)
        resp = client.post("/api/reports/bulk", headers=headers, json={
            "report_ids": [r_own.id, r_other.id],
            "action": "status",
            "value": "in_progress",
        })
        assert resp.status_code == 200
        assert resp.get_json()["count"] == 1
        db.session.refresh(r_own)
        db.session.refresh(r_other)
        assert r_own.status == "in_progress"
        assert r_other.status == "received"


class TestBulkRoleRestriction:
    def test_field_worker_rejected(self, client, field_worker, db, municipality, admin_user):
        r = create_report_for_municipality(
            db, municipality, admin_user, report_number="CW-BULK-009",
            assigned_to=field_worker[0].id,
        )
        headers = _login(client, field_worker)
        resp = client.post("/api/reports/bulk", headers=headers, json={
            "report_ids": [r.id],
            "action": "status",
            "value": "in_progress",
        })
        assert resp.status_code == 403
