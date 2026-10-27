  // Init user
  (function() {
    const u = JSON.parse(localStorage.getItem('df_user') || '{}');
    const initials = u.initials || (u.name ? u.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : 'U');
    const name     = u.name || 'Guest';
    document.getElementById('nav-name').textContent       = name;
    document.getElementById('nav-avatar').textContent     = initials;
    document.getElementById('profile-avatar').textContent = initials;
    document.getElementById('profile-name').textContent   = name;
  })();

  let currentView = 'grid';
  let favorites   = JSON.parse(localStorage.getItem('df_favorites') || '[]');

  function setView(v) {
    currentView = v;
    document.getElementById('listings-grid').classList.toggle('list-view', v==='list');
    document.getElementById('grid-btn').classList.toggle('active', v==='grid');
    document.getElementById('list-btn').classList.toggle('active', v==='list');
  }

  function toggleFav(e, id) {
    e.stopPropagation();
    const idx = favorites.indexOf(id);
    idx === -1 ? favorites.push(id) : favorites.splice(idx,1);
    localStorage.setItem('df_favorites', JSON.stringify(favorites));
    const btn = e.currentTarget;
    btn.classList.toggle('active', favorites.includes(id));
    btn.querySelector('svg').outerHTML = favorites.includes(id) ? Icons.heartF : Icons.heart;
    showToast(favorites.includes(id) ? 'Added to favorites' : 'Removed from favorites', 'info', 1800);
  }

  function quickFilter(loc) {
    document.getElementById('search-input').value = loc;
    applyFilters();
  }
  function quickTypeFilter(type) {
    document.getElementById('filter-type-top').value = type;
    applyFilters();
  }

  function getFiltered() {
    const q       = document.getElementById('search-input').value.toLowerCase();
    const typeTop = document.getElementById('filter-type-top').value;
    const priceTop= parseInt(document.getElementById('filter-price-top').value) || 0;
    const minP    = parseInt(document.getElementById('min-price').value) || 0;
    const maxP    = parseInt(document.getElementById('max-price').value) || Infinity;
    const sortBy  = document.getElementById('sort-select').value;
    const availOnly = document.getElementById('filter-available').checked;

    const checkedTypes = [...document.querySelectorAll('.check-list input[value="Dormitory"], .check-list input[value="Boarding House"], .check-list input[value="Apartment"]')]
      .filter(c=>c.checked).map(c=>c.value);
    const checkedAmenities = [...document.querySelectorAll('.check-list input[type="checkbox"]')]
      .filter(c=>c.checked && !['Dormitory','Boarding House','Apartment'].includes(c.value)).map(c=>c.value);

    let res = dormListings.filter(d => {
      if (q && !d.name.toLowerCase().includes(q) && !d.location.toLowerCase().includes(q)) return false;
      if (typeTop && d.type !== typeTop) return false;
      if (priceTop && d.price > priceTop) return false;
      if (d.price < minP || d.price > maxP) return false;
      if (checkedTypes.length && !checkedTypes.includes(d.type)) return false;
      if (checkedAmenities.length && !checkedAmenities.every(a=>d.amenities.includes(a))) return false;
      if (availOnly && d.available === 0) return false;
      return true;
    });

    if (sortBy==='price-asc')  res.sort((a,b)=>a.price-b.price);
    if (sortBy==='price-desc') res.sort((a,b)=>b.price-a.price);
    if (sortBy==='rating')     res.sort((a,b)=>b.rating-a.rating);
    if (sortBy==='available')  res.sort((a,b)=>b.available-a.available);
    return res;
  }

  function applyFilters() { renderListings(getFiltered()); }

  function resetFilters() {
    ['search-input','min-price','max-price'].forEach(id => document.getElementById(id).value='');
    document.getElementById('filter-type-top').value='';
    document.getElementById('filter-price-top').value='';
    document.getElementById('filter-available').checked=false;
    document.querySelectorAll('.check-list input[type="checkbox"]').forEach(c=>c.checked=false);
    applyFilters();
  }

  function renderListings(list) {
    const grid = document.getElementById('listings-grid');
    document.getElementById('results-count').textContent = list.length;

    if (!list.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h3>No results found</h3>
          <p>Try adjusting your filters or search terms.</p>
        </div>`;
      return;
    }

    grid.innerHTML = list.map(d => {
      const isFav = favorites.includes(d.id);
      const col = dormColor(d.id);
      const chips = d.amenities.slice(0,3).map(a => {
        const am = amenityMap[a] || { icon:'', label: a };
        return `<span class="chip">${am.icon} ${a}</span>`;
      }).join('') + (d.amenities.length>3 ? `<span class="chip">+${d.amenities.length-3}</span>` : '');

      return `
      <div class="dorm-card" onclick="selectDorm(${d.id})">
        <div class="dorm-img" style="background:${col.bg};position:relative;overflow:hidden">
          ${d.img && d.img.startsWith('data:image')
            ? `<img src="${d.img}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" alt="${d.name}"/>`
            : d.img
              ? `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">${d.img}</div>`
              : `<div class="dorm-img-icon" style="background:${col.fg}20;color:${col.fg}"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${col.fg}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`
          }
          <span class="dorm-type-tag" style="position:absolute;top:10px;left:10px;z-index:2">${d.type}</span>
          <button class="fav-btn ${isFav?'active':''}" onclick="toggleFav(event,${d.id})" style="position:absolute;top:10px;right:10px;z-index:2">
            ${isFav ? Icons.heartF : Icons.heart}
          </button>
        </div>
        <div class="dorm-body">
          <div class="dorm-name">${d.name}</div>
          <div class="dorm-meta">
            ${Icons.pin}
            ${d.location} &middot; ${d.distance}
          </div>
          <div class="dorm-price">${formatPeso(d.price)} <sub>/ month</sub></div>
          <div class="amenity-chips">${chips}</div>
          <div class="dorm-footer">
            <div class="rating-row">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#b45309" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ${d.rating}
            </div>
            ${availBadge(d.available)}
          </div>
        </div>
      </div>`;
    }).join('');
  }

  // ── Go to correct dashboard based on role ─────────────────
  function goToDashboard() {
    const u = JSON.parse(localStorage.getItem('df_user') || 'null');
    const routes = {
      student: '/pages/student-dashboard.html',
      owner:   '/pages/owner-dashboard.html',
      admin:   '/pages/admin-dashboard.html',
    };
    window.location.href = (u && routes[u.role]) ? routes[u.role] : '/index.html';
  }

  function logout() {
    localStorage.removeItem('df_role');
    localStorage.removeItem('df_user');
    window.location.href = '/index.html';
  }

  // ── Load DB listings and merge with seed data ─────────────
  async function loadAllListings() {
    try {
      const res  = await fetch('http://localhost:3000/api/listings');
      const data = await res.json();
      if (data.ok && data.listings.length) {
        data.listings.forEach(dl => {
          // Skip seed dorms (id 1-6) that have no photos in DB — keep the seed SVG illustrations
          const isSeed = dl.dorm_id >= 1 && dl.dorm_id <= 6;
          const hasDbPhotos = dl.photos && dl.photos.length > 0;

          if (isSeed && !hasDbPhotos) return; // let app.js seed data handle these

          // Build the dorm object from DB data
          const dbDorm = {
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

          const idx = dormListings.findIndex(s => s.id === dl.dorm_id);
          if (idx >= 0) {
            // Merge: if seed has SVG photos and DB has none, keep seed photos
            if (!hasDbPhotos) {
              dbDorm.img    = dormListings[idx].img;
              dbDorm.photos = dormListings[idx].photos;
            }
            dormListings[idx] = dbDorm;
          } else {
            dormListings.push(dbDorm);
          }
        });

        // Persist DB-only listings to localStorage so dorm-details.html can find them
        const dbOnlyListings = data.listings
          .filter(dl => dl.dorm_id > 6)
          .map(dl => ({
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
          }));

        if (dbOnlyListings.length) {
          const existing = JSON.parse(localStorage.getItem('df_custom_listings') || '[]');
          dbOnlyListings.forEach(dl => {
            const i = existing.findIndex(x => x.id === dl.id);
            if (i >= 0) existing[i] = dl; else existing.push(dl);
          });
          localStorage.setItem('df_custom_listings', JSON.stringify(existing));
        }
      }
    } catch(e) {
      // Server offline — app.js mergeCustomListings already loaded localStorage fallback
    }
    applyFilters();
  }

  loadAllListings();
