/* ============================================================
   DORMFINDER — SHARED JS
   ============================================================ */

// ── Inline SVG icons (consistent stroke system) ──────────────
const Icons = {
  home:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  search:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  message: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  bookmark:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`,
  user:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  users:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  pin:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  calendar:`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  star:    `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  staro:   `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  check:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  x:       `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  plus:    `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  edit:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  grid:    `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  list:    `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  chevron: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  arrowL:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  mail:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  lock:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  logout:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  settings:`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  shield:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  map:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
  wifi:    `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
  ac:      `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07"/></svg>`,
  camera:  `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  heart:   `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  heartF:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  chart:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  building:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="2" width="18" height="20" rx="2"/><path d="M9 22V12h6v10"/><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01"/></svg>`,
  bed:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>`,
  key:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
  logoMark:`<svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M12 2L3 9v13h6v-7h6v7h6V9z"/></svg>`,
};

// ── Toast ─────────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 3200) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-dot"></span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    setTimeout(() => toast.remove(), 380);
  }, duration);
}

// ── Modal ─────────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id)?.classList.add('show'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('show'); }
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('show');
});

// ── Session ───────────────────────────────────────────────────
const session = {
  student: { name: 'Juan Dela Cruz', role: 'student', initials: 'JD' },
  owner:   { name: 'Maria Santos',   role: 'owner',   initials: 'MS' },
  admin:   { name: 'Admin User',     role: 'admin',   initials: 'AD' },
};

