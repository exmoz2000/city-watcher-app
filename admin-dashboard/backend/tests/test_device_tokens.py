"""Tests for the POST/DELETE /api/mobile/device-tokens endpoints."""
import pytest
from app.models.device_token import DeviceToken


class TestDeviceTokenRegistration:
    def test_successful_registration(self, client, auth_headers):
        resp = client.post("/api/mobile/device-tokens", headers=auth_headers, json={
            "expo_push_token": "ExponentPushToken[test123]",
            "platform": "android",
        })
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["expo_push_token"] == "ExponentPushToken[test123]"
        assert data["platform"] == "android"
        assert data["is_active"] is True

    def test_duplicate_token_returns_200(self, client, auth_headers, db):
        payload = {
            "expo_push_token": "ExponentPushToken[dup123]",
            "platform": "ios",
        }
        # First registration
        resp1 = client.post("/api/mobile/device-tokens", headers=auth_headers, json=payload)
        assert resp1.status_code == 201

        # Second registration with same token
        resp2 = client.post("/api/mobile/device-tokens", headers=auth_headers, json=payload)
        assert resp2.status_code == 200

        # Only one active record should exist
        count = DeviceToken.query.filter_by(
            expo_push_token="ExponentPushToken[dup123]", is_active=True
        ).count()
        assert count == 1

    def test_missing_fields(self, client, auth_headers):
        resp = client.post("/api/mobile/device-tokens", headers=auth_headers, json={})
        assert resp.status_code == 400


class TestDeviceTokenDeactivation:
    def test_deactivation(self, client, auth_headers, db):
        # Register first
        client.post("/api/mobile/device-tokens", headers=auth_headers, json={
            "expo_push_token": "ExponentPushToken[deact123]",
            "platform": "android",
        })

        # Deactivate
        resp = client.delete("/api/mobile/device-tokens", headers=auth_headers, json={
            "expo_push_token": "ExponentPushToken[deact123]",
        })
        assert resp.status_code == 200

        token = DeviceToken.query.filter_by(
            expo_push_token="ExponentPushToken[deact123]"
        ).first()
        assert token.is_active is False

    def test_reregistration_after_deactivation(self, client, auth_headers, db):
        payload = {
            "expo_push_token": "ExponentPushToken[reactivate123]",
            "platform": "ios",
        }
        # Register
        client.post("/api/mobile/device-tokens", headers=auth_headers, json=payload)
        # Deactivate
        client.delete("/api/mobile/device-tokens", headers=auth_headers, json={
            "expo_push_token": payload["expo_push_token"],
        })
        # Re-register
        resp = client.post("/api/mobile/device-tokens", headers=auth_headers, json=payload)
        assert resp.status_code == 200

        token = DeviceToken.query.filter_by(
            expo_push_token=payload["expo_push_token"]
        ).first()
        assert token.is_active is True


class TestDeviceTokenAuth:
    def test_unauthenticated_returns_401(self, client):
        resp = client.post("/api/mobile/device-tokens", json={
            "expo_push_token": "ExponentPushToken[noauth]",
            "platform": "android",
        })
        assert resp.status_code == 401
