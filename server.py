"""
DormFinder — Python API Server
Requires: Python 3.6+  (uses only stdlib — no pip installs needed)
Run:  python server.py
Open: http://localhost:3000
"""

import json
import os
import sqlite3
import time
import random
import string
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = 3000
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dormfinder.db")


# ── helpers ──────────────────────────────────────────────────
def get_db():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    con.execute("PRAGMA journal_mode = WAL")
    return con


def ensure_photos_table(con):
    """Create dorm_photos table if it doesn't exist yet."""
    con.execute("""
        CREATE TABLE IF NOT EXISTS dorm_photos (
            photo_id   INTEGER PRIMARY KEY AUTOINCREMENT,
            dorm_id    INTEGER NOT NULL,
            photo_data TEXT    NOT NULL,
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TEXT    NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (dorm_id) REFERENCES dorms(dorm_id) ON DELETE CASCADE
        )
    """)
    con.commit()


def initials(name):
    parts = name.strip().split()
    return "".join(p[0] for p in parts).upper()[:2]


def rand_token():
    chars = string.ascii_letters + string.digits
    return "sess_" + str(int(time.time() * 1000)) + "_" + "".join(random.choices(chars, k=12))


def json_response(handler, status, data):
    body = json.dumps(data, default=str).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.end_headers()
    handler.wfile.write(body)


