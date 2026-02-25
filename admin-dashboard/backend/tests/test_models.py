"""Tests for database models."""
from app.models.user import User
from app.models.report import Report
from app.models.municipality import Municipality


class TestUserModel:
    def test_password_hashing(self, db):
        u = User(email="hash@test.com", first_name="A", last_name="B")
        u.set_password("secret123")
        assert u.password_hash != "secret123"
        assert u.check_password("secret123") is True
        assert u.check_password("wrong") is False

    def test_password_hash_is_not_plaintext(self, db):
        u = User(email="plain@test.com", first_name="A", last_name="B")
        u.set_password("mypassword")
        assert "mypassword" not in u.password_hash

    def test_user_to_dict(self, admin_user):
        user, _ = admin_user
        d = user.to_dict()
        assert d["email"] == "admin@test.co.za"
        assert d["role"] == "super_admin"
        assert "password_hash" not in d

    def test_user_defaults(self, db):
        u = User(email="def@test.com", first_name="D", last_name="E",
                 password_hash="x")
        db.session.add(u)
        db.session.commit()
        assert u.is_active is True
        assert u.role == "field_worker"


class TestMunicipalityModel:
    def test_municipality_to_dict(self, municipality):
        d = municipality.to_dict()
        assert d["name"] == "Test Municipality"
        assert "settings" in d

    def test_municipality_settings_json(self, db):
        m = Municipality(name="Settings Test")
        m.set_settings({"hours": "8-5", "wards": 10})
        db.session.add(m)
        db.session.commit()
        assert m.get_settings()["hours"] == "8-5"
        assert m.get_settings()["wards"] == 10


class TestReportModel:
    def test_report_to_dict(self, sample_report):
        d = sample_report.to_dict()
        assert d["report_number"] == "CW-TEST-00001"
        assert d["category"] == "pothole"
        assert d["status"] == "received"
        assert "citizen_name" in d

    def test_report_number_unique(self, db, municipality):
        r1 = Report(report_number="CW-UNIQ-001", category="pothole",
                    title="T1", status="received", priority="low",
                    municipality_id=municipality.id)
        db.session.add(r1)
        db.session.commit()

        r2 = Report(report_number="CW-UNIQ-001", category="garbage",
                    title="T2", status="received", priority="low",
                    municipality_id=municipality.id)
        db.session.add(r2)
        import sqlalchemy
        try:
            db.session.commit()
            assert False, "Should have raised IntegrityError"
        except sqlalchemy.exc.IntegrityError:
            db.session.rollback()
