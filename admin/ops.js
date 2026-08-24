(function(){
'use strict';
function esc(v){return String(v??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));}
function toast(m,t='success'){window.showAdminToast?window.showAdminToast(m,t):alert(m)}
function refreshIcons(){
  try {
    if (window.refreshLucideIcons) window.refreshLucideIcons();
    else if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') lucide.createIcons();
  } catch(e) {}
}

window.escAdmin = esc;

// Helper: Format INR currency
function formatINR(amount) {
  if (window.formatINR) return window.formatINR(amount);
  return '₹' + Number(amount || 0).toLocaleString('en-IN');
}

// Helper: Resolve image paths appropriately for admin and client views
function resolveAdminImg(url) {
  if (!url) return '../assets/products/roy-wh00829.webp';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  const inAdmin = window.location.pathname.includes('/admin');
  if (inAdmin) {
    if (url.startsWith('../')) return url;
    if (url.startsWith('/')) return '..' + url;
    return '../' + url;
  } else {
    if (url.startsWith('../')) return url.substring(3);
    return url;
  }
}

// Helper: Number to Indian Currency Words
function numberToWordsINR(num) {
  const n = Math.round(Number(num || 0));
  if (n === 0) return 'Zero Rupees Only';
  const a = ['','One ','Two ','Three ','Four ','Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  const b = ['', '', 'Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

  function inWords(val) {
    let str = '';
    if (val > 19) {
      str += b[Math.floor(val / 10)] + ' ' + a[val % 10];
    } else {
      str += a[val];
    }
    return str.trim();
  }

  let words = '';
  const crore = Math.floor(n / 10000000);
  let rem = n % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;
  const hundred = Math.floor(rem / 100);
  rem = rem % 100;

  if (crore > 0) words += inWords(crore) + ' Crore ';
  if (lakh > 0) words += inWords(lakh) + ' Lakh ';
  if (thousand > 0) words += inWords(thousand) + ' Thousand ';
  if (hundred > 0) words += inWords(hundred) + ' Hundred ';
  if (rem > 0) words += (words ? 'and ' : '') + inWords(rem) + ' ';

  return 'Rupees ' + words.trim() + ' Only';
}

// Helper: Parse and format address object into clean UI HTML (Never raw JSON)
function formatAddressBlock(addr, fallbackName = '', fallbackPhone = '') {
  if (!addr && !fallbackName && !fallbackPhone) {
    return '<div class="addr-empty" style="color:#888;font-style:italic">No address details provided</div>';
  }
  let obj = addr;
  if (typeof addr === 'string') {
    const trimmed = addr.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try { obj = JSON.parse(trimmed); } catch(e) { obj = { address: trimmed }; }
    } else {
      obj = { address: trimmed };
    }
  }
  if (!obj || typeof obj !== 'object') {
    obj = { address: String(addr || '') };
  }

  const name = obj.full_name || obj.name || obj.recipient_name || fallbackName || '';
  const phone = obj.phone || obj.mobile || obj.contact || fallbackPhone || '';
  const email = obj.email || '';
  const line1 = obj.address_line1 || obj.line1 || obj.address || obj.street || obj.house || '';
  const line2 = obj.address_line2 || obj.line2 || obj.landmark || obj.area || obj.locality || '';
  
  let cityStatePin = '';
  if (obj.city_state) {
    cityStatePin = obj.city_state + (obj.pincode || obj.pin || obj.postal_code || obj.zip ? ` – ${obj.pincode || obj.pin || obj.postal_code || obj.zip}` : '');
  } else {
    const parts = [];
    if (obj.city) parts.push(obj.city);
    if (obj.state) parts.push(obj.state);
    const joined = parts.join(', ');
    const pin = obj.pincode || obj.pin || obj.postal_code || obj.zip || '';
    cityStatePin = joined ? (pin ? `${joined} – ${pin}` : joined) : pin;
  }

  const country = obj.country || (line1 || cityStatePin ? 'India' : '');

  const lines = [];
  if (name) lines.push(`<div class="addr-line-name"><strong>${esc(name)}</strong></div>`);
  if (line1) lines.push(`<div class="addr-line">${esc(line1)}</div>`);
  if (line2) lines.push(`<div class="addr-line">${esc(line2)}</div>`);
  if (cityStatePin) lines.push(`<div class="addr-line">${esc(cityStatePin)}</div>`);
  if (country) lines.push(`<div class="addr-line addr-country">${esc(country)}</div>`);
  if (phone) lines.push(`<div class="addr-line addr-meta" style="margin-top:6px;font-size:12px;color:#555"><i data-lucide="phone" style="width:13px;height:13px;vertical-align:middle;display:inline-block;stroke:#888"></i> <span>${esc(phone)}</span></div>`);
  if (email && email !== obj.full_name) lines.push(`<div class="addr-line addr-meta" style="font-size:12px;color:#555"><i data-lucide="mail" style="width:13px;height:13px;vertical-align:middle;display:inline-block;stroke:#888"></i> <span>${esc(email)}</span></div>`);

  if (!lines.length) {
    return '<div class="addr-empty" style="color:#888;font-style:italic">No address details provided</div>';
  }
  return `<div class="addr-card-content">${lines.join('')}</div>`;
}

// Helper: Format Address for Print Document (Clean Structured Text)
function formatAddressForPrint(addr, fallbackName = '', fallbackPhone = '') {
  let obj = addr;
  if (typeof addr === 'string') {
    const trimmed = addr.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try { obj = JSON.parse(trimmed); } catch(e) { obj = { address: trimmed }; }
    } else {
      obj = { address: trimmed };
    }
  }
  if (!obj || typeof obj !== 'object') obj = { address: String(addr || '') };

  const name = obj.full_name || obj.name || obj.recipient_name || fallbackName || '';
  const phone = obj.phone || obj.mobile || obj.contact || fallbackPhone || '';
  const line1 = obj.address_line1 || obj.line1 || obj.address || obj.street || obj.house || '';
  const line2 = obj.address_line2 || obj.line2 || obj.landmark || obj.area || obj.locality || '';
  
  let cityStatePin = '';
  if (obj.city_state) {
    cityStatePin = obj.city_state + (obj.pincode || obj.pin || obj.postal_code || obj.zip ? ` – ${obj.pincode || obj.pin || obj.postal_code || obj.zip}` : '');
  } else {
    const parts = [];
    if (obj.city) parts.push(obj.city);
    if (obj.state) parts.push(obj.state);
    const joined = parts.join(', ');
    const pin = obj.pincode || obj.pin || obj.postal_code || obj.zip || '';
    cityStatePin = joined ? (pin ? `${joined} – ${pin}` : joined) : pin;
  }
  const country = obj.country || (line1 || cityStatePin ? 'India' : '');

  const items = [];
  if (name) items.push(`<strong>${esc(name)}</strong>`);
  if (line1) items.push(esc(line1));
  if (line2) items.push(esc(line2));
  if (cityStatePin) items.push(esc(cityStatePin));
  if (country) items.push(esc(country));
  if (phone) items.push(`Phone: ${esc(phone)}`);
  return items.join('<br>') || 'Address not specified';
}

