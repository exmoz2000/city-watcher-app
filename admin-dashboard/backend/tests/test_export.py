"""Tests for CSV export service and endpoint."""
import csv
import io
import pytest
from app.services.export_service import generate_csv
from tests.conftest import create_report_for_municipality


def _login(client, user_tuple):
    user, password = user_tuple
    resp = client.post("/api/auth/login", json={"email": user.email, "password": password})
    return {"Authorization": f"Bearer {resp.get_json()['token']}"}


class TestGenerateCSV:
    def test_empty_reports_header_only(self):
        result = generate_csv([])
        text = result.decode("utf-8")
        reader = csv.reader(io.StringIO(text))
        rows = list(reader)
        assert len(rows) == 1  # header only
        assert rows[0][0] == "Report Number"

    def test_single_report(self, db, municipality, admin_user):
        report = create_report_for_municipality(db, municipality, admin_user)
        result = generate_csv([report])
        text = result.decode("utf-8")
        reader = csv.reader(io.StringIO(text))
        rows = list(reader)
        assert len(rows) == 2  # header + 1 data row
        assert rows[1][0] == report.report_number

    def test_multiple_reports(self, db, municipality, admin_user):
        reports = []
        for i in range(5):
            r = create_report_for_municipality(
                db, municipality, admin_user,
                report_number=f"CW-EXPORT-{i:05d}",
                title=f"Report {i}",
            )
            reports.append(r)
        result = generate_csv(reports)
        text = result.decode("utf-8")
        reader = csv.reader(io.StringIO(text))
        rows = list(reader)
        assert len(rows) == 6  # header + 5

    def test_special_characters(self, db, municipality, admin_user):
        report = create_report_for_municipality(
            db, municipality, admin_user,
            title='Report with "quotes", commas, and émojis 🎉',
            location_address="123 O'Brien St, Suite #5",
        )
        result = generate_csv([report])
        text = result.decode("utf-8")
        reader = csv.reader(io.StringIO(text))
        rows = list(reader)
        assert len(rows) == 2
        assert "quotes" in rows[1][2]
        assert "O'Brien" in rows[1][5]


class TestExportEndpoint:
    def test_export_returns_csv(self, client, admin_user, sample_report):
        headers = _login(client, admin_user)
        resp = client.get("/api/reports/export", headers=headers)
        assert resp.status_code == 200
        assert resp.content_type == "text/csv; charset=utf-8"

    def test_content_disposition_header(self, client, admin_user, sample_report):
        headers = _login(client, admin_user)
        resp = client.get("/api/reports/export", headers=headers)
        assert "attachment" in resp.headers.get("Content-Disposition", "")
        assert "reports.csv" in resp.headers.get("Content-Disposition", "")

    def test_export_with_scope(
        self, client, muni_admin, municipality, second_municipality,
        other_muni_admin, db, admin_user
    ):
        create_report_for_municipality(db, municipality, admin_user, title="Own report")
        create_report_for_municipality(db, second_municipality, other_muni_admin, title="Other report")
        headers = _login(client, muni_admin)
        resp = client.get("/api/reports/export", headers=headers)
        assert resp.status_code == 200
        text = resp.data.decode("utf-8")
        reader = csv.reader(io.StringIO(text))
        rows = list(reader)
        # Should only contain own municipality's reports
        for row in rows[1:]:
            assert "Other report" not in row[2]
