"""Seed the database with demo data for 3 SA municipalities."""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app, db
from app.models.municipality import Municipality
from app.models.user import User
from app.models.report import Report
from app.models.report_sub import ReportHistory, ReportComment
from app.models.notification import Notification
from app.models.sla import SLAConfig, SLATracking
from app.models.community_alert import CommunityAlert
from datetime import datetime, timedelta, timezone
import random

app = create_app()

CATEGORIES = ["pothole", "water_leak", "power_outage", "traffic_light",
              "street_light", "garbage", "other"]
STATUSES = ["received", "under_review", "crew_dispatched", "in_progress",
            "resolved", "closed"]
PRIORITIES = ["low", "medium", "high", "critical"]

# Cape Town locations
CT_LOCATIONS = [
    ("Main Road, Observatory", -33.9249, 18.4241),
    ("Kloof Street, Gardens", -33.9300, 18.4150),
    ("Long Street, CBD", -33.9180, 18.4280),
    ("Voortrekker Road, Bellville", -33.9010, 18.6300),
    ("Victoria Road, Camps Bay", -33.9510, 18.3770),
    ("Adderley Street, CBD", -33.9200, 18.4230),
    ("Lansdowne Road, Claremont", -33.9830, 18.4690),
    ("Durban Road, Mowbray", -33.9420, 18.4730),
    ("Lower Main Road, Salt River", -33.9280, 18.4620),
    ("Rondebosch Main Road", -33.9600, 18.4730),
    ("Station Road, Woodstock", -33.9260, 18.4480),
    ("Buitenkant Street, CBD", -33.9250, 18.4300),
    ("Roeland Street, Gardens", -33.9310, 18.4220),
    ("Bree Street, CBD", -33.9190, 18.4210),
    ("Loop Street, CBD", -33.9210, 18.4200),
]

# Durban locations
DBN_LOCATIONS = [
    ("Florida Road, Morningside", -29.8400, 31.0100),
    ("Smith Street, CBD", -29.8587, 31.0218),
    ("Umhlanga Rocks Drive", -29.7230, 31.0850),
    ("Inanda Road, Durban North", -29.7900, 31.0300),
    ("Musgrave Road, Berea", -29.8450, 31.0050),
    ("Point Road, Durban Point", -29.8650, 31.0350),
    ("West Street, CBD", -29.8570, 31.0200),
    ("Windermere Road, Morningside", -29.8380, 31.0130),
    ("Argyle Road, Berea", -29.8500, 31.0000),
    ("Essenwood Road, Berea", -29.8430, 31.0020),
    ("Umgeni Road, Stamford Hill", -29.8300, 31.0150),
    ("Sandile Thusi Road, Greyville", -29.8480, 31.0250),
]

# Johannesburg locations
JHB_LOCATIONS = [
    ("Jan Smuts Avenue, Rosebank", -26.1460, 28.0440),
    ("Oxford Road, Illovo", -26.1310, 28.0530),
    ("Commissioner Street, CBD", -26.2050, 28.0470),
    ("William Nicol Drive, Sandton", -26.0870, 28.0570),
    ("Rivonia Road, Sandton", -26.1070, 28.0570),
    ("Louis Botha Avenue, Orange Grove", -26.1600, 28.0700),
    ("Empire Road, Parktown", -26.1800, 28.0400),
    ("Corlett Drive, Melrose", -26.1400, 28.0600),
    ("Tyrwhitt Avenue, Rosebank", -26.1480, 28.0460),
    ("Jellicoe Avenue, Rosebank", -26.1450, 28.0480),
    ("Cradock Avenue, Rosebank", -26.1500, 28.0450),
    ("Biermann Avenue, Rosebank", -26.1520, 28.0430),
    ("Bolton Road, Parkwood", -26.1550, 28.0500),
    ("Glenhove Road, Melrose", -26.1380, 28.0550),
]

CITIZEN_NAMES = [
    "Thabo Mokoena", "Naledi Dlamini", "Sipho Nkosi", "Zanele Mthembu",
    "Pieter van der Merwe", "Fatima Patel", "Bongani Zulu", "Lerato Molefe",
    "Johan Botha", "Ayanda Khumalo", "Nomsa Ndlovu", "David September",
]