// Helper: Enrich Order Item with master product catalog specifications
function enrichOrderItem(item, catalogProducts = []) {
  const match = catalogProducts.find(p =>
    (p.id && (String(p.id) === String(item.product_id) || String(p.id) === String(item.id))) ||
    (p.sku && item.sku && p.sku.toLowerCase() === item.sku.toLowerCase()) ||
    (p.name && item.product_name && p.name.toLowerCase() === item.product_name.toLowerCase())
  );

  const img = item.image || item.image_url || (match && (match.image_url || match.image || (match.gallery && match.gallery[0]))) || 'assets/products/roy-wh00829.webp';
  const category = item.category || (match && match.category) || 'Fine Jewellery';
  const metal = item.selected_metal || item.metal || (match && (match.material || match.metal)) || '18K Solid Gold / 925 Silver';
  const purity = item.purity || (match && match.purity) || (metal.includes('18K') ? '18K (750 BIS Hallmarked)' : (metal.includes('14K') ? '14K (585 BIS Hallmarked)' : 'BIS Hallmarked'));
  const stone = item.stone || item.stone_name || (match && (match.stone || match.stone_name || match.stone_type)) || 'Certified Gemstone / Moissanite';
  const design = item.design || item.product_type || (match && (match.productType || match.product_type)) || 'Artisanal Solitaire';
  const collection = item.collection || (match && match.collection) || 'Haute Atelier';
  const weight = item.weight || (match && match.weight) || '';
  const size = item.selected_size || item.size || '';

  return {
    ...item,
    image_resolved: resolveAdminImg(img),
    category,
    metal,
    purity,
    stone,
    design,
    collection,
    weight,
    size
  };
}

// Workflow steps sequence
const WORKFLOW_PIPELINE = [
  { key: 'Pending', label: 'Pending', icon: 'clock', desc: 'Order Placed' },
  { key: 'Confirmed', label: 'Confirmed', icon: 'check-circle-2', desc: 'Verified' },
  { key: 'Processing', label: 'Processing', icon: 'file-check', desc: 'Allocation' },
  { key: 'Production', label: 'Production', icon: 'sparkles', desc: 'Crafting' },
  { key: 'Ready', label: 'Ready', icon: 'package-check', desc: 'QC Passed' },
  { key: 'Shipped', label: 'Shipped', icon: 'truck', desc: 'In Transit' },
  { key: 'Delivered', label: 'Delivered', icon: 'gift', desc: 'Delivered' }
];

function getWorkflowStepIndex(status) {
  const s = (status || '').toLowerCase().trim();
  if (s.includes('cancel')) return -1;
  if (s.includes('return') || s.includes('refund')) return -2;
  if (s.includes('deliv')) return 6;
  if (s.includes('ship') || s.includes('transit') || s.includes('out for')) return 5;
  if (s.includes('ready') || s.includes('pack')) return 4;
  if (s.includes('product') || s.includes('craft')) return 3;
  if (s.includes('process')) return 2;
  if (s.includes('confirm') || s === 'paid') return 1;
  return 0; // pending
}

