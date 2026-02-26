"""Tests for the POST /api/auth/register endpoint."""
import pytest
from app.models.user import User


@pytest.fixture
def resident_user(db, municipality):
    """Create a resident user and return (user, password)."""
    u = User(
        email="resident@test.co.za",
        first_name="Resident",
        last_name="User",
        role="resident",
        municipality_id=municipality.id,
    )
    u.set_password("resident123")
    db.session.add(u)
    db.session.commit()
    return u, "resident123"


class TestRegistrationSuccess:
    def test_successful_registration(self, client):
        resp = client.post("/api/auth/register", json={
            "email": "newuser@test.co.za",
            "password": "securepass",
            "first_name": "Jane",
            "last_name": "Doe",
        })
        assert resp.status_code == 201
        data = resp.get_json()
        assert "token" in data
        assert data["user"]["role"] == "resident"
        assert data["user"]["email"] == "newuser@test.co.za"

    def test_password_exactly_8_chars(self, client):
        resp = client.post("/api/auth/register", json={
            "email": "eight@test.co.za",
            "password": "12345678",
            "first_name": "Eight",
            "last_name": "Chars",
        })
        assert resp.status_code == 201

    def test_optional_fields_omitted(self, client):
        resp = client.post("/api/auth/register", json={
            "email": "nophone@test.co.za",
            "password": "securepass",
            "first_name": "No",
            "last_name": "Phone",
        })
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["user"]["phone"] is None
        assert data["user"]["municipality_id"] is None


class TestRegistrationValidation:
    def test_duplicate_email(self, client, resident_user):
        user, _ = resident_user
        resp = client.post("/api/auth/register", json={
            "email": user.email,
            "password": "securepass",
            "first_name": "Dup",
            "last_name": "User",
        })
        assert resp.status_code == 409
        assert "Email already registered" in resp.get_json()["error"]

    def test_missing_email(self, client):
        resp = client.post("/api/auth/register", json={
            "password": "securepass",
            "first_name": "No",
            "last_name": "Email",
        })
        assert resp.status_code == 400

    def test_missing_first_name(self, client):
        resp = client.post("/api/auth/register", json={
            "email": "nofirst@test.co.za",
            "password": "securepass",
            "last_name": "Only",
        })
        assert resp.status_code == 400

    def test_missing_password(self, client):
        resp = client.post("/api/auth/register", json={
            "email": "nopass@test.co.za",
            "first_name": "No",
            "last_name": "Pass",
        })
        assert resp.status_code == 400

    def test_missing_last_name(self, client):
        resp = client.post("/api/auth/register", json={
            "email": "nolast@test.co.za",
            "password": "securepass",
            "first_name": "No",
        })
        assert resp.status_code == 400

    def test_short_password(self, client):
        resp = client.post("/api/auth/register", json={
            "email": "short@test.co.za",
            "password": "1234567",
            "first_name": "Short",
            "last_name": "Pass",
        })
        assert resp.status_code == 400
        assert "Password must be at least 8 characters" in resp.get_json()["error"]
