"""Tests for authentication endpoints."""


class TestLogin:
    def test_login_success(self, client, admin_user):
        user, password = admin_user
        resp = client.post("/api/auth/login",
                           json={"email": user.email, "password": password})
        assert resp.status_code == 200
        data = resp.get_json()
        assert "token" in data
        assert data["user"]["email"] == user.email
        assert data["user"]["role"] == "super_admin"

    def test_login_wrong_password(self, client, admin_user):
        user, _ = admin_user
        resp = client.post("/api/auth/login",
                           json={"email": user.email, "password": "wrong"})
        assert resp.status_code == 401
        assert "error" in resp.get_json()

    def test_login_nonexistent_user(self, client):
        resp = client.post("/api/auth/login",
                           json={"email": "nobody@test.com", "password": "x"})
        assert resp.status_code == 401

    def test_login_missing_fields(self, client):
        resp = client.post("/api/auth/login", json={"email": ""})
        assert resp.status_code == 400

    def test_login_deactivated_user(self, client, admin_user, db):
        user, password = admin_user
        user.is_active = False
        db.session.commit()
        resp = client.post("/api/auth/login",
                           json={"email": user.email, "password": password})
        assert resp.status_code == 403


class TestMe:
    def test_me_authenticated(self, client, auth_headers):
        resp = client.get("/api/auth/me", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()["user"]["email"] == "admin@test.co.za"

    def test_me_no_token(self, client):
        resp = client.get("/api/auth/me")
        assert resp.status_code == 401


class TestLogout:
    def test_logout(self, client, auth_headers):
        resp = client.post("/api/auth/logout", headers=auth_headers)
        assert resp.status_code == 200