// ── Dorm data ─────────────────────────────────────────────────
// ── Dorm photos — inline SVG illustrations (work from file://, no CORS) ──────
// Each array: [cover, interior, exterior]
const dormPhotos = {
  1: [
    // Sunrise Dormitory — warm orange tones, bunk beds
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 260"><rect width="400" height="260" fill="#fff7ed"/><rect x="0" y="180" width="400" height="80" fill="#fed7aa"/><rect x="20" y="60" width="120" height="130" rx="4" fill="#fb923c"/><rect x="28" y="68" width="104" height="52" rx="2" fill="#fef3c7"/><rect x="28" y="128" width="104" height="52" rx="2" fill="#fef3c7"/><rect x="20" y="58" width="8" height="134" fill="#c2410c"/><rect x="132" y="58" width="8" height="134" fill="#c2410c"/><rect x="20" y="122" width="120" height="8" fill="#c2410c"/><rect x="160" y="80" width="100" height="110" rx="4" fill="#fdba74"/><rect x="168" y="88" width="84" height="70" rx="2" fill="#fef3c7"/><rect x="175" y="95" width="70" height="55" rx="1" fill="#bae6fd"/><rect x="275" y="100" width="80" height="90" rx="4" fill="#fb923c"/><rect x="283" y="110" width="60" height="30" rx="2" fill="#fef3c7"/><rect x="310" y="50" width="50" height="60" rx="2" fill="#fed7aa"/><rect x="316" y="56" width="38" height="46" fill="#7dd3fc"/><ellipse cx="70" cy="40" rx="30" ry="28" fill="#fbbf24"/><line x1="70" y1="5" x2="70" y2="15" stroke="#fbbf24" stroke-width="3"/><line x1="70" y1="65" x2="70" y2="75" stroke="#fbbf24" stroke-width="3"/><line x1="35" y1="40" x2="25" y2="40" stroke="#fbbf24" stroke-width="3"/><line x1="105" y1="40" x2="115" y2="40" stroke="#fbbf24" stroke-width="3"/><text x="200" y="245" font-family="sans-serif" font-size="13" font-weight="bold" fill="#9a3412" text-anchor="middle">Sunrise Dormitory · Room Interior</text></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 260"><rect width="400" height="260" fill="#fef3c7"/><rect x="0" y="160" width="400" height="100" fill="#fed7aa"/><rect x="30" y="60" width="160" height="110" rx="6" fill="#fb923c"/><rect x="40" y="70" width="60" height="80" rx="2" fill="#7dd3fc"/><rect x="110" y="70" width="70" height="80" rx="2" fill="#7dd3fc"/><rect x="200" y="90" width="120" height="80" rx="4" fill="#fdba74"/><rect x="210" y="100" width="100" height="60" rx="2" fill="#fef9c3"/><rect x="320" y="70" width="50" height="100" rx="3" fill="#fb923c"/><rect x="325" y="75" width="40" height="30" fill="#7dd3fc"/><rect x="0" y="155" width="400" height="10" fill="#c2410c"/><circle cx="180" cy="30" r="20" fill="#fbbf24"/><text x="200" y="245" font-family="sans-serif" font-size="13" font-weight="bold" fill="#9a3412" text-anchor="middle">Sunrise Dormitory · Building Exterior</text></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 260"><rect width="400" height="260" fill="#fff7ed"/><rect x="60" y="100" width="120" height="90" rx="3" fill="#fdba74"/><rect x="70" y="110" width="45" height="60" rx="2" fill="#bae6fd"/><rect x="125" y="110" width="45" height="60" rx="2" fill="#bae6fd"/><rect x="200" y="80" width="140" height="110" rx="3" fill="#fb923c"/><rect x="210" y="90" width="50" height="70" rx="2" fill="#bae6fd"/><rect x="270" y="90" width="60" height="70" rx="2" fill="#bae6fd"/><rect x="50" y="185" width="310" height="15" rx="2" fill="#c2410c"/><rect x="30" y="195" width="340" height="8" fill="#9a3412"/><text x="200" y="245" font-family="sans-serif" font-size="13" font-weight="bold" fill="#9a3412" text-anchor="middle">Sunrise Dormitory · Common Area</text></svg>`,
  ],
  2: [
    // Villa Maria Suites — green tones, cozy boarding house
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 260"><rect width="400" height="260" fill="#f0fdf4"/><rect x="0" y="175" width="400" height="85" fill="#bbf7d0"/><rect x="20" y="50" width="160" height="130" rx="6" fill="#16a34a"/><rect x="30" y="60" width="65" height="90" rx="2" fill="#bbf7d0"/><rect x="105" y="60" width="65" height="90" rx="2" fill="#bbf7d0"/><rect x="40" y="68" width="45" height="70" fill="#86efac"/><rect x="115" y="68" width="45" height="70" fill="#86efac"/><rect x="190" y="80" width="90" height="100" rx="4" fill="#22c55e"/><rect x="200" y="90" width="70" height="65" rx="2" fill="#dcfce7"/><rect x="205" y="95" width="60" height="55" fill="#86efac"/><rect x="290" y="70" width="90" height="110" rx="4" fill="#15803d"/><rect x="298" y="78" width="35" height="45" rx="2" fill="#bbf7d0"/><rect x="339" y="78" width="35" height="45" rx="2" fill="#bbf7d0"/><rect x="298" y="130" width="76" height="40" rx="2" fill="#dcfce7"/><ellipse cx="320" cy="35" rx="18" ry="18" fill="#fbbf24" opacity="0.8"/><circle cx="50" cy="178" r="12" fill="#16a34a"/><circle cx="80" cy="175" r="16" fill="#15803d"/><circle cx="340" cy="177" r="14" fill="#16a34a"/><circle cx="365" cy="174" r="10" fill="#22c55e"/><text x="200" y="245" font-family="sans-serif" font-size="13" font-weight="bold" fill="#14532d" text-anchor="middle">Villa Maria Suites · Front View</text></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 260"><rect width="400" height="260" fill="#f0fdf4"/><rect x="0" y="190" width="400" height="70" fill="#bbf7d0"/><rect x="50" y="80" width="130" height="120" rx="4" fill="#22c55e"/><rect x="60" y="90" width="50" height="70" fill="#86efac"/><rect x="120" y="90" width="50" height="70" fill="#86efac"/><rect x="190" y="100" width="160" height="100" rx="4" fill="#16a34a"/><rect x="200" y="110" width="60" height="60" fill="#bbf7d0"/><rect x="270" y="110" width="70" height="60" fill="#bbf7d0"/><rect x="100" y="195" width="200" height="10" fill="#15803d"/><text x="200" y="245" font-family="sans-serif" font-size="13" font-weight="bold" fill="#14532d" text-anchor="middle">Villa Maria Suites · Kitchen Area</text></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 260"><rect width="400" height="260" fill="#dcfce7"/><rect x="0" y="170" width="400" height="90" fill="#86efac"/><rect x="80" y="70" width="240" height="110" rx="6" fill="#16a34a"/><rect x="90" y="80" width="80" height="80" fill="#bbf7d0"/><rect x="180" y="80" width="80" height="80" fill="#bbf7d0"/><rect x="270" y="80" width="40" height="80" fill="#bbf7d0"/><rect x="155" y="140" width="30" height="40" fill="#15803d"/><rect x="70" y="175" width="260" height="8" fill="#14532d"/><text x="200" y="245" font-family="sans-serif" font-size="13" font-weight="bold" fill="#14532d" text-anchor="middle">Villa Maria Suites · Parking Area</text></svg>`,
  ],
  3: [
    // Campus View Rooms — blue/modern apartment tones
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 260"><rect width="400" height="260" fill="#eff6ff"/><rect x="0" y="180" width="400" height="80" fill="#bfdbfe"/><rect x="15" y="30" width="370" height="155" rx="8" fill="#1d4ed8"/><rect x="25" y="40" width="80" height="55" rx="2" fill="#bfdbfe"/><rect x="115" y="40" width="80" height="55" rx="2" fill="#bfdbfe"/><rect x="205" y="40" width="80" height="55" rx="2" fill="#bfdbfe"/><rect x="295" y="40" width="80" height="55" rx="2" fill="#bfdbfe"/><rect x="25" y="105" width="80" height="55" rx="2" fill="#93c5fd"/><rect x="115" y="105" width="80" height="55" rx="2" fill="#93c5fd"/><rect x="205" y="105" width="80" height="55" rx="2" fill="#93c5fd"/><rect x="295" y="105" width="80" height="55" rx="2" fill="#93c5fd"/><rect x="170" y="165" width="60" height="22" rx="2" fill="#1e40af"/><rect x="0" y="178" width="400" height="8" fill="#1e3a8a"/><circle cx="200" cy="15" rx="10" fill="#fbbf24"/><text x="200" y="245" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1e3a8a" text-anchor="middle">Campus View Rooms · Apartment Block</text></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 260"><rect width="400" height="260" fill="#eff6ff"/><rect x="0" y="195" width="400" height="65" fill="#bfdbfe"/><rect x="30" y="70" width="140" height="130" rx="4" fill="#3b82f6"/><rect x="40" y="80" width="55" height="80" rx="2" fill="#dbeafe"/><rect x="105" y="80" width="55" height="80" rx="2" fill="#dbeafe"/><rect x="48" y="88" width="40" height="65" fill="#93c5fd"/><rect x="113" y="88" width="40" height="65" fill="#93c5fd"/><rect x="180" y="90" width="100" height="110" rx="4" fill="#1d4ed8"/><rect x="190" y="100" width="80" height="70" rx="2" fill="#dbeafe"/><rect x="195" y="105" width="70" height="60" fill="#93c5fd"/><rect x="290" y="80" width="80" height="120" rx="4" fill="#2563eb"/><rect x="298" y="88" width="60" height="40" rx="2" fill="#dbeafe"/><rect x="298" y="135" width="60" height="35" rx="2" fill="#dbeafe"/><text x="200" y="245" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1e3a8a" text-anchor="middle">Campus View Rooms · Interior</text></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 260"><rect width="400" height="260" fill="#dbeafe"/><rect x="0" y="165" width="400" height="95" fill="#93c5fd"/><rect x="50" y="50" width="300" height="125" rx="6" fill="#1d4ed8"/><rect x="60" y="60" width="70" height="50" fill="#bfdbfe"/><rect x="140" y="60" width="70" height="50" fill="#bfdbfe"/><rect x="220" y="60" width="70" height="50" fill="#bfdbfe"/><rect x="300" y="60" width="40" height="50" fill="#bfdbfe"/><rect x="60" y="120" width="70" height="45" fill="#93c5fd"/><rect x="140" y="120" width="70" height="45" fill="#93c5fd"/><rect x="220" y="120" width="70" height="45" fill="#93c5fd"/><rect x="300" y="120" width="40" height="45" fill="#93c5fd"/><rect x="170" y="165" width="60" height="20" fill="#1e3a8a"/><text x="200" y="245" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1e3a8a" text-anchor="middle">Campus View Rooms · AC Unit</text></svg>`,
  ],
  4: [
    // Green Haven Dorm — earthy green budget dorm
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 260"><rect width="400" height="260" fill="#f7fee7"/><rect x="0" y="175" width="400" height="85" fill="#d9f99d"/><rect x="15" y="55" width="165" height="125" rx="5" fill="#4d7c0f"/><rect x="25" y="65" width="65" height="85" rx="2" fill="#ecfccb"/><rect x="100" y="65" width="65" height="85" rx="2" fill="#ecfccb"/><rect x="30" y="70" width="55" height="75" fill="#a3e635"/><rect x="105" y="70" width="55" height="75" fill="#a3e635"/><rect x="190" y="75" width="95" height="105" rx="4" fill="#65a30d"/><rect x="200" y="85" width="75" height="65" rx="2" fill="#ecfccb"/><rect x="205" y="90" width="65" height="55" fill="#a3e635"/><rect x="295" y="65" width="90" height="115" rx="4" fill="#4d7c0f"/><rect x="303" y="73" width="36" height="48" rx="2" fill="#d9f99d"/><rect x="343" y="73" width="36" height="48" rx="2" fill="#d9f99d"/><rect x="303" y="128" width="76" height="40" rx="2" fill="#ecfccb"/><circle cx="50" cy="178" r="14" fill="#4d7c0f"/><circle cx="82" cy="174" r="18" fill="#365314"/><circle cx="338" cy="177" r="13" fill="#4d7c0f"/><circle cx="364" cy="173" r="10" fill="#65a30d"/><text x="200" y="245" font-family="sans-serif" font-size="13" font-weight="bold" fill="#365314" text-anchor="middle">Green Haven Dorm · Exterior</text></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 260"><rect width="400" height="260" fill="#f7fee7"/><rect x="0" y="190" width="400" height="70" fill="#d9f99d"/><rect x="40" y="80" width="140" height="120" rx="4" fill="#65a30d"/><rect x="50" y="90" width="55" height="75" fill="#d9f99d"/><rect x="115" y="90" width="55" height="75" fill="#d9f99d"/><rect x="57" y="97" width="42" height="62" fill="#a3e635"/><rect x="122" y="97" width="42" height="62" fill="#a3e635"/><rect x="190" y="100" width="160" height="100" rx="4" fill="#4d7c0f"/><rect x="200" y="110" width="65" height="60" fill="#d9f99d"/><rect x="275" y="110" width="65" height="60" fill="#d9f99d"/><text x="200" y="245" font-family="sans-serif" font-size="13" font-weight="bold" fill="#365314" text-anchor="middle">Green Haven Dorm · Study Area</text></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 260"><rect width="400" height="260" fill="#ecfccb"/><rect x="0" y="165" width="400" height="95" fill="#a3e635"/><rect x="60" y="60" width="280" height="115" rx="6" fill="#4d7c0f"/><rect x="70" y="70" width="75" height="55" fill="#d9f99d"/><rect x="155" y="70" width="75" height="55" fill="#d9f99d"/><rect x="240" y="70" width="75" height="55" fill="#d9f99d"/><rect x="70" y="130" width="245" height="35" fill="#65a30d"/><rect x="165" y="160" width="70" height="10" fill="#365314"/><text x="200" y="245" font-family="sans-serif" font-size="13" font-weight="bold" fill="#365314" text-anchor="middle">Green Haven Dorm · Corridor</text></svg>`,
  ],
  5: [
    // BlueSky Residences — premium blue/sky modern apartment
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 260"><rect width="400" height="260" fill="#e0f2fe"/><rect x="0" y="185" width="400" height="75" fill="#7dd3fc"/><rect x="10" y="20" width="380" height="170" rx="8" fill="#0369a1"/><rect x="20" y="30" width="85" height="60" rx="2" fill="#bae6fd"/><rect x="115" y="30" width="85" height="60" rx="2" fill="#bae6fd"/><rect x="210" y="30" width="85" height="60" rx="2" fill="#bae6fd"/><rect x="305" y="30" width="75" height="60" rx="2" fill="#bae6fd"/><rect x="20" y="100" width="85" height="60" rx="2" fill="#38bdf8"/><rect x="115" y="100" width="85" height="60" rx="2" fill="#38bdf8"/><rect x="210" y="100" width="85" height="60" rx="2" fill="#38bdf8"/><rect x="305" y="100" width="75" height="60" rx="2" fill="#38bdf8"/><rect x="160" y="168" width="80" height="22" rx="2" fill="#075985"/><rect x="0" y="183" width="400" height="8" fill="#0c4a6e"/><circle cx="30" cy="12" r="8" fill="#fbbf24"/><circle cx="50" cy="8" r="5" fill="#fde68a"/><circle cx="370" cy="10" r="7" fill="#fbbf24"/><text x="200" y="248" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0c4a6e" text-anchor="middle">BlueSky Residences · Modern Facade</text></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 260"><rect width="400" height="260" fill="#e0f2fe"/><rect x="0" y="195" width="400" height="65" fill="#7dd3fc"/><rect x="25" y="65" width="150" height="135" rx="4" fill="#0284c7"/><rect x="35" y="75" width="60" height="85" rx="2" fill="#bae6fd"/><rect x="105" y="75" width="60" height="85" rx="2" fill="#bae6fd"/><rect x="42" y="82" width="47" height="72" fill="#7dd3fc"/><rect x="112" y="82" width="47" height="72" fill="#7dd3fc"/><rect x="185" y="85" width="110" height="115" rx="4" fill="#0369a1"/><rect x="195" y="95" width="90" height="75" rx="2" fill="#bae6fd"/><rect x="200" y="100" width="80" height="65" fill="#7dd3fc"/><rect x="305" y="75" width="75" height="125" rx="4" fill="#0284c7"/><rect x="313" y="83" width="55" height="45" rx="2" fill="#bae6fd"/><rect x="313" y="135" width="55" height="45" rx="2" fill="#bae6fd"/><text x="200" y="248" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0c4a6e" text-anchor="middle">BlueSky Residences · Gym & Amenities</text></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 260"><rect width="400" height="260" fill="#bae6fd"/><rect x="0" y="160" width="400" height="100" fill="#38bdf8"/><rect x="40" y="45" width="320" height="125" rx="8" fill="#0369a1"/><rect x="50" y="55" width="70" height="50" fill="#e0f2fe"/><rect x="130" y="55" width="70" height="50" fill="#e0f2fe"/><rect x="210" y="55" width="70" height="50" fill="#e0f2fe"/><rect x="290" y="55" width="60" height="50" fill="#e0f2fe"/><rect x="50" y="115" width="300" height="45" fill="#0284c7"/><rect x="170" y="160" width="60" height="5" fill="#0c4a6e"/><text x="200" y="248" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0c4a6e" text-anchor="middle">BlueSky Residences · Pool View</text></svg>`,
  ],
  6: [
    // Homey Boardinghouse — warm purple/lavender cozy feel
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 260"><rect width="400" height="260" fill="#faf5ff"/><rect x="0" y="178" width="400" height="82" fill="#e9d5ff"/><rect x="20" y="55" width="155" height="128" rx="5" fill="#7e22ce"/><rect x="30" y="65" width="60" height="88" rx="2" fill="#f3e8ff"/><rect x="100" y="65" width="60" height="88" rx="2" fill="#f3e8ff"/><rect x="36" y="71" width="48" height="76" fill="#c084fc"/><rect x="106" y="71" width="48" height="76" fill="#c084fc"/><rect x="185" y="78" width="95" height="105" rx="4" fill="#9333ea"/><rect x="195" y="88" width="75" height="65" rx="2" fill="#faf5ff"/><rect x="200" y="93" width="65" height="55" fill="#c084fc"/><rect x="290" y="68" width="90" height="115" rx="4" fill="#7e22ce"/><rect x="298" y="76" width="35" height="48" rx="2" fill="#e9d5ff"/><rect x="337" y="76" width="36" height="48" rx="2" fill="#e9d5ff"/><rect x="298" y="130" width="75" height="40" rx="2" fill="#f3e8ff"/><circle cx="48" cy="179" r="12" fill="#7e22ce"/><circle cx="75" cy="175" r="16" fill="#581c87"/><circle cx="338" cy="178" r="12" fill="#7e22ce"/><circle cx="363" cy="174" r="10" fill="#9333ea"/><text x="200" y="248" font-family="sans-serif" font-size="13" font-weight="bold" fill="#581c87" text-anchor="middle">Homey Boardinghouse · Entrance</text></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 260"><rect width="400" height="260" fill="#faf5ff"/><rect x="0" y="192" width="400" height="68" fill="#e9d5ff"/><rect x="35" y="78" width="140" height="122" rx="4" fill="#9333ea"/><rect x="45" y="88" width="55" height="75" fill="#f3e8ff"/><rect x="110" y="88" width="55" height="75" fill="#f3e8ff"/><rect x="52" y="95" width="42" height="62" fill="#c084fc"/><rect x="117" y="95" width="42" height="62" fill="#c084fc"/><rect x="185" y="100" width="160" height="100" rx="4" fill="#7e22ce"/><rect x="195" y="110" width="65" height="60" fill="#e9d5ff"/><rect x="270" y="110" width="65" height="60" fill="#e9d5ff"/><text x="200" y="248" font-family="sans-serif" font-size="13" font-weight="bold" fill="#581c87" text-anchor="middle">Homey Boardinghouse · Living Area</text></svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 260"><rect width="400" height="260" fill="#ede9fe"/><rect x="0" y="168" width="400" height="92" fill="#c084fc"/><rect x="55" y="55" width="290" height="122" rx="6" fill="#7e22ce"/><rect x="65" y="65" width="72" height="55" fill="#f3e8ff"/><rect x="147" y="65" width="72" height="55" fill="#f3e8ff"/><rect x="229" y="65" width="72" height="55" fill="#f3e8ff"/><rect x="65" y="128" width="236" height="38" fill="#9333ea"/><rect x="165" y="163" width="70" height="10" fill="#581c87"/><text x="200" y="248" font-family="sans-serif" font-size="13" font-weight="bold" fill="#581c87" text-anchor="middle">Homey Boardinghouse · Kitchen</text></svg>`,
  ],
};