// Generate Printable Document and Invoke Native Print
window.printOrderSalesDocument = async function(id) {
  const o = await RoyraDB.getOrder(id);
  if (!o) {
    toast('Order could not be loaded for printing', 'error');
    return;
  }

  // Load catalog for enriched product specs
  let catalog = [];
  try {
    catalog = await RoyraDB.getProducts();
  } catch(e) {}
  if (!catalog || !catalog.length) {
    catalog = RoyraDB.getLocalProducts ? RoyraDB.getLocalProducts() : (window.ROYRA_PRODUCTS || []);
  }

  const enrichedItems = (o.order_items || []).map(i => enrichOrderItem(i, catalog));

  const itemsHtml = enrichedItems.map((item, idx) => `
    <tr>
      <td style="text-align:center">${idx + 1}</td>
      <td style="text-align:center">
        <img src="${esc(item.image_resolved)}" class="print-item-thumb" alt="${esc(item.product_name)}" onerror="this.src='../assets/products/product-01.jpg'">
      </td>
      <td>
        <div class="print-item-title">${esc(item.product_name)}</div>
        <div class="print-item-specs">
          ${item.metal ? `<span>Metal: ${esc(item.metal)}</span> • ` : ''}
          ${item.purity ? `<span>Purity: ${esc(item.purity)}</span> • ` : ''}
          ${item.stone ? `<span>Stone: ${esc(item.stone)}</span> • ` : ''}
          ${item.size ? `<span>Size: ${esc(item.size)}</span> • ` : ''}
          ${item.weight ? `<span>Weight: ${esc(item.weight)}</span>` : ''}
        </div>
      </td>
      <td><code>${esc(item.sku || ('SKU-' + (item.product_id || idx + 1)))}</code></td>
      <td style="text-align:center;font-weight:600">${item.quantity}</td>
      <td style="text-align:right">${formatINR(item.unit_price)}</td>
      <td style="text-align:right;font-weight:700">${formatINR(item.line_total)}</td>
    </tr>
  `).join('') || '<tr><td colspan="7" style="text-align:center;padding:12px;color:#777">No line items in order.</td></tr>';

  let printContainer = document.getElementById('royra-printable-order-container');
  if (!printContainer) {
    printContainer = document.createElement('div');
    printContainer.id = 'royra-printable-order-container';
    document.body.appendChild(printContainer);
  }

  printContainer.innerHTML = `
    <div class="royra-sales-order-print">
      <!-- Print Header with Royra Jewels Luxury Branding -->
      <div class="print-header">
        <div class="print-brand-left">
          <h1 class="print-logo">ROYRA JEWELS</h1>
          <div class="print-tagline">HAUTE JOAILLERIE & BESPOKE FINE JEWELLERY</div>
          <div class="print-company-details">
            Atelier Royra, Heritage Jewellery Quarter, Mumbai 400023, India<br>
            GSTIN: 27AABCR9842J1Z3 | BIS Hallmark Certificate #BIS-750-MH<br>
            Tel: +91 98201 54321 | Email: concierge@royrajewels.com | www.royrajewels.com
          </div>
        </div>
        <div class="print-meta-right">
          <div class="print-doc-badge">SALES ORDER / TAX INVOICE</div>
          <table class="print-meta-table">
            <tr><th>Order Number:</th><td><strong>${esc(o.order_number)}</strong></td></tr>
            <tr><th>Order Date:</th><td>${new Date(o.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</td></tr>
            <tr><th>Payment Method:</th><td>${esc(o.payment_method || 'Online UPI')}</td></tr>
            <tr><th>Payment Status:</th><td><strong>${esc(o.payment_status || 'Pending')}</strong></td></tr>
            <tr><th>Order Status:</th><td><strong style="color:#9f7d4d">${esc(o.order_status || 'Processing')}</strong></td></tr>
          </table>
        </div>
      </div>

      <!-- Address Row (Billed To & Shipped To) -->
      <div class="print-address-row">
        <div class="print-address-col">
          <div class="print-col-title">BILLED TO (CUSTOMER DETAILS)</div>
          <div class="print-address-content">
            ${formatAddressForPrint(o.billing_address || o.shipping_address, o.customer_name, o.customer_phone)}
            <div style="margin-top:4px">Email: ${esc(o.customer_email)}</div>
          </div>
        </div>
        <div class="print-address-col">
          <div class="print-col-title">SHIPPED TO (DELIVERY DESTINATION)</div>
          <div class="print-address-content">
            ${formatAddressForPrint(o.shipping_address, o.customer_name, o.customer_phone)}
          </div>
        </div>
      </div>

      <!-- Line Items Table -->
      <div class="print-section-title">ORDERED ITEMS & JEWELLERY SPECIFICATIONS</div>
      <table class="print-items-table">
        <thead>
          <tr>
            <th style="width:30px;text-align:center">#</th>
            <th style="width:50px;text-align:center">Photo</th>
            <th>Product Description & Specifications</th>
            <th style="width:110px">SKU</th>
            <th style="width:40px;text-align:center">Qty</th>
            <th style="width:90px;text-align:right">Unit Price</th>
            <th style="width:100px;text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Totals & Words -->
      <div class="print-totals-container">
        <div class="print-words-box">
          <div style="font-size:10px;font-weight:700;color:#666;text-transform:uppercase;margin-bottom:4px">Amount in Words:</div>
          <div style="font-size:12px;font-weight:600;color:#111">${numberToWordsINR(o.total_amount)}</div>
          
          ${o.notes ? `
            <div style="margin-top:12px;padding-top:8px;border-top:1px dashed #ccc">
              <div style="font-size:10px;font-weight:700;color:#666;text-transform:uppercase;margin-bottom:2px">Order Notes / Instructions:</div>
              <div style="font-size:11px;color:#333;font-style:italic">${esc(o.notes)}</div>
            </div>
          ` : ''}
        </div>

        <table class="print-totals-table">
          <tr>
            <td>Subtotal:</td>
            <td style="text-align:right">${formatINR(o.subtotal || o.total_amount)}</td>
          </tr>
          ${o.discount_total > 0 ? `
            <tr>
              <td>Discount ${o.coupon_code ? `(${esc(o.coupon_code)})` : ''}:</td>
              <td style="text-align:right;color:#a83232">-${formatINR(o.discount_total)}</td>
            </tr>
          ` : ''}
          <tr>
            <td>Insured Priority Delivery:</td>
            <td style="text-align:right">${o.shipping_amount > 0 ? formatINR(o.shipping_amount) : 'FREE (Insured Transit)'}</td>
          </tr>
          <tr>
            <td>GST (3% Jewellery Tax):</td>
            <td style="text-align:right">${formatINR(o.tax_amount || Math.round((o.subtotal || o.total_amount) * 0.03))}</td>
          </tr>
          <tr class="grand-total-row">
            <td><strong>Grand Total:</strong></td>
            <td style="text-align:right"><strong>${formatINR(o.total_amount)}</strong></td>
          </tr>
        </table>
      </div>

      <!-- Authenticity Guarantee -->
      <div class="print-declaration">
        <div class="print-decl-title">AUTHENTICITY & WARRANTY GUARANTEE</div>
        <p>1. All Gold jewellery is 100% BIS Hallmarked (916 / 750 purity). Certified Diamonds & Moissanites are tested for quality and cut excellence.</p>
        <p>2. This order is covered by Royra Jewels Tamper-Proof Insured Transit & Lifetime Complimentary Cleaning/Polishing Service.</p>
      </div>

      <!-- Signatures -->
      <div class="print-signature-row">
        <div class="print-sig-col">
          <div class="print-sig-line"></div>
          <div style="font-size:10px;color:#555">Customer Acknowledgment / Signature</div>
        </div>
        <div class="print-sig-col" style="text-align:right">
          <div class="print-sig-line" style="margin-left:auto"></div>
          <div style="font-size:11px;font-weight:700;color:#111">For ROYRA JEWELS PRIVATE LIMITED</div>
          <div style="font-size:10px;color:#555">Authorized Atelier Signatory</div>
        </div>
      </div>
    </div>
  `;

  // Trigger print
  window.print();
};

