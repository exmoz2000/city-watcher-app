"""Tests for notification endpoints."""
from app.models.notification import Notification


class TestGetNotifications:
    def test_get_notifications(self, client, auth_headers, admin_user, db):
        user, _ = admin_user
        n = Notification(user_id=user.id, type="new_report",
                         title="Test", message="Test notification")
        db.session.add(n)
        db.session.commit()

        resp = client.get("/api/notifications", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert "notifications" in data
        assert "unread_count" in data
        assert data["unread_count"] >= 1

    def test_notifications_unauthenticated(self, client):
        resp = client.get("/api/notifications")
        assert resp.status_code == 401


class TestMarkRead:
    def test_mark_notification_read(self, client, auth_headers, admin_user, db):
        user, _ = admin_user
        n = Notification(user_id=user.id, type="test", title="Test",
                         message="Msg", is_read=False)
        db.session.add(n)
        db.session.commit()

        resp = client.patch(f"/api/notifications/{n.id}/read",
                            headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()["is_read"] is True


class TestMarkAllRead:
    def test_mark_all_read(self, client, auth_headers, admin_user, db):
        user, _ = admin_user
        for i in range(3):
            db.session.add(Notification(user_id=user.id, type="test",
                                        title=f"N{i}", message="m", is_read=False))
        db.session.commit()

        resp = client.post("/api/notifications/mark-all-read",
                           headers=auth_headers)
        assert resp.status_code == 200

        # Verify all are read
        resp2 = client.get("/api/notifications", headers=auth_headers)
        assert resp2.get_json()["unread_count"] == 0
