import fs from 'fs';

const file = 'admin/settings.html';
let content = fs.readFileSync(file, 'utf8');

const newContent = `
      <div class="admin-content" style="max-width: 1000px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #202223;">Settings</h1>
        </div>

        <div style="display: grid; grid-template-columns: 240px 1fr; gap: 32px;">
          
          <!-- Settings Sidebar -->
          <div>
            <div class="global-search" style="background: #FFF; border: 1px solid #C9CCCF; border-radius: 4px; margin-bottom: 16px;">
              <i data-lucide="search" style="color: #8C9196; width: 14px; margin-left: 8px;"></i>
              <input type="text" placeholder="Search" style="color: #202223; width: 100%;" />
            </div>
            
            <nav style="display: flex; flex-direction: column; gap: 4px;">
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; background:#EBEBEB; border-radius:4px; font-size:14px; font-weight:600; color:#202223; text-decoration:none;"><i data-lucide="settings" style="width:16px;height:16px;"></i> General</a>
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="layout-template" style="width:16px;height:16px;"></i> Plan</a>
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="credit-card" style="width:16px;height:16px;"></i> Billing</a>
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="users" style="width:16px;height:16px;"></i> Users</a>
              <a href="payments.html" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="credit-card" style="width:16px;height:16px;"></i> Payments</a>
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="shopping-cart" style="width:16px;height:16px;"></i> Checkout</a>
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="user" style="width:16px;height:16px;"></i> Customer accounts</a>
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="truck" style="width:16px;height:16px;"></i> Shipping and delivery</a>
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="receipt" style="width:16px;height:16px;"></i> Taxes and duties</a>
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="map-pin" style="width:16px;height:16px;"></i> Locations</a>
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="globe" style="width:16px;height:16px;"></i> Markets</a>
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="grid" style="width:16px;height:16px;"></i> Apps</a>
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="share-2" style="width:16px;height:16px;"></i> Sales channels</a>
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="globe-2" style="width:16px;height:16px;"></i> Domains</a>
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="bell" style="width:16px;height:16px;"></i> Notifications</a>
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="database" style="width:16px;height:16px;"></i> Metafields and metaobjects</a>
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="type" style="width:16px;height:16px;"></i> Languages</a>
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="shield" style="width:16px;height:16px;"></i> Customer privacy</a>
              <a href="#" style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; font-size:14px; color:#6D7175; text-decoration:none;"><i data-lucide="file-text" style="width:16px;height:16px;"></i> Policies</a>
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
            <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; display:flex; align-items:center; gap:8px;"><i data-lucide="settings"></i> General</h2>
            
            <div class="admin-card">
              <div class="admin-card-header">
                <h3 style="font-size:14px; font-weight:600;">Business details</h3>
              </div>
              <div style="padding: 16px;">
                <p style="font-size:13px; color:#6D7175; margin-bottom:16px;">Business entity used for financial products, markets, apps, and taxes in this shop</p>
                <div style="border: 1px solid #E1E3E5; border-radius: 4px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 24px; height: 16px; background: #FFF; border: 1px solid #E1E3E5; display: flex; flex-direction: column;">
                      <div style="background:#FF9933;flex:1;"></div>
                      <div style="background:#FFFFFF;flex:1;"></div>
                      <div style="background:#138808;flex:1;"></div>
                    </div>
                    <div>
                      <div style="font-size:14px; font-weight:500;">Royra Jewels - entity</div>
                      <div style="font-size:13px; color:#6D7175;">India</div>
                    </div>
                  </div>
                  <i data-lucide="more-horizontal" style="color:#6D7175; width:16px;"></i>
                </div>
              </div>
            </div>

            <div class="admin-card">
              <div class="admin-card-header">
                <h3 style="font-size:14px; font-weight:600;">Store contact details</h3>
              </div>
              <div style="padding: 16px; display:flex; flex-direction:column; gap:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <div style="display:flex; gap:12px;">
                    <i data-lucide="smartphone" style="color:#6D7175; width:20px;"></i>
                    <div>
                      <div style="font-size:14px; font-weight:500;">Royra Jewels</div>
                      <div style="font-size:13px; color:#6D7175;">priayjit23@gmail.com · No phone number</div>
                    </div>
                  </div>
                  <i data-lucide="chevron-right" style="color:#6D7175; width:16px;"></i>
                </div>
                <div style="border-top:1px solid #E1E3E5; padding-top:16px; display:flex; justify-content:space-between; align-items:center;">
                  <div style="display:flex; gap:12px;">
                    <i data-lucide="map-pin" style="color:#6D7175; width:20px;"></i>
                    <div>
                      <div style="font-size:14px; font-weight:500;">Store address</div>
                      <div style="font-size:13px; color:#6D7175;">India</div>
                    </div>
                  </div>
                  <i data-lucide="chevron-right" style="color:#6D7175; width:16px;"></i>
                </div>
              </div>
            </div>

            <div class="admin-card">
              <div class="admin-card-header">
                <h3 style="font-size:14px; font-weight:600;">Store defaults</h3>
              </div>
              <div style="padding: 16px; display:flex; flex-direction:column; gap:20px;">
                <div style="border:1px solid #E1E3E5; border-radius:4px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div style="font-size:14px; font-weight:500;">Currency display</div>
                    <div style="font-size:13px; color:#6D7175;">To manage the currencies customers see, go to <a href="#" style="color:#2C6ECB;">Markets</a></div>
                  </div>
                  <div style="display:flex; align-items:center; gap:12px;">
                    <span style="font-size:14px;">Indian Rupee (INR ₹)</span>
                    <i data-lucide="more-horizontal" style="color:#6D7175; width:16px;"></i>
                  </div>
                </div>

                <div>
                  <label style="font-size:13px; color:#202223; margin-bottom:4px; display:block;">Backup Region</label>
                  <select style="width:100%; padding:8px; border:1px solid #C9CCCF; border-radius:4px; font-size:14px; margin-bottom:4px;">
                    <option>India</option>
                  </select>
                  <p style="font-size:12px; color:#6D7175;">Determines settings for customers outside of your markets</p>
                </div>

                <div>
                  <label style="font-size:13px; color:#202223; margin-bottom:4px; display:block;">Unit system</label>
                  <select style="width:100%; padding:8px; border:1px solid #C9CCCF; border-radius:4px; font-size:14px;">
                    <option>Metric system</option>
                  </select>
                </div>

                <div>
                  <label style="font-size:13px; color:#202223; margin-bottom:4px; display:block;">Default weight unit</label>
                  <select style="width:100%; padding:8px; border:1px solid #C9CCCF; border-radius:4px; font-size:14px;">
                    <option>Kilogram (kg)</option>
                  </select>
                </div>

                <div>
                  <label style="font-size:13px; color:#202223; margin-bottom:4px; display:block;">Time zone</label>
                  <select style="width:100%; padding:8px; border:1px solid #C9CCCF; border-radius:4px; font-size:14px; margin-bottom:4px;">
                    <option>(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
                  </select>
                  <p style="font-size:12px; color:#6D7175;">Sets the time for when orders and analytics are recorded</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
`;

content = content.replace(/<div class="admin-content">[\s\S]*?(?=<\/main>)/, newContent);
fs.writeFileSync(file, content, 'utf8');
console.log('Updated settings.html body');
