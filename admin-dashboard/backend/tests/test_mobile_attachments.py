"""Tests for the POST /api/mobile/reports/<id>/attachments endpoint."""
import io


class TestAttachmentUploadSuccess:
    def test_jpeg_upload(self, client, auth_headers, sample_report):
        data = {
            "file": (io.BytesIO(b"\xff\xd8\xff\xe0" + b"\x00" * 100), "photo.jpg", "image/jpeg"),
        }
        resp = client.post(
            f"/api/mobile/reports/{sample_report.id}/attachments",
            headers=auth_headers,
            data=data,
            content_type="multipart/form-data",
        )
        assert resp.status_code == 201
        body = resp.get_json()
        assert "file_path" in body
        assert body["file_type"] == "image/jpeg"

    def test_png_upload(self, client, auth_headers, sample_report):
        data = {
            "file": (io.BytesIO(b"\x89PNG" + b"\x00" * 100), "photo.png", "image/png"),
        }
        resp = client.post(
            f"/api/mobile/reports/{sample_report.id}/attachments",
            headers=auth_headers,
            data=data,
            content_type="multipart/form-data",
        )
        assert resp.status_code == 201
        body = resp.get_json()
        assert body["file_type"] == "image/png"


class TestAttachmentUploadValidation:
    def test_invalid_file_type(self, client, auth_headers, sample_report):
        data = {
            "file": (io.BytesIO(b"plain text content"), "doc.txt", "text/plain"),
        }
        resp = client.post(
            f"/api/mobile/reports/{sample_report.id}/attachments",
            headers=auth_headers,
            data=data,
            content_type="multipart/form-data",
        )
        assert resp.status_code == 415
        assert "Only JPEG and PNG images are allowed" in resp.get_json()["error"]

    def test_file_too_large(self, client, auth_headers, sample_report):
        # Create a file just over 10 MB
        large_content = b"\xff\xd8\xff\xe0" + b"\x00" * (10 * 1024 * 1024 + 1)
        data = {
            "file": (io.BytesIO(large_content), "big.jpg", "image/jpeg"),
        }
        resp = client.post(
            f"/api/mobile/reports/{sample_report.id}/attachments",
            headers=auth_headers,
            data=data,
            content_type="multipart/form-data",
        )
        assert resp.status_code == 413
        assert "File size exceeds 10 MB limit" in resp.get_json()["error"]

    def test_missing_file(self, client, auth_headers, sample_report):
        resp = client.post(
            f"/api/mobile/reports/{sample_report.id}/attachments",
            headers=auth_headers,
            data={},
            content_type="multipart/form-data",
        )
        assert resp.status_code == 400

    def test_report_not_found(self, client, auth_headers):
        data = {
            "file": (io.BytesIO(b"\xff\xd8\xff\xe0" + b"\x00" * 100), "photo.jpg", "image/jpeg"),
        }
        resp = client.post(
            "/api/mobile/reports/99999/attachments",
            headers=auth_headers,
            data=data,
            content_type="multipart/form-data",
        )
        assert resp.status_code == 404