window.initOrdersPage = async function(){
  const tbody = document.querySelector('#orders-tbody');
  const search = document.querySelector('#orders-search');
  const status = document.querySelector('#orders-status');
  const pay = document.querySelector('#orders-payment');

  async function load(){
    const rows = await RoyraDB.getOrders({
      search: search?.value || '',
      status: status?.value || 'all',
      paymentStatus: pay?.value || 'all'
    });
    if (!tbody) return;
    tbody.innerHTML = rows.length ? rows.map(o => `
      <tr>
        <td>
          <strong>${esc(o.order_number)}</strong><br>
          <small style="color:#666">${new Date(o.created_at).toLocaleString('en-IN')}</small>
        </td>
        <td>
          <strong>${esc(o.customer_name)}</strong><br>
          <small style="color:#666">${esc(o.customer_email)}</small>
        </td>
        <td><strong>${formatINR(o.total_amount)}</strong></td>
        <td><span class="status-badge ${o.payment_status.toLowerCase().replace(/\s+/g,'-')}">${esc(o.payment_status)}</span></td>
        <td>
          <select data-order="${o.id}" class="ops-inline-status">
            ${['Pending Payment','Confirmed','Processing','Production','Ready','Packed','Shipped','Out for Delivery','Delivered','Cancelled','Return Requested','Returned','Refund Pending','Refunded'].map(s => `<option ${s === o.order_status ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>
        <td>
          <div class="action-buttons-group">
            <button type="button" class="btn-action" onclick="viewOrder(${o.id})"><i data-lucide="eye"></i> View</button>
            <button type="button" class="btn-action edit" onclick="markPaid(${o.id})"><i data-lucide="check-circle-2"></i> Mark Paid</button>
          </div>
        </td>
      </tr>
    `).join('') : '<tr><td colspan="6" style="padding:40px;text-align:center;color:#777">No orders found.</td></tr>';

    refreshIcons();

    document.querySelectorAll('.ops-inline-status').forEach(el => {
      el.onchange = async () => {
        const r = await RoyraDB.updateOrderStatus(el.dataset.order, el.value, 'Updated from Admin Quick Selector');
        toast(r.success ? 'Order status updated' : r.error, r.success ? 'success' : 'error');
      };
    });
  }

  search?.addEventListener('input', load);
  status?.addEventListener('change', load);
  pay?.addEventListener('change', load);
  window.reloadOrders = load;
  await load();
};

// Centralized, idempotent Order Modal Close Controller
window.closeOrderModal = function() {
  const modal = document.getElementById('ops-order-modal');
  if (modal) {
    modal.classList.remove('open');
    modal.remove();
  }
  document.body.classList.remove('ops-modal-open', 'modal-open');
  document.body.style.overflow = '';
  if (window._orderModalEscHandler) {
    document.removeEventListener('keydown', window._orderModalEscHandler);
    window._orderModalEscHandler = null;
  }
};
window.closeOpsOrderModal = window.closeOrderModal;

// Global event delegation for modal closing (attached exactly once)
if (!window._orderModalDelegationAttached) {
  window._orderModalDelegationAttached = true;
  document.addEventListener('click', function(e) {
    const closeBtn = e.target.closest && e.target.closest('.ops-close, #ops-order-modal-close, [data-close-order-modal], .btn-order-modal-close');
    if (closeBtn && document.getElementById('ops-order-modal')) {
      e.preventDefault();
      e.stopPropagation();
      window.closeOrderModal();
      return;
    }
    const modalEl = document.getElementById('ops-order-modal');
    if (modalEl && e.target === modalEl) {
      e.preventDefault();
      e.stopPropagation();
      window.closeOrderModal();
    }
  }, true);
}

window.viewOrder = async function(id){
  const o = await RoyraDB.getOrder(id);
  if (!o) {
    toast('Order could not be loaded', 'error');
    return;
  }

  // Load catalog for enriched specifications
  let catalog = [];
  try {
    catalog = await RoyraDB.getProducts();
  } catch(e) {}
  if (!catalog || !catalog.length) {
    catalog = RoyraDB.getLocalProducts ? RoyraDB.getLocalProducts() : (window.ROYRA_PRODUCTS || []);
  }

  const enrichedItems = (o.order_items || []).map(i => enrichOrderItem(i, catalog));
  const currentStepIdx = getWorkflowStepIndex(o.order_status);

  // Workflow Next Action Button Logic
  let nextActionBtnHtml = '';
  if (currentStepIdx === 0) {
    nextActionBtnHtml = `<button type="button" class="btn-advance-status" onclick="advanceOrderStatus(${o.id}, 'Confirmed', 'Order confirmed by Admin')"><i data-lucide="check-circle-2"></i> Confirm Order</button>`;
  } else if (currentStepIdx === 1) {
    nextActionBtnHtml = `<button type="button" class="btn-advance-status" onclick="advanceOrderStatus(${o.id}, 'Processing', 'Order assigned for processing and allocation')"><i data-lucide="file-check"></i> Move to Processing</button>`;
  } else if (currentStepIdx === 2) {
    nextActionBtnHtml = `<button type="button" class="btn-advance-status" onclick="advanceOrderStatus(${o.id}, 'Production', 'Materials issued to goldsmith atelier for production')"><i data-lucide="hammer"></i> Send to Production Atelier</button>`;
  } else if (currentStepIdx === 3) {
    nextActionBtnHtml = `<button type="button" class="btn-advance-status" onclick="advanceOrderStatus(${o.id}, 'Ready', 'Crafting and Quality Check passed, ready for dispatch')"><i data-lucide="package-check"></i> Mark Ready for Dispatch</button>`;
  } else if (currentStepIdx === 4) {
    nextActionBtnHtml = `<button type="button" class="btn-advance-status" onclick="advanceOrderStatus(${o.id}, 'Shipped', 'Handed over to insured courier partner')"><i data-lucide="truck"></i> Mark Shipped / Dispatched</button>`;
  } else if (currentStepIdx === 5) {
    nextActionBtnHtml = `<button type="button" class="btn-advance-status" onclick="advanceOrderStatus(${o.id}, 'Delivered', 'Delivered successfully to customer')"><i data-lucide="gift"></i> Mark as Delivered</button>`;
  }

  const itemsRows = enrichedItems.map(i => `
    <tr>
      <td>
        <div class="ops-product-row">
          <img src="${esc(i.image_resolved)}" class="ops-product-thumb" alt="${esc(i.product_name)}" onerror="this.src='../assets/products/product-01.jpg'">
          <div class="ops-product-info">
            <div class="ops-product-title">${esc(i.product_name)}</div>
            <div class="ops-product-sku"><code>${esc(i.sku || ('SKU-' + (i.product_id || i.id)))}</code></div>
            <div class="ops-spec-chips">
              ${i.metal ? `<span class="spec-chip metal"><i data-lucide="gem"></i> ${esc(i.metal)}</span>` : ''}
              ${i.purity ? `<span class="spec-chip purity"><i data-lucide="award"></i> ${esc(i.purity)}</span>` : ''}
              ${i.stone ? `<span class="spec-chip stone"><i data-lucide="sparkles"></i> ${esc(i.stone)}</span>` : ''}
              ${i.category ? `<span class="spec-chip cat"><i data-lucide="tag"></i> ${esc(i.category)}</span>` : ''}
              ${i.design ? `<span class="spec-chip design">${esc(i.design)}</span>` : ''}
              ${i.size ? `<span class="spec-chip size">Size: ${esc(i.size)}</span>` : ''}
              ${i.weight ? `<span class="spec-chip weight">${esc(i.weight)}</span>` : ''}
            </div>
          </div>
        </div>
      </td>
      <td style="text-align:center;font-weight:600">x${i.quantity}</td>
      <td style="text-align:right">${formatINR(i.unit_price)}</td>
      <td style="text-align:right"><strong>${formatINR(i.line_total)}</strong></td>
    </tr>
  `).join('') || '<tr><td colspan="4" style="color:#777;padding:20px;text-align:center">No ordered items found</td></tr>';

  // Stepper Visual Nodes
  const stepperHtml = WORKFLOW_PIPELINE.map((step, idx) => {
    let stepClass = '';
    let iconName = step.icon;
    if (currentStepIdx >= 0) {
      if (idx < currentStepIdx) {
        stepClass = 'completed';
        iconName = 'check';
      } else if (idx === currentStepIdx) {
        stepClass = 'active';
      }
    }
    return `
      <div class="stepper-step ${stepClass}" title="${step.desc}">
        <div class="stepper-circle">
          <i data-lucide="${iconName}" style="width:16px;height:16px"></i>
        </div>
        <div class="stepper-label">${step.label}</div>
      </div>
    `;
  }).join('');

  const modalHtml = `
    <div class="ops-modal open" id="ops-order-modal" role="dialog" aria-modal="true" aria-labelledby="ops-order-title-${o.id}">
      <div class="ops-modal-card" id="ops-order-modal-card">
        <button type="button" class="ops-close" id="ops-order-modal-close" aria-label="Close Order Details" title="Close (Esc)" onclick="window.closeOrderModal()"><i data-lucide="x"></i></button>
        
        <!-- Header with Title and Print Button -->
        <div class="ops-order-header">
          <div class="ops-order-header-left">
            <div class="ops-order-icon-badge">
              <i data-lucide="shopping-bag" style="width:24px;height:24px"></i>
            </div>
            <div>
              <h2 class="ops-order-title" id="ops-order-title-${o.id}">${esc(o.order_number)}</h2>
              <div class="ops-order-meta-sub">
                <span><i data-lucide="calendar" style="width:14px;height:14px"></i> ${new Date(o.created_at).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
                <span><i data-lucide="user" style="width:14px;height:14px"></i> ${esc(o.customer_name)}</span>
                <span><i data-lucide="mail" style="width:14px;height:14px"></i> ${esc(o.customer_email)}</span>
                ${o.customer_phone ? `<span><i data-lucide="phone" style="width:14px;height:14px"></i> ${esc(o.customer_phone)}</span>` : ''}
              </div>
            </div>
          </div>
          
          <div class="ops-order-actions-top">
            <button type="button" class="btn-print-order" onclick="printOrderSalesDocument(${o.id})">
              <i data-lucide="printer"></i> Print Order / Sales Order
            </button>
          </div>
        </div>

        <!-- KPI Grid -->
        <div class="ops-grid">
          <div>
            <b>Grand Total</b>
            <div class="val" style="color:#9f7d4d">${formatINR(o.total_amount)}</div>
          </div>
          <div>
            <b>Payment Status</b>
            <div class="val">
              <span class="status-badge ${o.payment_status.toLowerCase().replace(/\s+/g,'-')}">${esc(o.payment_status)}</span>
              ${o.payment_status !== 'Paid' ? `<button type="button" style="margin-left:6px;font-size:11px;padding:3px 7px;border:1px solid #c5a880;background:#fff;color:#9f7d4d;border-radius:4px;cursor:pointer" onclick="markPaid(${o.id})">Mark Paid</button>` : ''}
            </div>
          </div>
          <div>
            <b>Order Stage</b>
            <div class="val"><strong style="color:#111">${esc(o.order_status)}</strong></div>
          </div>
          <div>
            <b>Payment Method</b>
            <div class="val" style="font-size:14px">${esc(o.payment_method || 'Online UPI')}</div>
          </div>
        </div>

        <!-- ERP Workflow Pipeline Stepper -->
        <div class="ops-workflow-box">
          <div class="ops-workflow-title-row">
            <h4 class="ops-workflow-title">
              <i data-lucide="git-commit" style="width:18px;height:18px;color:#9f7d4d"></i>
              ERP Order Processing Workflow
            </h4>
            <div style="font-size:12px;color:#666">
              Current Stage: <strong style="color:#9f7d4d">${esc(o.order_status)}</strong>
            </div>
          </div>

          <div class="ops-stepper">
            ${stepperHtml}
          </div>

          <!-- Workflow Controls Bar -->
          <div class="ops-workflow-controls">
            ${nextActionBtnHtml}

            <div style="display:flex;align-items:center;gap:6px;margin-left:auto;flex-wrap:wrap">
              <span style="font-size:12px;font-weight:600;color:#555">Change Stage:</span>
              <select id="modal-status-select-${o.id}" style="padding:6px 10px;font-size:12px;border:1px solid #d5cfc5;border-radius:5px;background:#fff">
                ${['Pending Payment','Confirmed','Processing','Production','Ready','Packed','Shipped','Out for Delivery','Delivered','Cancelled','Return Requested','Returned','Refund Pending','Refunded'].map(s => `<option value="${s}" ${s === o.order_status ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
              <input type="text" id="modal-status-note-${o.id}" placeholder="Optional status note..." style="padding:6px 10px;font-size:12px;border:1px solid #d5cfc5;border-radius:5px;width:180px;background:#fff">
              <button type="button" class="btn-action edit" onclick="saveCustomOrderStatus(${o.id})"><i data-lucide="check"></i> Update</button>
              ${o.order_status !== 'Cancelled' ? `<button type="button" class="btn-cancel-status" onclick="advanceOrderStatus(${o.id}, 'Cancelled', 'Cancelled via Admin Panel')"><i data-lucide="x-circle"></i> Cancel Order</button>` : ''}
            </div>
          </div>
        </div>

        <!-- Formatted Address Section (No raw JSON) -->
        <div class="ops-addresses-grid">
          <div class="addr-card">
            <div class="addr-card-header">
              <i data-lucide="credit-card"></i>
              <span>Billing Address</span>
            </div>
            ${formatAddressBlock(o.billing_address || o.shipping_address, o.customer_name, o.customer_phone)}
          </div>
          <div class="addr-card">
            <div class="addr-card-header">
              <i data-lucide="map-pin"></i>
              <span>Shipping & Delivery Destination</span>
            </div>
            ${formatAddressBlock(o.shipping_address, o.customer_name, o.customer_phone)}
          </div>
        </div>

        <!-- Ordered Items Table with Complete Specs and Thumbnails -->
        <h3 style="display:flex;align-items:center;gap:8px;margin:22px 0 12px 0;font-size:16px">
          <i data-lucide="package" style="width:18px;height:18px;color:#9f7d4d"></i>
          Ordered Items & Specifications (${enrichedItems.length})
        </h3>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Jewellery Item & Specifications</th>
              <th style="width:70px;text-align:center">Qty</th>
              <th style="width:110px;text-align:right">Unit Price</th>
              <th style="width:120px;text-align:right">Line Total</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>

        <!-- Order Summary & Notes Box -->
        <div class="ops-summary-box">
          <div class="ops-notes-panel">
            <b>Order Notes & Instructions:</b>
            <div style="font-size:13px;color:#444;background:#fff;padding:12px;border:1px solid #e7e3dd;border-radius:6px;min-height:50px">
              ${o.notes ? esc(o.notes) : '<span style="color:#888;font-style:italic">No special customer notes provided.</span>'}
            </div>
            ${o.payment_reference ? `
              <div style="margin-top:10px;font-size:12px;color:#666">
                <strong>Payment Ref / UTR:</strong> <code>${esc(o.payment_reference)}</code>
              </div>
            ` : ''}
          </div>

          <div class="ops-totals-table">
            <table>
              <tr>
                <td>Subtotal:</td>
                <td style="text-align:right;font-weight:600">${formatINR(o.subtotal || o.total_amount)}</td>
              </tr>
              ${o.discount_total > 0 ? `
                <tr>
                  <td>Discount ${o.coupon_code ? `(${esc(o.coupon_code)})` : ''}:</td>
                  <td style="text-align:right;color:#a83232;font-weight:600">-${formatINR(o.discount_total)}</td>
                </tr>
              ` : ''}
              <tr>
                <td>Insured Delivery:</td>
                <td style="text-align:right">${o.shipping_amount > 0 ? formatINR(o.shipping_amount) : '<span style="color:#2e7d32;font-weight:600">FREE</span>'}</td>
              </tr>
              <tr>
                <td>GST (3% Jewellery Tax):</td>
                <td style="text-align:right">${formatINR(o.tax_amount || Math.round((o.subtotal || o.total_amount) * 0.03))}</td>
              </tr>
              <tr class="total-row">
                <td>Grand Total:</td>
                <td style="text-align:right;color:#9f7d4d">${formatINR(o.total_amount)}</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Status History Log -->
        <h3 style="display:flex;align-items:center;gap:8px;margin:22px 0 12px 0;font-size:15px">
          <i data-lucide="clock" style="width:16px;height:16px;color:#9f7d4d"></i>
          Order Timeline & Audit History
        </h3>
        <div style="background:#fff;border:1px solid #e7e3dd;border-radius:8px;padding:12px">
          ${(o.order_status_history || []).sort((a,b) => new Date(a.created_at) - new Date(b.created_at)).map(h => `
            <div class="ops-history">
              <div><strong style="color:#9f7d4d">${esc(h.status)}</strong></div>
              <div style="color:#777">${new Date(h.created_at).toLocaleString('en-IN')}</div>
              <div style="color:#444">${esc(h.note || 'Status recorded')}</div>
            </div>
          `).join('') || '<p style="color:#777;margin:4px 0">No previous status history logged.</p>'}
        </div>

        <!-- Modal Footer Actions -->
        <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:24px;padding-top:16px;border-top:1px solid #e7e3dd">
          <button type="button" class="btn-action btn-order-modal-close" style="padding:9px 20px;font-size:13px;font-weight:600;cursor:pointer" onclick="window.closeOrderModal()">Close</button>
        </div>

      </div>
    </div>
  `;

  // Remove existing modal if any and cleanup
  const existing = document.getElementById('ops-order-modal');
  if (existing) existing.remove();
  if (window._orderModalEscHandler) {
    document.removeEventListener('keydown', window._orderModalEscHandler);
    window._orderModalEscHandler = null;
  }

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  document.body.classList.add('ops-modal-open');
  document.body.style.overflow = 'hidden';

  const modalEl = document.getElementById('ops-order-modal');
  const closeBtn = document.getElementById('ops-order-modal-close');

  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.closeOrderModal();
    });
  }

  if (modalEl) {
    modalEl.addEventListener('click', function(e) {
      if (e.target === modalEl) {
        e.preventDefault();
        e.stopPropagation();
        window.closeOrderModal();
      }
    });
  }

  // Register Escape key listener
  window._orderModalEscHandler = function(e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
      e.preventDefault();
      window.closeOrderModal();
    }
  };
  document.addEventListener('keydown', window._orderModalEscHandler);

  refreshIcons();
};

window.advanceOrderStatus = async function(id, nextStatus, note = '') {
  const r = await RoyraDB.updateOrderStatus(id, nextStatus, note);
  toast(r.success ? `Order status advanced to ${nextStatus}` : r.error, r.success ? 'success' : 'error');
  if (r.success) {
    if (window.reloadOrders) window.reloadOrders();
    window.viewOrder(id);
  }
};

window.saveCustomOrderStatus = async function(id) {
  const selectEl = document.getElementById(`modal-status-select-${id}`);
  const noteEl = document.getElementById(`modal-status-note-${id}`);
  if (!selectEl) return;
  const status = selectEl.value;
  const note = noteEl ? noteEl.value.trim() : '';
  const r = await RoyraDB.updateOrderStatus(id, status, note || 'Manual status change from order details');
  toast(r.success ? `Order updated to ${status}` : r.error, r.success ? 'success' : 'error');
  if (r.success) {
    if (window.reloadOrders) window.reloadOrders();
    window.viewOrder(id);
  }
};

window.markPaid = async function(id){
  const ref = prompt('Enter payment transaction ID / UPI UTR reference (optional):') || '';
  const r = await RoyraDB.updatePaymentStatus(id, 'Paid', ref);
  toast(r.success ? 'Payment marked Paid' : r.error, r.success ? 'success' : 'error');
  if (r.success) {
    if (window.reloadOrders) window.reloadOrders();
    const modal = document.getElementById('ops-order-modal');
    if (modal) window.viewOrder(id);
  }
};

window.initCouponsPage = async function(){
  const tbody = document.querySelector('#coupons-tbody');
  const form = document.querySelector('#coupon-form');
  const load = async () => {
    const rows = await RoyraDB.getCoupons();
    if (!tbody) return;
    tbody.innerHTML = rows.length ? rows.map(c => `
      <tr>
        <td><strong>${esc(c.code)}</strong></td>
        <td>${esc(c.discount_type)}</td>
        <td>${c.discount_type === 'percentage' ? c.discount_value + '%' : c.discount_type === 'fixed' ? formatINR(c.discount_value) : 'Free Shipping'}</td>
        <td>${c.minimum_order_value ? formatINR(c.minimum_order_value) : '—'}</td>
        <td><span class="status-badge ${c.active ? 'active' : 'draft'}">${c.active ? 'Active' : 'Inactive'}</span></td>
        <td>
          <div class="action-buttons-group">
            <button type="button" class="btn-action edit" onclick='editCoupon(${JSON.stringify(c)})'><i data-lucide="edit-2"></i> Edit</button>
            <button type="button" class="btn-action delete" onclick='deleteCoupon(${JSON.stringify(c.id)})'><i data-lucide="trash-2"></i> Delete</button>
          </div>
        </td>
      </tr>
    `).join('') : '<tr><td colspan="6" style="padding:40px;text-align:center;color:#777">No coupons yet.</td></tr>';
    refreshIcons();
  };

  window.reloadCoupons = load;
  await load();

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(form);
    const row = Object.fromEntries(fd.entries());
    row.discount_value = Number(row.discount_value || 0);
    row.minimum_order_value = Number(row.minimum_order_value || 0);
    row.maximum_discount = row.maximum_discount ? Number(row.maximum_discount) : null;
    row.usage_limit = row.usage_limit ? Number(row.usage_limit) : null;
    row.per_customer_limit = row.per_customer_limit ? Number(row.per_customer_limit) : null;
    row.active = fd.get('active') === 'on';
    const r = await RoyraDB.saveCoupon(row);
    toast(r.success ? 'Coupon saved' : r.error, r.success ? 'success' : 'error');
    if (r.success) {
      form.reset();
      load();
    }
  });
};

