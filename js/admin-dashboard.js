
  const API = 'http://localhost:3000';
  let _allUsers    = [];
  let _allListings = [];

  // ── Init user display ───────────────────────────────────
  (function() {
    const u   = JSON.parse(localStorage.getItem('df_user') || '{}');
    const ini = u.initials || (u.name ? u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : 'AD');
    const nm  = u.name || 'Admin User';
    document.getElementById('nav-avatar').textContent = ini;
    document.getElementById('nav-name').textContent   = nm;
    document.getElementById('profile-av').textContent = ini;
    document.getElementById('profile-nm').textContent = nm;
  })();

  // ── Tab switching ───────────────────────────────────────
  const TABS = ['overview', 'users', 'listings'];

  function switchTab(name) {
    TABS.forEach(t => {
      document.getElementById(`panel-${t}`).classList.toggle('active', t === name);
      document.getElementById(`sl-${t}`).classList.toggle('active', t === name);
    });
    if (name === 'users')    renderUsers();
    if (name === 'listings') renderListings();
  }

  // ── Fetch all data ──────────────────────────────────────
  async function fetchAll() {
    try {
      const [ur, lr] = await Promise.all([
        fetch(`${API}/api/users`),
        fetch(`${API}/api/listings`)
      ]);
      const ud = await ur.json();
      const ld = await lr.json();
      if (ud.ok) _allUsers    = ud.users;
      if (ld.ok) _allListings = ld.listings;
    } catch(e) {
      showToast('Server offline — data unavailable.', 'error', 3000);
    }
    renderStats();
    renderOverview();
  }

  // ── Stats ───────────────────────────────────────────────
  function renderStats() {
    const students = _allUsers.filter(u => u.role === 'student').length;
    const owners   = _allUsers.filter(u => u.role === 'owner').length;
    document.getElementById('stat-renters').textContent  = _allUsers.length  ? students          : '—';
    document.getElementById('stat-owners').textContent   = _allUsers.length  ? owners             : '—';
    document.getElementById('stat-listings').textContent = _allListings.length ? _allListings.length : '—';
    document.getElementById('stat-users').textContent    = _allUsers.length  ? _allUsers.length   : '—';
  }

  // ── Overview ────────────────────────────────────────────
  function renderOverview() {
    const recentUsers = [..._allUsers].slice(0, 5);
    document.getElementById('recent-users-tbody').innerHTML = recentUsers.length
      ? recentUsers.map(u => `
          <tr>
            <td style="color:var(--slate-400);font-size:0.8rem">${u.user_id}</td>
            <td style="font-weight:600;color:var(--slate-800)">${u.first_name} ${u.last_name || ''}</td>
            <td style="color:var(--slate-500);font-size:0.82rem">${u.email}</td>
            <td><span class="role-badge ${u.role}">${u.role}</span></td>
            <td>
              ${u.role === 'admin'
                ? `<span class="protected-label">Protected</span>`
                : `<button class="btn-tbl-delete" onclick="deleteUser(${u.user_id},'${(u.first_name+' '+(u.last_name||'')).trim().replace(/'/g,"\\'")}')">🗑 Delete</button>`}
            </td>
          </tr>`).join('')
      : '<tr class="empty-row"><td colspan="5">No users yet.</td></tr>';

    const recentListings = [..._allListings].slice(0, 5);
    document.getElementById('recent-listings-tbody').innerHTML = recentListings.length
      ? recentListings.map(d => listingRow(d, false)).join('')
      : '<tr class="empty-row"><td colspan="6">No listings yet.</td></tr>';
  }

  // ── Users tab ───────────────────────────────────────────
  function renderUsers() {
    const q    = (document.getElementById('user-search')?.value || '').toLowerCase();
    const list = _allUsers.filter(u =>
      !q || `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(q)
    );
    document.getElementById('users-count').textContent = `(${list.length})`;
    document.getElementById('users-tbody').innerHTML = list.length
      ? list.map(u => {
          const nm      = `${u.first_name} ${u.last_name || ''}`.trim();
          const isAdmin = u.role === 'admin';
          return `
          <tr>
            <td style="color:var(--slate-400);font-size:0.8rem">${u.user_id}</td>
            <td style="font-weight:600;color:var(--slate-800)">${nm}</td>
            <td style="color:var(--slate-500);font-size:0.82rem">${u.email}</td>
            <td><span class="role-badge ${u.role}">${u.role}</span></td>
            <td style="color:var(--slate-400)">—</td>
            <td>
              ${isAdmin
                ? `<span class="protected-label">Protected</span>`
                : `<button class="btn-tbl-delete" onclick="deleteUser(${u.user_id},'${nm.replace(/'/g,"\\'")}')">🗑 Delete</button>`}
            </td>
          </tr>`;
        }).join('')
      : '<tr class="empty-row"><td colspan="6">No users found.</td></tr>';
  }

  async function deleteUser(id, name) {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      const res  = await fetch(`${API}/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        showToast(`User "${name}" deleted.`, 'success');
        _allUsers = _allUsers.filter(u => u.user_id !== id);
        renderUsers();
        renderOverview();
        renderStats();
      } else {
        showToast(data.message || 'Delete failed.', 'error');
      }
    } catch(e) {
      showToast('Server offline.', 'error');
    }
  }

  // ── Listings tab ────────────────────────────────────────
  function typeKey(d) {
    const t = (d.dorm_type || '').toLowerCase();
    return t.includes('boarding') ? 'boarding' : t.includes('apart') ? 'apartment' : 'dormitory';
  }

  function listingRow(d, showAddress) {
    const tk    = typeKey(d);
    const price = d.price_per_month ? `₱${Number(d.price_per_month).toLocaleString()}` : '—';
    const addr  = d.location || '—';
    const safeName = (d.name || '').replace(/'/g, "\\'");
    if (showAddress) {
      return `
      <tr>
        <td style="color:var(--slate-400);font-size:0.8rem">${d.dorm_id}</td>
        <td style="font-weight:600;color:var(--slate-800)">${d.name}</td>
        <td><span class="type-badge ${tk}">${(d.dorm_type || 'Dormitory').toUpperCase()}</span></td>
        <td style="color:var(--slate-600)">${d.owner_name || '—'}</td>
        <td style="color:var(--slate-400);font-size:0.8rem;max-width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${addr}</td>
        <td style="font-weight:600;color:var(--slate-800)">${price}</td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn-tbl-view"   onclick="viewListing(${d.dorm_id})">👁 View</button>
            <button class="btn-tbl-delete" onclick="deleteListing(${d.dorm_id},'${safeName}')">🗑 Delete</button>
          </div>
        </td>
      </tr>`;
    }
    return `
    <tr>
      <td style="color:var(--slate-400);font-size:0.8rem">${d.dorm_id}</td>
      <td style="font-weight:600;color:var(--slate-800)">${d.name}</td>
      <td><span class="type-badge ${tk}">${(d.dorm_type || 'Dormitory').toUpperCase()}</span></td>
      <td style="color:var(--slate-600)">${d.owner_name || '—'}</td>
      <td style="font-weight:600;color:var(--slate-800)">${price}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn-tbl-view"   onclick="viewListing(${d.dorm_id})">👁 View</button>
          <button class="btn-tbl-delete" onclick="deleteListing(${d.dorm_id},'${safeName}')">🗑 Delete</button>
        </div>
      </td>
    </tr>`;
  }

  function renderListings() {
    const q    = (document.getElementById('listing-search')?.value || '').toLowerCase();
    const list = _allListings.filter(d =>
      !q || (d.name || '').toLowerCase().includes(q) || (d.location || '').toLowerCase().includes(q)
    );
    document.getElementById('listings-count').textContent = `(${list.length})`;
    document.getElementById('listings-tbody').innerHTML = list.length
      ? list.map(d => listingRow(d, true)).join('')
      : '<tr class="empty-row"><td colspan="7">No listings found.</td></tr>';
  }

  function filterListings() { renderListings(); }

  function viewListing(id) {
    localStorage.setItem('selectedDormId', id);
    window.open('/pages/dorm-details.html', '_blank');
  }

  async function deleteListing(id, name) {
    if (!confirm(`Delete listing "${name}"? This cannot be undone.`)) return;
    try {
      const res  = await fetch(`${API}/api/listings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        showToast(`"${name}" deleted.`, 'success');
        _allListings = _allListings.filter(d => d.dorm_id !== id);
        renderListings();
        renderOverview();
        renderStats();
      } else {
        showToast(data.message || 'Delete failed.', 'error');
      }
    } catch(e) { showToast('Server offline.', 'error'); }
  }

  function logout() {
    localStorage.removeItem('df_role');
    localStorage.removeItem('df_user');
    window.location.href = '/index.html';
  }

  // ── Boot ────────────────────────────────────────────────
  fetchAll();
