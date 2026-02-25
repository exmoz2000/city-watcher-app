"""Tests for SLA configuration, deadline calculation, breach detection, and dashboard."""
import pytest
from datetime import datetime, timedelta, timezone
from app.models.sla import SLAConfig, SLATracking
from app.models.report import Report
from app.services.sla_engine import calculate_sla_deadline, check_sla_breaches, get_sla_dashboard
from tests.conftest import create_report_for_municipality


def _login(client, user_tuple):
    user, password = user_tuple
    resp = client.post("/api/auth/login", json={"email": user.email, "password": password})
    return {"Authorization": f"Bearer {resp.get_json()['token']}"}


class TestSLAConfigCRUD:
    def test_create_valid_config(self, client, admin_user, municipality):
        headers = _login(client, admin_user)
        resp = client.post("/api/sla/config", headers=headers, json={
            "municipality_id": municipality.id,
            "category": "water_leak",
            "response_hours": 24,
            "warning_threshold_pct": 75,
        })
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["category"] == "water_leak"
        assert data["response_hours"] == 24

    def test_rejects_response_hours_zero(self, client, admin_user, municipality):
        headers = _login(client, admin_user)
        resp = client.post("/api/sla/config", headers=headers, json={
            "municipality_id": municipality.id,
            "category": "pothole",
            "response_hours": 0,
        })
        assert resp.status_code == 400

    def test_rejects_response_hours_negative(self, client, admin_user, municipality):
        headers = _login(client, admin_user)
        resp = client.post("/api/sla/config", headers=headers, json={
            "municipality_id": municipality.id,
            "category": "pothole",
            "response_hours": -5,
        })
        assert resp.status_code == 400

    def test_rejects_threshold_out_of_range(self, client, admin_user, municipality):
        headers = _login(client, admin_user)
        resp = client.post("/api/sla/config", headers=headers, json={
            "municipality_id": municipality.id,
            "category": "pothole",
            "response_hours": 72,
            "warning_threshold_pct": 0,
        })
        assert resp.status_code == 400

        resp2 = client.post("/api/sla/config", headers=headers, json={
            "municipality_id": municipality.id,
            "category": "garbage",
            "response_hours": 48,
            "warning_threshold_pct": 100,
        })
        assert resp2.status_code == 400

    def test_unique_constraint(self, client, admin_user, municipality):
        headers = _login(client, admin_user)
        payload = {
            "municipality_id": municipality.id,
            "category": "power_outage",
            "response_hours": 12,
        }
        resp1 = client.post("/api/sla/config", headers=headers, json=payload)
        assert resp1.status_code == 201
        resp2 = client.post("/api/sla/config", headers=headers, json=payload)
        assert resp2.status_code == 409


class TestSLADeadlineCalculation:
    def test_calculate_sla_deadline_creates_tracking(self, db, municipality, admin_user, sla_config):
        report = create_report_for_municipality(db, municipality, admin_user, category="pothole")
        tracking = calculate_sla_deadline(report)
        assert tracking is not None
        assert tracking.report_id == report.id
        expected_deadline = report.created_at + timedelta(hours=sla_config.response_hours)
        assert tracking.deadline == expected_deadline
        assert tracking.breached is False
        assert tracking.breached_at is None

    def test_calculate_sla_deadline_skips_no_config(self, db, municipality, admin_user):
        report = create_report_for_municipality(db, municipality, admin_user, category="other")
        tracking = calculate_sla_deadline(report)
        assert tracking is None


class TestSLABreachDetection:
    def test_marks_overdue_unresolved(self, db, municipality, admin_user, sla_config):
        report = create_report_for_municipality(db, municipality, admin_user, category="pothole")
        # Create tracking with deadline in the past
        tracking = SLATracking(
            report_id=report.id, sla_config_id=sla_config.id,
            deadline=datetime.now(timezone.utc) - timedelta(hours=1),
            breached=False,
        )
        db.session.add(tracking)
        db.session.commit()

        count = check_sla_breaches()
        db.session.commit()
        assert count == 1
        db.session.refresh(tracking)
        assert tracking.breached is True
        assert tracking.breached_at is not None

    def test_skips_already_breached(self, db, municipality, admin_user, sla_config):
        report = create_report_for_municipality(db, municipality, admin_user, category="pothole")
        tracking = SLATracking(
            report_id=report.id, sla_config_id=sla_config.id,
            deadline=datetime.now(timezone.utc) - timedelta(hours=1),
            breached=True, breached_at=datetime.now(timezone.utc) - timedelta(hours=1),
        )
        db.session.add(tracking)
        db.session.commit()

        count = check_sla_breaches()
        assert count == 0

    def test_skips_resolved_reports(self, db, municipality, admin_user, sla_config):
        report = create_report_for_municipality(
            db, municipality, admin_user, category="pothole", status="resolved"
        )
        tracking = SLATracking(
            report_id=report.id, sla_config_id=sla_config.id,
            deadline=datetime.now(timezone.utc) - timedelta(hours=1),
            breached=False,
        )
        db.session.add(tracking)
        db.session.commit()

        count = check_sla_breaches()
        assert count == 0
        db.session.refresh(tracking)
        assert tracking.breached is False


class TestSLADashboard:
    def test_dashboard_classification(self, db, municipality, admin_user, sla_config):
        # Breached report
        r1 = create_report_for_municipality(
            db, municipality, admin_user, category="pothole",
            report_number="CW-BREACH-001",
        )
        t1 = SLATracking(
            report_id=r1.id, sla_config_id=sla_config.id,
            deadline=datetime.now(timezone.utc) - timedelta(hours=10),
            breached=True, breached_at=datetime.now(timezone.utc),
        )
        db.session.add(t1)

        # On-track report (deadline far in future)
        r2 = create_report_for_municipality(
            db, municipality, admin_user, category="pothole",
            report_number="CW-ONTRACK-001",
        )
        t2 = SLATracking(
            report_id=r2.id, sla_config_id=sla_config.id,
            deadline=datetime.now(timezone.utc) + timedelta(hours=60),
            breached=False,
        )
        db.session.add(t2)
        db.session.commit()

        data = get_sla_dashboard(municipality.id)
        assert len(data["breached"]) >= 1
        assert len(data["on_track"]) >= 1
        total = len(data["breached"]) + len(data["at_risk"]) + len(data["on_track"])
        assert total >= 2

    def test_dashboard_empty_returns_100_compliance(self, db, municipality):
        data = get_sla_dashboard(municipality.id)
        assert data["compliance_rate"] == 100.0
        assert data["breached"] == []
        assert data["at_risk"] == []
        assert data["on_track"] == []
