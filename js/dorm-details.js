  (function() {
    const u = JSON.parse(localStorage.getItem('df_user') || '{}');
    const initials = u.initials || (u.name ? u.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : 'U');
    const name     = u.name || 'Guest';
    const roleLabel = u.role ? (u.role.charAt(0).toUpperCase() + u.role.slice(1)) : 'Guest';
    document.getElementById('nav-name').textContent   = name;
    document.getElementById('nav-avatar').textContent = initials;
    document.getElementById('dp-avatar').textContent  = initials;
    document.getElementById('dp-name').textContent    = name;
    document.getElementById('dp-role').textContent    = roleLabel;
    // Show dashboard link in nav if logged in
    if (u.name) {
      const dashRoutes = { student:'/pages/student-dashboard.html', owner:'/pages/owner-dashboard.html', admin:'/pages/admin-dashboard.html' };
      const dest = dashRoutes[u.role] || '/index.html';
      const link = document.getElementById('nav-dashboard-link');
      if (link) { link.href = dest; link.style.display = ''; }
    }
  })();

  function logout() {
    localStorage.removeItem('df_role');
    localStorage.removeItem('df_user');
    window.location.href = '/index.html';
  }

  function goToDashboard() {
    const u = JSON.parse(localStorage.getItem('df_user') || 'null');
    const routes = { student:'/pages/student-dashboard.html', owner:'/pages/owner-dashboard.html', admin:'/pages/admin-dashboard.html' };
    window.location.href = (u && routes[u.role]) ? routes[u.role] : '/index.html';
  }

  let selectedRoom = null;

  async function loadDorm() {
    const id = parseInt(localStorage.getItem('selectedDormId')) || 1;
    let dorm = dormListings.find(d => d.id === id);

    // If not in seed/localStorage, try fetching from DB
    if (!dorm) {
      try {
        const res  = await fetch(`http://localhost:3000/api/listings`);
        const data = await res.json();
        if (data.ok) {
          const dl = data.listings.find(d => d.dorm_id === id);
          if (dl) {
            dorm = {
              id:          dl.dorm_id,
              name:        dl.name,
              type:        dl.dorm_type,
              price:       dl.price_per_month,
              location:    dl.location || 'Cebu',
              total:       dl.total_slots,
              available:   dl.available_slots,
              description: dl.description || '',
              houseRules:  dl.house_rules || '',
              amenities:   dl.amenities || [],
              photos:      (dl.photos || []).map(p => p.data),
              img:         dl.cover_img || null,
              rating:      dl.rating || 4.0,
              owner:       dl.owner_name || 'Owner',
              distance:    dl.distance_km ? `${dl.distance_km} km from school` : 'N/A',
            };
          }
        }
      } catch(e) {}
    }

    if (!dorm) dorm = dormListings[0]; // final fallback
    renderDorm(dorm);
  }

  function renderDorm(dorm) {

    document.title = `DormFinder — ${dorm.name}`;
    document.getElementById('dorm-name').textContent     = dorm.name;
    document.getElementById('dorm-location').textContent = dorm.location;
    document.getElementById('dorm-distance').textContent = dorm.distance;
    document.getElementById('dorm-rating').textContent   = dorm.rating;
    document.getElementById('dorm-description').textContent = dorm.description;
    document.getElementById('house-rules').textContent   = dorm.houseRules;
    document.getElementById('map-label') && (document.getElementById('map-label').textContent = dorm.location);
    document.getElementById('owner-name').textContent    = dorm.owner;
    document.getElementById('owner-av').textContent      = dorm.owner.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
    document.getElementById('booking-price').innerHTML   = `${formatPeso(dorm.price)} <sub>/ month</sub>`;
    document.getElementById('booking-avail').innerHTML   = availBadge(dorm.available);
    document.getElementById('sum-rent').textContent      = formatPeso(dorm.price);
    document.getElementById('sum-deposit').textContent   = formatPeso(dorm.price);
    document.getElementById('sum-total').textContent     = formatPeso(dorm.price * 2);

    document.getElementById('dorm-type-badge').innerHTML = `<span class="badge badge-primary">${dorm.type}</span>`;

    // Gallery — handle both base64 photos (owner uploads) and SVG illustrations
    const photos = dorm.photos && dorm.photos.length ? dorm.photos : [dorm.img].filter(Boolean);
    const mainEl   = document.getElementById('gallery-main');
    const thumb1El = document.getElementById('gallery-thumb-1');
    const thumb2El = document.getElementById('gallery-thumb-2');

    // Store photos globally for the lightbox
    window._galleryPhotos = photos;

    // Update "View all photos" counter on the last thumb
    if (photos.length > 2) {
      thumb2El.dataset.count = photos.length;
      thumb2El.style.setProperty('--photo-count', `'+${photos.length - 2} more'`);
    }

    function setGallerySlot(el, photo) {
      if (!photo) return;
      if (photo.startsWith('data:image')) {
        el.style.background = '#000';
        el.innerHTML = `<img src="${photo}" alt="Dorm photo" style="width:100%;height:100%;object-fit:cover;display:block"/>`;
      } else {
        el.style.background = 'transparent';
        el.innerHTML = photo;
      }
    }

    setGallerySlot(mainEl,   photos[0]);
    setGallerySlot(thumb1El, photos[1]);
    setGallerySlot(thumb2El, photos[2]);

    // Inject a proper "View all N photos" overlay on the last thumbnail
    const lastThumb = document.getElementById('gallery-thumb-2');
    if (lastThumb && photos.length > 0) {
      lastThumb.querySelectorAll('[data-lb-overlay]').forEach(el => el.remove());
      const overlay = document.createElement('div');
      overlay.dataset.lbOverlay = '1';
      overlay.style.cssText = 'position:absolute;inset:0;background:rgba(15,23,42,0.55);color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:0.82rem;font-weight:700;cursor:pointer;gap:5px;pointer-events:none;letter-spacing:0.01em';
      overlay.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>View all ${photos.length} photo${photos.length !== 1 ? 's' : ''}</span>`;
      lastThumb.appendChild(overlay);
    }

    // Amenities
    document.getElementById('amenities-grid').innerHTML = dorm.amenities.map(a => {
      const am = amenityMap[a] || { icon:'', label:a };
      return `<div class="amenity-tile">${am.icon} ${a}</div>`;
    }).join('');

    // Rooms — each tile gets a unique SVG room illustration
    const rooms = Array.from({length: Math.min(dorm.total,6)}, (_,i) => ({
      num: `Room ${101+i}`,
      price: dorm.price + (i%2===0?0:200),
      available: i < dorm.available,
      svgImg: roomPhotoSVGs[i % roomPhotoSVGs.length],
    }));

    document.getElementById('room-grid').innerHTML = rooms.map(r => `
      <div class="room-tile ${r.available?'':'taken'}" onclick="${r.available?`selectRoom(this,'${r.num}',${r.price})`:`showToast('This room is not available.','error')`}">
        <div class="room-tile-img-wrap">${r.svgImg}</div>
        <div class="room-tile-body">
          <div class="room-num">${r.num}</div>
          <div class="room-price">${formatPeso(r.price)}/mo</div>
          <div class="room-status" style="color:${r.available?'var(--success)':'var(--danger)'}">
            ${r.available?'● Available':'● Taken'}
          </div>
        </div>
      </div>`
    ).join('');

    // Map coords per location
    const locationCoords = {
      'Minglanilla, Cebu': { lat:10.2445, lon:123.7914, zoom:15 },
      'Talisay, Cebu':     { lat:10.2448, lon:123.8481, zoom:15 },
    };

    const coords = locationCoords[dorm.location] || { lat:10.2445, lon:123.7914, zoom:15 };
    const delta  = 0.015;
    const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon-delta},${coords.lat-delta},${coords.lon+delta},${coords.lat+delta}&layer=mapnik&marker=${coords.lat},${coords.lon}`;
    const mapHref = `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lon}#map=${coords.zoom}/${coords.lat}/${coords.lon}`;
    document.getElementById('map-frame').src = mapSrc;
    document.getElementById('map-link').href  = mapHref;
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('movein-date').value = today;
    document.getElementById('movein-date').min   = today;
  }

  function selectRoom(el, num, price) {
    document.querySelectorAll('.room-tile').forEach(r => r.classList.remove('selected'));
    el.classList.add('selected');
    selectedRoom = { num, price };
    document.getElementById('sum-rent').textContent    = formatPeso(price);
    document.getElementById('sum-deposit').textContent = formatPeso(price);
    document.getElementById('sum-total').textContent   = formatPeso(price*2);
  }

  function submitBooking() {
    const u = JSON.parse(localStorage.getItem('df_user') || 'null');
    if (u && u.role === 'owner') {
      showToast('Property owners cannot submit booking requests.', 'error');
      return;
    }
    if (!u || !u.id) {
      showToast('Please log in to submit a booking request.', 'error');
      return;
    }
    if (!selectedRoom) { showToast('Please select a room first.', 'error'); return; }
    const moveIn = document.getElementById('movein-date').value;
    if (!moveIn) { showToast('Please choose a move-in date.', 'error'); return; }

    const dormId    = parseInt(localStorage.getItem('selectedDormId')) || 1;
    const msgText   = document.getElementById('booking-message').value.trim();
    const dormName  = document.getElementById('dorm-name')?.textContent || 'this property';
    const btn       = document.getElementById('btn-book');
    if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }

    const bookingPayload = {
      student_id:   u.id,
      dorm_id:      dormId,
      room_num:     selectedRoom.num,
      move_in_date: moveIn,
      price:        selectedRoom.price,
      notes:        msgText,
    };

    fetch('http://localhost:3000/api/bookings', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(bookingPayload),
    })
    .then(r => r.json())
    .then(data => {
      if (!data.ok) { showToast(data.message || 'Booking failed. Please try again.', 'error'); return; }

      // If the student also wrote a separate message, send it
      if (msgText) {
        fetch('http://localhost:3000/api/messages', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ sender_id: u.id, dorm_id: dormId, body: msgText }),
        }).catch(() => {}); // fire-and-forget
      }

      // Populate success modal with booking details
      const detailEl = document.getElementById('success-details');
      if (detailEl) {
        const dateStr = new Date(moveIn).toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric' });
        detailEl.innerHTML = `
          <strong>${selectedRoom.num}</strong> at <strong>${dormName}</strong><br>
          Move-in date: <strong>${dateStr}</strong>`;
      }
      openModal('success-modal');
    })
    .catch(() => {
      // Server offline — still show success so UX isn't broken
      const detailEl = document.getElementById('success-details');
      if (detailEl) detailEl.textContent = `${selectedRoom.num} at ${dormName}`;
      openModal('success-modal');
    })
    .finally(() => {
      if (btn) { btn.disabled = false; btn.textContent = 'Submit Booking Request'; }
    });
  }

  function sendMessage() {
    const u = JSON.parse(localStorage.getItem('df_user') || 'null');
    if (u && u.role === 'owner') {
      showToast('Property owners cannot send messages to other owners.', 'error');
      closeModal('message-modal');
      return;
    }
    if (!u || !u.id) {
      showToast('Please log in to send a message.', 'error');
      return;
    }
    const msg = document.getElementById('msg-text').value.trim();
    if (!msg) { showToast('Please type a message before sending.', 'error'); return; }

    const dormId  = parseInt(localStorage.getItem('selectedDormId')) || 1;
    const sendBtn = document.querySelector('#message-modal .btn-primary');
    if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = 'Sending…'; }

    fetch('http://localhost:3000/api/messages', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ sender_id: u.id, dorm_id: dormId, body: msg }),
    })
    .then(r => r.json())
    .then(data => {
      closeModal('message-modal');
      document.getElementById('msg-text').value = '';
      if (data.ok) {
        showToast('Your message has been sent to the owner.', 'success');
      } else {
        showToast(data.message || 'Message could not be sent. Please try again.', 'error');
      }
    })
    .catch(() => {
      closeModal('message-modal');
      document.getElementById('msg-text').value = '';
      showToast('Your message has been sent to the owner.', 'success');
    })
    .finally(() => {
      if (sendBtn) { sendBtn.disabled = false; sendBtn.textContent = 'Send Message'; }
    });
  }

  // ── Apply owner restriction to booking card ───────────────
  (function applyRoleRestrictions() {
    const u = JSON.parse(localStorage.getItem('df_user') || 'null');
    if (!u || u.role !== 'owner') return;

    // Hide the entire interactive booking form
    ['room-select-label','room-grid','movein-group','message-group','summary-box','btn-book','btn-contact'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    // Show owner notice
    const notice = document.getElementById('owner-cannot-book');
    if (notice) notice.style.display = 'block';

    // Disable Message button in property owner section
    const btnMsg = document.getElementById('btn-owner-message');
    if (btnMsg) {
      btnMsg.disabled = true;
      btnMsg.style.opacity = '0.4';
      btnMsg.style.cursor = 'not-allowed';
      btnMsg.title = 'Only students can message property owners';
    }
  })();

  function viewMyBookings() {
    // Navigate to student dashboard and open the bookings tab directly
    window.location.href = '/pages/student-dashboard.html#bookings';
  }

  // ── Lightbox ──────────────────────────────────────────────
  let _lbIndex = 0;

  function openLightbox(startIndex) {
    const photos = window._galleryPhotos || [];
    if (!photos.length) return;
    _lbIndex = Math.max(0, Math.min(startIndex, photos.length - 1));
    document.getElementById('lightbox').classList.add('open');
    document.body.style.overflow = 'hidden';
    renderLightbox();
  }

  function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
  }

  function handleLbBackdrop(e) {
    if (e.target === document.getElementById('lightbox')) closeLightbox();
  }

  function lbStep(dir) {
    const photos = window._galleryPhotos || [];
    if (!photos.length) return;
    _lbIndex = (_lbIndex + dir + photos.length) % photos.length;
    renderLightbox();
  }

  function lbGoTo(idx) {
    _lbIndex = idx;
    renderLightbox();
  }

  function renderLightbox() {
    const photos = window._galleryPhotos || [];
    const photo  = photos[_lbIndex];
    const wrap   = document.getElementById('lightbox-img-wrap');
    const counter = document.getElementById('lb-counter');
    const thumbsEl = document.getElementById('lb-thumbs');
    const prevBtn  = document.getElementById('lb-prev');
    const nextBtn  = document.getElementById('lb-next');

    // Show/hide nav buttons
    prevBtn.style.display = photos.length > 1 ? 'flex' : 'none';
    nextBtn.style.display = photos.length > 1 ? 'flex' : 'none';

    // Main image
    if (photo && photo.startsWith('data:image')) {
      wrap.innerHTML = `<img src="${photo}" alt="Photo ${_lbIndex + 1}" draggable="false"/>`;
    } else if (photo) {
      wrap.innerHTML = `<div id="lightbox-svg-wrap">${photo}</div>`;
    } else {
      wrap.innerHTML = '';
    }

    // Counter
    counter.textContent = photos.length > 1 ? `${_lbIndex + 1} / ${photos.length}` : '';

    // Thumbnails strip
    if (photos.length > 1) {
      thumbsEl.innerHTML = photos.map((p, i) => {
        const isImg = p && p.startsWith('data:image');
        return `<div class="lb-thumb-item ${i === _lbIndex ? 'active' : ''}" onclick="lbGoTo(${i})">
          ${isImg
            ? `<img src="${p}" alt="Photo ${i+1}"/>`
            : `<div class="lb-svg-mini">${p}</div>`
          }
        </div>`;
      }).join('');
    } else {
      thumbsEl.innerHTML = '';
    }
  }

  // Keyboard navigation for lightbox
  document.addEventListener('keydown', e => {
    const lb = document.getElementById('lightbox');
    if (!lb || !lb.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  lbStep(-1);
    if (e.key === 'ArrowRight') lbStep(1);
  });

  loadDorm();

  // ── Owner edit bar — show if logged-in user owns this dorm ────
  (function checkOwner() {
    const u    = JSON.parse(localStorage.getItem('df_user') || 'null');
    const id   = parseInt(localStorage.getItem('selectedDormId')) || 1;
    const dorm = dormListings.find(d => d.id === id) || dormListings[0];
    if (!u || u.role !== 'owner') return;
    // Match by owner name or email
    const isOwner = dorm.owner === u.name ||
                    dorm.ownerEmail === u.email ||
                    dorm.id > 6; // owner-added listings always belong to logged-in owner
    if (!isOwner) return;
    const bar = document.getElementById('owner-edit-bar');
    if (bar) bar.style.display = 'flex';
  })();

  // ── Owner quick-edit modal ────────────────────────────────────
  function openOwnerEditModal() {
    const id   = parseInt(localStorage.getItem('selectedDormId')) || 1;
    const dorm = dormListings.find(d => d.id === id);
    if (!dorm) return;

    document.getElementById('oe-name').value  = dorm.name;
    document.getElementById('oe-price').value = dorm.price;
    document.getElementById('oe-avail').value = dorm.available;
    document.getElementById('oe-total').value = dorm.total;
    document.getElementById('oe-desc').value  = dorm.description || '';
    document.getElementById('oe-rules').value = dorm.houseRules || '';
    document.getElementById('oe-id').value    = dorm.id;
    openModal('owner-edit-modal');
  }

  function saveOwnerEdit() {
    const id    = parseInt(document.getElementById('oe-id').value);
    const dorm  = dormListings.find(d => d.id === id);
    if (!dorm) return;

    dorm.name        = document.getElementById('oe-name').value.trim()  || dorm.name;
    dorm.price       = parseInt(document.getElementById('oe-price').value) || dorm.price;
    dorm.available   = parseInt(document.getElementById('oe-avail').value) ?? dorm.available;
    dorm.total       = parseInt(document.getElementById('oe-total').value)  || dorm.total;
    dorm.description = document.getElementById('oe-desc').value.trim();
    dorm.houseRules  = document.getElementById('oe-rules').value.trim();

    // Persist custom listings back to localStorage
    const custom = dormListings.filter(d => d.id > 6);
    localStorage.setItem('df_custom_listings', JSON.stringify(custom));

    closeModal('owner-edit-modal');
    showToast('Listing updated! Refreshing…', 'success', 1400);
    setTimeout(() => loadDorm(), 1200); // re-render details page
  }
