import fs from 'fs';

const file = 'admin/payments.html';
let content = fs.readFileSync(file, 'utf8');

const newContent = `
      <div class="admin-content" style="max-width: 1000px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #202223;">Payments</h1>
        </div>

        <div style="display: grid; grid-template-columns: 240px 1fr; gap: 32px;">
          
          <!-- Settings Sidebar -->
          <div>
            <div class="global-search" style="background: #FFF; border: 1px solid #C9CCCF; border-radius: 4px; margin-bottom: 16px;">
              <i data-lucide="search" style="color: #8C9196; width: 14px; margin-left: 8px;"></i>
              <input type="text" placeholder="Search" style="color: #202223; width: 100%;" />
            </div>
            
            <nav style="display: flex; flex-direction: column; gap: 4px;">
              <a href="settings.html" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="settings" style="width:16px;height:16px;"></i> General</a>
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="layout-template" style="width:16px;height:16px;"></i> Plan</a>
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="credit-card" style="width:16px;height:16px;"></i> Billing</a>
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="users" style="width:16px;height:16px;"></i> Users</a>
              <a href="payments.html" style="display:flex; align-items:center; gap:8px; padding:6px 8px; background:#EBEBEB; border-radius:4px; font-size:14px; font-weight:600; color:#202223; text-decoration:none;"><i data-lucide="credit-card" style="width:16px;height:16px;"></i> Payments</a>
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="shopping-cart" style="width:16px;height:16px;"></i> Checkout</a>
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="user" style="width:16px;height:16px;"></i> Customer accounts</a>
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="truck" style="width:16px;height:16px;"></i> Shipping and delivery</a>
            </nav>
            <div style="margin-top: 32px; font-size: 13px; color: #6D7175; display:flex; align-items:center; gap:8px;">
              <div style="width:24px;height:24px;background:#EBEBEB;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:#202223;">MA</div>
              <div>
                <div style="font-weight:600;color:#202223;">Royra Jewels Admin</div>
                <div>priayjit23@gmail.com</div>
              </div>
            </div>
          </div>

          <!-- Settings Content -->
          <div>
            <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; display:flex; align-items:center; gap:8px;"><i data-lucide="credit-card"></i> Payments</h2>
            
            <div class="admin-card">
              <div class="admin-card-header">
                <h3 style="font-size:14px; font-weight:600;">Recommended payment providers</h3>
                <p style="font-size:13px; color:#6D7175; margin-top:4px;">Accept payments at rates set by the provider</p>
              </div>
              <div style="padding: 16px; display:flex; flex-direction:column; gap:16px;">
                
                <div style="border:1px solid #E1E3E5; border-radius:4px; padding:16px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div style="font-size:14px; font-weight:500; margin-bottom:4px;">Cashfree Payments (UPI, Cards, Net Banking, Wallets)</div>
                    <div style="font-size:13px; color:#6D7175; margin-bottom:8px;">Transaction fees vary by plan • Provider fees may apply</div>
                    <div style="display:flex; gap:4px;">
                      <span style="background:#F6F6F7; border:1px solid #E1E3E5; border-radius:2px; padding:2px 4px; font-size:10px; font-weight:bold;">UPI</span>
                      <span style="background:#F6F6F7; border:1px solid #E1E3E5; border-radius:2px; padding:2px 4px; font-size:10px; font-weight:bold;">RuPay</span>
                      <span style="background:#1434CB; color:#FFF; border-radius:2px; padding:2px 4px; font-size:10px; font-weight:bold;">VISA</span>
                      <span style="background:#F6F6F7; border:1px solid #E1E3E5; border-radius:2px; padding:2px 4px; font-size:10px; font-weight:bold;">+9</span>
                    </div>
                  </div>
                  <button class="btn-admin-secondary" style="padding:6px 16px; font-size:13px; font-weight:600;">Install</button>
                </div>

                <div style="border:1px solid #E1E3E5; border-radius:4px; padding:16px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div style="font-size:14px; font-weight:500; margin-bottom:4px;">Razorpay: Card & UPI Payments</div>
                    <div style="font-size:13px; color:#6D7175; margin-bottom:8px;">Transaction fees vary by plan • Provider fees may apply</div>
                    <div style="display:flex; gap:4px;">
                      <span style="background:#1434CB; color:#FFF; border-radius:2px; padding:2px 4px; font-size:10px; font-weight:bold;">VISA</span>
                      <span style="background:#F6F6F7; border:1px solid #E1E3E5; border-radius:2px; padding:2px 4px; font-size:10px; font-weight:bold;">MC</span>
                    </div>
                  </div>
                  <button class="btn-admin-secondary" style="padding:6px 16px; font-size:13px; font-weight:600;">Install</button>
                </div>

                <div style="border:1px solid #E1E3E5; border-radius:4px; padding:16px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div style="font-size:14px; font-weight:500; margin-bottom:4px;">PhonePe PG (UPI, Cards, EMI)</div>
                    <div style="font-size:13px; color:#6D7175; margin-bottom:8px;">Transaction fees vary by plan • Provider fees may apply</div>
                    <div style="display:flex; gap:4px;">
                      <span style="background:#F6F6F7; border:1px solid #E1E3E5; border-radius:2px; padding:2px 4px; font-size:10px; font-weight:bold;">UPI</span>
                      <span style="background:#F6F6F7; border:1px solid #E1E3E5; border-radius:2px; padding:2px 4px; font-size:10px; font-weight:bold;">RuPay</span>
                    </div>
                  </div>
                  <button class="btn-admin-secondary" style="padding:6px 16px; font-size:13px; font-weight:600;">Install</button>
                </div>

                <div style="border:1px solid #E1E3E5; border-radius:4px; padding:16px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div style="font-size:14px; font-weight:500; margin-bottom:4px;">PayU India</div>
                    <div style="font-size:13px; color:#6D7175; margin-bottom:8px;">Transaction fees vary by plan • Provider fees may apply</div>
                    <div style="display:flex; gap:4px;">
                      <span style="background:#F6F6F7; border:1px solid #E1E3E5; border-radius:2px; padding:2px 4px; font-size:10px; font-weight:bold;">RuPay</span>
                      <span style="background:#1434CB; color:#FFF; border-radius:2px; padding:2px 4px; font-size:10px; font-weight:bold;">VISA</span>
                    </div>
                  </div>
                  <i data-lucide="chevron-right" style="color:#6D7175; width:20px;"></i>
                </div>

                <div style="padding-top:16px; border-top:1px solid #E1E3E5;">
                  <a href="#" style="color:#2C6ECB; font-size:13px; text-decoration:none;">See all options for payment providers</a>
                </div>
              </div>
            </div>

            <div class="admin-card">
              <div class="admin-card-header">
                <h3 style="font-size:14px; font-weight:600;">Additional payment providers</h3>
                <p style="font-size:13px; color:#6D7175; margin-top:4px;">Offer UPI, wallets, and other India-specific offsite or custom-integrated payment methods</p>
              </div>
              <div style="padding: 16px;">
                <div style="border:1px solid #E1E3E5; border-radius:4px; padding:16px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div style="font-size:14px; font-weight:500; margin-bottom:4px;">PayPal</div>
                    <div style="font-size:13px; color:#6D7175; margin-bottom:8px;">Transaction fees vary by plan • Processing fees set by PayPal</div>
                    <div style="display:flex; gap:4px;">
                      <span style="color:#003087; font-weight:bold; font-size:12px; font-style:italic;">PayPal</span>
                    </div>
                  </div>
                  <button class="btn-admin-secondary" style="padding:6px 16px; font-size:13px; font-weight:600;">Activate PayPal</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
`;

content = content.replace(/<div class="admin-content">[\s\S]*?(?=<\/main>)/, newContent);
fs.writeFileSync(file, content, 'utf8');
console.log('Updated payments.html body');