# ── request handler ───────────────────────────────────────────
class DormHandler(SimpleHTTPRequestHandler):

    def log_message(self, fmt, *args):
        print(f"  {self.address_string()} {fmt % args}")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path   = parsed.path

        if path == "/api/ping":
            json_response(self, 200, {"ok": True, "message": "pong"})
        elif path == "/api/users":
            self._handle_users()
        elif path == "/api/listings":
            self._handle_get_listings(parsed)
        elif path.startswith("/api/listings/") and path.endswith("/photos"):
            dorm_id = self._extract_id(path, "/api/listings/", "/photos")
            if dorm_id: self._handle_get_photos(dorm_id)
            else: json_response(self, 400, {"ok": False, "message": "Bad request"})
        elif path == "/api/bookings":
            self._handle_get_bookings(parsed)
        elif path == "/api/messages":
            self._handle_get_messages(parsed)
        else:
            if path == "/" or path == "":
                self.path = "/index.html"
            super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path   = parsed.path

        if path == "/api/login":
            self._handle_login()
        elif path == "/api/register":
            self._handle_register()
        elif path == "/api/listings":
            self._handle_add_listing()
        elif path.startswith("/api/listings/") and path.endswith("/photos"):
            dorm_id = self._extract_id(path, "/api/listings/", "/photos")
            if dorm_id: self._handle_add_photo(dorm_id)
            else: json_response(self, 400, {"ok": False, "message": "Bad request"})
        elif path == "/api/bookings":
            self._handle_add_booking()
        elif path == "/api/messages":
            self._handle_add_message()
        else:
            json_response(self, 404, {"ok": False, "message": "Not found"})

    def do_PUT(self):
        parsed = urlparse(self.path)
        path   = parsed.path

        if path.startswith("/api/listings/"):
            dorm_id = self._extract_id(path, "/api/listings/", "")
            if dorm_id: self._handle_update_listing(dorm_id)
            else: json_response(self, 400, {"ok": False, "message": "Bad request"})
        elif path.startswith("/api/bookings/"):
            booking_id = self._extract_id(path, "/api/bookings/", "")
            if booking_id: self._handle_update_booking(booking_id)
            else: json_response(self, 400, {"ok": False, "message": "Bad request"})
        else:
            json_response(self, 404, {"ok": False, "message": "Not found"})

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path   = parsed.path

        if path.startswith("/api/listings/") and "/photos/" in path:
            # DELETE /api/listings/{dorm_id}/photos/{photo_id}
            parts    = path.split("/")
            dorm_id  = int(parts[3]) if len(parts) > 3 and parts[3].isdigit() else None
            photo_id = int(parts[5]) if len(parts) > 5 and parts[5].isdigit() else None
            if dorm_id and photo_id: self._handle_delete_photo(dorm_id, photo_id)
            else: json_response(self, 400, {"ok": False, "message": "Bad request"})
        elif path.startswith("/api/listings/"):
            dorm_id = self._extract_id(path, "/api/listings/", "")
            if dorm_id: self._handle_delete_listing(dorm_id)
            else: json_response(self, 400, {"ok": False, "message": "Bad request"})
        else:
            json_response(self, 404, {"ok": False, "message": "Not found"})

    # ── util ──────────────────────────────────────────────────
    def _extract_id(self, path, prefix, suffix):
        try:
            s = path[len(prefix):]
            if suffix: s = s[: s.rfind(suffix)]
            return int(s) if s.isdigit() else None
        except Exception:
            return None

    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length)
        return json.loads(raw.decode("utf-8"))

    # ── POST /api/login ───────────────────────────────────────
    def _handle_login(self):
        try:
            data = self._read_body()
        except Exception:
            return json_response(self, 400, {"ok": False, "message": "Invalid JSON."})

        email    = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        if not email or not password:
            return json_response(self, 400, {"ok": False, "message": "Please fill in all fields."})

        con = get_db()
        try:
            row = con.execute(
                """
                SELECT u.user_id, u.first_name, u.last_name, u.email, u.role,
                       u.is_active, c.password_hash
                FROM   users u
                JOIN   user_credentials c ON c.user_id = u.user_id
                WHERE  lower(u.email) = ?
                """,
                (email,),
            ).fetchone()

            if not row:
                return json_response(self, 401, {"ok": False, "message": "No account found with that email."})
            if not row["is_active"]:
                return json_response(self, 403, {"ok": False, "message": "Your account has been deactivated."})
            if row["password_hash"] != password:
                return json_response(self, 401, {"ok": False, "message": "Incorrect password. Please try again."})

            token = rand_token()
            expires_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() + 7 * 24 * 3600))
            con.execute(
                "INSERT INTO login_sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)",
                (row["user_id"], token, expires_at),
            )
            con.commit()

            full_name = f"{row['first_name']} {row['last_name']}".strip()
            print(f"[login]  {row['role']}: {full_name} <{row['email']}> (id={row['user_id']})")

            return json_response(self, 200, {
                "ok": True,
                "message": f"Welcome back, {row['first_name']}!",
                "user": {
                    "id":       row["user_id"],
                    "name":     full_name,
                    "email":    row["email"],
                    "role":     row["role"],
                    "initials": initials(full_name),
                    "token":    token,
                },
            })
        finally:
            con.close()

    # ── POST /api/register ────────────────────────────────────
    def _handle_register(self):
        try:
            data = self._read_body()
        except Exception:
            return json_response(self, 400, {"ok": False, "message": "Invalid JSON."})

        name     = (data.get("name") or "").strip()
        email    = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        role     = data.get("role") or ""

        if not name or not email or not password or not role:
            return json_response(self, 400, {"ok": False, "message": "All fields are required."})
        if "@" not in email or "." not in email.split("@")[-1]:
            return json_response(self, 400, {"ok": False, "message": "Invalid email address."})
        if len(password) < 6:
            return json_response(self, 400, {"ok": False, "message": "Password must be at least 6 characters."})
        if role not in ("student", "owner"):
            return json_response(self, 400, {"ok": False, "message": "Invalid role."})

        con = get_db()
        try:
            existing = con.execute(
                "SELECT user_id FROM users WHERE lower(email) = ?", (email,)
            ).fetchone()
            if existing:
                return json_response(self, 409, {"ok": False, "message": "An account with that email already exists."})

            parts      = name.split()
            first_name = parts[0]
            last_name  = " ".join(parts[1:]) if len(parts) > 1 else "-"

            cur = con.execute(
                "INSERT INTO users (first_name, last_name, email, role, is_active, is_verified) VALUES (?, ?, ?, ?, 1, 0)",
                (first_name, last_name, email, role),
            )
            new_id = cur.lastrowid
            con.execute(
                "INSERT INTO user_credentials (user_id, password_hash) VALUES (?, ?)",
                (new_id, password),
            )
            con.commit()

            print(f"[register] New {role}: {name} <{email}> (id={new_id})")

            return json_response(self, 200, {
                "ok": True,
                "message": f"Account created! Welcome, {name}!",
                "user": {
                    "id":       new_id,
                    "name":     name,
                    "email":    email,
                    "role":     role,
                    "initials": initials(name),
                },
            })
        except Exception as e:
            print(f"[register] ERROR: {e}")
            return json_response(self, 500, {"ok": False, "message": "Server error. Please try again."})
        finally:
            con.close()

    # ── GET /api/users ────────────────────────────────────────
    def _handle_users(self):
        con = get_db()
        try:
            rows = con.execute(
                "SELECT user_id, first_name, last_name, email, role, is_active, is_verified, created_at FROM users ORDER BY created_at DESC"
            ).fetchall()
            return json_response(self, 200, {"ok": True, "users": [dict(r) for r in rows]})
        finally:
            con.close()

    # ── GET /api/listings?owner_id=X ─────────────────────────
    def _handle_get_listings(self, parsed):
        qs       = parse_qs(parsed.query)
        owner_id = qs.get("owner_id", [None])[0]

        con = get_db()
        ensure_photos_table(con)
        try:
            if owner_id:
                rows = con.execute(
                    """
                    SELECT d.*, u.first_name || ' ' || u.last_name AS owner_name
                    FROM dorms d
                    LEFT JOIN users u ON u.user_id = d.owner_id
                    WHERE d.owner_id = ?
                    ORDER BY d.created_at DESC
                    """,
                    (int(owner_id),)
                ).fetchall()
            else:
                rows = con.execute(
                    """
                    SELECT d.*, u.first_name || ' ' || u.last_name AS owner_name
                    FROM dorms d
                    LEFT JOIN users u ON u.user_id = d.owner_id
                    ORDER BY d.created_at DESC
                    """
                ).fetchall()

            listings = []
            for r in rows:
                d = dict(r)
                # amenities
                ams = con.execute(
                    "SELECT name FROM dorm_amenities WHERE dorm_id = ?", (d["dorm_id"],)
                ).fetchall()
                d["amenities"] = [a["name"] for a in ams]
                # photos (cover = sort_order 0 first)
                photos = con.execute(
                    "SELECT photo_id, photo_data, sort_order FROM dorm_photos WHERE dorm_id = ? ORDER BY sort_order ASC",
                    (d["dorm_id"],)
                ).fetchall()
                d["photos"]    = [{"photo_id": p["photo_id"], "data": p["photo_data"], "sort_order": p["sort_order"]} for p in photos]
                d["cover_img"] = photos[0]["photo_data"] if photos else None
                listings.append(d)

            return json_response(self, 200, {"ok": True, "listings": listings})
        finally:
            con.close()

    # ── POST /api/listings ────────────────────────────────────
    def _handle_add_listing(self):
        try:
            data = self._read_body()
        except Exception:
            return json_response(self, 400, {"ok": False, "message": "Invalid JSON."})

        owner_id  = data.get("owner_id")
        name      = (data.get("name") or "").strip()
        dorm_type = (data.get("type") or "Dormitory").strip()
        price     = float(data.get("price") or 0)
        location  = (data.get("location") or "").strip()
        total     = int(data.get("total") or 1)
        available = int(data.get("available") or 0)
        desc      = (data.get("description") or "").strip()
        rules     = (data.get("houseRules") or "").strip()
        amenities = data.get("amenities") or []
        photos    = data.get("photos") or []   # list of base64 data URLs

        if not owner_id or not name or not location:
            return json_response(self, 400, {"ok": False, "message": "owner_id, name and location are required."})

        con = get_db()
        ensure_photos_table(con)
        try:
            cur = con.execute(
                """
                INSERT INTO dorms
                  (owner_id, name, dorm_type, description, house_rules,
                   price_per_month, total_slots, available_slots, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
                """,
                (owner_id, name, dorm_type, desc, rules, price, total, available)
            )
            dorm_id = cur.lastrowid

            # amenities
            for am in amenities:
                con.execute(
                    "INSERT INTO dorm_amenities (dorm_id, name) VALUES (?, ?)",
                    (dorm_id, am)
                )

            # photos
            for i, photo_data in enumerate(photos):
                con.execute(
                    "INSERT INTO dorm_photos (dorm_id, photo_data, sort_order) VALUES (?, ?, ?)",
                    (dorm_id, photo_data, i)
                )

            con.commit()
            print(f"[listing] Added dorm_id={dorm_id} name='{name}' owner_id={owner_id} photos={len(photos)}")

            return json_response(self, 200, {
                "ok":      True,
                "message": "Listing added!",
                "dorm_id": dorm_id,
            })
        except Exception as e:
            print(f"[listing] ERROR: {e}")
            return json_response(self, 500, {"ok": False, "message": f"Server error: {e}"})
        finally:
            con.close()

    # ── PUT /api/listings/{dorm_id} ───────────────────────────
    def _handle_update_listing(self, dorm_id):
        try:
            data = self._read_body()
        except Exception:
            return json_response(self, 400, {"ok": False, "message": "Invalid JSON."})

        con = get_db()
        ensure_photos_table(con)
        try:
            row = con.execute("SELECT dorm_id FROM dorms WHERE dorm_id = ?", (dorm_id,)).fetchone()
            if not row:
                return json_response(self, 404, {"ok": False, "message": "Listing not found."})

            fields = []
            vals   = []
            if "name" in data:
                fields.append("name = ?");              vals.append(data["name"])
            if "price" in data:
                fields.append("price_per_month = ?");   vals.append(float(data["price"]))
            if "available" in data:
                fields.append("available_slots = ?");   vals.append(int(data["available"]))
            if "total" in data:
                fields.append("total_slots = ?");       vals.append(int(data["total"]))
            if "description" in data:
                fields.append("description = ?");       vals.append(data["description"])
            if "houseRules" in data:
                fields.append("house_rules = ?");       vals.append(data["houseRules"])

            if fields:
                fields.append("updated_at = datetime('now')")
                vals.append(dorm_id)
                con.execute(f"UPDATE dorms SET {', '.join(fields)} WHERE dorm_id = ?", vals)

            # Replace amenities if provided
            if "amenities" in data:
                con.execute("DELETE FROM dorm_amenities WHERE dorm_id = ?", (dorm_id,))
                for am in data["amenities"]:
                    con.execute("INSERT INTO dorm_amenities (dorm_id, name) VALUES (?, ?)", (dorm_id, am))

            # Replace photos if provided
            if "photos" in data and isinstance(data["photos"], list) and len(data["photos"]) > 0:
                con.execute("DELETE FROM dorm_photos WHERE dorm_id = ?", (dorm_id,))
                for i, photo_data in enumerate(data["photos"]):
                    con.execute(
                        "INSERT INTO dorm_photos (dorm_id, photo_data, sort_order) VALUES (?, ?, ?)",
                        (dorm_id, photo_data, i)
                    )

            con.commit()
            print(f"[listing] Updated dorm_id={dorm_id}")
            return json_response(self, 200, {"ok": True, "message": "Listing updated."})
        except Exception as e:
            print(f"[listing update] ERROR: {e}")
            return json_response(self, 500, {"ok": False, "message": f"Server error: {e}"})
        finally:
            con.close()

    # ── DELETE /api/listings/{dorm_id} ───────────────────────
    def _handle_delete_listing(self, dorm_id):
        con = get_db()
        ensure_photos_table(con)
        try:
            con.execute("DELETE FROM dorm_photos    WHERE dorm_id = ?", (dorm_id,))
            con.execute("DELETE FROM dorm_amenities WHERE dorm_id = ?", (dorm_id,))
            con.execute("DELETE FROM dorms          WHERE dorm_id = ?", (dorm_id,))
            con.commit()
            print(f"[listing] Deleted dorm_id={dorm_id}")
            return json_response(self, 200, {"ok": True, "message": "Listing deleted."})
        except Exception as e:
            return json_response(self, 500, {"ok": False, "message": f"Server error: {e}"})
        finally:
            con.close()

    # ── GET /api/listings/{dorm_id}/photos ────────────────────
    def _handle_get_photos(self, dorm_id):
        con = get_db()
        ensure_photos_table(con)
        try:
            photos = con.execute(
                "SELECT photo_id, photo_data, sort_order FROM dorm_photos WHERE dorm_id = ? ORDER BY sort_order ASC",
                (dorm_id,)
            ).fetchall()
            return json_response(self, 200, {
                "ok": True,
                "photos": [{"photo_id": p["photo_id"], "data": p["photo_data"], "sort_order": p["sort_order"]} for p in photos]
            })
        finally:
            con.close()

    # ── POST /api/listings/{dorm_id}/photos ───────────────────
    def _handle_add_photo(self, dorm_id):
        try:
            data = self._read_body()
        except Exception:
            return json_response(self, 400, {"ok": False, "message": "Invalid JSON."})

        photo_data = data.get("photo_data") or ""
        if not photo_data:
            return json_response(self, 400, {"ok": False, "message": "photo_data is required."})

        con = get_db()
        ensure_photos_table(con)
        try:
            count = con.execute(
                "SELECT COUNT(*) as c FROM dorm_photos WHERE dorm_id = ?", (dorm_id,)
            ).fetchone()["c"]
            if count >= 5:
                return json_response(self, 400, {"ok": False, "message": "Maximum 5 photos per listing."})

            cur = con.execute(
                "INSERT INTO dorm_photos (dorm_id, photo_data, sort_order) VALUES (?, ?, ?)",
                (dorm_id, photo_data, count)
            )
            con.commit()
            print(f"[photo] Added photo_id={cur.lastrowid} to dorm_id={dorm_id}")
            return json_response(self, 200, {"ok": True, "photo_id": cur.lastrowid})
        except Exception as e:
            return json_response(self, 500, {"ok": False, "message": f"Server error: {e}"})
        finally:
            con.close()

    # ── DELETE /api/listings/{dorm_id}/photos/{photo_id} ─────
    def _handle_delete_photo(self, dorm_id, photo_id):
        con = get_db()
        ensure_photos_table(con)
        try:
            con.execute(
                "DELETE FROM dorm_photos WHERE photo_id = ? AND dorm_id = ?",
                (photo_id, dorm_id)
            )
            con.commit()
            # Re-sequence sort_order
            remaining = con.execute(
                "SELECT photo_id FROM dorm_photos WHERE dorm_id = ? ORDER BY sort_order ASC",
                (dorm_id,)
            ).fetchall()
            for i, p in enumerate(remaining):
                con.execute("UPDATE dorm_photos SET sort_order = ? WHERE photo_id = ?", (i, p["photo_id"]))
            con.commit()
            print(f"[photo] Deleted photo_id={photo_id} from dorm_id={dorm_id}")
            return json_response(self, 200, {"ok": True, "message": "Photo deleted."})
        except Exception as e:
            return json_response(self, 500, {"ok": False, "message": f"Server error: {e}"})
        finally:
            con.close()


    # ── GET /api/bookings?student_id=X  or  ?dorm_id=X  or  ?owner_id=X ──
    def _handle_get_bookings(self, parsed):
        qs         = parse_qs(parsed.query)
        student_id = qs.get("student_id", [None])[0]
        owner_id   = qs.get("owner_id",   [None])[0]
        dorm_id    = qs.get("dorm_id",    [None])[0]

        con = get_db()
        try:
            if student_id:
                rows = con.execute("""
                    SELECT b.*,
                           d.name        AS dorm_name,
                           d.dorm_type   AS dorm_type,
                           d.price_per_month AS price,
                           u.first_name||' '||u.last_name AS student_name,
                           u.email AS student_email
                    FROM bookings b
                    JOIN dorms d ON d.dorm_id = b.dorm_id
                    JOIN users  u ON u.user_id = b.student_id
                    WHERE b.student_id = ?
                    ORDER BY b.created_at DESC
                """, (int(student_id),)).fetchall()
            elif owner_id:
                rows = con.execute("""
                    SELECT b.*,
                           d.name        AS dorm_name,
                           d.dorm_type   AS dorm_type,
                           d.price_per_month AS price,
                           u.first_name||' '||u.last_name AS student_name,
                           u.email AS student_email
                    FROM bookings b
                    JOIN dorms d ON d.dorm_id = b.dorm_id
                    JOIN users  u ON u.user_id = b.student_id
                    WHERE d.owner_id = ?
                    ORDER BY b.created_at DESC
                """, (int(owner_id),)).fetchall()
            elif dorm_id:
                rows = con.execute("""
                    SELECT b.*,
                           d.name        AS dorm_name,
                           d.dorm_type   AS dorm_type,
                           d.price_per_month AS price,
                           u.first_name||' '||u.last_name AS student_name,
                           u.email AS student_email
                    FROM bookings b
                    JOIN dorms d ON d.dorm_id = b.dorm_id
                    JOIN users  u ON u.user_id = b.student_id
                    WHERE b.dorm_id = ?
                    ORDER BY b.created_at DESC
                """, (int(dorm_id),)).fetchall()
            else:
                rows = []

            return json_response(self, 200, {"ok": True, "bookings": [dict(r) for r in rows]})
        finally:
            con.close()

    # ── POST /api/bookings ────────────────────────────────────
    def _handle_add_booking(self):
        try:
            data = self._read_body()
        except Exception:
            return json_response(self, 400, {"ok": False, "message": "Invalid JSON."})

        student_id  = data.get("student_id")
        dorm_id     = data.get("dorm_id")
        room_num    = data.get("room_num") or ""
        move_in     = data.get("move_in_date") or ""
        notes       = data.get("notes") or ""
        price       = float(data.get("price") or 0)

        if not student_id or not dorm_id or not move_in:
            return json_response(self, 400, {"ok": False, "message": "student_id, dorm_id and move_in_date are required."})

        con = get_db()
        try:
            # Check user is a student
            user = con.execute("SELECT role, first_name, last_name FROM users WHERE user_id = ?", (int(student_id),)).fetchone()
            if not user or user["role"] != "student":
                return json_response(self, 403, {"ok": False, "message": "Only students can submit booking requests."})

            # Check dorm exists
            dorm = con.execute("SELECT dorm_id, name, price_per_month, available_slots, owner_id FROM dorms WHERE dorm_id = ?", (int(dorm_id),)).fetchone()
            if not dorm:
                return json_response(self, 404, {"ok": False, "message": "Dorm not found."})
            if dorm["available_slots"] <= 0:
                return json_response(self, 400, {"ok": False, "message": "No rooms available in this dorm."})

            final_price = price or dorm["price_per_month"]
            total_price = final_price * 2  # first month + deposit

            # Build booking notes: include room + user message
            full_notes = notes.strip()
            if room_num:
                full_notes = f"{room_num}: {full_notes}" if full_notes else room_num

            cur = con.execute("""
                INSERT INTO bookings (dorm_id, student_id, move_in_date, total_price, status, notes)
                VALUES (?, ?, ?, ?, 'pending', ?)
            """, (int(dorm_id), int(student_id), move_in, total_price, full_notes))
            booking_id = cur.lastrowid

            # Auto-create a message from the student to the owner when booking is submitted
            student_name = f"{user['first_name']} {user['last_name']}".strip()
            auto_msg = f"📋 New booking request from {student_name} for {dorm['name']}.\n"
            auto_msg += f"Room: {room_num or 'Any available'} | Move-in: {move_in}\n"
            if notes.strip():
                auto_msg += f"Message: {notes.strip()}"
            else:
                auto_msg += "No additional message."

            con.execute("""
                INSERT INTO messages (sender_id, receiver_id, dorm_id, body)
                VALUES (?, ?, ?, ?)
            """, (int(student_id), dorm["owner_id"], int(dorm_id), auto_msg))

            con.commit()
            print(f"[booking] New booking_id={booking_id} dorm_id={dorm_id} student_id={student_id}")
            return json_response(self, 200, {"ok": True, "message": "Booking request submitted!", "booking_id": booking_id})
        except Exception as e:
            print(f"[booking] ERROR: {e}")
            return json_response(self, 500, {"ok": False, "message": f"Server error: {e}"})
        finally:
            con.close()

    # ── PUT /api/bookings/{booking_id}  (approve / reject) ───
    def _handle_update_booking(self, booking_id):
        try:
            data = self._read_body()
        except Exception:
            return json_response(self, 400, {"ok": False, "message": "Invalid JSON."})

        status = data.get("status") or ""
        if status not in ("approved", "rejected", "cancelled"):
            return json_response(self, 400, {"ok": False, "message": "status must be approved, rejected or cancelled."})

        con = get_db()
        try:
            row = con.execute(
                "SELECT b.booking_id, b.dorm_id, b.student_id, b.notes, d.name AS dorm_name, d.owner_id FROM bookings b JOIN dorms d ON d.dorm_id = b.dorm_id WHERE b.booking_id = ?",
                (booking_id,)
            ).fetchone()
            if not row:
                return json_response(self, 404, {"ok": False, "message": "Booking not found."})

            con.execute("""
                UPDATE bookings SET status = ?, reviewed_at = datetime('now'), updated_at = datetime('now')
                WHERE booking_id = ?
            """, (status, booking_id))

            # Decrease available slots when approved
            if status == "approved":
                con.execute("""
                    UPDATE dorms SET available_slots = MAX(0, available_slots - 1),
                    updated_at = datetime('now') WHERE dorm_id = ?
                """, (row["dorm_id"],))

            # Send an automatic notification message from owner to student
            if status in ("approved", "rejected"):
                if status == "approved":
                    msg_body = (
                        f"🎉 Congratulations! Your booking request for {row['dorm_name']} has been approved.\n"
                        f"Your room is now confirmed. Please prepare for your move-in date.\n"
                        f"Welcome to {row['dorm_name']}!"
                    )
                else:
                    msg_body = (
                        f"We're sorry, your booking request for {row['dorm_name']} was not approved at this time.\n"
                        f"Please feel free to browse other available dorms on DormFinder."
                    )
                con.execute("""
                    INSERT INTO messages (sender_id, receiver_id, dorm_id, body)
                    VALUES (?, ?, ?, ?)
                """, (row["owner_id"], row["student_id"], row["dorm_id"], msg_body))

            con.commit()
            print(f"[booking] booking_id={booking_id} → {status}")
            return json_response(self, 200, {"ok": True, "message": f"Booking {status}."})
        except Exception as e:
            return json_response(self, 500, {"ok": False, "message": f"Server error: {e}"})
        finally:
            con.close()

    # ── GET /api/messages?user_id=X  (all threads for a user) ─
    def _handle_get_messages(self, parsed):
        qs      = parse_qs(parsed.query)
        user_id = qs.get("user_id", [None])[0]
        dorm_id = qs.get("dorm_id", [None])[0]

        con = get_db()
        try:
            if user_id and dorm_id:
                # Thread between user and dorm owner
                rows = con.execute("""
                    SELECT m.*,
                           s.first_name || ' ' || s.last_name AS sender_name,
                           r.first_name || ' ' || r.last_name AS receiver_name,
                           d.name AS dorm_name
                    FROM messages m
                    JOIN users  s ON s.user_id = m.sender_id
                    JOIN users  r ON r.user_id = m.receiver_id
                    LEFT JOIN dorms d ON d.dorm_id = m.dorm_id
                    WHERE m.dorm_id = ?
                      AND (m.sender_id = ? OR m.receiver_id = ?)
                    ORDER BY m.sent_at ASC
                """, (int(dorm_id), int(user_id), int(user_id))).fetchall()
            elif user_id:
                rows = con.execute("""
                    SELECT m.*,
                           s.first_name || ' ' || s.last_name AS sender_name,
                           r.first_name || ' ' || r.last_name AS receiver_name,
                           d.name AS dorm_name
                    FROM messages m
                    JOIN users  s ON s.user_id = m.sender_id
                    JOIN users  r ON r.user_id = m.receiver_id
                    LEFT JOIN dorms d ON d.dorm_id = m.dorm_id
                    WHERE m.sender_id = ? OR m.receiver_id = ?
                    ORDER BY m.sent_at DESC
                """, (int(user_id), int(user_id))).fetchall()
            else:
                rows = []

            # Mark messages as read for this user (only ones received by them)
            if user_id:
                con.execute("""
                    UPDATE messages SET is_read = 1, read_at = datetime('now')
                    WHERE receiver_id = ? AND is_read = 0
                """, (int(user_id),))
                con.commit()

            return json_response(self, 200, {"ok": True, "messages": [dict(r) for r in rows]})
        finally:
            con.close()

    # ── POST /api/messages ────────────────────────────────────
    def _handle_add_message(self):
        try:
            data = self._read_body()
        except Exception:
            return json_response(self, 400, {"ok": False, "message": "Invalid JSON."})

        sender_id   = data.get("sender_id")
        dorm_id     = data.get("dorm_id")
        body        = (data.get("body") or "").strip()
        receiver_id = data.get("receiver_id")  # optional — owner replies use this

        if not sender_id or not dorm_id or not body:
            return json_response(self, 400, {"ok": False, "message": "sender_id, dorm_id and body are required."})

        con = get_db()
        try:
            sender = con.execute("SELECT role, first_name, last_name FROM users WHERE user_id = ?", (int(sender_id),)).fetchone()
            if not sender:
                return json_response(self, 404, {"ok": False, "message": "Sender not found."})

            dorm = con.execute("SELECT owner_id, name FROM dorms WHERE dorm_id = ?", (int(dorm_id),)).fetchone()
            if not dorm:
                return json_response(self, 404, {"ok": False, "message": "Dorm not found."})

            if sender["role"] == "student":
                # Student sends to dorm owner
                final_receiver = dorm["owner_id"]
            elif sender["role"] in ("owner", "admin"):
                # Owner replies — receiver_id must be supplied (the student)
                if not receiver_id:
                    return json_response(self, 400, {"ok": False, "message": "receiver_id is required for owner replies."})
                final_receiver = int(receiver_id)
            else:
                return json_response(self, 403, {"ok": False, "message": "Unauthorized role."})

            cur = con.execute("""
                INSERT INTO messages (sender_id, receiver_id, dorm_id, body)
                VALUES (?, ?, ?, ?)
            """, (int(sender_id), final_receiver, int(dorm_id), body))
            msg_id = cur.lastrowid
            con.commit()
            sender_name = f"{sender['first_name']} {sender['last_name']}".strip()
            print(f"[message] msg_id={msg_id} {sender_name}({sender['role']}) → user={final_receiver} dorm={dorm_id}")
            return json_response(self, 200, {"ok": True, "message": "Message sent!", "message_id": msg_id})
        except Exception as e:
            print(f"[message] ERROR: {e}")
            return json_response(self, 500, {"ok": False, "message": f"Server error: {e}"})
        finally:
            con.close()


# ── entry point ───────────────────────────────────────────────
if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    # Ensure photos table exists on startup
    con = get_db()
    ensure_photos_table(con)
    con.close()
    server = HTTPServer(("", PORT), DormHandler)
    print(f"\n✅  DormFinder (Python) server running at http://localhost:{PORT}")
    print(f"   Database : {DB_PATH}")
    print(f"   Open     → http://localhost:{PORT}/index.html\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
