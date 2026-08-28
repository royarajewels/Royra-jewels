import fs from 'fs';

const file = 'admin/orders.html';
let content = fs.readFileSync(file, 'utf8');

const newContent = `
      <div class="admin-content" style="max-width: 1200px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #202223;">Orders</h1>
          <div style="display: flex; gap: 8px;">
            <button class="btn-admin-secondary" style="padding: 6px 12px; font-size: 13px;">Export</button>
            <button class="btn-admin-secondary" style="padding: 6px 12px; font-size: 13px;">More actions <i data-lucide="chevron-down" style="width:14px;height:14px;vertical-align:middle;"></i></button>
            <button class="btn-admin-primary" style="padding: 6px 12px; font-size: 13px;">Create order</button>
          </div>
        </div>

        <div class="admin-card" style="overflow: visible;">
          <div style="display: flex; gap: 16px; padding: 0 12px; border-bottom: 1px solid var(--admin-border);">
            <button style="background:none; border:none; border-bottom: 2px solid #008060; padding: 12px 4px; font-size: 14px; font-weight: 600; color: #202223; cursor:pointer;">All</button>
            <button style="background:none; border:none; border-bottom: 2px solid transparent; padding: 12px 4px; font-size: 14px; color: #6D7175; cursor:pointer;">Unfulfilled <span style="background:#EBEBEB; padding:2px 6px; border-radius:12px; font-size:11px; margin-left:4px;">1</span></button>
            <button style="background:none; border:none; border-bottom: 2px solid transparent; padding: 12px 4px; font-size: 14px; color: #6D7175; cursor:pointer;">Unpaid</button>
            <button style="background:none; border:none; border-bottom: 2px solid transparent; padding: 12px 4px; font-size: 14px; color: #6D7175; cursor:pointer;">Open</button>
            <button style="background:none; border:none; border-bottom: 2px solid transparent; padding: 12px 4px; font-size: 14px; color: #6D7175; cursor:pointer;">Closed</button>
            <button style="background:none; border:none; border-bottom: 2px solid transparent; padding: 12px 4px; font-size: 14px; color: #6D7175; cursor:pointer;">Local delivery</button>
            <button style="background:none; border:none; padding: 12px 4px; cursor:pointer;"><i data-lucide="plus" style="width:16px;height:16px;color:#6D7175;"></i></button>
          </div>
          
          <div style="padding: 12px; border-bottom: 1px solid var(--admin-border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 300px;">
              <div class="global-search" style="background: #FFF; border: 1px solid #C9CCCF; border-radius: 4px; flex: 1; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <i data-lucide="search" style="color: #8C9196; width: 14px; margin-left: 8px;"></i>
                <input type="text" placeholder="Search orders" style="color: #202223;" />
              </div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <button class="btn-admin-secondary" style="border-radius:4px; border: 1px dashed #C9CCCF; padding:4px 8px; font-size: 13px;">Status <i data-lucide="chevron-down" style="width:14px;height:14px;"></i></button>
              <button class="btn-admin-secondary" style="border-radius:4px; border: 1px dashed #C9CCCF; padding:4px 8px; font-size: 13px;">Payment status <i data-lucide="chevron-down" style="width:14px;height:14px;"></i></button>
              <button class="btn-admin-secondary" style="border-radius:4px; border: 1px dashed #C9CCCF; padding:4px 8px; font-size: 13px;">Fulfillment status <i data-lucide="chevron-down" style="width:14px;height:14px;"></i></button>
              <button class="btn-admin-secondary" style="border-radius:4px; padding:4px 8px; font-size: 13px;"><i data-lucide="filter" style="width:14px;height:14px;margin-right:4px;"></i> More filters</button>
              <button class="btn-admin-secondary" style="border-radius:4px; padding:4px 8px; font-size: 13px;">Sort by: Order number <i data-lucide="chevron-down" style="width:14px;height:14px;"></i></button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="admin-table" style="width: 100%; text-align: left; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid var(--admin-border); font-size: 13px; color: #6D7175; font-weight: 600;">
                  <th style="padding: 12px; width: 40px;"><input type="checkbox" /></th>
                  <th style="padding: 12px;">Order</th>
                  <th style="padding: 12px;">Date</th>
                  <th style="padding: 12px;">Customer</th>
                  <th style="padding: 12px;">Channel</th>
                  <th style="padding: 12px; text-align:right;">Total</th>
                  <th style="padding: 12px;">Payment status</th>
                  <th style="padding: 12px;">Fulfillment status</th>
                  <th style="padding: 12px;">Items</th>
                  <th style="padding: 12px;">Delivery method</th>
                </tr>
              </thead>
              <tbody style="font-size: 14px; color: #202223;">
                <!-- Sample Order 1 -->
                <tr style="border-bottom: 1px solid var(--admin-border);">
                  <td style="padding: 12px;"><input type="checkbox" /></td>
                  <td style="padding: 12px; font-weight: 600;">#1015</td>
                  <td style="padding: 12px; color: #6D7175;">Today at 9:42 am</td>
                  <td style="padding: 12px;">Aisha Sharma</td>
                  <td style="padding: 12px;">Online Store</td>
                  <td style="padding: 12px; text-align:right;">₹12,499.00</td>
                  <td style="padding: 12px;"><span style="background: #E3F1DF; color: #008060; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">Paid</span></td>
                  <td style="padding: 12px;"><span style="background: #FFF5EA; color: #B98900; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">Unfulfilled</span></td>
                  <td style="padding: 12px;">2 items</td>
                  <td style="padding: 12px;">Standard Shipping</td>
                </tr>
                <!-- Sample Order 2 -->
                <tr style="border-bottom: 1px solid var(--admin-border);">
                  <td style="padding: 12px;"><input type="checkbox" /></td>
                  <td style="padding: 12px; font-weight: 600;">#1014</td>
                  <td style="padding: 12px; color: #6D7175;">Yesterday at 4:15 pm</td>
                  <td style="padding: 12px;">Rahul Patel</td>
                  <td style="padding: 12px;">Online Store</td>
                  <td style="padding: 12px; text-align:right;">₹8,999.00</td>
                  <td style="padding: 12px;"><span style="background: #E3F1DF; color: #008060; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">Paid</span></td>
                  <td style="padding: 12px;"><span style="background: #F1F2F3; color: #6D7175; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">Fulfilled</span></td>
                  <td style="padding: 12px;">1 item</td>
                  <td style="padding: 12px;">Express Delivery</td>
                </tr>
                 <!-- Sample Order 3 -->
                <tr style="border-bottom: 1px solid var(--admin-border);">
                  <td style="padding: 12px;"><input type="checkbox" /></td>
                  <td style="padding: 12px; font-weight: 600;">#1013</td>
                  <td style="padding: 12px; color: #6D7175;">Yesterday at 11:30 am</td>
                  <td style="padding: 12px;">Neha Gupta</td>
                  <td style="padding: 12px;">Online Store</td>
                  <td style="padding: 12px; text-align:right;">₹24,500.00</td>
                  <td style="padding: 12px;"><span style="background: #EBF5FA; color: #2C6ECB; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">Pending</span></td>
                  <td style="padding: 12px;"><span style="background: #FFF5EA; color: #B98900; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">Unfulfilled</span></td>
                  <td style="padding: 12px;">3 items</td>
                  <td style="padding: 12px;">Standard Shipping</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style="padding: 12px; border-top: 1px solid var(--admin-border); display: flex; justify-content: space-between; align-items: center; color: #6D7175; font-size: 13px;">
            <span>Showing 1 to 3 of 3 orders</span>
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
console.log('Updated orders.html body');
