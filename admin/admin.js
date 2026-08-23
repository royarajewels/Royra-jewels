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

    if (pageTitleEl) pageTitleEl.textContent = isEdit ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT';
    if (saveBtnText) saveBtnText.textContent = isEdit ? 'Save Changes' : 'Create Product';

    // Populate categories from Supabase
    if (categorySelect) {
      const categories = await window.RoyraDB.getCategories();
      categorySelect.innerHTML = categories.map(c => `<option value="${c.slug}">${c.name}</option>`).join('');
    }

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
      document.getElementById('input-collection').value = existingProduct.collection || 'everyday';

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
      if (skuInput && !skuInput.value) {
        skuInput.value = `ROY-${Math.floor(1000 + Math.random() * 9000)}`;
      }
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
          ${idx === primaryImageIndex ? `<span class="preview-badge-primary">PRIMARY</span>` : ''}
          <img src="${resolveAdminImageUrl(img.url)}" alt="Preview ${idx + 1}" />
          
          <div class="preview-actions">
            ${idx !== primaryImageIndex ? `
              <button type="button" class="preview-btn star" onclick="setPrimaryImage(${idx})" title="Set as primary image">★ Main</button>
            ` : '<span></span>'}
            
            <div style="display: flex; gap: 2px;">
              ${idx > 0 ? `<button type="button" class="preview-btn" onclick="moveImage(${idx}, -1)" title="Move left">←</button>` : ''}
              ${idx < productImages.length - 1 ? `<button type="button" class="preview-btn" onclick="moveImage(${idx}, 1)" title="Move right">→</button>` : ''}
              <button type="button" class="preview-btn delete" onclick="removeImage(${idx})" title="Delete image">✕</button>
            </div>
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
        const submitBtn = document.getElementById('btn-save-product');

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
          collection: document.getElementById('input-collection').value,
          image: mainImageUrl,
          secondImage: galleryUrls[1] || null,
          images: orderedImages,
          gallery: galleryUrls.length > 0 ? galleryUrls : [mainImageUrl]
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

})();
