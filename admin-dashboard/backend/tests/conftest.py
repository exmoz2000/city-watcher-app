"""Shared test fixtures for the CityWatcher admin dashboard backend."""
import sys
import os
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import create_app, db as _db
from app.models.user import User
from app.models.municipality import Municipality
from app.models.report import Report
from app.models.report_sub import ReportHistory
from app.models.sla import SLAConfig, SLATracking


@pytest.fixture(scope="session")
def app():
    """Create a Flask app configured for testing."""
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"
    application = create_app()
    application.config["TESTING"] = True
    yield application


@pytest.fixture(autouse=True)
def db(app):
    """Reset database for each test."""
    with app.app_context():
        _db.create_all()
        yield _db
        _db.session.rollback()
        _db.drop_all()


@pytest.fixture
def client(app):
    """Flask test client."""
    return app.test_client()


@pytest.fixture
def municipality(db):
    """Create a test municipality."""
    m = Municipality(name="Test Municipality",
                     contact_email="test@muni.gov.za",
                     contact_phone="012 345 6789")
    db.session.add(m)
    db.session.commit()
    return m


@pytest.fixture
def admin_user(db, municipality):
    """Create an admin user and return (user, password)."""
    u = User(email="admin@test.co.za", first_name="Test", last_name="Admin",
             role="super_admin", department="Admin", municipality_id=municipality.id)
    u.set_password("testpass123")
    db.session.add(u)
    db.session.commit()
    return u, "testpass123"


@pytest.fixture
def field_worker(db, municipality):
    """Create a field worker user."""
    u = User(email="worker@test.co.za", first_name="Field", last_name="Worker",
             role="field_worker", department="Public Works",
             municipality_id=municipality.id)
    u.set_password("workerpass")
    db.session.add(u)
    db.session.commit()
    return u, "workerpass"


@pytest.fixture
def auth_headers(client, admin_user):
    """Get JWT auth headers for admin user."""
    user, password = admin_user
    resp = client.post("/api/auth/login",
                       json={"email": user.email, "password": password})
    token = resp.get_json()["token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def sample_report(db, municipality, admin_user):
    """Create a sample report."""
    user, _ = admin_user
    r = Report(report_number="CW-TEST-00001", category="pothole",
               title="Test pothole", description="A big pothole",
               status="received", priority="medium",
               location_address="Test Street", location_lat=-33.92,
               location_lng=18.42, ward="Ward 1",
               citizen_name="Test Citizen", citizen_phone="+27821234567",
               citizen_email="citizen@test.com",
               municipality_id=municipality.id)
    db.session.add(r)
    db.session.flush()
    h = ReportHistory(report_id=r.id, user_id=user.id,
                      action="created", new_value="received")
    db.session.add(h)
    db.session.commit()
    return r


@pytest.fixture
def second_municipality(db):
    """Create a second municipality for isolation testing."""
    m = Municipality(name="Other Municipality",
                     contact_email="other@muni.gov.za",
                     contact_phone="011 222 3333")
    db.session.add(m)
    db.session.commit()
    return m


@pytest.fixture
def other_muni_admin(db, second_municipality):
    """Admin user for the second municipality."""
    u = User(email="other.admin@test.co.za", first_name="Other", last_name="Admin",
             role="municipality_admin", department="Administration",
             municipality_id=second_municipality.id)
    u.set_password("otherpass")
    db.session.add(u)
    db.session.commit()
    return u, "otherpass"


@pytest.fixture
def muni_admin(db, municipality):
    """Municipality admin for the primary municipality."""
    u = User(email="muni.admin@test.co.za", first_name="Muni", last_name="Admin",
             role="municipality_admin", department="Administration",
             municipality_id=municipality.id)
    u.set_password("muniadminpass")
    db.session.add(u)
    db.session.commit()
    return u, "muniadminpass"


@pytest.fixture
def dept_manager(db, municipality):
    """Department manager for Public Works."""
    u = User(email="manager@test.co.za", first_name="Dept", last_name="Manager",
             role="department_manager", department="Public Works",
             municipality_id=municipality.id)
    u.set_password("managerpass")
    db.session.add(u)
    db.session.commit()
    return u, "managerpass"


@pytest.fixture
def sla_config(db, municipality):
    """SLA config: potholes must be resolved in 72 hours."""
    config = SLAConfig(municipality_id=municipality.id, category="pothole",
                       response_hours=72, warning_threshold_pct=75)
    db.session.add(config)
    db.session.commit()
    return config


def create_report_for_municipality(db, municipality, admin_user, **kwargs):
    """Helper to create a report in a specific municipality."""
    defaults = dict(
        report_number=f"CW-TEST-{municipality.id}-{Report.query.count() + 1:05d}",
        category="pothole",
        title="Test report",
        description="Test description",
        status="received",
        priority="medium",
        location_address="Test Street",
        location_lat=-33.92,
        location_lng=18.42,
        ward="Ward 1",
        citizen_name="Test Citizen",
        citizen_phone="+27821234567",
        citizen_email="citizen@test.com",
        municipality_id=municipality.id,
    )
    defaults.update(kwargs)
    r = Report(**defaults)
    db.session.add(r)
    db.session.flush()
    user = admin_user[0] if isinstance(admin_user, tuple) else admin_user
    h = ReportHistory(report_id=r.id, user_id=user.id,
                      action="created", new_value="received")
    db.session.add(h)
    db.session.commit()
    return r