window.editCoupon = function(c){
  const f = document.querySelector('#coupon-form');
  for (const k of ['id','code','description','discount_type','discount_value','minimum_order_value','maximum_discount','usage_limit','per_customer_limit','starts_at','expires_at','applicable_category']) {
    const el = f?.elements.namedItem(k);
    if (el) el.value = c[k] || '';
  }
  if (f?.elements.namedItem('active')) f.elements.namedItem('active').checked = !!c.active;
  scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteCoupon = async function(id){
  if (!confirm('Delete coupon?')) return;
  const r = await RoyraDB.deleteCoupon(id);
  toast(r.success ? 'Coupon deleted' : r.error, r.success ? 'success' : 'error');
  if (r.success && window.reloadCoupons) window.reloadCoupons();
};

window.initOffersPage = async function(){
  const tbody = document.querySelector('#offers-tbody');
  const form = document.querySelector('#offer-form');
  const load = async () => {
    const rows = await RoyraDB.getOffers();
    if (!tbody) return;
    tbody.innerHTML = rows.length ? rows.map(o => `
      <tr>
        <td><strong>${esc(o.name)}</strong><br><small style="color:#666">${esc(o.description || '')}</small></td>
        <td>${esc(o.offer_type)}</td>
        <td>${o.offer_type === 'percentage' ? o.discount_value + '%' : o.offer_type === 'fixed' ? formatINR(o.discount_value) : 'Free Shipping'}</td>
        <td>${o.priority}</td>
        <td><span class="status-badge ${o.active ? 'active' : 'draft'}">${o.active ? 'Active' : 'Inactive'}</span></td>
        <td>
          <div class="action-buttons-group">
            <button type="button" class="btn-action edit" onclick='editOffer(${JSON.stringify(o)})'><i data-lucide="edit-2"></i> Edit</button>
            <button type="button" class="btn-action delete" onclick='deleteOffer(${o.id})'><i data-lucide="trash-2"></i> Delete</button>
          </div>
        </td>
      </tr>
    `).join('') : '<tr><td colspan="6" style="padding:40px;text-align:center;color:#777">No offers yet.</td></tr>';
    refreshIcons();
  };

  window.reloadOffers = load;
  await load();

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(form);
    const row = Object.fromEntries(fd.entries());
    ['discount_value','minimum_order_value','minimum_quantity','priority'].forEach(k => row[k] = Number(row[k] || 0));
    row.active = fd.get('active') === 'on';
    const r = await RoyraDB.saveOffer(row);
    toast(r.success ? 'Offer saved' : r.error, r.success ? 'success' : 'error');
    if (r.success) {
      form.reset();
      load();
    }
  });
};

