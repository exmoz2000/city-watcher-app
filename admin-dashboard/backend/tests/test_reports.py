"""Tests for reports endpoints."""


class TestGetReports:
    def test_list_reports(self, client, auth_headers, sample_report):
        resp = client.get("/api/reports", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["total"] >= 1
        assert len(data["reports"]) >= 1

    def test_list_reports_pagination(self, client, auth_headers, sample_report):
        resp = client.get("/api/reports?page=1&per_page=5", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["page"] == 1
        assert data["per_page"] == 5

    def test_filter_by_status(self, client, auth_headers, sample_report):
        resp = client.get("/api/reports?status=received", headers=auth_headers)
        data = resp.get_json()
        assert all(r["status"] == "received" for r in data["reports"])

    def test_filter_by_category(self, client, auth_headers, sample_report):
        resp = client.get("/api/reports?category=pothole", headers=auth_headers)
        data = resp.get_json()
        assert all(r["category"] == "pothole" for r in data["reports"])

    def test_filter_by_priority(self, client, auth_headers, sample_report):
        resp = client.get("/api/reports?priority=medium", headers=auth_headers)
        data = resp.get_json()
        assert all(r["priority"] == "medium" for r in data["reports"])

    def test_search_reports(self, client, auth_headers, sample_report):
        resp = client.get("/api/reports?search=pothole", headers=auth_headers)
        data = resp.get_json()
        assert data["total"] >= 1

    def test_reports_unauthenticated(self, client):
        resp = client.get("/api/reports")
        assert resp.status_code == 401


class TestGetReport:
    def test_get_report_detail(self, client, auth_headers, sample_report):
        resp = client.get(f"/api/reports/{sample_report.id}", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["report_number"] == "CW-TEST-00001"
        assert "comments" in data
        assert "history" in data

    def test_get_nonexistent_report(self, client, auth_headers):
        resp = client.get("/api/reports/99999", headers=auth_headers)
        assert resp.status_code == 404


class TestCreateReport:
    def test_create_report(self, client, auth_headers, municipality):
        resp = client.post("/api/reports", headers=auth_headers, json={
            "category": "water_leak",
            "title": "Water leak on Main St",
            "description": "Big leak",
            "priority": "high",
            "location_address": "Main Street",
            "location_lat": -33.93,
            "location_lng": 18.41,
            "citizen_name": "Jane Doe",
            "municipality_id": municipality.id,
        })
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["category"] == "water_leak"
        assert data["status"] == "received"
        assert data["report_number"].startswith("CW-")


class TestUpdateStatus:
    def test_update_status(self, client, auth_headers, sample_report):
        resp = client.patch(f"/api/reports/{sample_report.id}/status",
                            headers=auth_headers,
                            json={"status": "under_review"})
        assert resp.status_code == 200
        assert resp.get_json()["status"] == "under_review"

    def test_update_status_to_resolved_sets_completed_at(self, client, auth_headers, sample_report):
        resp = client.patch(f"/api/reports/{sample_report.id}/status",
                            headers=auth_headers,
                            json={"status": "resolved"})
        assert resp.status_code == 200
        assert resp.get_json()["completed_at"] is not None

    def test_update_status_missing(self, client, auth_headers, sample_report):
        resp = client.patch(f"/api/reports/{sample_report.id}/status",
                            headers=auth_headers, json={})
        assert resp.status_code == 400


class TestAssignReport:
    def test_assign_report(self, client, auth_headers, sample_report, field_worker):
        worker, _ = field_worker
        resp = client.patch(f"/api/reports/{sample_report.id}/assign",
                            headers=auth_headers,
                            json={"assigned_to": worker.id})
        assert resp.status_code == 200
        assert resp.get_json()["assigned_to"] == worker.id

    def test_unassign_report(self, client, auth_headers, sample_report):
        resp = client.patch(f"/api/reports/{sample_report.id}/assign",
                            headers=auth_headers,
                            json={"assigned_to": None})
        assert resp.status_code == 200
        assert resp.get_json()["assigned_to"] is None


class TestComments:
    def test_add_comment(self, client, auth_headers, sample_report):
        resp = client.post(f"/api/reports/{sample_report.id}/comments",
                           headers=auth_headers,
                           json={"comment_text": "Crew dispatched", "is_internal": True})
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["comment_text"] == "Crew dispatched"
        assert data["is_internal"] is True


class TestReportStats:
    def test_get_stats(self, client, auth_headers, sample_report):
        resp = client.get("/api/reports/stats", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert "total" in data
        assert "pending" in data
        assert "received" in data
