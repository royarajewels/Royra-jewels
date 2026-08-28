const fs = require('fs');

let html = fs.readFileSync('admin/settings.html', 'utf8');

// Update active tab logic
html = html.replace(/class="settings-nav-link active"><i data-lucide="store"><\/i> Store details/g, 'class="settings-nav-link"><i data-lucide="store"></i> Store details');
html = html.replace(/class="settings-nav-link"><i data-lucide="dollar-sign"><\/i> Payments/g, 'class="settings-nav-link active"><i data-lucide="dollar-sign"></i> Payments');

html = html.replace(/<h1 style="font-size: 24px; font-weight: 700; color: #202223; margin: 0;">Store details<\/h1>/g, '<h1 style="font-size: 24px; font-weight: 700; color: #202223; margin: 0;">Payments</h1>');

const paymentContent = `
            <div class="admin-card" style="margin-bottom: 24px;">
              <div style="padding: 16px 20px; border-bottom: 1px solid var(--admin-border);">
                <h3 style="font-size: 14px; font-weight: 600; margin: 0;">Payment providers</h3>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #6D7175;">Accept payments on your store using third-party providers such as Cashfree, Razorpay, PhonePe, PayU, or PayPal.</p>
              </div>
              <div style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--admin-border); border-radius: 4px; padding: 16px;">
                  <div>
                    <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #202223;">Cashfree Payments</h4>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #6D7175;">Status: <span style="color: #8A6116; font-weight: 500;">Not connected</span></p>
                  </div>
                  <button class="btn-admin-secondary">Connect</button>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--admin-border); border-radius: 4px; padding: 16px; margin-top: 12px;">
                  <div>
                    <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #202223;">Razorpay</h4>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #6D7175;">Status: <span style="color: #8A6116; font-weight: 500;">Not connected</span></p>
                  </div>
                  <button class="btn-admin-secondary">Connect</button>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--admin-border); border-radius: 4px; padding: 16px; margin-top: 12px;">
                  <div>
                    <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #202223;">PhonePe / PayU / PayPal</h4>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #6D7175;">Additional gateways available</p>
                  </div>
                  <button class="btn-admin-secondary">Choose a provider</button>
                </div>
              </div>
            </div>
            
            <div class="admin-card" style="margin-bottom: 24px;">
              <div style="padding: 16px 20px; border-bottom: 1px solid var(--admin-border);">
                <h3 style="font-size: 14px; font-weight: 600; margin: 0;">Manual payment methods</h3>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #6D7175;">Payments that are processed outside your online store. When a customer selects a manual payment method such as Cash on Delivery, you'll need to approve their order before fulfilling.</p>
              </div>
              <div style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--admin-border); border-radius: 4px; padding: 16px;">
                  <div>
                    <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #202223;">Cash on Delivery (COD)</h4>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #6D7175;">Status: <span style="color: #007F5F; font-weight: 500;">Active</span></p>
                  </div>
                  <button class="btn-admin-secondary">Manage</button>
                </div>
              </div>
            </div>
`;

// Replace all cards with new payment content
html = html.replace(/<div class="admin-card" style="margin-bottom: 24px;">[\s\S]*?(?=<\/div>\s*<\/div>\s*<\/div>\s*<\/main>)/, paymentContent);

fs.writeFileSync('admin/settings-payments.html', html);

// Also update settings.html to link to settings-payments.html
let originalHtml = fs.readFileSync('admin/settings.html', 'utf8');
originalHtml = originalHtml.replace(/<a href="#" class="settings-nav-link"><i data-lucide="dollar-sign"><\/i> Payments<\/a>/g, '<a href="settings-payments.html" class="settings-nav-link"><i data-lucide="dollar-sign"></i> Payments</a>');
fs.writeFileSync('admin/settings.html', originalHtml);

// And update settings-payments.html to point back to settings.html for store details
let paymentsHtml = fs.readFileSync('admin/settings-payments.html', 'utf8');
paymentsHtml = paymentsHtml.replace(/<a href="#" class="settings-nav-link"><i data-lucide="store"><\/i> Store details<\/a>/g, '<a href="settings.html" class="settings-nav-link"><i data-lucide="store"></i> Store details</a>');
fs.writeFileSync('admin/settings-payments.html', paymentsHtml);