window.editOffer = function(o){
  const f = document.querySelector('#offer-form');
  for (const k of ['id','name','description','offer_type','discount_value','minimum_order_value','minimum_quantity','applicable_category','priority','starts_at','expires_at']) {
    const el = f?.elements.namedItem(k);
    if (el) el.value = o[k] || '';
  }
  if (f?.elements.namedItem('active')) f.elements.namedItem('active').checked = !!o.active;
  scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteOffer = async function(id){
  if (!confirm('Delete offer?')) return;
  const r = await RoyraDB.deleteOffer(id);
  toast(r.success ? 'Offer deleted' : r.error, r.success ? 'success' : 'error');
  if (r.success && window.reloadOffers) window.reloadOffers();
};

window.initInventoryPage = async function(){
  const tbody = document.querySelector('#inventory-tbody');
  const search = document.querySelector('#inventory-search');
  async function load(){
    let rows = await RoyraDB.getInventory();
    if (search?.value) rows = rows.filter(x => `${x.name} ${x.sku}`.toLowerCase().includes(search.value.toLowerCase()));
    if (!tbody) return;
    tbody.innerHTML = rows.map(p => `
      <tr>
        <td><strong>${esc(p.name)}</strong><br><small style="color:#666">${esc(p.sku)}</small></td>
        <td>${esc(p.category)}</td>
        <td><strong>${p.stock_quantity}</strong></td>
        <td>${p.low_stock_alert}</td>
        <td><span class="status-badge ${p.stock_quantity <= 0 ? 'out-of-stock' : p.stock_quantity <= p.low_stock_alert ? 'draft' : 'active'}">${p.stock_quantity <= 0 ? 'Out of Stock' : p.stock_quantity <= p.low_stock_alert ? 'Low Stock' : 'In Stock'}</span></td>
        <td>
          <div class="action-buttons-group">
            <button type="button" class="btn-action" onclick="adjustInventory(${p.id},1)"><i data-lucide="plus"></i> 1</button>
            <button type="button" class="btn-action" onclick="adjustInventory(${p.id},-1)"><i data-lucide="minus"></i> 1</button>
          </div>
        </td>
      </tr>
    `).join('');
    refreshIcons();
  }
  window.reloadInventory = load;
  search?.addEventListener('input', load);
  await load();
};

window.adjustInventory = async function(id, delta){
  const reason = prompt('Reason for stock adjustment?') || 'Manual adjustment';
  const r = await RoyraDB.adjustStock(id, delta, reason);
  toast(r.success ? `Stock updated: ${r.stock}` : r.error, r.success ? 'success' : 'error');
  if (r.success && window.reloadInventory) window.reloadInventory();
};

window.initPaymentsPage = async function(){
  const tb = document.querySelector('#payments-tbody');
  const rows = await RoyraDB.getPayments();
  if (!tb) return;
  tb.innerHTML = rows.length ? rows.map(p => `
    <tr>
      <td><strong>${esc(p.orders?.order_number || '—')}</strong></td>
      <td>${esc(p.orders?.customer_name || '—')}</td>
      <td><strong>${formatINR(p.amount)}</strong></td>
      <td>${esc(p.payment_method)}</td>
      <td><span class="status-badge ${String(p.status).toLowerCase()}">${esc(p.status)}</span></td>
      <td><code>${esc(p.transaction_id || '—')}</code></td>
      <td>${new Date(p.created_at).toLocaleString('en-IN')}</td>
    </tr>
  `).join('') : '<tr><td colspan="7" style="padding:40px;text-align:center;color:#777">No payment records.</td></tr>';
  refreshIcons();
};

window.initReturnsPage = async function(){
  const tb = document.querySelector('#returns-tbody');
  const rows = await RoyraDB.getReturns();
  if (!tb) return;
  tb.innerHTML = rows.length ? rows.map(r => `
    <tr>
      <td><strong>#${r.id}</strong></td>
      <td>${esc(r.orders?.order_number || '—')}</td>
      <td>${esc(r.orders?.customer_name || '—')}</td>
      <td>${esc(r.reason || '—')}</td>
      <td><span class="status-badge ${String(r.status).toLowerCase()}">${esc(r.status)}</span></td>
      <td>${new Date(r.created_at).toLocaleString('en-IN')}</td>
    </tr>
  `).join('') : '<tr><td colspan="6" style="padding:40px;text-align:center;color:#777">No returns.</td></tr>';
  refreshIcons();
};

window.initRefundsPage = async function(){
  const tb = document.querySelector('#refunds-tbody');
  const rows = await RoyraDB.getRefunds();
  if (!tb) return;
  tb.innerHTML = rows.length ? rows.map(r => `
    <tr>
      <td><strong>#${r.id}</strong></td>
      <td>${esc(r.orders?.order_number || '—')}</td>
      <td>${esc(r.orders?.customer_name || '—')}</td>
      <td><strong>${formatINR(r.amount)}</strong></td>
      <td><span class="status-badge ${String(r.status).toLowerCase()}">${esc(r.status)}</span></td>
      <td>${esc(r.reason || '—')}</td>
    </tr>
  `).join('') : '<tr><td colspan="6" style="padding:40px;text-align:center;color:#777">No refunds.</td></tr>';
  refreshIcons();
};

window.initShippingPage = async function(){
  const tb = document.querySelector('#shipping-tbody');
  const rows = await RoyraDB.getShipments();
  if (!tb) return;
  tb.innerHTML = rows.length ? rows.map(s => `
    <tr>
      <td><strong>${esc(s.orders?.order_number || '—')}</strong></td>
      <td>${esc(s.orders?.customer_name || '—')}</td>
      <td>${esc(s.shipping_method || 'Standard Delivery')}</td>
      <td>${esc(s.courier || '—')}</td>
      <td><code>${esc(s.tracking_number || '—')}</code></td>
      <td><span class="status-badge ${String(s.status).toLowerCase()}">${esc(s.status || 'Pending')}</span></td>
    </tr>
  `).join('') : '<tr><td colspan="6" style="padding:40px;text-align:center;color:#777">No shipments.</td></tr>';
  refreshIcons();
};

window.initCustomersPage = async function(){
  const tb = document.querySelector('#customers-tbody');
  const rows = await RoyraDB.getCustomersFromOrders();
  if (!tb) return;
  tb.innerHTML = rows.length ? rows.map(c => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <i data-lucide="user" style="width:15px;height:15px;stroke:#888"></i>
          <strong>${esc(c.name)}</strong>
        </div>
      </td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <i data-lucide="mail" style="width:14px;height:14px;stroke:#888"></i>
          <span>${esc(c.email)}</span>
        </div>
      </td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <i data-lucide="phone" style="width:14px;height:14px;stroke:#888"></i>
          <span>${esc(c.phone || '—')}</span>
        </div>
      </td>
      <td><strong>${c.orders}</strong> orders</td>
      <td><strong>${formatINR(c.total_spent)}</strong></td>
      <td>${new Date(c.last_order).toLocaleDateString('en-IN')}</td>
    </tr>
  `).join('') : '<tr><td colspan="6" style="padding:40px;text-align:center;color:#777">No customers with orders yet.</td></tr>';
  refreshIcons();
};

})();
