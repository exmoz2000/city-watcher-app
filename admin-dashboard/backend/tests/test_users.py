"""Tests for user management endpoints."""


class TestGetUsers:
    def test_list_users(self, client, auth_headers, admin_user):
        resp = client.get("/api/users", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["total"] >= 1

    def test_filter_by_role(self, client, auth_headers, admin_user):
        resp = client.get("/api/users?role=super_admin", headers=auth_headers)
        data = resp.get_json()
        assert all(u["role"] == "super_admin" for u in data["users"])

    def test_search_users(self, client, auth_headers, admin_user):
        resp = client.get("/api/users?search=Admin", headers=auth_headers)
        data = resp.get_json()
        assert data["total"] >= 1

    def test_users_unauthenticated(self, client):
        resp = client.get("/api/users")
        assert resp.status_code == 401


class TestGetUser:
    def test_get_user(self, client, auth_headers, admin_user):
        user, _ = admin_user
        resp = client.get(f"/api/users/{user.id}", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()["email"] == user.email

    def test_get_nonexistent_user(self, client, auth_headers):
        resp = client.get("/api/users/99999", headers=auth_headers)
        assert resp.status_code == 404


class TestCreateUser:
    def test_create_user(self, client, auth_headers, municipality):
        resp = client.post("/api/users", headers=auth_headers, json={
            "email": "new@test.co.za",
            "first_name": "New",
            "last_name": "User",
            "role": "field_worker",
            "department": "Roads",
            "municipality_id": municipality.id,
            "password": "newpass123",
        })
        assert resp.status_code == 201
        assert resp.get_json()["email"] == "new@test.co.za"

    def test_create_duplicate_email(self, client, auth_headers, admin_user):
        user, _ = admin_user
        resp = client.post("/api/users", headers=auth_headers, json={
            "email": user.email,
            "first_name": "Dup",
            "last_name": "User",
        })
        assert resp.status_code == 409


class TestUpdateUser:
    def test_update_user(self, client, auth_headers, field_worker):
        worker, _ = field_worker
        resp = client.put(f"/api/users/{worker.id}", headers=auth_headers,
                          json={"first_name": "Updated", "department": "Water"})
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["first_name"] == "Updated"
        assert data["department"] == "Water"


class TestToggleUserStatus:
    def test_deactivate_user(self, client, auth_headers, field_worker):
        worker, _ = field_worker
        resp = client.patch(f"/api/users/{worker.id}/status",
                            headers=auth_headers, json={"is_active": False})
        assert resp.status_code == 200
        assert resp.get_json()["is_active"] is False

    def test_activate_user(self, client, auth_headers, field_worker, db):
        worker, _ = field_worker
        worker.is_active = False
        db.session.commit()
        resp = client.patch(f"/api/users/{worker.id}/status",
                            headers=auth_headers, json={"is_active": True})
        assert resp.status_code == 200
        assert resp.get_json()["is_active"] is True