// ── Room photos — inline SVG (unique per room slot) ───────────
// 6 room illustration variants reused across dorms
const roomPhotoSVGs = [
  // Variant 0 — Single bed, study desk, warm
  `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 200 120"><rect width="200" height="120" fill="#fef9c3"/><rect x="0" y="80" width="200" height="40" fill="#fde68a"/><rect x="10" y="50" width="80" height="35" rx="3" fill="#b45309"/><rect x="14" y="54" width="72" height="27" rx="1" fill="#fef3c7"/><rect x="10" y="82" width="10" height="10" fill="#92400e"/><rect x="80" y="82" width="10" height="10" fill="#92400e"/><rect x="100" y="40" width="50" height="50" rx="2" fill="#d97706"/><rect x="104" y="44" width="42" height="30" fill="#fef3c7"/><rect x="108" y="48" width="34" height="22" fill="#bae6fd"/><rect x="155" y="55" width="30" height="35" rx="2" fill="#b45309"/><rect x="158" y="58" width="24" height="20" fill="#fef3c7"/><circle cx="170" cy="45" r="8" fill="#fbbf24"/><text x="100" y="115" font-family="sans-serif" font-size="9" fill="#92400e" text-anchor="middle">Single Room</text></svg>`,
  // Variant 1 — Bunk bed, blue tones
  `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 200 120"><rect width="200" height="120" fill="#eff6ff"/><rect x="0" y="80" width="200" height="40" fill="#bfdbfe"/><rect x="10" y="25" width="70" height="60" rx="2" fill="#2563eb"/><rect x="14" y="29" width="62" height="24" rx="1" fill="#dbeafe"/><rect x="14" y="57" width="62" height="24" rx="1" fill="#dbeafe"/><rect x="10" y="23" width="4" height="64" fill="#1d4ed8"/><rect x="76" y="23" width="4" height="64" fill="#1d4ed8"/><rect x="10" y="53" width="70" height="4" fill="#1d4ed8"/><rect x="90" y="45" width="55" height="45" rx="2" fill="#3b82f6"/><rect x="94" y="49" width="47" height="30" fill="#dbeafe"/><rect x="98" y="53" width="40" height="22" fill="#93c5fd"/><rect x="150" y="55" width="40" height="35" rx="2" fill="#1d4ed8"/><rect x="153" y="58" width="34" height="15" fill="#dbeafe"/><text x="100" y="115" font-family="sans-serif" font-size="9" fill="#1e3a8a" text-anchor="middle">Bunk Bed Room</text></svg>`,
  // Variant 2 — Double bed, green
  `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 200 120"><rect width="200" height="120" fill="#f0fdf4"/><rect x="0" y="80" width="200" height="40" fill="#bbf7d0"/><rect x="8" y="48" width="95" height="38" rx="3" fill="#15803d"/><rect x="12" y="52" width="87" height="30" rx="1" fill="#dcfce7"/><rect x="8" y="82" width="10" height="10" fill="#14532d"/><rect x="93" y="82" width="10" height="10" fill="#14532d"/><rect x="30" y="44" width="20" height="10" rx="2" fill="#dcfce7"/><rect x="60" y="44" width="20" height="10" rx="2" fill="#dcfce7"/><rect x="110" y="40" width="50" height="50" rx="2" fill="#16a34a"/><rect x="114" y="44" width="42" height="32" fill="#dcfce7"/><rect x="118" y="48" width="34" height="24" fill="#86efac"/><rect x="165" y="52" width="25" height="38" rx="2" fill="#15803d"/><circle cx="178" cy="45" r="7" fill="#fbbf24"/><text x="100" y="115" font-family="sans-serif" font-size="9" fill="#14532d" text-anchor="middle">Double Room</text></svg>`,
  // Variant 3 — Studio, purple
  `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 200 120"><rect width="200" height="120" fill="#faf5ff"/><rect x="0" y="80" width="200" height="40" fill="#e9d5ff"/><rect x="10" y="50" width="75" height="35" rx="3" fill="#7e22ce"/><rect x="14" y="54" width="67" height="27" rx="1" fill="#f3e8ff"/><rect x="10" y="82" width="9" height="10" fill="#581c87"/><rect x="76" y="82" width="9" height="10" fill="#581c87"/><rect x="95" y="42" width="55" height="48" rx="2" fill="#9333ea"/><rect x="99" y="46" width="47" height="32" fill="#f3e8ff"/><rect x="103" y="50" width="40" height="24" fill="#c084fc"/><rect x="155" y="55" width="35" height="35" rx="2" fill="#7e22ce"/><rect x="158" y="58" width="28" height="14" fill="#f3e8ff"/><text x="100" y="115" font-family="sans-serif" font-size="9" fill="#581c87" text-anchor="middle">Studio Unit</text></svg>`,
  // Variant 4 — AC room, teal
  `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 200 120"><rect width="200" height="120" fill="#f0fdfa"/><rect x="0" y="80" width="200" height="40" fill="#99f6e4"/><rect x="8" y="48" width="85" height="36" rx="3" fill="#0f766e"/><rect x="12" y="52" width="77" height="28" rx="1" fill="#ccfbf1"/><rect x="8" y="82" width="9" height="10" fill="#134e4a"/><rect x="84" y="82" width="9" height="10" fill="#134e4a"/><rect x="100" y="20" width="80" height="22" rx="3" fill="#0d9488"/><rect x="105" y="24" width="70" height="14" fill="#ccfbf1"/><rect x="105" y="45" width="55" height="45" rx="2" fill="#0f766e"/><rect x="109" y="49" width="47" height="30" fill="#ccfbf1"/><rect x="113" y="53" width="40" height="22" fill="#5eead4"/><rect x="165" y="55" width="28" height="35" rx="2" fill="#0f766e"/><text x="100" y="115" font-family="sans-serif" font-size="9" fill="#134e4a" text-anchor="middle">Air-Conditioned Room</text></svg>`,
  // Variant 5 — Cozy corner, orange
  `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 200 120"><rect width="200" height="120" fill="#fff7ed"/><rect x="0" y="80" width="200" height="40" fill="#fed7aa"/><rect x="8" y="50" width="78" height="34" rx="3" fill="#ea580c"/><rect x="12" y="54" width="70" height="26" rx="1" fill="#ffedd5"/><rect x="8" y="82" width="9" height="10" fill="#9a3412"/><rect x="77" y="82" width="9" height="10" fill="#9a3412"/><rect x="95" y="44" width="58" height="46" rx="2" fill="#f97316"/><rect x="99" y="48" width="50" height="30" fill="#ffedd5"/><rect x="103" y="52" width="42" height="22" fill="#fdba74"/><rect x="158" y="55" width="32" height="35" rx="2" fill="#ea580c"/><rect x="161" y="58" width="26" height="12" fill="#ffedd5"/><circle cx="175" cy="46" r="7" fill="#fbbf24"/><text x="100" y="115" font-family="sans-serif" font-size="9" fill="#9a3412" text-anchor="middle">Cozy Room</text></svg>`,
];

