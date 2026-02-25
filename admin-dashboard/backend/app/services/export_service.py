import csv
import io


def generate_csv(reports):
    """
    Generate CSV bytes from a list of Report objects.
    Returns UTF-8 encoded bytes with header row and one data row per report.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Report Number", "Category", "Title", "Status", "Priority",
        "Location", "Ward", "Assigned To", "Created", "Completed",
    ])
    for r in reports:
        writer.writerow([
            r.report_number,
            r.category,
            r.title,
            r.status,
            r.priority,
            r.location_address or "",
            r.ward or "",
            f"{r.assignee.first_name} {r.assignee.last_name}" if r.assignee else "",
            r.created_at.isoformat() if r.created_at else "",
            r.completed_at.isoformat() if r.completed_at else "",
        ])
    return output.getvalue().encode("utf-8")
