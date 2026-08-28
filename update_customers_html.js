import fs from 'fs';

const file = 'admin/customers.html';
let content = fs.readFileSync(file, 'utf8');

const newContent = `
      <div class="admin-content" style="max-width: 1200px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #202223;">Customers</h1>
          <div style="display: flex; gap: 8px;">
            <button class="btn-admin-secondary" style="padding: 6px 12px; font-size: 13px;">Export</button>
            <button class="btn-admin-secondary" style="padding: 6px 12px; font-size: 13px;">Import</button>
            <button class="btn-admin-primary" style="padding: 6px 12px; font-size: 13px;">Add customer</button>
          </div>
        </div>

        <div class="admin-card" style="overflow: visible;">
          <div style="display: flex; gap: 16px; padding: 0 12px; border-bottom: 1px solid var(--admin-border);">
            <button style="background:none; border:none; border-bottom: 2px solid #008060; padding: 12px 4px; font-size: 14px; font-weight: 600; color: #202223; cursor:pointer;">All</button>
            <button style="background:none; border:none; border-bottom: 2px solid transparent; padding: 12px 4px; font-size: 14px; color: #6D7175; cursor:pointer;">New</button>
            <button style="background:none; border:none; border-bottom: 2px solid transparent; padding: 12px 4px; font-size: 14px; color: #6D7175; cursor:pointer;">Returning</button>
            <button style="background:none; border:none; border-bottom: 2px solid transparent; padding: 12px 4px; font-size: 14px; color: #6D7175; cursor:pointer;">Abandoned checkouts</button>
            <button style="background:none; border:none; border-bottom: 2px solid transparent; padding: 12px 4px; font-size: 14px; color: #6D7175; cursor:pointer;">Email subscribers</button>
            <button style="background:none; border:none; padding: 12px 4px; cursor:pointer;"><i data-lucide="plus" style="width:16px;height:16px;color:#6D7175;"></i></button>
          </div>
          
          <div style="padding: 12px; border-bottom: 1px solid var(--admin-border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 300px;">
              <div class="global-search" style="background: #FFF; border: 1px solid #C9CCCF; border-radius: 4px; flex: 1; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <i data-lucide="search" style="color: #8C9196; width: 14px; margin-left: 8px;"></i>
                <input type="text" placeholder="Search customers" style="color: #202223;" />
              </div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <button class="btn-admin-secondary" style="border-radius:4px; border: 1px dashed #C9CCCF; padding:4px 8px; font-size: 13px;">Email subscription status <i data-lucide="chevron-down" style="width:14px;height:14px;"></i></button>
              <button class="btn-admin-secondary" style="border-radius:4px; padding:4px 8px; font-size: 13px;"><i data-lucide="filter" style="width:14px;height:14px;margin-right:4px;"></i> More filters</button>
              <button class="btn-admin-secondary" style="border-radius:4px; padding:4px 8px; font-size: 13px;">Sort by: Last updated <i data-lucide="chevron-down" style="width:14px;height:14px;"></i></button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="admin-table" style="width: 100%; text-align: left; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid var(--admin-border); font-size: 13px; color: #6D7175; font-weight: 600;">
                  <th style="padding: 12px; width: 40px;"><input type="checkbox" /></th>
                  <th style="padding: 12px;">Customer name</th>
                  <th style="padding: 12px;">Email subscription</th>
                  <th style="padding: 12px;">Location</th>
                  <th style="padding: 12px; text-align:right;">Orders</th>
                  <th style="padding: 12px; text-align:right;">Amount spent</th>
                </tr>
              </thead>
              <tbody style="font-size: 14px; color: #202223;">
                <!-- Sample Customer 1 -->
                <tr style="border-bottom: 1px solid var(--admin-border);">
                  <td style="padding: 12px;"><input type="checkbox" /></td>
                  <td style="padding: 12px; font-weight: 600; color: #2C6ECB;">Aisha Sharma</td>
                  <td style="padding: 12px;"><span style="background: #F1F2F3; color: #6D7175; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">Not subscribed</span></td>
                  <td style="padding: 12px;">Mumbai, India</td>
                  <td style="padding: 12px; text-align:right;">2</td>
                  <td style="padding: 12px; text-align:right;">₹24,998.00</td>
                </tr>
                <!-- Sample Customer 2 -->
                <tr style="border-bottom: 1px solid var(--admin-border);">
                  <td style="padding: 12px;"><input type="checkbox" /></td>
                  <td style="padding: 12px; font-weight: 600; color: #2C6ECB;">Rahul Patel</td>
                  <td style="padding: 12px;"><span style="background: #E3F1DF; color: #008060; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">Subscribed</span></td>
                  <td style="padding: 12px;">Ahmedabad, India</td>
                  <td style="padding: 12px; text-align:right;">1</td>
                  <td style="padding: 12px; text-align:right;">₹8,999.00</td>
                </tr>
                 <!-- Sample Customer 3 -->
                <tr style="border-bottom: 1px solid var(--admin-border);">
                  <td style="padding: 12px;"><input type="checkbox" /></td>
                  <td style="padding: 12px; font-weight: 600; color: #2C6ECB;">Neha Gupta</td>
                  <td style="padding: 12px;"><span style="background: #E3F1DF; color: #008060; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">Subscribed</span></td>
                  <td style="padding: 12px;">New Delhi, India</td>
                  <td style="padding: 12px; text-align:right;">4</td>
                  <td style="padding: 12px; text-align:right;">₹1,24,500.00</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style="padding: 12px; border-top: 1px solid var(--admin-border); display: flex; justify-content: space-between; align-items: center; color: #6D7175; font-size: 13px;">
            <span>Showing 1 to 3 of 3 customers</span>
            <div style="display: flex; gap: 8px;">
              <button class="btn-admin-secondary" style="padding: 4px 8px;" disabled><i data-lucide="chevron-left" style="width:16px;height:16px;"></i></button>
              <button class="btn-admin-secondary" style="padding: 4px 12px; font-weight: 600; background: #F3F3F3;">1</button>
              <button class="btn-admin-secondary" style="padding: 4px 8px;" disabled><i data-lucide="chevron-right" style="width:16px;height:16px;"></i></button>
            </div>
          </div>
        </div>
      </div>
`;

content = content.replace(/<div class="admin-content">[\s\S]*?(?=<\/main>)/, newContent);
fs.writeFileSync(file, content, 'utf8');
console.log('Updated customers.html body');
