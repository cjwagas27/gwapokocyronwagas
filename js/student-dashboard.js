
  // ── Load logged-in user ────────────────────────────────────
  const u = JSON.parse(localStorage.getItem('df_user') || 'null');

  // Guard: must be logged in as student (or any role for demo)
  if (!u || !u.name) {
    window.location.replace('/index.html');
  }

  const initials = u.initials || (u.name ? u.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : 'S');
  const fullName = u.name || 'Student';

  // Populate nav + profile
  document.getElementById('nav-name').textContent       = fullName;
  document.getElementById('nav-avatar').textContent     = initials;
  document.getElementById('welcome-msg').textContent    = `Welcome back, ${u.name ? u.name.split(' ')[0] : 'Student'}!`;
  document.getElementById('profile-fullname').textContent = fullName;
  document.getElementById('profile-av-big').textContent  = initials;
  document.getElementById('prof-name').value  = fullName;
  document.getElementById('prof-email').value = u.email || '';

  // ── Tab switching ──────────────────────────────────────────
  const API = 'http://localhost:3000';
  const TABS = ['overview','bookings','saved','messages','profile'];

  function switchTab(name) {
    TABS.forEach(t => {
      document.getElementById(`panel-${t}`).classList.toggle('active', t === name);
      const sl = document.getElementById(`sl-${t}`);
      if (sl) sl.classList.toggle('active', t === name);
    });
    if (name === 'bookings') fetchBookings();
    if (name === 'saved')    renderSaved();
    if (name === 'messages') fetchMessages();
  }

  // ── My Bookings — live from DB ─────────────────────────────
  let myBookings = [];
  let _prevBookingStatuses = {}; // track status changes for notifications

  async function fetchBookings() {
    if (!u || !u.id) { renderBookings(); return; }
    try {
      const res  = await fetch(`${API}/api/bookings?student_id=${u.id}`);
      const data = await res.json();
      if (data.ok) {
        // Detect newly approved bookings since last fetch
        data.bookings.forEach(b => {
          const prev = _prevBookingStatuses[b.booking_id];
          if (prev === 'pending' && b.status === 'approved') {
            showApprovedNotification(b.dorm_name || 'your dorm');
          }
          _prevBookingStatuses[b.booking_id] = b.status;
        });
        myBookings = data.bookings;
      }
    } catch(e) { /* offline — keep existing */ }
    renderBookings();
    renderStats();
  }

  function showApprovedNotification(dormName) {
    // Show a prominent toast
    showToast(`🎉 Congratulations! Your booking at ${dormName} has been approved!`, 'success', 6000);
  }

  function pillHtml(status) {
    const map = {
      pending:   ['pill-pending',  'Pending'],
      approved:  ['pill-approved', '✓ Approved'],
      rejected:  ['pill-rejected', 'Rejected'],
      cancelled: ['pill-cancelled','Cancelled'],
      completed: ['pill-completed','Completed'],
    };
    const [cls, label] = map[status] || ['pill-pending', status];
    return `<span class="pill ${cls}">${label}</span>`;
  }

  function renderBookings() {
    const tbody = document.getElementById('bookings-tbody');

    // Check for any approved bookings to show a banner
    const approvedBookings = myBookings.filter(b => b.status === 'approved');

    if (!myBookings.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--slate-400)">No bookings yet. <a href="/pages/search.html">Browse dorms →</a></td></tr>`;
      return;
    }

    tbody.innerHTML = myBookings.map(b => {
      const isApproved  = b.status === 'approved';
      const isRejected  = b.status === 'rejected';
      const isPending   = b.status === 'pending';
      const isCancelled = b.status === 'cancelled';

      // Row highlight for approved
      const rowStyle = isApproved ? 'background:linear-gradient(90deg,#f0fdf4 0%,#ffffff 100%);' : '';

      // Action column
      let actionHtml = `<button class="btn btn-sm btn-ghost" onclick="selectDorm(${b.dorm_id})">View</button>`;
      if (isPending) {
        actionHtml += ` <button class="btn btn-sm btn-danger" style="margin-left:4px" onclick="cancelBooking(${b.booking_id})">Cancel</button>`;
      }
      if (isApproved) {
        actionHtml = `
          <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-start">
            <span style="display:inline-flex;align-items:center;gap:4px;font-size:0.75rem;font-weight:700;color:#15803d;background:#dcfce7;padding:3px 8px;border-radius:100px">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Approved
            </span>
            <button class="btn btn-sm btn-ghost" style="font-size:0.75rem;padding:3px 8px" onclick="selectDorm(${b.dorm_id})">View Dorm</button>
          </div>`;
      }
      if (isRejected) {
        actionHtml = `<span style="font-size:0.75rem;color:var(--danger);font-weight:600">Not approved</span>`;
      }

      // Congratulation inline banner for approved
      const congrats = isApproved ? `
        <tr>
          <td colspan="6" style="padding:0;border-bottom:none">
            <div style="background:linear-gradient(90deg,#dcfce7,#f0fdf4);border-left:4px solid #16a34a;padding:10px 16px;display:flex;align-items:center;gap:10px">
              <span style="font-size:1.3rem">🎉</span>
              <div>
                <div style="font-weight:700;font-size:0.875rem;color:#15803d">Congratulations! Your booking has been approved.</div>
                <div style="font-size:0.78rem;color:#166534">Your room at <strong>${b.dorm_name}</strong> is confirmed. Move-in date: <strong>${b.move_in_date}</strong></div>
              </div>
            </div>
          </td>
        </tr>` : '';

      return `${congrats}<tr style="${rowStyle}">
        <td>
          <strong style="color:var(--slate-900)">${b.dorm_name || 'Dorm'}</strong>
          ${isApproved ? `<div style="font-size:0.7rem;color:#15803d;font-weight:600;margin-top:2px">● Confirmed</div>` : ''}
        </td>
        <td style="font-size:0.82rem;color:var(--slate-600)">${b.move_in_date || '—'}</td>
        <td style="font-size:0.82rem;color:var(--slate-600);max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${b.notes ? b.notes.substring(0,40) : '—'}</td>
        <td><strong style="color:var(--blue-700)">${formatPeso(b.total_price || 0)}</strong></td>
        <td>${pillHtml(b.status)}</td>
        <td>${actionHtml}</td>
      </tr>`;
    }).join('');
  }

  async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking request?')) return;
    try {
      const res  = await fetch(`${API}/api/bookings/${bookingId}`, {
        method: 'PUT', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ status: 'cancelled' }),
      });
      const data = await res.json();
      showToast(data.ok ? 'Booking cancelled successfully.' : data.message, data.ok ? 'info' : 'error');
    } catch(e) { showToast('Could not reach server.', 'error'); }
    fetchBookings();
  }

  // ── Messages — live from DB ────────────────────────────────
  async function fetchMessages() {
    if (!u || !u.id) return;
    try {
      const res  = await fetch(`${API}/api/messages?user_id=${u.id}`);
      const data = await res.json();
      if (data.ok) renderMessages(data.messages);
    } catch(e) { /* offline */ }
  }

  // Quick unread count without side-effects for badge
  async function checkMsgBadge() {
    if (!u || !u.id) return;
    try {
      const res  = await fetch(`${API}/api/messages?user_id=${u.id}`);
      const data = await res.json();
      if (data.ok) {
        const unread = data.messages.filter(m => !m.is_read && m.receiver_id === u.id).length;
        const badge  = document.getElementById('msg-badge');
        if (badge) {
          if (unread > 0) { badge.textContent = unread; badge.style.display = 'inline-flex'; }
          else badge.style.display = 'none';
        }
      }
    } catch(e) {}
  }

  function renderMessages(msgs) {
    const container = document.getElementById('messages-list');

    // Update unread badge
    const unreadCount = (msgs || []).filter(m => !m.is_read && m.receiver_id === u.id).length;
    const badge = document.getElementById('msg-badge');
    if (badge) {
      if (unreadCount > 0) { badge.textContent = unreadCount; badge.style.display = 'inline-flex'; }
      else badge.style.display = 'none';
    }

    if (!msgs || !msgs.length) {
      container.innerHTML = `
        <div style="text-align:center;padding:56px 24px;color:var(--slate-400)">
          <div style="width:56px;height:56px;background:var(--slate-100);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div style="font-weight:600;color:var(--slate-600);margin-bottom:6px">No messages yet</div>
          <div style="font-size:0.82rem">When you contact a dorm owner, your conversation will appear here.</div>
          <a href="/pages/search.html" class="btn btn-primary" style="margin-top:18px;display:inline-flex">Browse Dorms</a>
        </div>`;
      return;
    }

    // Group by dorm + owner for thread view
    const threads = {};
    msgs.forEach(m => {
      const otherId = m.sender_id === u.id ? m.receiver_id : m.sender_id;
      const key = `${m.dorm_id}_${otherId}`;
      if (!threads[key]) threads[key] = { messages: [], dormName: m.dorm_name, otherName: m.sender_id === u.id ? m.receiver_name : m.sender_name, dormId: m.dorm_id, otherId };
      threads[key].messages.push(m);
    });

    container.innerHTML = Object.values(threads).map(thread => {
      const hasUnread = thread.messages.some(m => !m.is_read && m.receiver_id === u.id);
      const lastMsg   = thread.messages[thread.messages.length - 1];
      const threadKey = `sthread_${thread.dormId}_${thread.otherId}`;
      return `
      <div class="card" style="margin-bottom:12px">
        <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;${hasUnread?'background:#eff6ff;':''}cursor:pointer" onclick="toggleSThread('${threadKey}')">
          <div style="width:38px;height:38px;border-radius:50%;background:var(--navy-700);color:white;font-weight:700;font-size:0.8rem;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            ${(thread.otherName||'?').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;font-size:0.875rem;color:var(--slate-800);display:flex;align-items:center;gap:6px">
              ${thread.otherName || 'Owner'}
              ${hasUnread ? `<span style="width:8px;height:8px;border-radius:50%;background:var(--danger);display:inline-block"></span>` : ''}
            </div>
            ${thread.dormName ? `<div style="font-size:0.72rem;color:var(--navy-700);font-weight:600">🏠 ${thread.dormName}</div>` : ''}
            <div style="font-size:0.78rem;color:var(--slate-500);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:340px">${lastMsg.body.substring(0,90)}${lastMsg.body.length>90?'…':''}</div>
          </div>
          <div style="font-size:0.7rem;color:var(--slate-400);flex-shrink:0">${new Date(lastMsg.sent_at).toLocaleDateString()}</div>
          <svg id="schevron_${threadKey}" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--slate-400)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;transition:transform 0.2s"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div id="${threadKey}" style="display:none">
          <div style="padding:12px 16px;max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:8px">
            ${thread.messages.map(m => {
              const isSent = m.sender_id === u.id;
              return `<div style="display:flex;flex-direction:column;align-items:${isSent?'flex-end':'flex-start'}">
                <div style="max-width:80%;padding:9px 13px;border-radius:${isSent?'14px 14px 4px 14px':'14px 14px 14px 4px'};background:${isSent?'var(--navy-700)':'var(--slate-100)'};color:${isSent?'white':'var(--slate-800)'};font-size:0.85rem;line-height:1.5;white-space:pre-wrap">${m.body}</div>
                <div style="font-size:0.68rem;color:var(--slate-400);margin-top:3px">${isSent?'You':m.sender_name} · ${new Date(m.sent_at).toLocaleString()}</div>
              </div>`;
            }).join('')}
          </div>
          <div style="padding:10px 14px;border-top:1px solid var(--border);display:flex;gap:8px;align-items:flex-end">
            <textarea id="sreply_${thread.dormId}_${thread.otherId}" rows="2" class="form-control" placeholder="Type your message…" style="resize:none;flex:1;font-size:0.85rem"></textarea>
            <button class="btn btn-primary btn-sm" onclick="sendStudentReply(${thread.dormId})" style="flex-shrink:0;padding:9px 16px">Send</button>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  function toggleSThread(key) {
    const el = document.getElementById(key);
    const chevron = document.getElementById(`schevron_${key}`);
    if (!el) return;
    const open = el.style.display !== 'none';
    el.style.display = open ? 'none' : 'block';
    if (chevron) chevron.style.transform = open ? '' : 'rotate(180deg)';
    if (!open) {
      const msgDiv = el.querySelector('div[style*="overflow-y"]');
      if (msgDiv) setTimeout(() => { msgDiv.scrollTop = msgDiv.scrollHeight; }, 50);
    }
  }

  async function sendStudentReply(dormId) {
    // Find the textarea for this dorm (student sends to dorm owner, server resolves receiver)
    const textareas = document.querySelectorAll(`[id^="sreply_${dormId}_"]`);
    if (!textareas.length) return;
    const textarea = textareas[0];
    const body = textarea.value.trim();
    if (!body) { showToast('Please type a message before sending.', 'error'); return; }
    if (!u || !u.id) { showToast('Please log in to send messages.', 'error'); return; }
    const btn = textarea.nextElementSibling;
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    try {
      const res  = await fetch(`${API}/api/messages`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ sender_id: u.id, dorm_id: dormId, body }),
      });
      const data = await res.json();
      if (!data.ok) { showToast(data.message || 'Could not send message.', 'error'); return; }
      textarea.value = '';
      showToast('Message sent!', 'success');
      await fetchMessages();
    } catch(e) {
      showToast('Could not reach server.', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Send'; }
    }
  }

  // ── Saved Dorms ────────────────────────────────────────────
  let favorites = JSON.parse(localStorage.getItem('df_favorites') || '[]');

  function renderSaved() {
    const list    = document.getElementById('saved-list');
    const saved   = dormListings.filter(d => favorites.includes(d.id));
    document.getElementById('stat-saved').textContent = saved.length;

    if (!saved.length) {
      list.innerHTML = `<div style="text-align:center;padding:40px;color:var(--slate-400)">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 12px;display:block;opacity:.35"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <div style="font-weight:600;color:var(--slate-600)">No saved dorms yet</div>
        <div style="font-size:0.82rem;margin-top:4px">Tap the ♡ on any listing to save it here.</div>
        <a href="/pages/search.html" class="btn btn-primary" style="margin-top:16px;display:inline-flex">Browse Dorms</a>
      </div>`;
      return;
    }

    list.innerHTML = saved.map(d => {
      const col = dormColor(d.id);
      return `
      <div class="saved-card">
        <div class="saved-thumb" style="background:${col.bg}">${d.img || ''}</div>
        <div class="saved-info">
          <div class="saved-name">${d.name}</div>
          <div class="saved-loc">${d.location} · ${d.distance || ''}</div>
          <div class="saved-price">${formatPeso(d.price)}/month</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
          <button class="btn btn-sm btn-primary" onclick="selectDorm(${d.id})">View</button>
          <button class="btn btn-sm btn-ghost" onclick="removeSaved(${d.id})">Remove</button>
        </div>
      </div>`;
    }).join('');
  }

  function removeSaved(id) {
    favorites = favorites.filter(f => f !== id);
    localStorage.setItem('df_favorites', JSON.stringify(favorites));
    renderSaved();
    showToast('Removed from saved dorms.', 'info');
  }

  // ── Overview dorm cards — fetch from DB + seed ────────────
  async function renderOverviewDorms() {
    const grid = document.getElementById('overview-dorm-grid');
    // Load DB listings first, then merge with seed data
    try {
      const res  = await fetch(`${API}/api/listings`);
      const data = await res.json();
      if (data.ok && data.listings.length) {
        data.listings.forEach(dl => {
          const isSeed = dl.dorm_id >= 1 && dl.dorm_id <= 6;
          const hasDbPhotos = dl.photos && dl.photos.length > 0;
          if (isSeed && !hasDbPhotos) return;
          const dbDorm = {
            id: dl.dorm_id, name: dl.name, type: dl.dorm_type,
            price: dl.price_per_month, location: dl.location || 'Cebu',
            total: dl.total_slots, available: dl.available_slots,
            description: dl.description || '', amenities: dl.amenities || [],
            photos: (dl.photos || []).map(p => p.data),
            img: dl.cover_img || null, rating: 4.0,
            owner: dl.owner_name || 'Owner', distance: 'N/A',
          };
          const idx = dormListings.findIndex(s => s.id === dl.dorm_id);
          if (idx >= 0) { if (hasDbPhotos) dormListings[idx] = dbDorm; }
          else dormListings.push(dbDorm);
        });
      }
    } catch(e) { /* offline — use seed data */ }

    const all = dormListings.slice(0, 9);
    grid.innerHTML = all.map(d => {
      const col = dormColor(d.id);
      const avail = d.available === 0
        ? `<span style="color:var(--danger);font-size:.7rem;font-weight:700">Fully Occupied</span>`
        : d.available <= 2
        ? `<span style="color:var(--warning);font-size:.7rem;font-weight:700">${d.available} slot${d.available>1?'s':''} left</span>`
        : `<span style="color:var(--success);font-size:.7rem;font-weight:700">${d.available} available</span>`;

      const imgHtml = d.img && d.img.startsWith('data:image')
        ? `<img src="${d.img}" style="width:100%;height:100%;object-fit:cover;display:block" alt="${d.name}"/>`
        : (d.img || '');

      return `
      <div class="overview-dorm-card" onclick="selectDorm(${d.id})">
        <div class="odc-img" style="background:${col.bg};overflow:hidden;position:relative">
          ${imgHtml}
          <span class="odc-type" style="position:absolute;top:6px;left:6px;font-size:0.65rem">${d.type}</span>
        </div>
        <div class="odc-body">
          <div class="odc-name">${d.name}</div>
          <div class="odc-loc">${d.location}</div>
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div class="odc-price">${formatPeso(d.price)}<span style="font-size:.65rem;font-weight:500;color:var(--slate-400)">/mo</span></div>
            ${avail}
          </div>
        </div>
      </div>`;
    }).join('');
  }

  // ── Stats ──────────────────────────────────────────────────
  function renderStats() {
    const total    = myBookings.length;
    const approved = myBookings.filter(b => b.status === 'approved').length;
    const pending  = myBookings.filter(b => b.status === 'pending').length;
    const saved    = favorites.length;

    document.getElementById('stat-bookings').textContent = total;
    document.getElementById('stat-approved').textContent = approved;
    document.getElementById('stat-pending').textContent  = pending;
    document.getElementById('stat-saved').textContent    = saved;

    const badge = document.getElementById('bookings-badge');
    if (pending > 0) {
      badge.textContent   = pending;
      badge.style.display = 'inline-flex';
    }
  }

  // ── Go home WITHOUT logging out ───────────────────────────
  function goHome(e) {
    e.preventDefault();
    window.location.href = '/index.html';
  }

  function logout() {
    localStorage.removeItem('df_role');
    localStorage.removeItem('df_user');
    window.location.href = '/index.html';
  }

  // ── Init ──────────────────────────────────────────────────
  renderOverviewDorms();
  renderStats();
  checkMsgBadge(); // show unread badge on load without marking as read

  // Check URL hash — if #bookings (from "View My Bookings" after submission),
  // open bookings tab directly and load from DB
  (function checkHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'bookings' || hash === 'messages' || hash === 'saved') {
      switchTab(hash);
    } else {
      fetchBookings(); // still pre-load bookings count for stats
    }
    // Clear the hash so refreshing doesn't re-trigger it
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  })();
