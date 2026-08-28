const fs = require('fs');
let html = fs.readFileSync('admin/product-form.html', 'utf8');

// Update Category Section
const categorySection = `
            <div class="admin-card" style="padding: 16px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h3 style="font-size:14px; font-weight:600; margin:0;">Category</h3>
                <button type="button" onclick="openAddCategoryModal()" style="border:none;background:none;cursor:pointer;color:#2C6ECB;font-size:13px;font-weight:500;">Add category</button>
              </div>
              <select id="product-category-select" class="form-select" style="width:100%; padding:8px; font-size:14px; border:1px solid #C9CCCF; border-radius:4px;">
                <option>Choose a product category</option>
                <option selected>Rings</option>
                <option>Earrings</option>
                <option>Necklaces</option>
              </select>
              <p style="font-size:12px; color:#6D7175; margin-top:8px;">Determines tax rates and adds metafields to improve search, filters, and cross-channel sales</p>
            </div>
`;
html = html.replace(/<!-- Category -->[\s\S]*?(?=<!-- Pricing -->)/, '<!-- Category -->\n' + categorySection + '\n');

// Add Add Category Modal
const addCategoryModal = `
  <div id="add-category-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1000; align-items:center; justify-content:center;">
    <div style="background:#fff; width: 400px; border-radius:8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); overflow:hidden; display:flex; flex-direction:column;">
      <div style="padding:16px; border-bottom:1px solid #E5E5E5; display:flex; justify-content:space-between; align-items:center;">
        <h4 style="margin:0; font-size:14px; font-weight:600;">Add new category</h4>
        <button onclick="closeAddCategoryModal()" style="background:none;border:none;cursor:pointer;"><i data-lucide="x" style="width:16px;height:16px;"></i></button>
      </div>
      <div style="padding:16px;">
        <label style="font-size:13px; color:#6D7175; margin-bottom:8px; display:block;">Category name</label>
        <input type="text" id="new-category-name" class="form-input" style="width:100%; border:1px solid #C9CCCF; border-radius:4px; padding:8px; font-size:13px;" placeholder="e.g. Bracelets" />
      </div>
      <div style="padding:16px; border-top:1px solid #E5E5E5; display:flex; justify-content:flex-end; gap:8px;">
        <button onclick="closeAddCategoryModal()" class="btn-admin-secondary">Cancel</button>
        <button onclick="saveNewCategory()" class="btn-admin-primary" style="background:#2C6ECB; color:#fff;">Save category</button>
      </div>
    </div>
  </div>
`;
html = html.replace(/<\/body>/, addCategoryModal + '\n</body>');

// Fix Product Status Badge
html = html.replace(/<span style="background: #E4F8EB; color: #007F5F; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">Active<\/span>/, 
  '<span style="background: #AEE9D1; color: #008060; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">Active</span>'); // More Shopify-like

// Product Organization updates
html = html.replace(/<input type="text" class="form-input" value="Earrings" \/>/, 
  `<select class="form-select" style="width:100%; padding:8px; font-size:14px; border:1px solid #C9CCCF; border-radius:4px;">
    <option>Rings</option>
    <option>Earrings</option>
  </select>`);

// Add Scripts for Category & Variants
const moreScripts = `
<script>
  function openAddCategoryModal() {
    document.getElementById('add-category-modal').style.display = 'flex';
  }
  function closeAddCategoryModal() {
    document.getElementById('add-category-modal').style.display = 'none';
  }
  function saveNewCategory() {
    const val = document.getElementById('new-category-name').value;
    if(val) {
      const select = document.getElementById('product-category-select');
      const option = document.createElement('option');
      option.text = val;
      option.value = val;
      select.add(option);
      select.value = val;
      closeAddCategoryModal();
      document.getElementById('new-category-name').value = '';
      window.showAdminToast('Category added successfully');
    }
  }

  function handleVariantImageClick(btn) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      if(e.target.files && e.target.files[0]) {
        btn.innerHTML = '<i data-lucide="check" style="width:16px;height:16px;color:green;"></i>';
        window.refreshLucideIcons();
      }
    };
    input.click();
  }
</script>
`;
html = html.replace(/<\/body>/, moreScripts + '\n</body>');

// Add onclick to variant image boxes
html = html.replace(/<div style="width:32px; height:32px; border:1px dashed #C9CCCF; border-radius:4px; display:flex; align-items:center; justify-content:center; color:#8C9196; background:#FFF; cursor:pointer;"/g, 
  '<div onclick="handleVariantImageClick(this)" style="width:32px; height:32px; border:1px dashed #C9CCCF; border-radius:4px; display:flex; align-items:center; justify-content:center; color:#8C9196; background:#FFF; cursor:pointer;"');

// Add another option logic
html = html.replace(/<button type="button" class="btn-admin-secondary" style="font-size: 13px; padding: 4px 12px;">[\s\S]*?<i data-lucide="plus" style="width: 14px; height: 14px;"><\/i> Add another option[\s\S]*?<\/button>/, 
  `<button type="button" onclick="alert('This will add a new Option 3 row. (Implementation pending dynamic generator)')" class="btn-admin-secondary" style="font-size: 13px; padding: 4px 12px;">
    <i data-lucide="plus" style="width: 14px; height: 14px;"></i> Add another option
  </button>
  <button type="button" onclick="window.showAdminToast('Variants generated based on options')" class="btn-admin-primary" style="font-size: 13px; padding: 4px 12px; margin-left:8px; background:#2C6ECB; color:#FFF; border:none; border-radius:4px; cursor:pointer;">
    Generate variants
  </button>`);


fs.writeFileSync('admin/product-form.html', html);
