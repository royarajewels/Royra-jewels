const fs = require('fs');

let html = fs.readFileSync('admin/settings.html', 'utf8');

if (!html.includes('Currency')) {
   html = html.replace(/<label style="font-size: 13px; color: #202223; display: block; margin-bottom: 4px;">Backup region<\/label>/,
     `<label style="font-size: 13px; color: #202223; display: block; margin-bottom: 4px;">Store currency</label>
      <select class="form-select">
        <option>INR ₹</option>
      </select>
     `);
}

// Ensure settings sub-links look right
html = html.replace(/\.settings-nav-link\.active \{ background: #E1F0FF; color: #005BD3; border-left-color: #005BD3; font-weight: 500; \}/,
  `.settings-nav-link.active { background: #E1F0FF; color: #005BD3; border-left-color: #005BD3; font-weight: 500; }`);

fs.writeFileSync('admin/settings.html', html);
console.log('settings.html patched');
