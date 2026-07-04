import hashlib
import hmac
import json
import os
import secrets
import smtplib
import threading
from datetime import datetime
from email.message import EmailMessage
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent
DATABASE_DIR = ROOT / "database"
DATABASE_PATH = DATABASE_DIR / "vidyasetu-db.json"
ADMIN_PASSWORD = "Himu**1983"
DB_LOCK = threading.Lock()


def now_text():
    return datetime.now().strftime("%d/%m/%Y, %I:%M:%S %p")


def normalize(value):
    return str(value or "").strip().lower()


def normalize_mobile(value):
    return "".join(str(value or "").strip().lower().split())


def hash_password(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", str(password).encode("utf-8"), salt.encode("utf-8"), 120_000)
    return f"{salt}${digest.hex()}"


def verify_password(password, stored):
    if not stored or "$" not in stored:
        return False
    salt, digest = stored.split("$", 1)
    return hmac.compare_digest(hash_password(password, salt).split("$", 1)[1], digest)


def empty_database():
    return {"schools": [], "sessions": {}, "adminSessions": [], "downloadCount": 0}


def safe_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def read_database():
    DATABASE_DIR.mkdir(exist_ok=True)
    if not DATABASE_PATH.exists():
      return empty_database()
    try:
        with DATABASE_PATH.open("r", encoding="utf-8") as file:
            data = json.load(file)
    except (json.JSONDecodeError, OSError):
        return empty_database()
    return {
        "schools": data.get("schools") if isinstance(data.get("schools"), list) else [],
        "sessions": data.get("sessions") if isinstance(data.get("sessions"), dict) else {},
        "adminSessions": data.get("adminSessions") if isinstance(data.get("adminSessions"), list) else [],
        "downloadCount": safe_int(data.get("downloadCount"), 0)
    }


def write_database(data):
    DATABASE_DIR.mkdir(exist_ok=True)
    with DATABASE_PATH.open("w", encoding="utf-8") as file:
        json.dump(data, file, indent=2)


def public_school(school):
    if not school:
        return None
    item = dict(school)
    item.pop("passwordHash", None)
    return item


def auth_header(headers):
    value = headers.get("Authorization", "")
    if value.startswith("Bearer "):
        return value[7:].strip()
    return ""


def smtp_configured():
    return bool(os.environ.get("VIDYASETU_SMTP_HOST") and os.environ.get("VIDYASETU_SMTP_FROM"))


def send_activation_email(school):
    if not smtp_configured():
        return {"sent": False, "message": "SMTP is not configured."}

    activation_key = school.get("activationKey") or ""
    email_to = school.get("email") or ""
    if not activation_key:
        return {"sent": False, "message": "Activation key is empty, so email was not sent."}
    if not email_to:
        return {"sent": False, "message": "School email is missing."}

    school_name = school.get("schoolName") or "VidyaSetu ERP user"
    message = EmailMessage()
    message["Subject"] = "VidyaSetu ERP Activation Key"
    message["From"] = os.environ["VIDYASETU_SMTP_FROM"]
    message["To"] = email_to
    message.set_content(
        "\n".join([
            f"Dear {school_name},",
            "",
            "Your VidyaSetu ERP activation details are given below:",
            "",
            f"Activation Key: {activation_key}",
            f"Activation Date: {school.get('activationDate') or 'Not set'}",
            f"Expiry Date: {school.get('expiryDate') or 'Not set'}",
            f"License Capacity: {school.get('students') or 'Not selected'}",
            f"License Duration: {school.get('licenseDurationLabel') or 'Not selected'}",
            "",
            "Please keep this activation key confidential and use it only for your registered school account/machine.",
            "",
            "Regards,",
            "VidyaSetu Tech",
            "support@vidyasetuerptech.com"
        ])
    )

    host = os.environ["VIDYASETU_SMTP_HOST"]
    port = int(os.environ.get("VIDYASETU_SMTP_PORT", "587"))
    username = os.environ.get("VIDYASETU_SMTP_USER", "")
    password = os.environ.get("VIDYASETU_SMTP_PASSWORD", "")
    use_ssl = os.environ.get("VIDYASETU_SMTP_SSL", "").strip().lower() in {"1", "true", "yes"}

    try:
        smtp_class = smtplib.SMTP_SSL if use_ssl else smtplib.SMTP
        with smtp_class(host, port, timeout=20) as smtp:
            if not use_ssl:
                smtp.starttls()
            if username and password:
                smtp.login(username, password)
            smtp.send_message(message)
        return {"sent": True, "message": f"Activation email sent to {email_to}."}
    except Exception as error:
        return {"sent": False, "message": f"Activation saved, but email could not be sent: {error}"}


class VidyaSetuJsonHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def read_json(self):
        length = int(self.headers.get("Content-Length", "0") or "0")
        if not length:
            return {}
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def send_json(self, payload, status=HTTPStatus.OK):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, message, status=HTTPStatus.BAD_REQUEST, code=None):
        self.send_json({"error": code or message, "message": message}, status)

    def get_current_school(self, data):
        token = auth_header(self.headers)
        school_id = data["sessions"].get(token)
        if not school_id:
            return None
        return next((school for school in data["schools"] if school["id"] == school_id), None)

    def has_admin_session(self, data):
        token = auth_header(self.headers)
        return token in data["adminSessions"]

    def do_POST(self):
        path = urlparse(self.path).path
        if not path.startswith("/api/"):
            return self.send_error_json("API endpoint not found.", HTTPStatus.NOT_FOUND, "NOT_FOUND")
        try:
            payload = self.read_json()
        except json.JSONDecodeError:
            return self.send_error_json("Invalid JSON request.", HTTPStatus.BAD_REQUEST, "INVALID_JSON")

        with DB_LOCK:
            data = read_database()
            if path == "/api/downloads":
                data["downloadCount"] = safe_int(data.get("downloadCount"), 0) + 1
                write_database(data)
                return self.send_json({"count": data["downloadCount"]})
            if path == "/api/school/create":
                return self.create_school(data, payload)
            if path == "/api/school/login":
                return self.login_school(data, payload)
            if path == "/api/school/details":
                return self.save_school_details(data, payload)
            if path == "/api/admin/login":
                return self.admin_login(data, payload)
        return self.send_error_json("API endpoint not found.", HTTPStatus.NOT_FOUND, "NOT_FOUND")

    def do_GET(self):
        path = urlparse(self.path).path
        if not path.startswith("/api/"):
            return super().do_GET()

        with DB_LOCK:
            data = read_database()
            if path == "/api/downloads":
                return self.send_json({"count": safe_int(data.get("downloadCount"), 0)})
            if path == "/api/school/account":
                school = self.get_current_school(data)
                if not school:
                    return self.send_error_json("Please login again.", HTTPStatus.UNAUTHORIZED, "UNAUTHORIZED")
                return self.send_json({"school": public_school(school)})
            if path == "/api/admin/schools":
                if not self.has_admin_session(data):
                    return self.send_error_json("Admin login required.", HTTPStatus.UNAUTHORIZED, "UNAUTHORIZED")
                schools = sorted(data["schools"], key=lambda item: item.get("updatedAt", ""), reverse=True)
                return self.send_json({"schools": [public_school(school) for school in schools]})
        return self.send_error_json("API endpoint not found.", HTTPStatus.NOT_FOUND, "NOT_FOUND")

    def do_PUT(self):
        path = urlparse(self.path).path
        if not path.startswith("/api/admin/schools/") or not path.endswith("/activation"):
            return self.send_error_json("API endpoint not found.", HTTPStatus.NOT_FOUND, "NOT_FOUND")

        school_id = path.split("/")[4]
        try:
            payload = self.read_json()
        except json.JSONDecodeError:
            return self.send_error_json("Invalid JSON request.", HTTPStatus.BAD_REQUEST, "INVALID_JSON")

        with DB_LOCK:
            data = read_database()
            if not self.has_admin_session(data):
                return self.send_error_json("Admin login required.", HTTPStatus.UNAUTHORIZED, "UNAUTHORIZED")
            school = next((item for item in data["schools"] if item["id"] == school_id), None)
            if not school:
                return self.send_error_json("School account not found.", HTTPStatus.NOT_FOUND, "NOT_FOUND")
            school.update({
                "status": payload.get("status") or "Pending",
                "activationKey": payload.get("activationKey") or "",
                "activationDate": payload.get("activationDate") or "",
                "expiryDate": payload.get("expiryDate") or "",
                "adminNote": payload.get("adminNote") or "",
                "updatedAt": now_text()
            })
            write_database(data)
            email_result = send_activation_email(school)
            return self.send_json({"school": public_school(school), "email": email_result})

    def do_DELETE(self):
        path = urlparse(self.path).path
        if not path.startswith("/api/admin/schools/"):
            return self.send_error_json("API endpoint not found.", HTTPStatus.NOT_FOUND, "NOT_FOUND")

        school_id = path.split("/")[-1]
        with DB_LOCK:
            data = read_database()
            if not self.has_admin_session(data):
                return self.send_error_json("Admin login required.", HTTPStatus.UNAUTHORIZED, "UNAUTHORIZED")
            data["schools"] = [school for school in data["schools"] if school["id"] != school_id]
            data["sessions"] = {token: sid for token, sid in data["sessions"].items() if sid != school_id}
            write_database(data)
            return self.send_json({"ok": True})

    def create_school(self, data, payload):
        email = normalize(payload.get("email"))
        mobile = normalize_mobile(payload.get("mobile"))
        password = str(payload.get("password") or "")
        if not email or not mobile or len(password) < 6:
            return self.send_error_json("Email, mobile number, and password are required.", HTTPStatus.BAD_REQUEST, "MISSING_FIELDS")

        existing = next((school for school in data["schools"] if normalize(school.get("email")) == email or normalize_mobile(school.get("mobile")) == mobile), None)
        if existing:
            return self.send_error_json(f"Account already exist for {existing.get('email') or email} email/mobile no.", HTTPStatus.CONFLICT, "ACCOUNT_EXISTS")

        created_at = now_text()
        school = {
            "id": f"school-{secrets.token_hex(12)}",
            "createdAt": created_at,
            "updatedAt": created_at,
            "email": email,
            "mobile": mobile,
            "passwordHash": hash_password(password),
            "schoolName": "",
            "contactPerson": "",
            "city": "",
            "licenseCapacity": "",
            "licenseDuration": "",
            "licenseDurationLabel": "",
            "actualPrice": "",
            "discountPrice": "",
            "students": "",
            "plan": "",
            "machineId": "",
            "remarks": "",
            "status": "Pending",
            "activationKey": "",
            "activationDate": "",
            "expiryDate": "",
            "adminNote": ""
        }
        token = secrets.token_urlsafe(32)
        data["schools"].insert(0, school)
        data["sessions"][token] = school["id"]
        write_database(data)
        return self.send_json({"token": token, "school": public_school(school)}, HTTPStatus.CREATED)

    def login_school(self, data, payload):
        email = normalize(payload.get("email"))
        mobile = normalize_mobile(payload.get("mobile"))
        password = str(payload.get("password") or "")
        school = next((item for item in data["schools"] if normalize(item.get("email")) == email and normalize_mobile(item.get("mobile")) == mobile), None)
        if not school:
            return self.send_error_json("No school account found for this e-mail/mobile no.", HTTPStatus.NOT_FOUND, "ACCOUNT_NOT_FOUND")
        if not verify_password(password, school.get("passwordHash")):
            return self.send_error_json("Password does not match this school account.", HTTPStatus.UNAUTHORIZED, "PASSWORD_MISMATCH")
        token = secrets.token_urlsafe(32)
        data["sessions"][token] = school["id"]
        write_database(data)
        return self.send_json({"token": token, "school": public_school(school)})

    def save_school_details(self, data, payload):
        school = self.get_current_school(data)
        if not school:
            return self.send_error_json("Please login again.", HTTPStatus.UNAUTHORIZED, "UNAUTHORIZED")

        machine_id = str(payload.get("machineId") or "").strip()
        if not machine_id:
            return self.send_error_json("Machine ID is required.", HTTPStatus.BAD_REQUEST, "MACHINE_REQUIRED")
        duplicate = next((item for item in data["schools"] if item["id"] != school["id"] and normalize(item.get("machineId")) == normalize(machine_id)), None)
        if duplicate:
            return self.send_error_json(f"Machine ID already registered with {duplicate.get('schoolName') or duplicate.get('email')}.", HTTPStatus.CONFLICT, "DUPLICATE_MACHINE")

        school.update({
            "updatedAt": now_text(),
            "schoolName": payload.get("schoolName") or "",
            "contactPerson": payload.get("contactPerson") or "",
            "city": payload.get("city") or "",
            "licenseCapacity": payload.get("licenseCapacity") or "",
            "licenseDuration": payload.get("licenseDuration") or "",
            "licenseDurationLabel": payload.get("licenseDurationLabel") or "",
            "actualPrice": payload.get("actualPrice") or "",
            "discountPrice": payload.get("discountPrice") or "",
            "students": payload.get("students") or "",
            "plan": payload.get("plan") or "",
            "machineId": machine_id,
            "remarks": payload.get("remarks") or ""
        })
        write_database(data)
        return self.send_json({"school": public_school(school)})

    def admin_login(self, data, payload):
        if str(payload.get("password") or "") != ADMIN_PASSWORD:
            return self.send_error_json("Incorrect password.", HTTPStatus.UNAUTHORIZED, "BAD_PASSWORD")
        token = secrets.token_urlsafe(32)
        data["adminSessions"].append(token)
        write_database(data)
        return self.send_json({"token": token})


def run():
    DATABASE_DIR.mkdir(exist_ok=True)
    if not DATABASE_PATH.exists():
        write_database(empty_database())
    server = ThreadingHTTPServer(("127.0.0.1", 5187), VidyaSetuJsonHandler)
    print("VidyaSetu database server running at http://127.0.0.1:5187")
    server.serve_forever()


if __name__ == "__main__":
    run()