const dormListings = [
  {
    id:1, name:'Sunrise Dormitory', location:'Minglanilla, Cebu', price:3500,
    type:'Dormitory', amenities:['WiFi','CCTV','Laundry','Study Area'],
    available:3, total:10, rating:4.5, owner:'Maria Santos',
    description:'A clean and safe dormitory located near the school, perfect for students. Complete amenities and 24/7 security.',
    houseRules:'No visitors after 10PM. No smoking inside. Quiet hours 10PM–6AM.',
    distance:'0.3 km from school',
    get img()    { return dormPhotos[1][0]; },
    get photos() { return dormPhotos[1]; },
  },
  {
    id:2, name:'Villa Maria Suites', location:'Minglanilla, Cebu', price:2800,
    type:'Boarding House', amenities:['WiFi','Parking','Kitchen'],
    available:5, total:8, rating:4.2, owner:'Jose Reyes',
    description:'Affordable boarding house with complete basic amenities. Walking distance from campus.',
    houseRules:'No loud music. Guests allowed until 9PM only.',
    distance:'0.6 km from school',
    get img()    { return dormPhotos[2][0]; },
    get photos() { return dormPhotos[2]; },
  },
  {
    id:3, name:'Campus View Rooms', location:'Minglanilla, Cebu', price:4200,
    type:'Apartment', amenities:['WiFi','CCTV','AC','Kitchen','Laundry'],
    available:1, total:6, rating:4.8, owner:'Ana Gonzales',
    description:'Premium rooms with air conditioning, fully furnished, and with complete kitchen access.',
    houseRules:'No pets. No overnight visitors. Weekly room inspection.',
    distance:'0.2 km from school',
    get img()    { return dormPhotos[3][0]; },
    get photos() { return dormPhotos[3]; },
  },
  {
    id:4, name:'Green Haven Dorm', location:'Talisay, Cebu', price:2500,
    type:'Dormitory', amenities:['WiFi','Study Area','CCTV'],
    available:7, total:12, rating:3.9, owner:'Roberto Lim',
    description:'Budget-friendly dormitory in a quiet neighborhood, suitable for students on a tight budget.',
    houseRules:'Curfew at 11PM. No cooking inside rooms.',
    distance:'1.2 km from school',
    get img()    { return dormPhotos[4][0]; },
    get photos() { return dormPhotos[4]; },
  },
  {
    id:5, name:'BlueSky Residences', location:'Talisay, Cebu', price:5000,
    type:'Apartment', amenities:['WiFi','AC','CCTV','Parking','Gym'],
    available:2, total:5, rating:4.9, owner:'Carla Mendoza',
    description:'Modern and fully furnished apartments with gym access. Best for graduate students.',
    houseRules:'Strictly no smoking. Noise restriction after 10PM.',
    distance:'0.8 km from school',
    get img()    { return dormPhotos[5][0]; },
    get photos() { return dormPhotos[5]; },
  },
  {
    id:6, name:'Homey Boardinghouse', location:'Minglanilla, Cebu', price:1800,
    type:'Boarding House', amenities:['WiFi','Kitchen'],
    available:4, total:8, rating:3.7, owner:'Nena Cruz',
    description:'Very affordable option for students looking for a no-frills place close to campus.',
    houseRules:'Quiet hours from 10PM. Common area must be kept clean.',
    distance:'0.5 km from school',
    get img()    { return dormPhotos[6][0]; },
    get photos() { return dormPhotos[6]; },
  },
];

