const fs = require('fs');
let html = fs.readFileSync('admin/settings.html', 'utf8');

const businessDetails = `
            <div class="admin-card" style="margin-bottom: 24px;">
              <div style="padding: 16px 20px; border-bottom: 1px solid var(--admin-border);">
                <h3 style="font-size: 14px; font-weight: 600; margin: 0;">Business details</h3>
              </div>
              <div style="padding: 20px;">
                <label style="font-size: 13px; color: #202223; display: block; margin-bottom: 4px;">Legal business name</label>
                <input type="text" class="form-input" value="Royra Jewels" />
              </div>
            </div>
`;

html = html.replace(/<div class="admin-card">[\s]*<div style="padding: 16px 20px; border-bottom: 1px solid var\(--admin-border\);">[\s]*<h3 style="font-size: 14px; font-weight: 600; margin: 0;">Store contact details<\/h3>/, businessDetails + '\n            <div class="admin-card">\n              <div style="padding: 16px 20px; border-bottom: 1px solid var(--admin-border);">\n                <h3 style="font-size: 14px; font-weight: 600; margin: 0;">Store contact details</h3>');

fs.writeFileSync('admin/settings.html', html);
