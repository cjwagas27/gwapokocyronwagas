/**
 * DormFinder — API Server
 * Run:  node server.js
 * Then open: http://localhost:3000/index.html
 */

const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const Database = require('better-sqlite3');

const app  = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'dormfinder.db');

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));   // serve HTML/CSS/JS files

// ── Open DB ───────────────────────────────────────────────────
const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode  = WAL');

// ── Helper: derive initials from full name ────────────────────
function initials(name) {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ─────────────────────────────────────────────────────────────
//  POST /api/register
//  Body: { name, email, password, role }
// ─────────────────────────────────────────────────────────────
app.post('/api/register', (req, res) => {
  const { name, email, password, role } = req.body;

  // ── Validate ──────────────────────────────────────────────
  if (!name || !email || !password || !role) {
    return res.status(400).json({ ok: false, message: 'All fields are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, message: 'Invalid email address.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ ok: false, message: 'Password must be at least 6 characters.' });
  }
  if (!['student', 'owner'].includes(role)) {
    return res.status(400).json({ ok: false, message: 'Invalid role.' });
  }

  // ── Check duplicate email ─────────────────────────────────
  const existing = db.prepare('SELECT user_id FROM users WHERE email = ? COLLATE NOCASE').get(email);
  if (existing) {
    return res.status(409).json({ ok: false, message: 'An account with that email already exists.' });
  }

  // ── Split full name into first / last ─────────────────────
  const parts     = name.trim().split(/\s+/);
  const firstName = parts[0];
  const lastName  = parts.slice(1).join(' ') || '-';

  // ── Insert user + credentials in one transaction ──────────
  const insert = db.transaction(() => {
    const userRow = db.prepare(`
      INSERT INTO users (first_name, last_name, email, role, is_active, is_verified)
      VALUES (?, ?, ?, ?, 1, 0)
    `).run(firstName, lastName, email.toLowerCase(), role);

    db.prepare(`
      INSERT INTO user_credentials (user_id, password_hash)
      VALUES (?, ?)
    `).run(userRow.lastInsertRowid, password);   // plain text for demo

    return userRow.lastInsertRowid;
  });

  let newId;
  try {
    newId = insert();
  } catch (err) {
    console.error('[register]', err.message);
    return res.status(500).json({ ok: false, message: 'Server error. Please try again.' });
  }

  console.log(`[register] New ${role}: ${name} <${email}> (id=${newId})`);

  return res.json({
    ok: true,
    message: `Account created! Welcome, ${name}!`,
    user: {
      id:       newId,
      name:     name.trim(),
      email:    email.toLowerCase(),
      role,
      initials: initials(name),
    },
  });
});

// ─────────────────────────────────────────────────────────────
//  POST /api/login
//  Body: { email, password }
// ─────────────────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: 'Please fill in all fields.' });
  }

  // ── Look up user + credential ─────────────────────────────
  const row = db.prepare(`
    SELECT u.user_id, u.first_name, u.last_name, u.email, u.role,
           u.is_active, c.password_hash
    FROM   users u
    JOIN   user_credentials c ON c.user_id = u.user_id
    WHERE  u.email = ? COLLATE NOCASE
  `).get(email);

  if (!row) {
    return res.status(401).json({ ok: false, message: 'No account found with that email.' });
  }
  if (!row.is_active) {
    return res.status(403).json({ ok: false, message: 'Your account has been deactivated.' });
  }
  if (row.password_hash !== password) {
    return res.status(401).json({ ok: false, message: 'Incorrect password. Please try again.' });
  }

  // ── Record login session ──────────────────────────────────
  const token     = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare(`
    INSERT INTO login_sessions (user_id, session_token, expires_at)
    VALUES (?, ?, ?)
  `).run(row.user_id, token, expiresAt);

  const fullName = `${row.first_name} ${row.last_name}`.trim();
  console.log(`[login]  ${row.role}: ${fullName} <${row.email}> (id=${row.user_id})`);

  return res.json({
    ok: true,
    message: `Welcome back, ${row.first_name}!`,
    user: {
      id:       row.user_id,
      name:     fullName,
      email:    row.email,
      role:     row.role,
      initials: initials(fullName),
      token,
    },
  });
});

// ─────────────────────────────────────────────────────────────
//  GET /api/users  (admin view — lists all registered users)
// ─────────────────────────────────────────────────────────────
app.get('/api/users', (req, res) => {
  const users = db.prepare(`
    SELECT u.user_id, u.first_name, u.last_name, u.email,
           u.role, u.is_active, u.is_verified, u.created_at
    FROM   users u
    ORDER  BY u.created_at DESC
  `).all();
  res.json({ ok: true, users });
});

// ─────────────────────────────────────────────────────────────
//  Start
// ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  DormFinder server running at http://localhost:${PORT}`);
  console.log(`   Open → http://localhost:${PORT}/index.html\n`);
});