DESCRIPTIONS = {
    "pothole": [
        "Large pothole causing traffic hazards",
        "Deep pothole near school entrance",
        "Multiple potholes on residential street",
        "Pothole filled with water, hard to see",
    ],
    "water_leak": [
        "Water gushing from broken pipe",
        "Persistent leak flooding the sidewalk",
        "Water main break affecting the block",
        "Slow leak from fire hydrant",
    ],
    "power_outage": [
        "Entire block without power since morning",
        "Intermittent power cuts in the area",
        "Transformer sparking and smoking",
        "Street lights out on main road",
    ],
    "traffic_light": [
        "Traffic light stuck on red",
        "All lights at intersection not working",
        "Pedestrian crossing signal broken",
    ],
    "street_light": [
        "Street light flickering all night",
        "Row of street lights not working",
        "Broken street light pole leaning dangerously",
    ],
    "garbage": [
        "Overflowing bins at park entrance",
        "Illegal dumping on vacant lot",
        "Missed collection for two weeks",
        "Hazardous waste dumped near river",
    ],
    "other": [
        "Graffiti on public building",
        "Damaged park bench needs repair",
        "Overgrown vegetation blocking sidewalk",
        "Broken playground equipment",
    ],
}


def seed():
    with app.app_context():
        db.drop_all()
        db.create_all()

        # Municipalities
        m1 = Municipality(name="City of Cape Town",
                          contact_email="contact@capetown.gov.za",
                          contact_phone="0860 103 089",
                          address="Civic Centre, 12 Hertzog Blvd, Cape Town")
        m2 = Municipality(name="eThekwini Municipality (Durban)",
                          contact_email="sizakala@durban.gov.za",
                          contact_phone="031 311 1111",
                          address="City Hall, Dr Pixley Ka Seme St, Durban")
        m3 = Municipality(name="City of Johannesburg",
                          contact_email="joburgconnect@joburg.org.za",
                          contact_phone="0860 562 874",
                          address="Metro Centre, Braamfontein, Johannesburg")
        db.session.add_all([m1, m2, m3])
        db.session.flush()

        # Users - Super Admin
        admin = User(email="admin@citywatcher.co.za", first_name="Admin",
                     last_name="Super", role="super_admin",
                     department="Administration", municipality_id=m1.id,
                     phone="+27800000001")
        admin.set_password("admin123")
        db.session.add(admin)

        # Municipality admins
        users_data = [
            ("cape.admin@citywatcher.co.za", "Sarah", "Williams",
             "municipality_admin", "Administration", m1.id),
            ("durban.admin@citywatcher.co.za", "Themba", "Ngcobo",
             "municipality_admin", "Administration", m2.id),
            ("jhb.admin@citywatcher.co.za", "Priya", "Naidoo",
             "municipality_admin", "Administration", m3.id),
            ("roads.mgr@citywatcher.co.za", "James", "October",
             "department_manager", "Public Works", m1.id),
            ("water.mgr@citywatcher.co.za", "Lindiwe", "Sithole",
             "department_manager", "Water & Sanitation", m2.id),
            ("power.mgr@citywatcher.co.za", "Andre", "Pretorius",
             "department_manager", "Electricity", m3.id),
            ("field1@citywatcher.co.za", "Bongani", "Mkhize",
             "field_worker", "Public Works", m1.id),
            ("field2@citywatcher.co.za", "Nomsa", "Dube",
             "field_worker", "Water & Sanitation", m2.id),
            ("field3@citywatcher.co.za", "Ruan", "Venter",
             "field_worker", "Electricity", m3.id),
            ("field4@citywatcher.co.za", "Zinhle", "Cele",
             "field_worker", "Waste Management", m1.id),
        ]
        all_users = [admin]
        for email, fn, ln, role, dept, mid in users_data:
            u = User(email=email, first_name=fn, last_name=ln, role=role,
                     department=dept, municipality_id=mid)
            u.set_password("password123")
            db.session.add(u)
            all_users.append(u)
        db.session.flush()

        # Reports - 150 total across 3 municipalities (50 each)
        now = datetime.now(timezone.utc)
        report_id = 0
        all_reports = []

        for muni, locations in [(m1, CT_LOCATIONS), (m2, DBN_LOCATIONS),
                                (m3, JHB_LOCATIONS)]:
            muni_users = [u for u in all_users if u.municipality_id == muni.id]
            for i in range(50):
                report_id += 1
                cat = random.choice(CATEGORIES)
                status = random.choice(STATUSES)
                priority = random.choice(PRIORITIES)
                loc = random.choice(locations)
                citizen = random.choice(CITIZEN_NAMES)
                desc = random.choice(DESCRIPTIONS[cat])
                days_ago = random.randint(0, 30)
                created = now - timedelta(days=days_ago,
                                          hours=random.randint(0, 23),
                                          minutes=random.randint(0, 59))
                completed = None
                if status in ("resolved", "closed"):
                    completed = created + timedelta(
                        hours=random.randint(2, 72))

                assignee = random.choice(muni_users) if status != "received" else None

                # Tighter clustering around locations for better heatmap
                r = Report(
                    report_number=f"CW-2026-{report_id:05d}",
                    category=cat,
                    title=desc[:60],
                    description=desc,
                    status=status,
                    priority=priority,
                    location_address=loc[0],
                    location_lat=loc[1] + random.uniform(-0.005, 0.005),
                    location_lng=loc[2] + random.uniform(-0.005, 0.005),
                    ward=f"Ward {random.randint(1, 30)}",
                    citizen_name=citizen,
                    citizen_phone=f"+2782{random.randint(1000000, 9999999)}",
                    citizen_email=f"{citizen.split()[0].lower()}@email.com",
                    assigned_to=assignee.id if assignee else None,
                    municipality_id=muni.id,
                    created_at=created,
                    updated_at=created,
                    completed_at=completed,
                )
                db.session.add(r)
                all_reports.append(r)
        db.session.flush()

        # History entries for each report
        for r in all_reports:
            h = ReportHistory(report_id=r.id, user_id=admin.id,
                              action="created", new_value="received",
                              timestamp=r.created_at)
            db.session.add(h)
            if r.status != "received":
                h2 = ReportHistory(
                    report_id=r.id, user_id=admin.id,
                    action="status_changed", old_value="received",
                    new_value=r.status,
                    timestamp=r.created_at + timedelta(hours=random.randint(1, 12)))
                db.session.add(h2)

        # Some comments
        for r in random.sample(all_reports, min(20, len(all_reports))):
            c = ReportComment(
                report_id=r.id,
                user_id=random.choice(all_users).id,
                comment_text=random.choice([
                    "Team has been notified.",
                    "Crew dispatched to location.",
                    "Awaiting parts for repair.",
                    "Issue confirmed on site visit.",
                    "Escalated to senior management.",
                    "Repair completed, monitoring.",
                ]),
                is_internal=True,
            )
            db.session.add(c)

        # Notifications for admin
        for i in range(10):
            r = random.choice(all_reports)
            n = Notification(
                user_id=admin.id,
                type=random.choice(["new_report", "status_changed",
                                    "report_assigned"]),
                title=f"Report {r.report_number}",
                message=f"New activity on report {r.report_number}",
                link=f"/reports/{r.id}",
                is_read=random.choice([True, False]),
            )
            db.session.add(n)

        # SLA Configurations for each municipality
        sla_categories = {
            "pothole": 72,
            "water_leak": 24,
            "power_outage": 12,
            "street_light": 168,
            "garbage": 48,
            "traffic_light": 24,
        }
        sla_configs = []
        for muni in [m1, m2, m3]:
            for cat, hours in sla_categories.items():
                config = SLAConfig(
                    municipality_id=muni.id,
                    category=cat,
                    response_hours=hours,
                    warning_threshold_pct=75,
                )
                db.session.add(config)
                sla_configs.append(config)
        db.session.flush()

        # SLA Tracking records for some existing reports
        sla_count = 0
        for r in all_reports:
            if r.category in sla_categories and r.status not in ("resolved", "closed"):
                config = next(
                    (c for c in sla_configs
                     if c.municipality_id == r.municipality_id and c.category == r.category),
                    None,
                )
                if config and sla_count < 15:
                    deadline = r.created_at + timedelta(hours=config.response_hours)
                    breached = deadline < now and r.status not in ("resolved", "closed")
                    tracking = SLATracking(
                        report_id=r.id,
                        sla_config_id=config.id,
                        deadline=deadline,
                        breached=breached,
                        breached_at=now if breached else None,
                    )
                    db.session.add(tracking)
                    sla_count += 1
        db.session.flush()

        # Community Alerts
        alerts = [
            CommunityAlert(
                title="Water Main Break - Observatory",
                message="A major water main has burst on Main Road, Observatory. Residents may experience low water pressure or no water supply. Repair crews are on site.",
                category="water_main_break",
                severity="critical",
                latitude=-33.9249,
                longitude=18.4241,
                radius_meters=1000,
                expires_at=now + timedelta(days=2),
                is_active=True,
                municipality_id=m1.id,
                created_at=now - timedelta(hours=3),
            ),
            CommunityAlert(
                title="Power Outage - Sandton",
                message="Scheduled maintenance will cause power outages in the Sandton area. Please ensure backup power for essential equipment.",
                category="power_outage",
                severity="critical",
                latitude=-26.1070,
                longitude=28.0570,
                radius_meters=2000,
                expires_at=now + timedelta(days=1),
                is_active=True,
                municipality_id=m3.id,
                created_at=now - timedelta(hours=1),
            ),
            CommunityAlert(
                title="Road Closure - Kloof Street",
                message="Kloof Street will be partially closed for pothole repairs. Expect delays and use alternative routes where possible.",
                category="road_closure",
                severity="warning",
                latitude=-33.9300,
                longitude=18.4150,
                radius_meters=500,
                expires_at=now + timedelta(days=3),
                is_active=True,
                municipality_id=m1.id,
                created_at=now - timedelta(hours=6),
            ),
            CommunityAlert(
                title="Waste Collection Delay - Berea",
                message="Waste collection in the Berea area has been delayed due to vehicle maintenance. Collections will resume tomorrow.",
                category="waste_collection",
                severity="warning",
                latitude=-29.8450,
                longitude=31.0050,
                radius_meters=1500,
                expires_at=now + timedelta(days=1),
                is_active=True,
                municipality_id=m2.id,
                created_at=now - timedelta(hours=12),
            ),
            CommunityAlert(
                title="Park Maintenance - Rondebosch Common",
                message="Routine maintenance will be conducted at Rondebosch Common this week. Some areas may be temporarily inaccessible.",
                category="maintenance",
                severity="info",
                latitude=-33.9600,
                longitude=18.4730,
                radius_meters=800,
                expires_at=now - timedelta(days=1),  # Expired for testing
                is_active=True,
                municipality_id=m1.id,
                created_at=now - timedelta(days=3),
            ),
        ]
        # Make one alert inactive for testing
        inactive_alert = CommunityAlert(
            title="Resolved: Gas Leak - CBD",
            message="The gas leak reported on Commissioner Street has been resolved. All clear.",
            category="gas_leak",
            severity="info",
            latitude=-26.2050,
            longitude=28.0470,
            radius_meters=500,
            expires_at=now + timedelta(days=1),
            is_active=False,  # Inactive for testing
            municipality_id=m3.id,
            created_at=now - timedelta(days=2),
        )
        alerts.append(inactive_alert)
        db.session.add_all(alerts)
        db.session.flush()

        db.session.commit()
        print(f"Seeded: 3 municipalities, {len(all_users)} users, "
              f"{len(all_reports)} reports, {len(sla_configs)} SLA configs, "
              f"{sla_count} SLA tracking records, {len(alerts)} community alerts")
        print("Admin login: admin@citywatcher.co.za / admin123")


if __name__ == "__main__":
    seed()
