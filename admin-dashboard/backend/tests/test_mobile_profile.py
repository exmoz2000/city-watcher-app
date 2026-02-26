"""Tests for the PATCH /api/mobile/profile endpoint."""
import pytest
from app.models.user import User


@pytest.fixture
def resident_auth_headers(client, db, municipality):
    """Create a resident user, log in, and return auth headers."""
    u = User(
        email="profileresident@test.co.za",
        first_name="Profile",
        last_name="Resident",
        role="resident",
        phone="+27820000000",
        municipality_id=municipality.id,
    )
    u.set_password("resident123")
    db.session.add(u)
    db.session.commit()

    resp = client.post("/api/auth/login", json={
        "email": u.email,
        "password": "resident123",
    })
    token = resp.get_json()["token"]
    return {"Authorization": f"Bearer {token}"}


class TestProfileUpdateSuccess:
    def test_successful_update(self, client, resident_auth_headers):
        resp = client.patch("/api/mobile/profile", headers=resident_auth_headers, json={
            "first_name": "Updated",
            "last_name": "Name",
            "phone": "+27829999999",
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["first_name"] == "Updated"
        assert data["last_name"] == "Name"
        assert data["phone"] == "+27829999999"

    def test_partial_update_phone_only(self, client, resident_auth_headers):
        resp = client.patch("/api/mobile/profile", headers=resident_auth_headers, json={
            "phone": "+27821111111",
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["phone"] == "+27821111111"
        # Original name should be unchanged
        assert data["first_name"] == "Profile"
        assert data["last_name"] == "Resident"


class TestProfileProtectedFields:
    def test_role_change_prevention(self, client, resident_auth_headers):
        resp = client.patch("/api/mobile/profile", headers=resident_auth_headers, json={
            "role": "super_admin",
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["role"] == "resident"

    def test_municipality_id_change_prevention(self, client, resident_auth_headers):
        resp = client.patch("/api/mobile/profile", headers=resident_auth_headers, json={
            "municipality_id": 999,
        })
        assert resp.status_code == 200
        data = resp.get_json()
        # municipality_id should remain unchanged (not 999)
        assert data["municipality_id"] != 999


class TestProfileAuth:
    def test_unauthenticated_returns_401(self, client):
        resp = client.patch("/api/mobile/profile", json={"phone": "+27820000000"})
        assert resp.status_code == 401