// ── Merge owner-added listings from localStorage ──────────────
// When an owner adds a listing via owner-dashboard.html it gets saved
// to localStorage under 'df_custom_listings'. We push those into
// dormListings here so search.html, dorm-details.html and student-dashboard
// automatically pick them up (including uploaded photos) on every page load.
(function mergeCustomListings() {
  try {
    const raw = localStorage.getItem('df_custom_listings');
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved) || saved.length === 0) return;
    saved.forEach(d => {
      const idx = dormListings.findIndex(x => x.id === d.id);
      if (idx >= 0) {
        // Merge saved data (including photos, edits) into existing seed listing
        dormListings[idx] = { ...dormListings[idx], ...d };
      } else {
        // Brand-new listing added by owner — append it
        dormListings.push(d);
      }
    });
  } catch (e) {
    console.warn('Could not load custom listings:', e);
  }
})();

// ── Helpers ───────────────────────────────────────────────────
function selectDorm(id) {
  localStorage.setItem('selectedDormId', id);
  window.location.href = '/pages/dorm-details.html';
}

function formatPeso(n) {
  return '₱' + Number(n).toLocaleString();
}

function availBadge(available) {
  if (available === 0) return `<span class="badge badge-danger">Fully Occupied</span>`;
  if (available <= 2)  return `<span class="badge badge-warning">${available} slot${available>1?'s':''} left</span>`;
  return `<span class="badge badge-success">${available} available</span>`;
}

