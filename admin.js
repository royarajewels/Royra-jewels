/**
 * ROYRA JEWELS - Master Admin Panel Controller
 * Handles Supabase Auth session checks, PostgreSQL CRUD,
 * Supabase Storage multi-image uploads, and catalog management.
 */

(function () {
  let lucideDebounceTimer = null;
  window.refreshLucideIcons = function () {
    try {
      if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
      }
    } catch (e) {
      console.warn('Lucide icon refresh warning:', e);
    }
  };

  // Set up MutationObserver to automatically detect and render any dynamically injected data-lucide icons
  try {
    const observer = new MutationObserver((mutations) => {
      let hasNewIcons = false;
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length > 0) {
          for (const node of m.addedNodes) {
            if (node.nodeType === 1) { // ELEMENT_NODE
              if (node.hasAttribute && node.hasAttribute('data-lucide')) {
                hasNewIcons = true;
                break;
              }
              if (node.querySelector && node.querySelector('[data-lucide]')) {
                hasNewIcons = true;
                break;
              }
            }
          }
        }
        if (hasNewIcons) break;
      }
      if (hasNewIcons) {
        clearTimeout(lucideDebounceTimer);
        lucideDebounceTimer = setTimeout(() => {
          window.refreshLucideIcons();
        }, 15);
      }
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        if (document.body) observer.observe(document.body, { childList: true, subtree: true });
      });
    }
  } catch (err) {
    console.warn('MutationObserver setup:', err);
  }

  function highlightActiveAdminNav() {
    try {
      const page = window.location.pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
        const href = link.getAttribute('href') || '';
        const targetPage = href.split('/').pop();
        if (targetPage === page || (page === '' && targetPage === 'index.html')) {
          link.classList.add('active');
        }
      });
    } catch(e) {}
  }

  document.addEventListener('DOMContentLoaded', () => {
    highlightActiveAdminNav();
    window.refreshLucideIcons();
    setTimeout(window.refreshLucideIcons, 50);
    setTimeout(window.refreshLucideIcons, 300);
  });

  window.addEventListener('load', () => {
    window.refreshLucideIcons();
  });

  'use strict';

  // 1. ASYNCHRONOUS SUPABASE AUTH & ADMIN ROLE GUARD
  const isAuthExemptPage = window.location.pathname.endsWith('login.html') ||
                           window.location.pathname.endsWith('login') ||
                           window.location.pathname.endsWith('reset-password.html') ||
                           window.location.pathname.endsWith('reset-password');

  async function enforceAuth() {
    if (isAuthExemptPage) return;

    if (typeof window.RoyraDB !== 'undefined') {
      try {
        const isAuthorized = await window.RoyraDB.checkAuthAndRedirect('login.html');
        if (!isAuthorized) {
          return;
        }
      } catch (err) {
        console.error('[Admin Guard Error]:', err);
      }
    }
  }

  // Run auth check on initialization
  enforceAuth();

  // 2. TOAST NOTIFICATION HELPER
  window.showAdminToast = function (message, type = 'success') {
    let container = document.getElementById('admin-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'admin-toast-container';
      container.className = 'admin-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `admin-toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  };

  // 3. LOGOUT HANDLER (SUPABASE AUTH SIGNOUT)
  window.handleAdminLogout = async function () {
    if (confirm('Are you sure you want to log out of ROYRA JEWELS Admin?')) {
      await window.RoyraDB.logout();
      window.location.href = 'login.html';
    }
  };

  // 4. SIDEBAR MOBILE TOGGLE
  window.toggleAdminSidebar = function () {
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('admin-sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('open');
  };

  // 5. FORMAT INR CURRENCY
  window.formatINR = function (amount) {
    return '₹' + Number(amount || 0).toLocaleString('en-IN');
  };

  // Helper for image URLs inside admin directory
  function resolveAdminImageUrl(url) {
    if (!url) return '../assets/products/product-01.jpg';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    if (url.startsWith('../')) {
      return url;
    }
    if (url.startsWith('/')) {
      return '..' + url;
    }
    return '../' + url;
  }

  // 6. COPY SQL SCHEMA TO CLIPBOARD
  window.copySupabaseSQL = function () {
    const sql = window.RoyraDB.getSchemaSQL();
    navigator.clipboard.writeText(sql).then(() => {
      window.showAdminToast('Supabase SQL Schema copied to clipboard!', 'success');
    }).catch(() => {
      window.showAdminToast('Could not copy to clipboard. Please select text manually.', 'error');
    });
  };

  // ==========================================================================
  // DASHBOARD CONTROLLER (index.html)
  // ==========================================================================
  window.initAdminDashboard = async function () {
    const totalProductsEl = document.getElementById('stat-total-products');
    const activeProductsEl = document.getElementById('stat-active-products');
    const outOfStockEl = document.getElementById('stat-out-of-stock');
    const draftProductsEl = document.getElementById('stat-draft-products');
    const recentTableBody = document.getElementById('dashboard-recent-products-tbody');
    const adminUserDisplay = document.getElementById('admin-user-display-email');

    // Update current logged-in Supabase user email
    try {
      const user = await window.RoyraDB.getCurrentUser();
      if (user && adminUserDisplay) {
        adminUserDisplay.textContent = user.email || 'Admin';
      }
    } catch (e) {}

    const products = await window.RoyraDB.getProducts({ sort: 'newest' });

    // Calculate real metrics from Supabase DB
    const total = products.length;
    const active = products.filter(p => (p.status || 'Active').toLowerCase() === 'active').length;
    const outOfStock = products.filter(p => Number(p.stock) <= 0 || (p.status || '').toLowerCase() === 'out of stock').length;
    const drafts = products.filter(p => (p.status || '').toLowerCase() === 'draft').length;

    if (totalProductsEl) totalProductsEl.textContent = total;
    if (activeProductsEl) activeProductsEl.textContent = active;
    if (outOfStockEl) outOfStockEl.textContent = outOfStock;
    if (draftProductsEl) draftProductsEl.textContent = drafts;

    // Render Recent 6 Products
    if (recentTableBody) {
      const recent = products.slice(0, 6);
      if (recent.length === 0) {
        recentTableBody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; padding: 30px; color: #777;">
              No products found in the catalogue. <a href="product-form.html" style="color: var(--admin-accent); font-weight:600;">+ Add your first product</a>
            </td>
          </tr>
        `;
        return;
      }

      recentTableBody.innerHTML = recent.map(p => `
        <tr>
          <td>
            <div class="table-product-cell">
              <div class="table-product-thumb">
                <img src="${resolveAdminImageUrl(p.image)}" alt="${p.name}" />
              </div>
              <div>
                <a href="product-form.html?id=${p.id}" class="table-product-title">${p.name}</a>
                <div class="table-product-meta">${p.productType || 'Jewellery'} • ${p.collection || 'Collection'}</div>
              </div>
            </div>
          </td>
          <td><code>${p.sku || 'N/A'}</code></td>
          <td style="text-transform: capitalize;">${p.category || 'Rings'}</td>
          <td><strong>${formatINR(p.price)}</strong></td>
          <td>
            <span style="font-weight: 600; color: ${Number(p.stock) <= (p.lowStockAlert || 3) ? '#EF4444' : '#10B981'};">
              ${p.stock ?? 0} in stock
            </span>
          </td>
          <td>
            <span class="status-badge ${(p.status || 'active').toLowerCase().replace(/\s+/g, '-')}">
              ${p.status || 'Active'}
            </span>
          </td>
          <td>
            <div class="action-buttons-group">
              <a href="../product.html?id=${p.id}" target="_blank" class="btn-action" title="View on store">
                <i data-lucide="eye"></i> View
              </a>
              <a href="product-form.html?id=${p.id}" class="btn-action edit" title="Edit product">
                <i data-lucide="edit-2"></i> Edit
              </a>
            </div>
          </td>
        </tr>
      `).join('');
      if (window.refreshLucideIcons) window.refreshLucideIcons();
    }
  };

  // ==========================================================================
  // PRODUCT LISTING CONTROLLER (products.html)
  // ==========================================================================
  window.initProductListing = async function () {
    const tableBody = document.getElementById('products-table-tbody');
    const searchInput = document.getElementById('product-search-input');
    const categoryFilter = document.getElementById('product-category-filter');
    const statusFilter = document.getElementById('product-status-filter');
    const sortSelect = document.getElementById('product-sort-select');
    const countBadge = document.getElementById('products-count-badge');

    // Populate category filter dynamically from Supabase
    if (categoryFilter) {
      const categories = await window.RoyraDB.getCategories();
      categoryFilter.innerHTML = `
        <option value="all">All Categories</option>
        ${categories.map(c => `<option value="${c.slug}">${c.name}</option>`).join('')}
      `;
    }

    async function loadTable() {
      const filters = {
        search: searchInput ? searchInput.value : '',
        category: categoryFilter ? categoryFilter.value : 'all',
        status: statusFilter ? statusFilter.value : 'all',
        sort: sortSelect ? sortSelect.value : 'newest'
      };

      const products = await window.RoyraDB.getProducts(filters);
      if (countBadge) countBadge.textContent = `${products.length} Products`;

      if (!tableBody) return;

      if (products.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; padding: 40px 20px; color: #777;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#A68B5B" stroke-width="1.5" style="margin: 0 auto 10px;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <div style="font-weight: 600; font-size: 15px; margin-bottom: 4px; color: #1F1F1F;">No products found</div>
              <div style="font-size: 13px;">Try adjusting your search criteria or category filter.</div>
            </td>
          </tr>
        `;
        return;
      }

      tableBody.innerHTML = products.map(p => `
        <tr id="row-${p.id}">
          <td>
            <div class="table-product-thumb">
              <img src="${resolveAdminImageUrl(p.image)}" alt="${p.name}" />
            </div>
          </td>
          <td>
            <a href="product-form.html?id=${p.id}" class="table-product-title">${p.name}</a>
            <div class="table-product-meta">${p.material || 'Gold / Silver'}</div>
          </td>
          <td><code>${p.sku || 'N/A'}</code></td>
          <td style="text-transform: capitalize;">${p.category || 'Rings'}</td>
          <td>
            <strong>${formatINR(p.price)}</strong>
            ${p.oldPrice && p.oldPrice > p.price ? `<div style="font-size: 11px; color: #888; text-decoration: line-through;">${formatINR(p.oldPrice)}</div>` : ''}
          </td>
          <td>
            <span style="font-weight: 600; color: ${Number(p.stock) <= (p.lowStockAlert || 3) ? '#EF4444' : '#10B981'};">
              ${p.stock ?? 0}
            </span>
          </td>
          <td>
            <span class="status-badge ${(p.status || 'active').toLowerCase().replace(/\s+/g, '-')}">
              ${p.status || 'Active'}
            </span>
          </td>
          <td>
            <div class="action-buttons-group">
              <a href="../product.html?id=${p.id}" target="_blank" class="btn-action" title="View on customer store">
                <i data-lucide="eye"></i> View
              </a>
              <a href="product-form.html?id=${p.id}" class="btn-action edit" title="Edit product">
                <i data-lucide="edit-2"></i> Edit
              </a>
              <button type="button" class="btn-action delete" onclick="confirmDeleteProduct('${p.id}', '${p.name.replace(/'/g, "\\'")}')" title="Delete product">
                <i data-lucide="trash-2"></i> Delete
              </button>
            </div>
          </td>
        </tr>
      `).join('');
      if (window.refreshLucideIcons) window.refreshLucideIcons();
    }

    // Filter listeners
    if (searchInput) searchInput.addEventListener('input', debounce(loadTable, 250));
    if (categoryFilter) categoryFilter.addEventListener('change', loadTable);
    if (statusFilter) statusFilter.addEventListener('change', loadTable);
    if (sortSelect) sortSelect.addEventListener('change', loadTable);

    // Initial load
    await loadTable();
  };

  // DELETE MODAL HANDLER
  let pendingDeleteProductId = null;
  window.confirmDeleteProduct = function (productId, productName) {
    pendingDeleteProductId = productId;
    const modal = document.getElementById('delete-confirm-modal');
    const nameEl = document.getElementById('delete-modal-product-name');
    if (nameEl) nameEl.textContent = productName;
    if (modal) modal.classList.add('open');
  };

  window.closeDeleteModal = function () {
    pendingDeleteProductId = null;
    const modal = document.getElementById('delete-confirm-modal');
    if (modal) modal.classList.remove('open');
  };

  window.executeDeleteProduct = async function () {
    if (!pendingDeleteProductId) return;
    const res = await window.RoyraDB.deleteProduct(pendingDeleteProductId);
    if (res.success) {
      window.showAdminToast('Product deleted from Supabase database', 'success');
      closeDeleteModal();
      const row = document.getElementById(`row-${pendingDeleteProductId}`);
      if (row) row.remove();
      if (typeof window.initProductListing === 'function') {
        window.initProductListing();
      }
    } else {
      window.showAdminToast(res.error || 'Failed to delete product', 'error');
    }
  };

  // ==========================================================================
  // PRODUCT FORM CONTROLLER (Add / Edit product-form.html)
  // ==========================================================================
  window.initProductForm = async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const isEdit = Boolean(productId);

    // Elements
    const form = document.getElementById('product-management-form');
    const pageTitleEl = document.getElementById('form-page-title');
    const saveBtnText = document.getElementById('save-btn-text');
    const categorySelect = document.getElementById('input-category');
    const skuInput = document.getElementById('input-sku');
    const skuFeedback = document.getElementById('sku-feedback');
    const dropzone = document.getElementById('image-dropzone');
    const fileInput = document.getElementById('image-file-input');
    const imagePreviewGrid = document.getElementById('image-preview-grid');

    // Dynamic Multi-Image Gallery State
    let productImages = [];
    let primaryImageIndex = 0;

    // Advanced Jewellery Variant Matrix State
    let currentMetalOptions = ['Gold', 'Silver', 'Rose Gold'];
    let currentSizeOptions = ['4', '5', '6', '7', '8', '9', '10', '11', '12'];
    let variantMatrixCombinations = [];
    let currentMatrixFilter = 'all';

    // Rich Text Formatting for Descriptions
    window.applyRichFormat = function (targetId, prefix, suffix) {
      const el = document.getElementById(targetId);
      if (!el) return;
      const start = el.selectionStart || 0;
      const end = el.selectionEnd || 0;
      const val = el.value || '';
      const selected = val.substring(start, end);
      const replacement = prefix + (selected || 'text') + (suffix || '');
      el.value = val.substring(0, start) + replacement + val.substring(end);
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 4));
      
      const preview = document.getElementById('desc-preview-container');
      if (preview && preview.style.display !== 'none') {
        renderDescPreviewContent();
      }
    };

    window.clearRichFormat = function (targetId) {
      const el = document.getElementById(targetId);
      if (!el) return;
      el.value = el.value.replace(/[*#✦•`_\[\]\(\)]/g, '').replace(/https?:\/\/[^\s]+/g, '');
      const preview = document.getElementById('desc-preview-container');
      if (preview && preview.style.display !== 'none') {
        renderDescPreviewContent();
      }
    };

    function renderDescPreviewContent() {
      const el = document.getElementById('input-full-desc');
      const preview = document.getElementById('desc-preview-container');
      if (!el || !preview) return;
      let text = el.value || '';
      if (!text) {
        preview.innerHTML = '<span style="color: #999; font-style: italic;">Description preview will appear here...</span>';
        return;
      }
      let html = text
        .replace(/### (.*?)\n/g, '<h4 style="margin: 8px 0 4px; font-weight: 700; color: #111;">$1</h4>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/✦ (.*?)\n/g, '<li style="list-style: none; margin-bottom: 4px;">✦ $1</li>')
        .replace(/• (.*?)\n/g, '<li style="margin-left: 18px; margin-bottom: 4px;">$1</li>')
        .replace(/\n\n/g, '<p style="margin: 8px 0;"></p>')
        .replace(/\n/g, '<br/>');
      preview.innerHTML = html;
    }

    window.toggleDescPreview = function () {
      const preview = document.getElementById('desc-preview-container');
      if (!preview) return;
      if (preview.style.display === 'none' || !preview.style.display) {
        renderDescPreviewContent();
        preview.style.display = 'block';
      } else {
        preview.style.display = 'none';
      }
    };

    // Load collections into dropdown
    async function loadCollectionsIntoSelect(selectedSlug) {
      const collectionSelect = document.getElementById('input-collection');
      if (!collectionSelect) return;
      try {
        const collections = await window.RoyraDB.getCollections();
        if (collections && collections.length > 0) {
          const currentVal = selectedSlug || collectionSelect.value;
          collectionSelect.innerHTML = collections.map(c => `
            <option value="${c.slug}">${c.name}</option>
          `).join('');
          if (currentVal) collectionSelect.value = currentVal;
        }
      } catch (err) {
        console.warn('Error loading collections into select:', err);
      }
    }

    if (pageTitleEl) pageTitleEl.textContent = isEdit ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT';
    if (saveBtnText) saveBtnText.textContent = isEdit ? 'Save Changes' : 'Create Product';

    // Populate categories from Supabase
    if (categorySelect) {
      const categories = await window.RoyraDB.getCategories();
      categorySelect.innerHTML = categories.map(c => `<option value="${c.slug}">${c.name}</option>`).join('');
    }

    await loadCollectionsIntoSelect();

    // Option Chips Handlers
    function renderMetalChips() {
      const container = document.getElementById('metal-chips-wrap');
      if (!container) return;
      if (currentMetalOptions.length === 0) {
        container.innerHTML = '<span style="font-size: 12px; color: #888;">No metals defined. Click quick presets or add a metal.</span>';
        return;
      }
      container.innerHTML = currentMetalOptions.map((metal, idx) => {
        let badgeColor = '#D4A359';
        if (/silver|white|platinum|rhodium/i.test(metal)) badgeColor = '#718096';
        if (/rose/i.test(metal)) badgeColor = '#D53F8C';
        return `
          <div class="option-chip" style="border-left: 3px solid ${badgeColor};">
            <span>${metal}</span>
            <button type="button" class="option-chip-remove" onclick="removeMetalOption(${idx})" title="Remove ${metal}">✕</button>
          </div>
        `;
      }).join('');
    }

    function renderSizeChips() {
      const container = document.getElementById('size-chips-wrap');
      if (!container) return;
      if (currentSizeOptions.length === 0) {
        container.innerHTML = '<span style="font-size: 12px; color: #888;">No sizes defined. Click quick presets or add a size.</span>';
        return;
      }
      container.innerHTML = currentSizeOptions.map((size, idx) => `
        <div class="option-chip">
          <span>${size}</span>
          <button type="button" class="option-chip-remove" onclick="removeSizeOption(${idx})" title="Remove ${size}">✕</button>
        </div>
      `).join('');
    }

    window.addCustomMetalOption = function () {
      const input = document.getElementById('new-metal-input');
      const val = input ? input.value.trim() : '';
      if (!val) return;
      if (!currentMetalOptions.includes(val)) {
        currentMetalOptions.push(val);
        renderMetalChips();
        generateVariantMatrix(false);
      }
      if (input) input.value = '';
    };

    window.addPresetMetal = function (metal) {
      if (!currentMetalOptions.includes(metal)) {
        currentMetalOptions.push(metal);
        renderMetalChips();
        generateVariantMatrix(false);
      }
    };

    window.removeMetalOption = function (idx) {
      if (currentMetalOptions.length <= 1) {
        window.showAdminToast('A product must have at least one metal option', 'info');
        return;
      }
      currentMetalOptions.splice(idx, 1);
      renderMetalChips();
      generateVariantMatrix(false);
    };

    window.addCustomSizeOption = function () {
      const input = document.getElementById('new-size-input');
      const val = input ? input.value.trim() : '';
      if (!val) return;
      if (!currentSizeOptions.includes(val)) {
        currentSizeOptions.push(val);
        renderSizeChips();
        generateVariantMatrix(false);
      }
      if (input) input.value = '';
    };

    window.addPresetSizes = function (category) {
      if (category === 'rings') {
        currentSizeOptions = ['4', '5', '6', '7', '8', '9', '10', '11', '12'];
      } else if (category === 'necklaces') {
        currentSizeOptions = ['16"', '18"', '20"', '22"'];
      } else if (category === 'bracelets') {
        currentSizeOptions = ['6"', '6.5"', '7"', '7.5"', '8"'];
      } else if (category === 'general') {
        currentSizeOptions = ['Small', 'Medium', 'Large'];
      }
      renderSizeChips();
      generateVariantMatrix(false);
    };

    window.removeSizeOption = function (idx) {
      if (currentSizeOptions.length <= 1) {
        window.showAdminToast('A product must have at least one size option', 'info');
        return;
      }
      currentSizeOptions.splice(idx, 1);
      renderSizeChips();
      generateVariantMatrix(false);
    };

    // GENERATE VARIANT COMBINATIONS MATRIX
    window.generateVariantMatrix = function (isManualClick = false) {
      const baseSku = skuInput ? skuInput.value.trim().toUpperCase() : 'ROY-0001';
      const basePrice = Number(document.getElementById('input-price')?.value || 0);
      const baseCompare = Number(document.getElementById('input-old-price')?.value || 0);
      const baseStock = Number(document.getElementById('input-stock')?.value || 10);

      // Create a lookup of previous combinations to preserve custom values
      const existingMap = new Map();
      variantMatrixCombinations.forEach(comb => {
        const key = `${comb.metal}_${comb.size}`;
        existingMap.set(key, comb);
      });

      const newCombinations = [];

      currentMetalOptions.forEach(metal => {
        let metalCode = 'GLD';
        if (/silver|white|platinum|rhodium/i.test(metal)) metalCode = 'SLV';
        else if (/rose/i.test(metal)) metalCode = 'RSG';
        else metalCode = metal.substring(0, 3).toUpperCase();

        let defaultMetalImg = '';
        if (/rose/i.test(metal)) {
          defaultMetalImg = document.getElementById('v-rose-primary-img')?.value.trim() || '';
        } else if (/silver|white|platinum/i.test(metal)) {
          defaultMetalImg = document.getElementById('v-silver-primary-img')?.value.trim() || '';
        } else {
          defaultMetalImg = document.getElementById('v-gold-primary-img')?.value.trim() || '';
        }

        currentSizeOptions.forEach(size => {
          const key = `${metal}_${size}`;
          const cleanSizeCode = size.replace(/[^a-zA-Z0-9]/g, '');
          const defaultSku = `${baseSku}-${metalCode}-${cleanSizeCode}`;

          if (existingMap.has(key)) {
            const prev = existingMap.get(key);
            newCombinations.push({
              ...prev,
              metal,
              size,
              sku: prev.sku || defaultSku,
              price: prev.price || basePrice,
              comparePrice: prev.comparePrice || baseCompare,
              stock: prev.stock !== undefined ? prev.stock : baseStock,
              image: prev.image || defaultMetalImg || (productImages[0]?.url || ''),
              active: prev.active !== false
            });
          } else {
            newCombinations.push({
              id: `var_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              metal,
              size,
              sku: defaultSku,
              price: basePrice,
              comparePrice: baseCompare || null,
              stock: baseStock,
              image: defaultMetalImg || (productImages[0]?.url || ''),
              active: true
            });
          }
        });
      });

      variantMatrixCombinations = newCombinations;
      renderMatrixFilterTabs();
      renderVariantMatrixTable();

      if (isManualClick) {
        window.showAdminToast(`Generated ${variantMatrixCombinations.length} variant combinations (${currentMetalOptions.length} metals × ${currentSizeOptions.length} sizes)`, 'success');
      }
    };

    function renderMatrixFilterTabs() {
      const tabsContainer = document.getElementById('matrix-metal-tabs');
      const countEl = document.getElementById('matrix-total-count');
      if (countEl) countEl.textContent = variantMatrixCombinations.length;
      if (!tabsContainer) return;

      let html = `
        <button type="button" class="matrix-metal-tab ${currentMatrixFilter === 'all' ? 'active' : ''}" data-filter="all" onclick="filterMatrixByMetal('all', this)">
          All Combinations (${variantMatrixCombinations.length})
        </button>
      `;

      currentMetalOptions.forEach(metal => {
        const count = variantMatrixCombinations.filter(c => c.metal === metal).length;
        let icon = '🟡';
        if (/silver|white|platinum/i.test(metal)) icon = '⚪';
        else if (/rose/i.test(metal)) icon = '🌸';
        html += `
          <button type="button" class="matrix-metal-tab ${currentMatrixFilter === metal ? 'active' : ''}" data-filter="${metal}" onclick="filterMatrixByMetal('${metal}', this)">
            ${icon} ${metal} (${count})
          </button>
        `;
      });

      tabsContainer.innerHTML = html;
    }

    window.filterMatrixByMetal = function (metalFilter, btnEl) {
      currentMatrixFilter = metalFilter;
      document.querySelectorAll('.matrix-metal-tab').forEach(b => b.classList.remove('active'));
      if (btnEl) btnEl.classList.add('active');
      renderVariantMatrixTable();
    };

    function renderVariantMatrixTable() {
      const tbody = document.getElementById('variant-matrix-tbody');
      if (!tbody) return;

      const filtered = currentMatrixFilter === 'all'
        ? variantMatrixCombinations
        : variantMatrixCombinations.filter(c => c.metal === currentMatrixFilter);

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; padding: 24px; color: var(--admin-text-muted); font-size: 13px;">
              No variant combinations found. Click "Generate / Refresh Variant Matrix" above.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = filtered.map((item) => {
        const realIdx = variantMatrixCombinations.indexOf(item);
        let metalBadgeColor = '#B38E46';
        let metalBg = 'rgba(212, 163, 89, 0.1)';
        if (/silver|white|platinum/i.test(item.metal)) {
          metalBadgeColor = '#718096';
          metalBg = 'rgba(160, 174, 192, 0.15)';
        } else if (/rose/i.test(item.metal)) {
          metalBadgeColor = '#D53F8C';
          metalBg = 'rgba(229, 124, 142, 0.15)';
        }

        return `
          <tr class="${!item.active ? 'variant-row-inactive' : ''}" id="matrix-row-${realIdx}">
            <td style="text-align: center;">
              <input type="checkbox" ${item.active ? 'checked' : ''} onchange="toggleVariantActive(${realIdx}, this.checked)" title="Enable/disable on storefront" />
            </td>
            <td>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="badge-metal-tag" style="background: ${metalBg}; color: ${metalBadgeColor}; border: 1px solid ${metalBadgeColor}40;">
                  ${item.metal}
                </span>
                <span style="font-weight: 600; font-size: 12.5px; color: var(--admin-text-main);">Size ${item.size}</span>
              </div>
            </td>
            <td>
              <input type="text" class="form-input" style="padding: 4px 8px; font-size: 11.5px; font-family: monospace;" value="${item.sku || ''}" onchange="updateMatrixVariantField(${realIdx}, 'sku', this.value)" placeholder="SKU" />
            </td>
            <td>
              <input type="number" class="form-input" style="padding: 4px 8px; font-size: 12px;" value="${item.price || ''}" onchange="updateMatrixVariantField(${realIdx}, 'price', this.value)" placeholder="₹ Price" />
            </td>
            <td>
              <input type="number" class="form-input" style="padding: 4px 8px; font-size: 12px;" value="${item.comparePrice || ''}" onchange="updateMatrixVariantField(${realIdx}, 'comparePrice', this.value)" placeholder="₹ Strike" />
            </td>
            <td>
              <input type="number" class="form-input" style="padding: 4px 8px; font-size: 12px; width: 70px;" value="${item.stock !== undefined ? item.stock : 10}" onchange="updateMatrixVariantField(${realIdx}, 'stock', this.value)" />
            </td>
            <td>
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 28px; height: 28px; border-radius: 4px; overflow: hidden; border: 1px solid var(--admin-border); background: #fff; flex-shrink: 0;">
                  <img src="${resolveAdminImageUrl(item.image || 'assets/products/variant-unavailable.svg')}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='../assets/products/variant-unavailable.svg'" />
                </div>
                <button type="button" class="btn-admin-secondary" style="padding: 2px 6px; font-size: 10px;" onclick="pickImageForMatrixRow(${realIdx})">Pick</button>
              </div>
            </td>
            <td style="text-align: center;">
              <button type="button" style="background: none; border: none; color: #E53E3E; cursor: pointer; font-size: 13px;" onclick="removeMatrixCombination(${realIdx})" title="Delete combination">✕</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    window.updateMatrixVariantField = function (idx, field, val) {
      if (!variantMatrixCombinations[idx]) return;
      if (field === 'price' || field === 'comparePrice' || field === 'stock') {
        variantMatrixCombinations[idx][field] = val !== '' ? Number(val) : null;
      } else {
        variantMatrixCombinations[idx][field] = val;
      }
    };

    window.toggleVariantActive = function (idx, isChecked) {
      if (!variantMatrixCombinations[idx]) return;
      variantMatrixCombinations[idx].active = isChecked;
      const row = document.getElementById(`matrix-row-${idx}`);
      if (row) {
        if (isChecked) row.classList.remove('variant-row-inactive');
        else row.classList.add('variant-row-inactive');
      }
    };

    window.removeMatrixCombination = function (idx) {
      variantMatrixCombinations.splice(idx, 1);
      renderMatrixFilterTabs();
      renderVariantMatrixTable();
    };

    window.pickImageForMatrixRow = function (idx) {
      if (productImages.length === 0) {
        window.showAdminToast('Upload photos to Master Gallery first', 'info');
        return;
      }
      const primaryUrl = productImages[primaryImageIndex]?.url || productImages[0]?.url;
      variantMatrixCombinations[idx].image = primaryUrl;
      renderVariantMatrixTable();
      window.showAdminToast(`Assigned ${primaryUrl.split('/').pop()} to variant`, 'success');
    };

    // BULK MATRIX ACTIONS
    window.bulkApplyBasePrice = function () {
      const basePrice = Number(document.getElementById('input-price')?.value || 0);
      if (!basePrice) {
        window.showAdminToast('Enter a regular price in the Pricing card first', 'error');
        return;
      }
      variantMatrixCombinations.forEach(c => {
        c.price = basePrice;
      });
      renderVariantMatrixTable();
      window.showAdminToast(`Applied ₹${basePrice} to all ${variantMatrixCombinations.length} variants`, 'success');
    };

    window.bulkApplyBaseStock = function () {
      const baseStock = Number(document.getElementById('input-stock')?.value || 10);
      variantMatrixCombinations.forEach(c => {
        c.stock = baseStock;
      });
      renderVariantMatrixTable();
      window.showAdminToast(`Applied stock of ${baseStock} units to all variants`, 'success');
    };

    window.bulkRegenerateSkus = function () {
      const baseSku = skuInput ? skuInput.value.trim().toUpperCase() : 'ROY-0001';
      variantMatrixCombinations.forEach(c => {
        let metalCode = 'GLD';
        if (/silver|white|platinum/i.test(c.metal)) metalCode = 'SLV';
        else if (/rose/i.test(c.metal)) metalCode = 'RSG';
        else metalCode = c.metal.substring(0, 3).toUpperCase();

        const cleanSizeCode = c.size.replace(/[^a-zA-Z0-9]/g, '');
        c.sku = `${baseSku}-${metalCode}-${cleanSizeCode}`;
      });
      renderVariantMatrixTable();
      window.showAdminToast('Auto-generated unique SKUs for all combinations', 'success');
    };

    window.toggleAllVariantsActive = function (activeState) {
      variantMatrixCombinations.forEach(c => {
        c.active = activeState;
      });
      renderVariantMatrixTable();
      window.showAdminToast(`All variants set to ${activeState ? 'Enabled' : 'Disabled'}`, 'success');
    };

    // Load existing product if Edit mode
    let existingProduct = null;
    if (isEdit) {
      existingProduct = await window.RoyraDB.getProductById(productId);
      if (!existingProduct) {
        window.showAdminToast('Product not found in Supabase', 'error');
        setTimeout(() => window.location.href = 'products.html', 1000);
        return;
      }

      // Populate form
      document.getElementById('input-name').value = existingProduct.name || '';
      if (skuInput) skuInput.value = existingProduct.sku || '';
      if (categorySelect) categorySelect.value = (existingProduct.category || 'rings').toLowerCase();
      document.getElementById('input-product-type').value = existingProduct.productType || 'Solitaire';
      document.getElementById('input-short-desc').value = existingProduct.shortDescription || '';
      document.getElementById('input-full-desc').value = existingProduct.description || '';

      // Pricing & Inventory
      document.getElementById('input-price').value = existingProduct.price || '';
      document.getElementById('input-old-price').value = existingProduct.oldPrice || existingProduct.regularPrice || '';
      document.getElementById('input-stock').value = existingProduct.stock ?? 10;
      document.getElementById('input-low-stock').value = existingProduct.lowStockAlert ?? 3;
      document.getElementById('input-status').value = existingProduct.status || 'Active';

      // Jewellery Details
      document.getElementById('input-metal').value = existingProduct.material || '';
      document.getElementById('input-plating').value = existingProduct.plating || '';
      document.getElementById('input-stone').value = existingProduct.stone || '';
      document.getElementById('input-weight').value = existingProduct.weight || '';
      
      if (document.getElementById('input-style')) {
        document.getElementById('input-style').value = existingProduct.style || existingProduct.specifications?.style || '';
      }
      if (document.getElementById('input-occasion')) {
        document.getElementById('input-occasion').value = existingProduct.occasion || existingProduct.specifications?.occasion || '';
      }
      if (document.getElementById('input-dimensions')) {
        document.getElementById('input-dimensions').value = existingProduct.dimensions || existingProduct.specifications?.dimensions || '';
      }
      if (document.getElementById('input-certification')) {
        document.getElementById('input-certification').value = existingProduct.certification || existingProduct.specifications?.certification || '';
      }
      if (document.getElementById('input-craftsmanship')) {
        document.getElementById('input-craftsmanship').value = existingProduct.craftsmanship || existingProduct.specifications?.craftsmanship || '';
      }
      if (document.getElementById('input-care-instructions')) {
        document.getElementById('input-care-instructions').value = existingProduct.careInstructions || existingProduct.specifications?.care || '';
      }
      if (document.getElementById('input-seo-keywords')) {
        document.getElementById('input-seo-keywords').value = existingProduct.seoKeywords || existingProduct.seo_keywords || '';
      }
      
      if (existingProduct.collection) {
        await loadCollectionsIntoSelect(existingProduct.collection);
      }

      // Populate Option chips
      if (existingProduct.finishes && Array.isArray(existingProduct.finishes) && existingProduct.finishes.length > 0) {
        currentMetalOptions = [...existingProduct.finishes];
      }
      if (existingProduct.sizes && Array.isArray(existingProduct.sizes) && existingProduct.sizes.length > 0) {
        currentSizeOptions = [...existingProduct.sizes];
      }

      renderMetalChips();
      renderSizeChips();

      // Populate Variant Matrix if exists
      const variants = existingProduct.variants || {};
      
      // Gold Variant
      const goldV = variants['Gold'] || variants['gold'] || {};
      if (document.getElementById('v-gold-sku')) {
        document.getElementById('v-gold-sku').value = goldV.sku || (existingProduct.sku ? `${existingProduct.sku}-GLD` : '');
        document.getElementById('v-gold-price').value = goldV.price || '';
        document.getElementById('v-gold-stock').value = goldV.stock ?? existingProduct.stock ?? 10;
        document.getElementById('v-gold-primary-img').value = goldV.primary || existingProduct.image || '';
        document.getElementById('v-gold-gallery').value = (goldV.gallery && Array.isArray(goldV.gallery)) ? goldV.gallery.join(', ') : '';
        document.getElementById('v-gold-active').checked = goldV.active !== false;
      }

      // Silver Variant
      const silverV = variants['Silver'] || variants['silver'] || {};
      if (document.getElementById('v-silver-sku')) {
        document.getElementById('v-silver-sku').value = silverV.sku || (existingProduct.sku ? `${existingProduct.sku}-SLV` : '');
        document.getElementById('v-silver-price').value = silverV.price || '';
        document.getElementById('v-silver-stock').value = silverV.stock ?? 10;
        document.getElementById('v-silver-primary-img').value = silverV.primary || existingProduct.secondImage || '';
        document.getElementById('v-silver-gallery').value = (silverV.gallery && Array.isArray(silverV.gallery)) ? silverV.gallery.join(', ') : '';
        document.getElementById('v-silver-active').checked = silverV.active !== false;
      }

      // Rose Gold Variant
      const roseV = variants['Rose Gold'] || variants['rose gold'] || variants['Rose'] || {};
      if (document.getElementById('v-rose-sku')) {
        document.getElementById('v-rose-sku').value = roseV.sku || (existingProduct.sku ? `${existingProduct.sku}-RSG` : '');
        document.getElementById('v-rose-price').value = roseV.price || '';
        document.getElementById('v-rose-stock').value = roseV.stock ?? 10;
        document.getElementById('v-rose-primary-img').value = roseV.primary || '';
        document.getElementById('v-rose-gallery').value = (roseV.gallery && Array.isArray(roseV.gallery)) ? roseV.gallery.join(', ') : '';
        document.getElementById('v-rose-active').checked = roseV.active !== false;
      }

      // Refresh preview strips
      ['gold', 'silver', 'rose'].forEach(v => updateVariantPreview(v));

      // Load matrix combinations if stored
      if (existingProduct.variants_matrix && Array.isArray(existingProduct.variants_matrix) && existingProduct.variants_matrix.length > 0) {
        variantMatrixCombinations = existingProduct.variants_matrix;
        renderMatrixFilterTabs();
        renderVariantMatrixTable();
      } else {
        generateVariantMatrix(false);
      }

      // Load multiple gallery images
      if (existingProduct.gallery && existingProduct.gallery.length > 0) {
        productImages = existingProduct.gallery.map((imgUrl, i) => ({
          url: imgUrl,
          name: `Image ${i + 1}`,
          isPrimary: i === 0
        }));
      } else if (existingProduct.image) {
        productImages = [{ url: existingProduct.image, name: 'Main Image', isPrimary: true }];
      }
      primaryImageIndex = 0;
      renderImagePreviews();
    } else {
      renderMetalChips();
      renderSizeChips();
      if (skuInput && !skuInput.value) {
        const baseSku = `ROY-${Math.floor(1000 + Math.random() * 9000)}`;
        skuInput.value = baseSku;
        if (document.getElementById('v-gold-sku')) document.getElementById('v-gold-sku').value = `${baseSku}-GLD`;
        if (document.getElementById('v-silver-sku')) document.getElementById('v-silver-sku').value = `${baseSku}-SLV`;
        if (document.getElementById('v-rose-sku')) document.getElementById('v-rose-sku').value = `${baseSku}-RSG`;
      }
      generateVariantMatrix(false);
    }

    // SKU Live DB Validation
    if (skuInput) {
      skuInput.addEventListener('input', debounce(async () => {
        const val = skuInput.value.trim();
        if (!val) {
          skuFeedback.className = 'sku-feedback';
          skuFeedback.textContent = '';
          return;
        }
        const isUnique = await window.RoyraDB.isSkuUnique(val, productId);
        if (!isUnique) {
          skuFeedback.className = 'sku-feedback error';
          skuFeedback.textContent = 'This SKU is already registered in Supabase. Please choose a unique SKU.';
        } else {
          skuFeedback.className = 'sku-feedback valid';
          skuFeedback.textContent = '✓ SKU is available';
        }
      }, 300));
    }

    // VARIANT MATRIX HELPERS & UI CONTROLLERS
    window.switchVariantTab = function (vtab, btn) {
      document.querySelectorAll('.variant-tab-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      document.querySelectorAll('.variant-panel').forEach(p => p.style.display = 'none');
      const panel = document.getElementById(`vpanel-${vtab}`);
      if (panel) panel.style.display = 'block';
    };

    window.updateVariantPreview = function (metalKey) {
      const primaryInput = document.getElementById(`v-${metalKey}-primary-img`);
      const galleryInput = document.getElementById(`v-${metalKey}-gallery`);
      const previewStrip = document.getElementById(`v-${metalKey}-preview-strip`);
      if (!previewStrip) return;

      const primary = primaryInput ? primaryInput.value.trim() : '';
      const gallery = galleryInput ? galleryInput.value.split(',').map(s => s.trim()).filter(Boolean) : [];
      const allUrls = primary ? [primary, ...gallery.filter(g => g !== primary)] : gallery;

      if (allUrls.length === 0) {
        previewStrip.innerHTML = '<span style="font-size: 11px; color: #888;">No images assigned to this variant yet.</span>';
        return;
      }

      previewStrip.innerHTML = allUrls.map((url, idx) => `
        <div style="position: relative; width: 50px; height: 50px; border-radius: 4px; overflow: hidden; border: 1px solid var(--admin-border); flex-shrink: 0; background: #fff;">
          <img src="${resolveAdminImageUrl(url)}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='../assets/products/variant-unavailable.svg'" />
          ${idx === 0 ? '<span style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: #fff; font-size: 8px; text-align: center; font-weight: 700;">MAIN</span>' : ''}
        </div>
      `).join('');
    };

    window.pickFromMasterGallery = function (metalKey, type) {
      if (productImages.length === 0) {
        window.showAdminToast('Upload images to Master Gallery first, or paste image path directly', 'info');
        return;
      }
      const primaryUrl = productImages[primaryImageIndex]?.url || productImages[0]?.url;
      if (type === 'primary') {
        const input = document.getElementById(`v-${metalKey}-primary-img`);
        if (input && primaryUrl) {
          input.value = primaryUrl;
          updateVariantPreview(metalKey);
          window.showAdminToast(`Assigned ${primaryUrl.split('/').pop()} to ${metalKey.toUpperCase()} primary`, 'success');
        }
      }
    };

    // Assign master gallery photo directly to a specific metal
    window.assignImageToMetal = function (imgIndex, metalKey) {
      const img = productImages[imgIndex];
      if (!img) return;
      const input = document.getElementById(`v-${metalKey}-primary-img`);
      if (input) {
        input.value = img.url;
        updateVariantPreview(metalKey);
        // Also update any combinations with this metal
        const targetMetalName = metalKey === 'gold' ? 'Gold' : (metalKey === 'silver' ? 'Silver' : 'Rose Gold');
        variantMatrixCombinations.forEach(c => {
          if (c.metal.toLowerCase().includes(metalKey)) {
            c.image = img.url;
          }
        });
        renderVariantMatrixTable();
        window.showAdminToast(`Assigned image to ${targetMetalName} Primary & Variants`, 'success');
      }
    };

    // QUICK ADD COLLECTION MODAL LOGIC
    window.openAddCollectionModal = function () {
      const modal = document.getElementById('quick-add-collection-modal');
      if (modal) modal.style.display = 'flex';
      const nameInput = document.getElementById('new-collection-name');
      if (nameInput) {
        nameInput.value = '';
        nameInput.focus();
      }
      const slugInput = document.getElementById('new-collection-slug');
      if (slugInput) slugInput.value = '';
    };

    window.closeAddCollectionModal = function () {
      const modal = document.getElementById('quick-add-collection-modal');
      if (modal) modal.style.display = 'none';
    };

    window.saveNewCollectionFromModal = async function () {
      const nameInput = document.getElementById('new-collection-name');
      const slugInput = document.getElementById('new-collection-slug');
      const name = nameInput ? nameInput.value.trim() : '';
      if (!name) {
        window.showAdminToast('Please enter a collection name', 'error');
        return;
      }
      let slug = slugInput ? slugInput.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
      if (!slug) slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const collectionPayload = {
        name,
        slug,
        description: `Handcrafted ${name} curated signature jewellery selection.`,
        status: 'Active',
        sortOrder: 1
      };

      try {
        const res = await window.RoyraDB.saveCollection(collectionPayload);
        if (res.success || res.data) {
          await loadCollectionsIntoSelect(slug);
          window.closeAddCollectionModal();
          window.showAdminToast(`Collection "${name}" saved to database & selected`, 'success');
        } else {
          // Fallback UI insert
          const collectionSelect = document.getElementById('input-collection');
          if (collectionSelect) {
            const opt = document.createElement('option');
            opt.value = slug;
            opt.textContent = name;
            collectionSelect.appendChild(opt);
            collectionSelect.value = slug;
          }
          window.closeAddCollectionModal();
          window.showAdminToast(`Collection "${name}" added`, 'success');
        }
      } catch (err) {
        console.error('Error saving collection:', err);
        window.closeAddCollectionModal();
      }
    };

    // Multi-Image Gallery Rendering & Controls
    function renderImagePreviews() {
      if (!imagePreviewGrid) return;
      if (productImages.length === 0) {
        imagePreviewGrid.innerHTML = `
          <div style="grid-column: 1 / -1; font-size: 12px; color: #888; text-align: center; padding: 12px;">
            No images uploaded yet. Upload high-resolution jewellery photos.
          </div>
        `;
        return;
      }

      imagePreviewGrid.innerHTML = productImages.map((img, idx) => `
        <div class="preview-item">
          ${idx === primaryImageIndex ? `<span class="preview-badge-primary">PRIMARY COVER</span>` : ''}
          <img src="${resolveAdminImageUrl(img.url)}" alt="Preview ${idx + 1}" />
          
          <div class="preview-actions">
            ${idx !== primaryImageIndex ? `
              <button type="button" class="preview-btn star" onclick="setPrimaryImage(${idx})" title="Set as primary catalogue cover">★ Main</button>
            ` : '<span></span>'}
            
            <div style="display: flex; gap: 2px;">
              ${idx > 0 ? `<button type="button" class="preview-btn" onclick="moveImage(${idx}, -1)" title="Move left">←</button>` : ''}
              ${idx < productImages.length - 1 ? `<button type="button" class="preview-btn" onclick="moveImage(${idx}, 1)" title="Move right">→</button>` : ''}
              <button type="button" class="preview-btn delete" onclick="removeImage(${idx})" title="Delete image">✕</button>
            </div>
          </div>

          <div class="preview-metal-assign-bar">
            <button type="button" class="assign-badge-btn gold" onclick="assignImageToMetal(${idx}, 'gold')" title="Assign as Yellow Gold primary photo">🟡 Gold</button>
            <button type="button" class="assign-badge-btn silver" onclick="assignImageToMetal(${idx}, 'silver')" title="Assign as Silver primary photo">⚪ Silver</button>
            <button type="button" class="assign-badge-btn rose" onclick="assignImageToMetal(${idx}, 'rose')" title="Assign as Rose Gold primary photo">🌸 Rose</button>
          </div>
        </div>
      `).join('');
    }

    window.setPrimaryImage = function (index) {
      primaryImageIndex = index;
      renderImagePreviews();
    };

    window.moveImage = function (index, direction) {
      const target = index + direction;
      if (target < 0 || target >= productImages.length) return;
      const temp = productImages[index];
      productImages[index] = productImages[target];
      productImages[target] = temp;

      if (primaryImageIndex === index) {
        primaryImageIndex = target;
      } else if (primaryImageIndex === target) {
        primaryImageIndex = index;
      }
      renderImagePreviews();
    };

    window.removeImage = function (index) {
      productImages.splice(index, 1);
      if (primaryImageIndex >= productImages.length) {
        primaryImageIndex = Math.max(0, productImages.length - 1);
      }
      renderImagePreviews();
    };

    // SUPABASE STORAGE MULTI-FILE UPLOADER
    async function handleFiles(files) {
      const uploadCount = files.length;
      if (uploadCount === 0) return;

      window.showAdminToast(`Uploading ${uploadCount} image(s) to Supabase Storage...`, 'info');

      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const res = await window.RoyraDB.uploadImage(file);
        if (res.success) {
          productImages.push({
            url: res.url,
            name: res.name,
            path: res.path
          });
        }
      }
      renderImagePreviews();
      window.showAdminToast('Images processed and ready', 'success');
    }

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
      });
    }

    // FORM SUBMISSION TO SUPABASE POSTGRESQL
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('input-name').value.trim();
        const sku = skuInput ? skuInput.value.trim().toUpperCase() : '';
        const price = document.getElementById('input-price').value;
        const submitBtn = document.querySelector('button[type="submit"]');

        if (!name || !sku || !price) {
          window.showAdminToast('Please fill in all required fields (*)', 'error');
          return;
        }

        // Validate SKU uniqueness
        const isSkuUnique = await window.RoyraDB.isSkuUnique(sku, productId);
        if (!isSkuUnique) {
          window.showAdminToast('This SKU is already registered. Please enter a unique SKU.', 'error');
          if (skuFeedback) {
            skuFeedback.className = 'sku-feedback error';
            skuFeedback.textContent = 'This SKU already exists.';
          }
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `
            <svg class="admin-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
            Saving to Supabase...
          `;
        }

        // Prepare ordered images
        let orderedImages = [...productImages];
        if (primaryImageIndex > 0 && primaryImageIndex < orderedImages.length) {
          const primaryImg = orderedImages.splice(primaryImageIndex, 1)[0];
          orderedImages.unshift(primaryImg);
        }

        const galleryUrls = orderedImages.map(img => img.url);
        const mainImageUrl = galleryUrls[0] || (existingProduct ? existingProduct.image : 'assets/products/product-01.jpg');

        // Extract Variant Matrix
        const goldPrimary = document.getElementById('v-gold-primary-img')?.value.trim() || '';
        const silverPrimary = document.getElementById('v-silver-primary-img')?.value.trim() || '';
        const rosePrimary = document.getElementById('v-rose-primary-img')?.value.trim() || '';

        const goldGallery = document.getElementById('v-gold-gallery')?.value.split(',').map(s => s.trim()).filter(Boolean) || [];
        const silverGallery = document.getElementById('v-silver-gallery')?.value.split(',').map(s => s.trim()).filter(Boolean) || [];
        const roseGallery = document.getElementById('v-rose-gallery')?.value.split(',').map(s => s.trim()).filter(Boolean) || [];

        const goldActive = document.getElementById('v-gold-active')?.checked ?? true;
        const silverActive = document.getElementById('v-silver-active')?.checked ?? true;
        const roseActive = document.getElementById('v-rose-active')?.checked ?? true;

        const variantsPayload = {
          "Gold": {
            sku: document.getElementById('v-gold-sku')?.value.trim() || `${sku}-GLD`,
            price: document.getElementById('v-gold-price')?.value ? Number(document.getElementById('v-gold-price').value) : Number(price),
            stock: Number(document.getElementById('v-gold-stock')?.value || 10),
            primary: goldPrimary || mainImageUrl,
            gallery: goldGallery.length > 0 ? (goldPrimary ? [goldPrimary, ...goldGallery.filter(g => g !== goldPrimary)] : goldGallery) : [goldPrimary || mainImageUrl],
            active: goldActive
          },
          "Silver": {
            sku: document.getElementById('v-silver-sku')?.value.trim() || `${sku}-SLV`,
            price: document.getElementById('v-silver-price')?.value ? Number(document.getElementById('v-silver-price').value) : Number(price),
            stock: Number(document.getElementById('v-silver-stock')?.value || 10),
            primary: silverPrimary || '',
            gallery: silverGallery.length > 0 ? (silverPrimary ? [silverPrimary, ...silverGallery.filter(g => g !== silverPrimary)] : silverGallery) : (silverPrimary ? [silverPrimary] : []),
            active: silverActive
          },
          "Rose Gold": {
            sku: document.getElementById('v-rose-sku')?.value.trim() || `${sku}-RSG`,
            price: document.getElementById('v-rose-price')?.value ? Number(document.getElementById('v-rose-price').value) : Number(price),
            stock: Number(document.getElementById('v-rose-stock')?.value || 10),
            primary: rosePrimary || '',
            gallery: roseGallery.length > 0 ? (rosePrimary ? [rosePrimary, ...roseGallery.filter(g => g !== rosePrimary)] : roseGallery) : (rosePrimary ? [rosePrimary] : []),
            active: roseActive
          }
        };

        const activeFinishes = [];
        if (goldActive) activeFinishes.push("Gold");
        if (silverActive) activeFinishes.push("Silver");
        if (roseActive) activeFinishes.push("Rose Gold");

        const productPayload = {
          id: productId || null,
          name,
          sku,
          category: categorySelect ? categorySelect.value : 'rings',
          productType: document.getElementById('input-product-type').value,
          shortDescription: document.getElementById('input-short-desc').value,
          description: document.getElementById('input-full-desc').value,
          price: Number(price),
          regularPrice: Number(price),
          oldPrice: document.getElementById('input-old-price').value ? Number(document.getElementById('input-old-price').value) : null,
          stock: Number(document.getElementById('input-stock').value),
          lowStockAlert: Number(document.getElementById('input-low-stock').value),
          status: document.getElementById('input-status').value,
          material: document.getElementById('input-metal').value,
          plating: document.getElementById('input-plating').value,
          stone: document.getElementById('input-stone').value,
          weight: document.getElementById('input-weight').value,
          style: document.getElementById('input-style')?.value || '',
          occasion: document.getElementById('input-occasion')?.value || '',
          dimensions: document.getElementById('input-dimensions')?.value || '',
          certification: document.getElementById('input-certification')?.value || '',
          craftsmanship: document.getElementById('input-craftsmanship')?.value || '',
          careInstructions: document.getElementById('input-care-instructions')?.value || '',
          seoKeywords: document.getElementById('input-seo-keywords')?.value || '',
          collection: document.getElementById('input-collection').value,
          image: mainImageUrl,
          secondImage: silverPrimary || galleryUrls[1] || null,
          images: orderedImages,
          gallery: galleryUrls.length > 0 ? galleryUrls : [mainImageUrl],
          variants: variantsPayload,
          variants_matrix: variantMatrixCombinations,
          finishes: currentMetalOptions.length > 0 ? currentMetalOptions : (activeFinishes.length > 0 ? activeFinishes : ["Gold", "Silver", "Rose Gold"]),
          sizes: currentSizeOptions
        };

        const result = await window.RoyraDB.saveProduct(productPayload, isEdit);
        if (result.success) {
          window.showAdminToast(isEdit ? 'Product updated in Supabase database' : 'Product created in Supabase database', 'success');
          setTimeout(() => {
            window.location.href = 'products.html';
          }, 600);
        } else {
          window.showAdminToast(result.error || 'Failed to save product to Supabase', 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              ${isEdit ? 'Save Changes' : 'Create Product'}
            `;
          }
        }
      });
    }
  };

  // ==========================================================================
  // CATEGORIES CONTROLLER (categories.html)
  // ==========================================================================
  window.initCategoriesManagement = async function () {
    const tableBody = document.getElementById('categories-table-tbody');
    const addBtn = document.getElementById('btn-add-category');
    const modal = document.getElementById('category-modal');
    const modalForm = document.getElementById('category-modal-form');
    const modalTitle = document.getElementById('category-modal-title');

    let editingCategoryId = null;

    async function loadCategories() {
      const categories = await window.RoyraDB.getCategories();
      if (!tableBody) return;

      tableBody.innerHTML = categories.map(cat => `
        <tr id="cat-row-${cat.id}">
          <td><strong>${cat.name}</strong></td>
          <td><code>${cat.slug}</code></td>
          <td style="color: #666; max-width: 300px;">${cat.description || '—'}</td>
          <td><span class="status-badge active">${cat.status || 'Active'}</span></td>
          <td>
            <div class="action-buttons-group">
              <button type="button" class="btn-action edit" onclick="openEditCategory('${cat.id}', '${cat.name}', '${cat.slug}', '${(cat.description || '').replace(/'/g, "\\'")}')"><i data-lucide="edit-2"></i> Edit</button>
              <button type="button" class="btn-action delete" onclick="deleteCategory('${cat.id}', '${cat.name}')"><i data-lucide="trash-2"></i> Delete</button>
            </div>
          </td>
        </tr>
      `).join('');
      if (window.refreshLucideIcons) window.refreshLucideIcons();
    }

    window.openAddCategory = function () {
      editingCategoryId = null;
      if (modalTitle) modalTitle.textContent = 'Add New Category';
      if (modalForm) modalForm.reset();
      if (modal) modal.classList.add('open');
    };

    window.openEditCategory = function (id, name, slug, desc) {
      editingCategoryId = id;
      if (modalTitle) modalTitle.textContent = 'Edit Category';
      document.getElementById('cat-input-name').value = name;
      document.getElementById('cat-input-slug').value = slug;
      document.getElementById('cat-input-desc').value = desc;
      if (modal) modal.classList.add('open');
    };

    window.closeCategoryModal = function () {
      if (modal) modal.classList.remove('open');
    };

    window.deleteCategory = async function (id, name) {
      if (confirm(`Are you sure you want to delete the category "${name}" from Supabase?`)) {
        await window.RoyraDB.deleteCategory(id);
        window.showAdminToast(`Category "${name}" deleted`, 'success');
        loadCategories();
      }
    };

    if (modalForm) {
      modalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('cat-input-name').value.trim();
        const slug = document.getElementById('cat-input-slug').value.trim().toLowerCase();
        const description = document.getElementById('cat-input-desc').value.trim();

        if (!name) {
          window.showAdminToast('Please enter a category name', 'error');
          return;
        }

        const res = await window.RoyraDB.saveCategory({
          id: editingCategoryId,
          name,
          slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description
        }, Boolean(editingCategoryId));

        if (res.success) {
          window.showAdminToast(editingCategoryId ? 'Category updated in Supabase' : 'Category created in Supabase', 'success');
          closeCategoryModal();
          loadCategories();
        } else {
          window.showAdminToast(res.error || 'Failed to save category', 'error');
        }
      });
    }

    if (addBtn) addBtn.addEventListener('click', openAddCategory);
    await loadCategories();
  };

  // Utility: Debounce
  function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // ==========================================================================
  // AI JEWELLERY PRODUCT CONTENT GENERATOR CONTROLLERS
  // ==========================================================================
  window.triggerAiGeneration = async function(target = 'both') {
    const nameInput = document.getElementById('input-name');
    const name = nameInput ? nameInput.value.trim() : '';

    if (!name) {
      window.showAdminToast('Please enter a Product Name first before generating AI content', 'warning');
      if (nameInput) nameInput.focus();
      return;
    }

    const tone = document.getElementById('ai-tone')?.value || 'Luxury';
    const length = document.getElementById('ai-length')?.value || 'Standard';
    const language = document.getElementById('ai-language')?.value || 'English';
    const selectedVariant = document.getElementById('ai-variant-target')?.value || 'all';
    const verifiedOnly = document.getElementById('ai-verified-only')?.checked ?? true;

    // Extract all product fields from form
    const productType = document.getElementById('input-product-type')?.value?.trim() || '';
    const categorySelect = document.getElementById('input-category');
    const category = categorySelect ? categorySelect.value : '';
    const collectionSelect = document.getElementById('input-collection');
    const collection = collectionSelect ? collectionSelect.value : '';
    const metal = document.getElementById('input-metal')?.value?.trim() || '';
    const plating = document.getElementById('input-plating')?.value?.trim() || '';
    const stone = document.getElementById('input-stone')?.value?.trim() || '';
    const weight = document.getElementById('input-weight')?.value?.trim() || '';
    const style = document.getElementById('input-style')?.value?.trim() || '';
    const occasion = document.getElementById('input-occasion')?.value?.trim() || '';
    const dimensions = document.getElementById('input-dimensions')?.value?.trim() || '';
    const certification = document.getElementById('input-certification')?.value?.trim() || '';
    const craftsmanship = document.getElementById('input-craftsmanship')?.value?.trim() || '';
    const careInstructions = document.getElementById('input-care-instructions')?.value?.trim() || '';
    const seoKeywords = document.getElementById('input-seo-keywords')?.value?.trim() || '';
    const existingShortDesc = document.getElementById('input-short-desc')?.value?.trim() || '';
    const existingFullDesc = document.getElementById('input-full-desc')?.value?.trim() || '';

    // Collect Variant Matrix Data
    const variantsPayload = {
      "Gold": {
        sku: document.getElementById('v-gold-sku')?.value?.trim() || '',
        price: document.getElementById('v-gold-price')?.value ? Number(document.getElementById('v-gold-price').value) : null,
        stock: Number(document.getElementById('v-gold-stock')?.value || 10),
        active: document.getElementById('v-gold-active')?.checked ?? true
      },
      "Silver": {
        sku: document.getElementById('v-silver-sku')?.value?.trim() || '',
        price: document.getElementById('v-silver-price')?.value ? Number(document.getElementById('v-silver-price').value) : null,
        stock: Number(document.getElementById('v-silver-stock')?.value || 10),
        active: document.getElementById('v-silver-active')?.checked ?? true
      },
      "Rose Gold": {
        sku: document.getElementById('v-rose-sku')?.value?.trim() || '',
        price: document.getElementById('v-rose-price')?.value ? Number(document.getElementById('v-rose-price').value) : null,
        stock: Number(document.getElementById('v-rose-stock')?.value || 10),
        active: document.getElementById('v-rose-active')?.checked ?? true
      }
    };

    const payload = {
      name,
      productType,
      category,
      collection,
      metal,
      plating,
      stone,
      weight,
      style,
      occasion,
      dimensions,
      certification,
      craftsmanship,
      careInstructions,
      seoKeywords,
      existingShortDesc,
      existingFullDesc,
      finishes: (typeof currentMetalOptions !== 'undefined' && currentMetalOptions.length > 0) ? currentMetalOptions : ["Gold", "Silver", "Rose Gold"],
      sizes: (typeof currentSizeOptions !== 'undefined') ? currentSizeOptions : [],
      variants: variantsPayload,
      selectedVariant: selectedVariant !== 'all' ? selectedVariant : undefined,
      tone,
      length,
      language,
      verifiedOnly,
      target
    };

    const loadingEl = document.getElementById('ai-loading-indicator');
    const resultsContainer = document.getElementById('ai-results-container');
    const shortCard = document.getElementById('ai-short-card');
    const storyCard = document.getElementById('ai-story-card');
    const shortOutput = document.getElementById('ai-short-output');
    const storyOutput = document.getElementById('ai-story-output');
    const btnBoth = document.getElementById('btn-ai-gen-both');
    const btnShort = document.getElementById('btn-ai-gen-short');
    const btnStory = document.getElementById('btn-ai-gen-story');

    if (loadingEl) loadingEl.style.display = 'flex';
    if (btnBoth) btnBoth.disabled = true;
    if (btnShort) btnShort.disabled = true;
    if (btnStory) btnStory.disabled = true;

    try {
      let endpoint = '/api/ai/generate-product-content';
      const customBase = window.__ENV__?.API_BASE?.trim();
      if (customBase && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
        endpoint = `${customBase.replace(/\/+$/, '')}/api/ai/generate-product-content`;
      }

      let response = null;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (netErr) {
        if (endpoint.startsWith('http')) {
          response = await fetch('/api/ai/generate-product-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          throw netErr;
        }
      }

      if (!response || !response.ok) {
        const errText = response ? await response.text() : 'Server communication failure';
        throw new Error(`AI generation request failed: ${errText}`);
      }

      const data = await response.json();
      if (!data.success && !data.data) {
        throw new Error(data.error || 'Failed to generate AI product content');
      }

      const result = data.data || {};
      if (resultsContainer) resultsContainer.style.display = 'flex';

      if (target === 'both' || target === 'short') {
        if (shortOutput && result.shortDescription) {
          shortOutput.value = result.shortDescription;
        }
        if (shortCard) shortCard.style.display = 'block';
      } else if (shortCard && target === 'full') {
        if (!shortOutput?.value) shortCard.style.display = 'none';
      }

      if (target === 'both' || target === 'full') {
        if (storyOutput && result.fullStory) {
          storyOutput.value = result.fullStory;
        }
        if (storyCard) storyCard.style.display = 'block';
      } else if (storyCard && target === 'short') {
        if (!storyOutput?.value) storyCard.style.display = 'none';
      }

      window.showAdminToast(`✨ Product content generated (${data.source === 'gemini_ai' ? 'Gemini 3.7 Flash' : 'Fine Jewellery AI'})`, 'success');
      resultsContainer?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (err) {
      console.error('AI Generation Error:', err);
      window.showAdminToast(err.message || 'Could not generate AI content. Existing content preserved.', 'error');
    } finally {
      if (loadingEl) loadingEl.style.display = 'none';
      if (btnBoth) btnBoth.disabled = false;
      if (btnShort) btnShort.disabled = false;
      if (btnStory) btnStory.disabled = false;
    }
  };

  window.applyAiShortDescription = function() {
    const shortOutput = document.getElementById('ai-short-output');
    const shortInput = document.getElementById('input-short-desc');
    if (!shortOutput || !shortInput) return;
    const val = shortOutput.value.trim();
    if (!val) {
      window.showAdminToast('No generated short description to apply', 'warning');
      return;
    }
    shortInput.value = val;
    shortInput.classList.remove('field-highlight-pulse');
    void shortInput.offsetWidth;
    shortInput.classList.add('field-highlight-pulse');
    window.showAdminToast('Short description applied to product form', 'success');
  };

  window.applyAiFullStory = function() {
    const storyOutput = document.getElementById('ai-story-output');
    const fullDescInput = document.getElementById('input-full-desc');
    if (!storyOutput || !fullDescInput) return;
    const val = storyOutput.value.trim();
    if (!val) {
      window.showAdminToast('No generated product story to apply', 'warning');
      return;
    }
    fullDescInput.value = val;
    fullDescInput.classList.remove('field-highlight-pulse');
    void fullDescInput.offsetWidth;
    fullDescInput.classList.add('field-highlight-pulse');

    const preview = document.getElementById('desc-preview-container');
    if (preview && preview.style.display !== 'none' && typeof window.renderRichMarkdown === 'function') {
      preview.innerHTML = window.renderRichMarkdown(val);
    }

    window.showAdminToast('Full product story applied to product form', 'success');
  };

  window.applyBothAiDescriptions = function() {
    window.applyAiShortDescription();
    window.applyAiFullStory();
    window.showAdminToast('Both AI descriptions successfully applied to product form', 'success');
  };

  window.focusAiEditor = function(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

})();
