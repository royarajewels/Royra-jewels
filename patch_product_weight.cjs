const fs = require('fs');

let html = fs.readFileSync('admin/product-form.html', 'utf8');

html = html.replace(/<label style="font-size:13px; color:#202223;">Gross Weight \(g\)<\/label>\s*<input type="number" step="0.01" style="width:100%; padding:6px; border:1px solid #C9CCCF; border-radius:4px; font-size:13px;" \/>/,
  `<label style="font-size:13px; color:#202223;">Gross Weight (g)</label>
   <input type="number" step="0.01" value="2.50" style="width:100%; padding:6px; border:1px solid #C9CCCF; border-radius:4px; font-size:13px;" />`);

html = html.replace(/<label style="font-size:13px; color:#202223;">Purity<\/label>\s*<input type="text" style="width:100%; padding:6px; border:1px solid #C9CCCF; border-radius:4px; font-size:13px;" \/>/,
  `<label style="font-size:13px; color:#202223;">Purity</label>
   <input type="text" value="18K" style="width:100%; padding:6px; border:1px solid #C9CCCF; border-radius:4px; font-size:13px;" />`);

// Update Form Save button to show success toast
html = html.replace(/<button type="submit" class="btn-admin-primary">Save<\/button>/,
  `<button type="button" onclick="saveProductForm(this)" class="btn-admin-primary">Save</button>`);

const saveScript = `
<script>
  function saveProductForm(btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="loader" class="spin"></i> Saving...';
    btn.disabled = true;
    setTimeout(() => {
      window.showAdminToast('Product saved successfully');
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 800);
  }
</script>
`;
html = html.replace(/<\/body>/, saveScript + '\n</body>');

fs.writeFileSync('admin/product-form.html', html);