function dormColor(id) {
  const palette = [
    {bg:'#dbeafe',fg:'#1e40af'},
    {bg:'#dcfce7',fg:'#15803d'},
    {bg:'#fef3c7',fg:'#92400e'},
    {bg:'#ede9fe',fg:'#5b21b6'},
    {bg:'#fce7f3',fg:'#9d174d'},
    {bg:'#cffafe',fg:'#0e7490'},
  ];
  return palette[(id-1) % palette.length];
}

function starsHtml(rating) {
  const full  = Math.floor(rating);
  const empty = 5 - full;
  return `<span style="color:#f59e0b">${Icons.star.repeat(full)}</span><span style="color:var(--slate-300)">${Icons.staro.repeat(empty)}</span>`;
}

const amenityMap = {
  'WiFi':      { icon: Icons.wifi,   label: 'WiFi' },
  'AC':        { icon: Icons.ac,     label: 'Air Conditioning' },
  'CCTV':      { icon: Icons.camera, label: 'CCTV' },
  'Laundry':   { icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M7 12a5 5 0 0 1 5-5 4 4 0 0 1 4 4"/></svg>`, label: 'Laundry' },
  'Kitchen':   { icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2"/><path d="M18 15V2"/><rect x="15" y="15" width="6" height="7" rx="1"/></svg>`, label: 'Kitchen' },
  'Parking':   { icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>`, label: 'Parking' },
  'Study Area':{ icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`, label: 'Study Area' },
  'Gym':       { icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5h11M6.5 17.5h11M3 12h3m15 0h-3M6.5 9v6M17.5 9v6"/></svg>`, label: 'Gym' },
};
