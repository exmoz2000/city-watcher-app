"""Tests for the GET /api/mobile/alerts endpoint."""
import pytest
from datetime import datetime, timedelta, timezone
from app.models.community_alert import CommunityAlert


@pytest.fixture
def alert_fixtures(db, municipality):
    """Create alerts: active+future, active+expired, inactive+future."""
    now = datetime.now(timezone.utc)

    active_future = CommunityAlert(
        title="Active Future Alert",
        message="This alert is active and not expired",
        category="water_main_break",
        severity="critical",
        latitude=-33.928,
        longitude=18.41,
        radius_meters=5000,
        expires_at=now + timedelta(days=7),
        is_active=True,
        municipality_id=municipality.id,
    )
    active_expired = CommunityAlert(
        title="Active Expired Alert",
        message="This alert is active but expired",
        category="power_outage",
        severity="warning",
        latitude=-33.928,
        longitude=18.41,
        radius_meters=5000,
        expires_at=now - timedelta(days=1),
        is_active=True,
        municipality_id=municipality.id,
    )
    inactive_future = CommunityAlert(
        title="Inactive Future Alert",
        message="This alert is inactive but not expired",
        category="road_closure",
        severity="info",
        latitude=-33.928,
        longitude=18.41,
        radius_meters=5000,
        expires_at=now + timedelta(days=7),
        is_active=False,
        municipality_id=municipality.id,
    )

    db.session.add_all([active_future, active_expired, inactive_future])
    db.session.commit()
    return {
        "active_future": active_future,
        "active_expired": active_expired,
        "inactive_future": inactive_future,
    }


class TestAlertsFiltering:
    def test_active_alerts_returned(self, client, auth_headers, alert_fixtures):
        resp = client.get("/api/mobile/alerts", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        titles = [a["title"] for a in data]
        assert "Active Future Alert" in titles

    def test_expired_alerts_excluded(self, client, auth_headers, alert_fixtures):
        resp = client.get("/api/mobile/alerts", headers=auth_headers)
        data = resp.get_json()
        titles = [a["title"] for a in data]
        assert "Active Expired Alert" not in titles

    def test_inactive_alerts_excluded(self, client, auth_headers, alert_fixtures):
        resp = client.get("/api/mobile/alerts", headers=auth_headers)
        data = resp.get_json()
        titles = [a["title"] for a in data]
        assert "Inactive Future Alert" not in titles

    def test_geographic_filtering(self, client, auth_headers, db, municipality):
        now = datetime.now(timezone.utc)
        # Alert centered at Cape Town
        nearby = CommunityAlert(
            title="Nearby Alert",
            message="Close by",
            category="water_leak",
            severity="warning",
            latitude=-33.928,
            longitude=18.41,
            radius_meters=1000,
            expires_at=now + timedelta(days=7),
            is_active=True,
            municipality_id=municipality.id,
        )
        # Alert centered far away (Johannesburg)
        far_away = CommunityAlert(
            title="Far Away Alert",
            message="Too far",
            category="power_outage",
            severity="info",
            latitude=-26.2,
            longitude=28.04,
            radius_meters=1000,
            expires_at=now + timedelta(days=7),
            is_active=True,
            municipality_id=municipality.id,
        )
        db.session.add_all([nearby, far_away])
        db.session.commit()

        # Query from Cape Town coordinates
        resp = client.get(
            "/api/mobile/alerts?lat=-33.928&lng=18.41",
            headers=auth_headers,
        )
        data = resp.get_json()
        titles = [a["title"] for a in data]
        assert "Nearby Alert" in titles
        assert "Far Away Alert" not in titles


class TestAlertsSorting:
    def test_severity_sorting(self, client, auth_headers, db, municipality):
        now = datetime.now(timezone.utc)
        alerts = [
            CommunityAlert(
                title="Info Alert", message="m", category="c",
                severity="info", latitude=0, longitude=0, radius_meters=1000,
                expires_at=now + timedelta(days=7), is_active=True,
                municipality_id=municipality.id,
            ),
            CommunityAlert(
                title="Critical Alert", message="m", category="c",
                severity="critical", latitude=0, longitude=0, radius_meters=1000,
                expires_at=now + timedelta(days=7), is_active=True,
                municipality_id=municipality.id,
            ),
            CommunityAlert(
                title="Warning Alert", message="m", category="c",
                severity="warning", latitude=0, longitude=0, radius_meters=1000,
                expires_at=now + timedelta(days=7), is_active=True,
                municipality_id=municipality.id,
            ),
        ]
        db.session.add_all(alerts)
        db.session.commit()

        resp = client.get("/api/mobile/alerts", headers=auth_headers)
        data = resp.get_json()
        severities = [a["severity"] for a in data]
        # critical should come before warning, warning before info
        assert severities.index("critical") < severities.index("warning")
        assert severities.index("warning") < severities.index("info")


class TestAlertsAuth:
    def test_unauthenticated_returns_401(self, client):
        resp = client.get("/api/mobile/alerts")
        assert resp.status_code == 401
