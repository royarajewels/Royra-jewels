(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const toast = (m, t='success') => window.showAdminToast ? window.showAdminToast(m, t) : alert(m);

  async function currentUser() {
    try { return await window.RoyraDB.getCurrentUser(); } catch { return null; }
  }

  function mediaCard(m) {
    return `<div class="cms-media-card" data-media-id="${esc(m.id)}">
      <div class="cms-media-thumb"><img src="${esc(m.public_url || '')}" alt="${esc(m.alt_text || m.file_name || '')}"></div>
      <div class="cms-media-meta"><strong>${esc(m.file_name || 'Untitled')}</strong><span>${esc(m.media_type || 'general')}</span></div>
      <div class="cms-row-actions">
        <button class="btn-action" type="button" data-copy="${esc(m.public_url || '')}"><i data-lucide="copy"></i> Copy URL</button>
        <button class="btn-action danger" type="button" data-delete-media="${esc(m.id)}"><i data-lucide="trash-2"></i> Delete</button>
      </div>
    </div>`;
  }

  window.initMediaLibrary = async function () {
    const refreshIcons = () => { if (window.refreshLucideIcons) window.refreshLucideIcons(); };
    const grid = $('media-grid');
    const search = $('media-search');
    const type = $('media-type');
    const picker = $('media-upload');
    if (!grid) return;

    async function load() {
      grid.innerHTML = '<div class="cms-empty">Loading media…</div>';
      const rows = await window.RoyraDB.getMedia({ search: search?.value || '', mediaType: type?.value || 'all' });
      grid.innerHTML = rows.length ? rows.map(mediaCard).join('') : '<div class="cms-empty">No media found.</div>';
      refreshIcons(); grid.querySelectorAll('[data-copy]').forEach(btn => btn.onclick = async () => {
        await navigator.clipboard.writeText(btn.dataset.copy); toast('Image URL copied.');
      });
      grid.querySelectorAll('[data-delete-media]').forEach(btn => btn.onclick = async () => {
        if (!confirm('Delete this media item?')) return;
        const r = await window.RoyraDB.deleteMedia(btn.dataset.deleteMedia);
        if (!r.success) toast(r.error || 'Unable to delete media.', 'error'); else { toast('Media deleted.'); load(); }
      });
    }

    search?.addEventListener('input', load);
    type?.addEventListener('change', load);
    picker?.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      for (const file of files) {
        const r = await window.RoyraDB.uploadMedia(file, type?.value || 'general');
        if (!r.success) toast(`${file.name}: ${r.error}`, 'error');
      }
      e.target.value = '';
      toast('Upload complete.');
      load();
    });

    await load();
  };

  window.initBannerManager = async function () {
    const tbody = $('banners-tbody');
    const form = $('banner-form');
    const editId = $('banner-id');
    const status = $('banner-status');
    const listImage = $('banner-desktop-preview');
    if (!tbody || !form) return;

    let banners = [];
    let media = [];

    async function loadMediaPicker() {
      media = await window.RoyraDB.getMedia({ mediaType: 'banner' });
      const sel = $('banner-media-select');
      if (sel) sel.innerHTML = '<option value="">Select existing image…</option>' + media.map(m => `<option value="${esc(m.public_url)}">${esc(m.file_name)}</option>`).join('');
    }

    async function load() {
      banners = await window.RoyraDB.getBanners({ includeInactive: true });
      tbody.innerHTML = banners.length ? banners.map(b => `<tr>
        <td>${b.desktop_image_url ? `<img class="cms-table-img" src="${esc(b.desktop_image_url)}" alt="Banner thumbnail">` : '—'}</td>
        <td><strong>${esc(b.internal_name || b.name || b.title || 'Untitled Banner')}</strong><div class="cms-muted">${esc(b.title || '')}</div></td>
        <td><span class="status-badge ${String(b.status).toLowerCase() === 'published' || String(b.status).toLowerCase() === 'active' ? 'active' : 'draft'}">${esc(b.status || 'published')}</span></td>
        <td>${b.display_order ?? 0}</td>
        <td><div class="action-buttons-group"><button class="btn-action edit" type="button" data-edit-banner="${b.id}"><i data-lucide="edit-2"></i> Edit</button><button class="btn-action danger" type="button" data-delete-banner="${b.id}"><i data-lucide="trash-2"></i> Delete</button></div></td>
      </tr>`).join('') : '<tr><td colspan="5" class="cms-empty">No banners yet.</td></tr>';
      if (window.refreshLucideIcons) window.refreshLucideIcons();
      tbody.querySelectorAll('[data-edit-banner]').forEach(b => b.onclick = () => fill(banners.find(x => String(x.id) === String(b.dataset.editBanner))));
      tbody.querySelectorAll('[data-delete-banner]').forEach(b => b.onclick = async () => {
        if (!confirm('Delete banner?')) return;
        const r = await window.RoyraDB.deleteBanner(b.dataset.deleteBanner);
        if (!r.success) toast(r.error, 'error');
        else { toast('Banner deleted.'); load(); }
      });
    }

    function fill(b) {
      editId.value = b?.id || '';
      $('banner-name').value = b?.internal_name || b?.name || '';
      $('banner-title').value = b?.title || '';
      $('banner-subtitle').value = b?.subtitle || '';
      $('banner-description').value = b?.description || '';
      $('banner-desktop-url').value = b?.desktop_image_url || '';
      $('banner-mobile-url').value = b?.mobile_image_url || '';
      $('banner-button-text').value = b?.button_text || 'SHOP NOW →';
      $('banner-button-link').value = b?.button_link || 'shop.html';
      
      const st = b?.status || 'published';
      if (status) {
        let found = false;
        for (let i = 0; i < status.options.length; i++) {
          if (status.options[i].value.toLowerCase() === st.toLowerCase()) {
            status.selectedIndex = i;
            found = true;
            break;
          }
        }
        if (!found) status.value = st;
      }

      $('banner-order').value = b?.display_order ?? 1;
      listImage.src = b?.desktop_image_url || '';
      listImage.style.display = b?.desktop_image_url ? 'block' : 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    $('banner-clear')?.addEventListener('click', () => fill(null));
    $('banner-desktop-url')?.addEventListener('input', e => {
      const url = e.target.value.trim();
      listImage.src = url;
      listImage.style.display = url ? 'block' : 'none';
    });
    $('banner-upload-desktop')?.addEventListener('change', async e => {
      const f = e.target.files?.[0];
      if (!f) return;
      const r = await window.RoyraDB.uploadMedia(f, 'banner');
      if (!r.success) return toast(r.error, 'error');
      $('banner-desktop-url').value = r.url;
      listImage.src = r.url;
      listImage.style.display = 'block';
      toast('Desktop banner uploaded.');
    });
    $('banner-upload-mobile')?.addEventListener('change', async e => {
      const f = e.target.files?.[0];
      if (!f) return;
      const r = await window.RoyraDB.uploadMedia(f, 'banner');
      if (!r.success) return toast(r.error, 'error');
      $('banner-mobile-url').value = r.url;
      toast('Mobile banner uploaded.');
    });
    $('banner-media-select')?.addEventListener('change', e => {
      if (e.target.value) {
        $('banner-desktop-url').value = e.target.value;
        listImage.src = e.target.value;
        listImage.style.display = 'block';
      }
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const internalName = $('banner-name').value.trim();
      const titleVal = $('banner-title').value.trim();
      const statusVal = status.value;
      const isAct = statusVal.toLowerCase() === 'published' || statusVal.toLowerCase() === 'active';
      const payload = {
        id: editId.value || null,
        internal_name: internalName,
        name: internalName,
        title: titleVal,
        subtitle: $('banner-subtitle').value.trim(),
        description: $('banner-description').value.trim(),
        desktop_image_url: $('banner-desktop-url').value.trim(),
        mobile_image_url: $('banner-mobile-url').value.trim(),
        button_text: $('banner-button-text').value.trim(),
        button_link: $('banner-button-link').value.trim(),
        status: statusVal,
        is_active: isAct,
        display_order: Number($('banner-order').value || 1)
      };
      const r = await window.RoyraDB.saveBanner(payload, Boolean(payload.id));
      if (!r.success) return toast(r.error || 'Unable to save banner.', 'error');
      toast('Banner saved.');
      fill(null);
      await load();
    });

    await loadMediaPicker();
    await load();
  };

  window.initCollectionManager = async function () {
    const tbody = $('collections-tbody');
    const form = $('collection-form');
    if (!tbody || !form) return;
    let collections = [];
    let products = [];

    async function load() {
      collections = await window.RoyraDB.getCollections({ includeInactive: true });
      tbody.innerHTML = collections.length ? collections.map(c => `<tr>
        <td>${c.image_url ? `<img class="cms-table-img" src="${esc(c.image_url)}">` : '—'}</td>
        <td><strong>${esc(c.name)}</strong><div class="cms-muted">${esc(c.slug)}</div></td><td>${esc(c.status)}</td><td>${c.featured ? 'Yes' : 'No'}</td><td>${c.product_count || 0}</td>
        <td><div class="action-buttons-group"><button class="btn-action edit" data-edit-collection="${c.id}"><i data-lucide="edit-2"></i> Edit</button><button class="btn-action danger" data-delete-collection="${c.id}"><i data-lucide="trash-2"></i> Delete</button></div></td>
      </tr>`).join('') : '<tr><td colspan="6" class="cms-empty">No collections yet.</td></tr>';
      if (window.refreshLucideIcons) window.refreshLucideIcons(); tbody.querySelectorAll('[data-edit-collection]').forEach(b => b.onclick = () => fill(collections.find(x => String(x.id)===String(b.dataset.editCollection))));
      tbody.querySelectorAll('[data-delete-collection]').forEach(b => b.onclick = async () => { if(!confirm('Delete collection?')) return; const r=await window.RoyraDB.deleteCollection(b.dataset.deleteCollection); if(!r.success) toast(r.error,'error'); else {toast('Collection deleted.');load();} });
    }

    async function loadProducts(selected=[]) {
      products = await window.RoyraDB.getProducts({ sort:'newest' });
      const wrap = $('collection-products');
      if (!wrap) return;
      wrap.innerHTML = products.map(p => `<label class="cms-check-row"><input type="checkbox" value="${p.id}" ${selected.map(String).includes(String(p.id))?'checked':''}> <span>${esc(p.name)}</span><small>${esc(p.sku || '')}</small></label>`).join('');
    }

    async function fill(c) {
      $('collection-id').value = c?.id || '';
      $('collection-name').value = c?.name || '';
      $('collection-slug').value = c?.slug || '';
      $('collection-description').value = c?.description || '';
      $('collection-short-description').value = c?.short_description || '';
      $('collection-image-url').value = c?.collection_image_url || '';
      $('collection-banner-url').value = c?.banner_image_url || '';
      $('collection-status').value = c?.status || 'Active';
      $('collection-order').value = c?.display_order ?? 1;
      $('collection-featured').checked = !!c?.featured;
      const selected = c?.product_ids || [];
      await loadProducts(selected);
      window.scrollTo({top:0,behavior:'smooth'});
    }

    function clearForm() { fill(null); }
    $('collection-clear')?.addEventListener('click', clearForm);
    $('collection-upload-image')?.addEventListener('change', async e => { const f=e.target.files?.[0]; if(!f) return; const r=await window.RoyraDB.uploadMedia(f,'collection'); if(!r.success) return toast(r.error,'error'); $('collection-image-url').value=r.url; toast('Collection image uploaded.'); });
    $('collection-upload-banner')?.addEventListener('change', async e => { const f=e.target.files?.[0]; if(!f) return; const r=await window.RoyraDB.uploadMedia(f,'collection'); if(!r.success) return toast(r.error,'error'); $('collection-banner-url').value=r.url; toast('Collection banner uploaded.'); });

    $('collection-name')?.addEventListener('input', e => { if(!$('collection-slug').value || $('collection-slug').dataset.auto === '1'){ $('collection-slug').value=e.target.value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); $('collection-slug').dataset.auto='1'; }});
    $('collection-slug')?.addEventListener('input', () => $('collection-slug').dataset.auto='0');

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const selected = Array.from(document.querySelectorAll('#collection-products input:checked')).map(x => Number(x.value));
      const payload = { id:$('collection-id').value || null, name:$('collection-name').value.trim(), slug:$('collection-slug').value.trim(), description:$('collection-description').value.trim(), short_description:$('collection-short-description').value.trim(), collection_image_url:$('collection-image-url').value.trim(), banner_image_url:$('collection-banner-url').value.trim(), status:$('collection-status').value, display_order:Number($('collection-order').value||1), featured:$('collection-featured').checked, product_ids:selected };
      const r=await window.RoyraDB.saveCollection(payload, Boolean(payload.id));
      if(!r.success) return toast(r.error||'Unable to save collection.','error');
      toast('Collection saved.'); clearForm(); load();
    });

    $('collection-reset')?.addEventListener('click', clearForm);
    await loadProducts();
    await load();
  };

  window.initSiteSettings = async function () {
    const form = $('site-settings-form');
    if (!form) return;
    const keys = ['announcement_text','announcement_subtext','contact_email','contact_phone','whatsapp_number','instagram_url','facebook_url','footer_copyright'];
    const fields = Object.fromEntries(keys.map(k => [k, $(k)]));
    const rows = await window.RoyraDB.getSiteSettings(keys);
    keys.forEach(k => { if(fields[k]) fields[k].value = rows[k] || ''; });
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const payload = {};
      keys.forEach(k => payload[k] = fields[k]?.value || '');
      const r = await window.RoyraDB.saveSiteSettings(payload);
      toast(r.success ? 'Settings saved.' : (r.error || 'Unable to save settings.'), r.success ? 'success' : 'error');
    });
  };
})();
