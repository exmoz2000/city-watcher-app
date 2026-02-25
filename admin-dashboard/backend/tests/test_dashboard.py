"""Tests for dashboard and analytics endpoints."""


class TestDashboardMetrics:
    def test_get_metrics(self, client, auth_headers, sample_report):
        resp = client.get("/api/dashboard/metrics", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert "total" in data
        assert "pending" in data
        assert "in_progress" in data
        assert "completed" in data
        assert "avg_response_hours" in data
        assert "today" in data
        assert "this_week" in data
        assert "this_month" in data

    def test_metrics_unauthenticated(self, client):
        resp = client.get("/api/dashboard/metrics")
        assert resp.status_code == 401


class TestRecentActivity:
    def test_get_recent_activity(self, client, auth_headers, sample_report):
        resp = client.get("/api/dashboard/recent-activity", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert "action" in data[0]
        assert "timestamp" in data[0]


class TestCharts:
    def test_get_charts(self, client, auth_headers, sample_report):
        resp = client.get("/api/dashboard/charts", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert "by_category" in data
        assert "by_status" in data
        assert "by_priority" in data
        assert isinstance(data["by_category"], list)


class TestAnalyticsTrends:
    def test_get_trends(self, client, auth_headers, sample_report):
        resp = client.get("/api/analytics/trends?days=30", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert isinstance(data, list)

    def test_trends_unauthenticated(self, client):
        resp = client.get("/api/analytics/trends")
        assert resp.status_code == 401


class TestAnalyticsCategories:
    def test_get_categories(self, client, auth_headers, sample_report):
        resp = client.get("/api/analytics/categories", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert isinstance(data, list)
        assert any(c["category"] == "pothole" for c in data)


class TestAnalyticsPerformance:
    def test_get_performance(self, client, auth_headers, sample_report):
        resp = client.get("/api/analytics/performance", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert "total_reports" in data
        assert "resolved_reports" in data
        assert "resolution_rate" in data
        assert data["total_reports"] >= 1
