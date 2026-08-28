import fs from 'fs';

const file = 'admin/index.html';
let content = fs.readFileSync(file, 'utf8');

const newContent = `
      <div class="admin-content" style="max-width: 1000px; margin: 0 auto;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <h1 style="font-size: 20px; font-weight: 600; color: #202223;">Here's what's happening with your store today.</h1>
          <div style="display: flex; gap: 8px;">
            <button class="btn-admin-secondary" style="padding: 6px 12px; font-size: 13px;">Today <i data-lucide="chevron-down" style="width:14px;height:14px;vertical-align:middle;"></i></button>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px;">
          <div class="admin-card" style="padding: 16px; margin-bottom: 0;">
            <div style="font-size: 13px; color: #6D7175; margin-bottom: 8px; display:flex; align-items:center; gap:4px;">Total sales <i data-lucide="info" style="width:12px;height:12px;"></i></div>
            <div style="font-size: 24px; font-weight: 600; color: #202223; margin-bottom: 8px;">₹0.00</div>
            <div style="font-size: 13px; color: #6D7175;">—</div>
          </div>
          <div class="admin-card" style="padding: 16px; margin-bottom: 0;">
            <div style="font-size: 13px; color: #6D7175; margin-bottom: 8px; display:flex; align-items:center; gap:4px;">Sessions <i data-lucide="info" style="width:12px;height:12px;"></i></div>
            <div style="font-size: 24px; font-weight: 600; color: #202223; margin-bottom: 8px;">0</div>
            <div style="font-size: 13px; color: #6D7175;">—</div>
          </div>
          <div class="admin-card" style="padding: 16px; margin-bottom: 0;">
            <div style="font-size: 13px; color: #6D7175; margin-bottom: 8px; display:flex; align-items:center; gap:4px;">Total orders <i data-lucide="info" style="width:12px;height:12px;"></i></div>
            <div style="font-size: 24px; font-weight: 600; color: #202223; margin-bottom: 8px;">0</div>
            <div style="font-size: 13px; color: #6D7175;">—</div>
          </div>
        </div>

        <!-- Tasks / Setup Guide -->
        <div class="admin-card">
          <div style="padding: 16px 20px; border-bottom: 1px solid var(--admin-border); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h2 style="font-size: 16px; font-weight: 600; color: #202223; margin-bottom:4px;">Setup guide</h2>
              <p style="font-size: 13px; color: #6D7175;">Use this personalized guide to get your store up and running.</p>
            </div>
            <div style="font-size:13px; font-weight:600; color:#202223;">0 / 5 completed</div>
          </div>
          <div style="padding: 0;">
            <div style="padding: 16px 20px; border-bottom: 1px solid var(--admin-border); display:flex; gap:16px;">
              <div style="margin-top:2px;"><i data-lucide="circle-dashed" style="color:#6D7175; width:20px;height:20px;"></i></div>
              <div>
                <h3 style="font-size: 14px; font-weight: 600; margin-bottom:4px;">Add your first product</h3>
                <p style="font-size: 13px; color: #6D7175; margin-bottom:12px;">Write a description, add photos, and set pricing for the products you plan to sell.</p>
                <a href="product-form.html" class="btn-admin-primary" style="display:inline-block; padding:6px 12px; font-size:13px; text-decoration:none;">Add product</a>
              </div>
            </div>
            <div style="padding: 16px 20px; border-bottom: 1px solid var(--admin-border); display:flex; gap:16px;">
              <div style="margin-top:2px;"><i data-lucide="circle-dashed" style="color:#6D7175; width:20px;height:20px;"></i></div>
              <div>
                <h3 style="font-size: 14px; font-weight: 600; margin-bottom:4px; color:#202223;">Customize your online store</h3>
              </div>
            </div>
            <div style="padding: 16px 20px; border-bottom: 1px solid var(--admin-border); display:flex; gap:16px;">
              <div style="margin-top:2px;"><i data-lucide="circle-dashed" style="color:#6D7175; width:20px;height:20px;"></i></div>
              <div>
                <h3 style="font-size: 14px; font-weight: 600; margin-bottom:4px; color:#202223;">Add a custom domain</h3>
              </div>
            </div>
            <div style="padding: 16px 20px; border-bottom: 1px solid var(--admin-border); display:flex; gap:16px;">
              <div style="margin-top:2px;"><i data-lucide="circle-dashed" style="color:#6D7175; width:20px;height:20px;"></i></div>
              <div>
                <h3 style="font-size: 14px; font-weight: 600; margin-bottom:4px; color:#202223;">Name your store</h3>
              </div>
            </div>
            <div style="padding: 16px 20px; display:flex; gap:16px;">
              <div style="margin-top:2px;"><i data-lucide="circle-dashed" style="color:#6D7175; width:20px;height:20px;"></i></div>
              <div>
                <h3 style="font-size: 14px; font-weight: 600; margin-bottom:4px; color:#202223;">Set up your payment provider</h3>
              </div>
            </div>
          </div>
        </div>

      </div>
`;

content = content.replace(/<div class="admin-content">[\s\S]*?(?=<\/main>)/, newContent);
fs.writeFileSync(file, content, 'utf8');
console.log('Updated index.html body');
