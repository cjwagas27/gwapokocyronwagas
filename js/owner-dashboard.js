
  const API = 'http://localhost:3000';
  const u = JSON.parse(localStorage.getItem('df_user') || '{}');
  const ownerName = u.name || 'Maria Santos';
  const ownerId   = u.id   || null;

  let ownerListings = [];

  const bookings = [];

  (function(){
    const u=JSON.parse(localStorage.getItem('df_user')||'{}');
    const initials = u.initials || (u.name ? u.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : 'MS');
    const name     = u.name || 'Property Owner';
    document.getElementById('nav-name').textContent   = name;
    document.getElementById('nav-avatar').textContent = initials;
    document.getElementById('profile-av').textContent = initials;
    document.getElementById('profile-nm').textContent = name;
  })();

  function switchTab(name) {
    ['listings','bookings','messages'].forEach(t=>{
      document.getElementById(`panel-${t}`).classList.toggle('active', t===name);
      document.getElementById(`tab-${t}`).classList.toggle('active', t===name);
      document.getElementById(`sl-${t}`)?.classList.toggle('active', t===name);
    });
    if (name === 'bookings') fetchOwnerBookings();
    if (name === 'messages') fetchOwnerMessages();
  }

  // ── Fetch owner bookings from DB ─────────────────────────
  async function fetchOwnerBookings() {
    if (!ownerId) { renderBookings(); return; }
    try {
      const res  = await fetch(`${API}/api/bookings?owner_id=${ownerId}`);
      const data = await res.json();
      if (data.ok) {
        bookings.length = 0;
        data.bookings.forEach(b => bookings.push({
          id:       b.booking_id,
          student:  b.student_name || 'Student',
          property: b.dorm_name    || 'Dorm',
          room:     b.notes ? b.notes.split(' ')[0] : 'Room',
          movein:   b.move_in_date || '—',
          price:    b.price        || 0,
          status:   (b.status.charAt(0).toUpperCase() + b.status.slice(1)),
          booking_id: b.booking_id,
          dorm_id:  b.dorm_id,
        }));
      }
    } catch(e) { /* offline */ }
    renderBookings();
  }

  function renderBookings() {
    const pending  = bookings.filter(b => b.status === 'Pending').length;
    document.getElementById('stat-pending').textContent  = pending;
    document.getElementById('stat-approved').textContent = bookings.filter(b => b.status === 'Approved').length;
    document.getElementById('pending-badge').textContent = pending;
    const bm = { Pending:'badge-warning', Approved:'badge-success', Rejected:'badge-danger', Cancelled:'badge-danger' };
    document.getElementById('bookings-tbody').innerHTML = bookings.length ? bookings.map(b => `
      <tr>
        <td class="req-name">${b.student}</td>
        <td class="req-sub">${b.property}</td>
        <td style="font-size:0.875rem">${b.room}</td>
        <td style="font-size:0.82rem;color:var(--slate-500)">${b.movein}</td>
        <td><strong style="color:var(--blue-800)">${formatPeso(b.price)}</strong></td>
        <td><span class="badge ${bm[b.status]||'badge-neutral'}">${b.status}</span></td>
        <td>${b.status==='Pending'?`
          <div style="display:flex;gap:5px">
            <button class="btn btn-sm btn-success" onclick="updateBooking(${b.booking_id},'approved')">Approve</button>
            <button class="btn btn-sm btn-danger"  onclick="updateBooking(${b.booking_id},'rejected')">Reject</button>
          </div>`:
          `<span style="font-size:0.78rem;color:var(--slate-400)">—</span>`}
        </td>
      </tr>`).join('') :
      `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--slate-400)">No booking requests yet.</td></tr>`;
  }

  async function updateBooking(bookingId, status) {
    try {
      const res  = await fetch(`${API}/api/bookings/${bookingId}`, {
        method: 'PUT', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      showToast(data.ok ? `Booking ${status}.` : data.message, data.ok ? 'success' : 'error');
    } catch(e) { showToast('Could not reach server.', 'error'); }
    fetchOwnerBookings();
  }

  // ── Fetch owner messages from DB ─────────────────────────
  async function fetchOwnerMessages() {
    if (!ownerId) return;
    try {
      const res  = await fetch(`${API}/api/messages?user_id=${ownerId}`);
      const data = await res.json();
      if (data.ok) renderOwnerMessages(data.messages);
    } catch(e) { /* offline */ }
  }

  function renderOwnerMessages(msgs) {
    const container = document.getElementById('messages-list');

    // Update unread badge
    const unreadCount = (msgs || []).filter(m => !m.is_read && m.receiver_id === ownerId).length;
    const badge = document.getElementById('unread-badge');
    if (badge) {
      if (unreadCount > 0) { badge.textContent = unreadCount; badge.style.display = 'inline-flex'; }
      else badge.style.display = 'none';
    }

    if (!msgs || !msgs.length) {
      container.innerHTML = `<div class="card card-body" style="text-align:center;padding:56px;color:var(--slate-500)">
        <div style="width:56px;height:56px;background:var(--slate-100);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;color:var(--slate-400)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div style="font-size:0.95rem;font-weight:700;color:var(--slate-700);margin-bottom:4px">No messages yet</div>
        <div style="font-size:0.85rem">Student inquiries about your properties will appear here.</div>
      </div>`;
      return;
    }

    // Group by dorm + student for thread view
    const threads = {};
    msgs.forEach(m => {
      const otherId = m.sender_id === ownerId ? m.receiver_id : m.sender_id;
      const key = `${m.dorm_id}_${otherId}`;
      if (!threads[key]) threads[key] = { messages: [], dormName: m.dorm_name, otherName: m.sender_id === ownerId ? m.receiver_name : m.sender_name, dormId: m.dorm_id, otherId };
      threads[key].messages.push(m);
    });

    container.innerHTML = Object.values(threads).map(thread => {
      const hasUnread = thread.messages.some(m => !m.is_read && m.receiver_id === ownerId);
      const lastMsg   = thread.messages[thread.messages.length - 1];
      const threadKey = `thread_${thread.dormId}_${thread.otherId}`;
      return `
      <div class="card" style="margin-bottom:12px">
        <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;${hasUnread?'background:#eff6ff;':''}cursor:pointer" onclick="toggleThread('${threadKey}')">
          <div style="width:38px;height:38px;border-radius:50%;background:var(--navy-700);color:white;font-weight:700;font-size:0.8rem;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            ${(thread.otherName||'?').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;font-size:0.875rem;color:var(--slate-800);display:flex;align-items:center;gap:6px">
              ${thread.otherName || 'Student'}
              ${hasUnread ? `<span style="width:8px;height:8px;border-radius:50%;background:var(--danger);display:inline-block"></span>` : ''}
            </div>
            ${thread.dormName ? `<div style="font-size:0.72rem;color:var(--navy-700);font-weight:600">🏠 ${thread.dormName}</div>` : ''}
            <div style="font-size:0.78rem;color:var(--slate-500);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:340px">${lastMsg.body.substring(0,90)}${lastMsg.body.length>90?'…':''}</div>
          </div>
          <div style="font-size:0.7rem;color:var(--slate-400);flex-shrink:0">${new Date(lastMsg.sent_at).toLocaleDateString()}</div>
          <svg id="chevron_${threadKey}" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--slate-400)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;transition:transform 0.2s"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div id="${threadKey}" style="display:none">
          <div style="padding:12px 16px;max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:8px">
            ${thread.messages.map(m => {
              const isSent = m.sender_id === ownerId;
              return `<div style="display:flex;flex-direction:column;align-items:${isSent?'flex-end':'flex-start'}">
                <div style="max-width:80%;padding:9px 13px;border-radius:${isSent?'14px 14px 4px 14px':'14px 14px 14px 4px'};background:${isSent?'var(--navy-700)':'var(--slate-100)'};color:${isSent?'white':'var(--slate-800)'};font-size:0.85rem;line-height:1.5;white-space:pre-wrap">${m.body}</div>
                <div style="font-size:0.68rem;color:var(--slate-400);margin-top:3px">${isSent?'You':m.sender_name} · ${new Date(m.sent_at).toLocaleString()}</div>
              </div>`;
            }).join('')}
          </div>
          <div style="padding:10px 14px;border-top:1px solid var(--border);display:flex;gap:8px;align-items:flex-end">
            <textarea id="reply_${thread.dormId}_${thread.otherId}" rows="2" class="form-control" placeholder="Type your reply…" style="resize:none;flex:1;font-size:0.85rem"></textarea>
            <button class="btn btn-primary btn-sm" onclick="sendOwnerReply(${thread.dormId},${thread.otherId})" style="flex-shrink:0;padding:9px 16px">Send</button>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  function toggleThread(key) {
    const el = document.getElementById(key);
    const chevron = document.getElementById(`chevron_${key}`);
    if (!el) return;
    const open = el.style.display !== 'none';
    el.style.display = open ? 'none' : 'block';
    if (chevron) chevron.style.transform = open ? '' : 'rotate(180deg)';
    if (!open) {
      const msgDiv = el.querySelector('div[style*="overflow-y"]');
      if (msgDiv) setTimeout(() => { msgDiv.scrollTop = msgDiv.scrollHeight; }, 50);
    }
  }

  async function sendOwnerReply(dormId, studentId) {
    const textarea = document.getElementById(`reply_${dormId}_${studentId}`);
    if (!textarea) return;
    const body = textarea.value.trim();
    if (!body) { showToast('Please type a reply before sending.', 'error'); return; }
    const btn = textarea.nextElementSibling;
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    try {
      const res  = await fetch(`${API}/api/messages`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ sender_id: ownerId, receiver_id: studentId, dorm_id: dormId, body }),
      });
      const data = await res.json();
      if (!data.ok) { showToast(data.message || 'Could not send reply.', 'error'); return; }
      textarea.value = '';
      showToast('Reply sent!', 'success');
      await fetchOwnerMessages();
      setTimeout(() => {
        const key = `thread_${dormId}_${studentId}`;
        const el  = document.getElementById(key);
        if (el && el.style.display === 'none') toggleThread(key);
      }, 100);
    } catch(e) {
      showToast('Could not reach server.', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Send'; }
    }
  }
  async function fetchListings() {
    if (!ownerId) { renderListings(); return; }
    try {
      const res  = await fetch(`${API}/api/listings?owner_id=${ownerId}`);
      const data = await res.json();
      if (data.ok) {
        ownerListings = data.listings.map(d => ({
          id:          d.dorm_id,
          name:        d.name,
          type:        d.dorm_type,
          price:       d.price_per_month,
          location:    d.location || '',
          total:       d.total_slots,
          available:   d.available_slots,
          description: d.description || '',
          houseRules:  d.house_rules || '',
          amenities:   d.amenities || [],
          photos:      (d.photos || []).map(p => p.data),
          img:         d.cover_img || null,
          rating:      4.0,
          owner:       ownerName,
          distance:    d.distance_km ? `${d.distance_km} km from school` : 'N/A',
        }));
        renderListings();
      }
    } catch(err) {
      console.warn('Server offline, using localStorage fallback.');
      loadLocalListings();
    }
  }

  function loadLocalListings() {
    const LISTINGS_KEY = 'df_custom_listings';
    let base = dormListings.filter(d => d.owner === ownerName).map(d => ({...d}));
    try {
      const raw = localStorage.getItem(LISTINGS_KEY);
      if (raw) {
        const custom = JSON.parse(raw);
        custom.forEach(saved => {
          const idx = base.findIndex(d => d.id === saved.id);
          if (idx >= 0) base[idx] = { ...base[idx], ...saved };
          else if (saved.owner === ownerName || saved.id > 6) base.push(saved);
        });
      }
    } catch(e) {}
    if (base.length < 1) {
      base.push({...dormListings[0], id: Date.now()-2, owner: ownerName});
      base.push({...dormListings[1], id: Date.now()-1, owner: ownerName});
    }
    ownerListings = base;
    renderListings();
  }

  function renderListings() {
    document.getElementById('stat-listings').textContent = ownerListings.length;
    document.getElementById('stat-rooms').textContent    = ownerListings.reduce((s,d)=>s+(d.total||0),0);
    document.getElementById('listings-tbody').innerHTML = ownerListings.map(d=>{
      const pct = d.total ? Math.round((d.available/d.total)*100) : 0;
      const c   = dormColor(d.id);
      return `<tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="prop-thumb" style="background:${c.bg};color:${c.fg};overflow:hidden">
              ${d.img && (d.img.startsWith('data:image') || d.img.startsWith('http'))
                ? `<img src="${d.img}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit" alt="${d.name}"/>`
                : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${c.fg}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
              }
            </div>
            <div>
              <div style="font-weight:700;font-size:0.875rem;color:var(--slate-900)">${d.name}</div>
              <div style="font-size:0.75rem;color:var(--slate-500)">${d.location||''}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-primary">${d.type}</span></td>
        <td><strong style="color:var(--blue-800)">${formatPeso(d.price)}</strong><div style="font-size:0.72rem;color:var(--slate-400)">/month</div></td>
        <td style="min-width:120px">
          <div style="font-size:0.78rem;color:var(--slate-600)">${d.available} / ${d.total} rooms</div>
          <div class="avail-bar"><div class="avail-bar-fill" style="width:${pct}%"></div></div>
        </td>
        <td><span class="badge badge-success">Active</span></td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn btn-sm btn-ghost" onclick="editListing(${d.id})">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="removeListing(${d.id})">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  function renderBookings() {
    const pending = bookings.filter(b=>b.status==='Pending').length;
    document.getElementById('stat-pending').textContent  = pending;
    document.getElementById('stat-approved').textContent = bookings.filter(b=>b.status==='Approved').length;
    document.getElementById('pending-badge').textContent = pending;
    const bm={Pending:'badge-warning',Approved:'badge-success',Rejected:'badge-danger'};
    document.getElementById('bookings-tbody').innerHTML = bookings.map(b=>`
      <tr>
        <td class="req-name">${b.student}</td>
        <td class="req-sub">${b.property}</td>
        <td style="font-size:0.875rem">${b.room}</td>
        <td style="font-size:0.82rem;color:var(--slate-500)">${b.movein}</td>
        <td><strong style="color:var(--blue-800)">${formatPeso(b.price)}</strong></td>
        <td><span class="badge ${bm[b.status]}">${b.status}</span></td>
        <td>${b.status==='Pending'?`
          <div style="display:flex;gap:5px">
            <button class="btn btn-sm btn-success" onclick="updateBooking(${b.id},'Approved')">Approve</button>
            <button class="btn btn-sm btn-danger"  onclick="updateBooking(${b.id},'Rejected')">Reject</button>
          </div>`:`<span style="font-size:0.78rem;color:var(--slate-400)">—</span>`}
        </td>
      </tr>`).join('');
  }

  function updateBooking(id,status){
    const b=bookings.find(x=>x.id===id);
    if(b){b.status=status;renderBookings();showToast(`Booking ${status.toLowerCase()}.`,status==='Approved'?'success':'info');}
  }

  // ── Photo upload state ───────────────────────────────────
  let uploadedPhotos = []; // [{ dataUrl, name }]

  function handlePhotoSelect(input) {
    const files = Array.from(input.files || []);
    const slots = 5 - uploadedPhotos.length;
    if (!files.length) return;
    if (slots <= 0) { showToast('Maximum 5 photos allowed.', 'error'); return; }
    files.slice(0, slots).forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        showToast(`"${file.name}" is over 5 MB and was skipped.`, 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = e => {
        uploadedPhotos.push({ dataUrl: e.target.result, name: file.name });
        renderPhotoPreview();
      };
      reader.readAsDataURL(file);
    });
    if (files.length > slots) showToast(`Only the first ${slots} photo(s) were added (max 5).`, 'info');
    input.value = '';
  }

  function renderPhotoPreview() {
    const row  = document.getElementById('photo-preview-row');
    const hint = document.getElementById('photo-drop-hint');
    row.innerHTML = uploadedPhotos.map((p, i) => `
      <div class="photo-thumb">
        <img src="${p.dataUrl}" alt="${p.name}"/>
        <button class="photo-thumb-remove" onclick="removePhoto(${i})" title="Remove photo">✕</button>
        ${i === 0 ? '<div class="photo-thumb-cover-badge">Cover</div>' : ''}
      </div>`).join('');
    if (hint) hint.textContent = uploadedPhotos.length === 0
      ? 'Click to upload photos'
      : `${uploadedPhotos.length}/5 photo${uploadedPhotos.length > 1 ? 's' : ''} — click to add more`;
  }

  function removePhoto(index) {
    uploadedPhotos.splice(index, 1);
    renderPhotoPreview();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const zone = document.getElementById('photo-drop-zone');
    if (!zone) return;
    zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      if (e.dataTransfer?.files?.length) handlePhotoSelect({ files: e.dataTransfer.files, value: '' });
    });
  });

  // ── Add listing → POST to DB ─────────────────────────────
  async function addListing() {
    const name     = document.getElementById('new-name').value.trim();
    const location = document.getElementById('new-location').value.trim();
    if (!name || !location) { showToast('Please fill in required fields.', 'error'); return; }

    const payload = {
      owner_id:    ownerId,
      name,
      type:        document.getElementById('new-type').value,
      price:       parseInt(document.getElementById('new-price').value) || 3000,
      location,
      total:       parseInt(document.getElementById('new-total').value) || 5,
      available:   parseInt(document.getElementById('new-avail').value) || 3,
      description: document.getElementById('new-desc').value.trim(),
      houseRules:  document.getElementById('new-rules').value.trim() || 'No specific rules.',
      amenities:   [...document.querySelectorAll('#add-modal .amenity-check input:checked')].map(c => c.value),
      photos:      uploadedPhotos.map(p => p.dataUrl),
    };

    const btn = document.querySelector('#add-modal .btn-primary');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }

    // If no server ownerId, go straight to local save
    if (!ownerId) {
      addListingLocal(payload);
      if (btn) { btn.disabled = false; btn.textContent = 'Add Listing'; }
      return;
    }

    try {
      const res  = await fetch(`${API}/api/listings`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) { showToast(data.message, 'error'); return; }

      showToast(`Listing saved to database! (${uploadedPhotos.length} photo${uploadedPhotos.length !== 1 ? 's' : ''} uploaded)`, 'success');
      closeModal('add-modal');
      resetAddForm();
      fetchListings();
    } catch(err) {
      console.warn('Server offline, saving to localStorage.');
      addListingLocal(payload);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Add Listing'; }
    }
  }

  function addListingLocal(payload) {
    const LISTINGS_KEY = 'df_custom_listings';
    const newListing = {
      id:          Date.now(),
      name:        payload.name,
      type:        payload.type,
      price:       payload.price,
      location:    payload.location,
      total:       payload.total,
      available:   payload.available,
      description: payload.description,
      houseRules:  payload.houseRules,
      amenities:   payload.amenities,
      photos:      payload.photos,
      img:         payload.photos[0] || null,
      rating:      4.0,
      owner:       ownerName,
      distance:    'N/A',
    };
    ownerListings.push(newListing);
    const existing = JSON.parse(localStorage.getItem(LISTINGS_KEY) || '[]');
    localStorage.setItem(LISTINGS_KEY, JSON.stringify([...existing.filter(d => d.owner !== ownerName), ...ownerListings]));
    renderListings();
    closeModal('add-modal');
    resetAddForm();
    showToast('Listing saved locally (server offline).', 'info');
  }

  function resetAddForm() {
    document.querySelectorAll('#add-modal input[type="text"], #add-modal input[type="number"], #add-modal textarea').forEach(el => el.value = '');
    document.querySelectorAll('#add-modal input[type="checkbox"]').forEach(c => c.checked = false);
    uploadedPhotos = [];
    renderPhotoPreview();
  }

  // ── Edit listing ─────────────────────────────────────────
  // ── Edit photo state ─────────────────────────────────────
  let editPhotos = []; // new photos to upload

  function handleEditPhotoSelect(input) {
    const files = Array.from(input.files || []);
    const slots = 5 - editPhotos.length;
    if (!files.length) return;
    if (slots <= 0) { showToast('Maximum 5 photos allowed.', 'error'); return; }
    files.slice(0, slots).forEach(file => {
      if (file.size > 5 * 1024 * 1024) { showToast(`"${file.name}" is over 5 MB, skipped.`, 'error'); return; }
      const reader = new FileReader();
      reader.onload = e => {
        editPhotos.push(e.target.result);
        renderEditPhotoPreview();
      };
      reader.readAsDataURL(file);
    });
    input.value = '';
  }

  function renderEditPhotoPreview() {
    const row  = document.getElementById('edit-photo-preview');
    const hint = document.getElementById('edit-photo-hint');
    row.innerHTML = editPhotos.map((p, i) => `
      <div class="photo-thumb">
        <img src="${p}" alt="New photo"/>
        <button class="photo-thumb-remove" onclick="removeEditPhoto(${i})">✕</button>
        ${i === 0 ? '<div class="photo-thumb-cover-badge">Cover</div>' : ''}
      </div>`).join('');
    if (hint) hint.textContent = editPhotos.length === 0
      ? 'Click to upload new photos (up to 5)'
      : `${editPhotos.length}/5 new photo${editPhotos.length > 1 ? 's' : ''} — click to add more`;
  }

  function removeEditPhoto(i) { editPhotos.splice(i, 1); renderEditPhotoPreview(); }

  function editListing(id) {
    const d = ownerListings.find(x => x.id === id); if (!d) return;
    document.getElementById('edit-id').value    = id;
    document.getElementById('edit-name').value  = d.name;
    document.getElementById('edit-price').value = d.price;
    document.getElementById('edit-avail').value = d.available;
    document.getElementById('edit-desc').value  = d.description || '';

    // Show current photos
    editPhotos = [];
    renderEditPhotoPreview();
    const currentEl = document.getElementById('edit-photo-current');
    if (currentEl) {
      const existing = d.photos && d.photos.length ? d.photos : (d.img ? [d.img] : []);
      if (existing.length) {
        currentEl.innerHTML = `<div style="font-size:0.75rem;font-weight:600;color:var(--slate-500);width:100%;margin-bottom:4px">Current photos:</div>` +
          existing.map((p, i) => `
            <div class="photo-thumb">
              ${p.startsWith('data:image') ? `<img src="${p}" alt="Photo"/>` : `<div style="width:100%;height:100%;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-size:0.6rem;color:var(--slate-500)">SVG</div>`}
              ${i === 0 ? '<div class="photo-thumb-cover-badge">Cover</div>' : ''}
            </div>`).join('');
      } else {
        currentEl.innerHTML = '<div style="font-size:0.75rem;color:var(--slate-400)">No current photos.</div>';
      }
    }
    openModal('edit-modal');
  }

  async function saveEdit() {
    const id = parseInt(document.getElementById('edit-id').value);
    const d  = ownerListings.find(x => x.id === id); if (!d) return;
    const payload = {
      name:        document.getElementById('edit-name').value.trim()           || d.name,
      price:       parseInt(document.getElementById('edit-price').value)       || d.price,
      available:   parseInt(document.getElementById('edit-avail').value)       || d.available,
      description: document.getElementById('edit-desc').value.trim(),
    };
    // Only include photos if new ones were selected
    if (editPhotos.length > 0) payload.photos = editPhotos;

    const btn = document.querySelector('#edit-modal .btn-primary');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }

    try {
      const res  = await fetch(`${API}/api/listings/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) { showToast(data.message, 'error'); return; }
      showToast('Listing updated successfully!', 'success');
    } catch(err) {
      Object.assign(d, payload);
      if (editPhotos.length > 0) { d.photos = editPhotos; d.img = editPhotos[0]; }
      const LISTINGS_KEY = 'df_custom_listings';
      const existing = JSON.parse(localStorage.getItem(LISTINGS_KEY) || '[]');
      const idx = existing.findIndex(x => x.id === id);
      if (idx >= 0) existing[idx] = { ...existing[idx], ...d };
      localStorage.setItem(LISTINGS_KEY, JSON.stringify(existing));
      showToast('Listing updated locally (server offline).', 'info');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Save Changes'; }
    }
    editPhotos = [];
    renderEditPhotoPreview();
    closeModal('edit-modal');
    fetchListings();
  }

  // ── Remove listing ───────────────────────────────────────
  async function removeListing(id) {
    if (!confirm('Remove this listing? This cannot be undone.')) return;
    try {
      const res  = await fetch(`${API}/api/listings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.ok) { showToast(data.message, 'error'); return; }
      showToast('Listing removed from database.', 'info');
    } catch(err) {
      // Fallback: remove from localStorage
      ownerListings = ownerListings.filter(x => x.id !== id);
      const LISTINGS_KEY = 'df_custom_listings';
      const existing = JSON.parse(localStorage.getItem(LISTINGS_KEY) || '[]');
      localStorage.setItem(LISTINGS_KEY, JSON.stringify(existing.filter(x => x.id !== id)));
      showToast('Listing removed locally (server offline).', 'info');
    }
    fetchListings();
  }

  function goHome(e) {
    e.preventDefault();
    window.location.href = '/index.html';
  }

  function logout(){
    localStorage.removeItem('df_role');
    localStorage.removeItem('df_user');
    window.location.href='/index.html';
  }

  fetchListings();
  fetchOwnerBookings();
  fetchOwnerMessages(); // load messages on init for unread badge
