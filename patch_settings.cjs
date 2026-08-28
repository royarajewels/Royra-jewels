const fs = require('fs');
let html = fs.readFileSync('admin/settings.html', 'utf8');

// Replace "Profile" section with "Business details", "Store contact details", "Store address"
// Oh wait, the prompt says: "Business details, Store contact details, Store address, Store defaults, Currency, Backup region, Unit system, Default weight, Timezone."

const newSections = `
            <div class="admin-card">
              <div style="padding: 16px 20px; border-bottom: 1px solid var(--admin-border);">
                <h3 style="font-size: 14px; font-weight: 600; margin: 0;">Store defaults</h3>
              </div>
              <div style="padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <label style="font-size: 13px; color: #202223; display: block; margin-bottom: 4px;">Timezone</label>
                  <select class="form-select">
                    <option>India / IST</option>
                  </select>
                </div>
                <div>
                  <label style="font-size: 13px; color: #202223; display: block; margin-bottom: 4px;">Unit system</label>
                  <select class="form-select">
                    <option>Metric system</option>
                  </select>
                </div>
                <div>
                  <label style="font-size: 13px; color: #202223; display: block; margin-bottom: 4px;">Default weight unit</label>
                  <select class="form-select">
                    <option>kg</option>
                    <option>g</option>
                  </select>
                </div>
                <div>
                  <label style="font-size: 13px; color: #202223; display: block; margin-bottom: 4px;">Backup region</label>
                  <select class="form-select">
                    <option>Asia (Mumbai)</option>
                  </select>
                </div>
              </div>
            </div>
`;

// Insert the new sections before "Store currency"
html = html.replace(/<div class="admin-card" style="margin-top: 24px;">\s*<div style="padding: 16px 20px; border-bottom: 1px solid var\(--admin-border\);">\s*<h3 style="font-size: 14px; font-weight: 600; margin: 0;">Store currency<\/h3>/, newSections + '\n            <div class="admin-card" style="margin-top: 24px;">\n              <div style="padding: 16px 20px; border-bottom: 1px solid var(--admin-border);">\n                <h3 style="font-size: 14px; font-weight: 600; margin: 0;">Store currency</h3>');

// Ensure currency has INR selected
html = html.replace(/<option>Indian Rupee \(INR\)<\/option>/, '<option selected>Indian Rupee (INR ₹)</option>');

// Update "Profile" to "Business details", and maybe add the others
html = html.replace(/<h3 style="font-size: 14px; font-weight: 600; margin: 0;">Profile<\/h3>/, '<h3 style="font-size: 14px; font-weight: 600; margin: 0;">Store contact details</h3>');
html = html.replace(/<h3 style="font-size: 14px; font-weight: 600; margin: 0;">Billing information<\/h3>/, '<h3 style="font-size: 14px; font-weight: 600; margin: 0;">Store address</h3>');

fs.writeFileSync('admin/settings.html', html);
