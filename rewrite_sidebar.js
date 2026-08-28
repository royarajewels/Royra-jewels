import fs from 'fs';
import path from 'path';

const newSidebar = `    <!-- SIDEBAR -->
    <aside id="admin-sidebar" class="admin-sidebar">
      <nav class="sidebar-nav">
        <a href="index.html" class="nav-link"><i data-lucide="home"></i><span>Home</span></a>
        
        <div class="nav-group">
          <a href="orders.html" class="nav-link"><i data-lucide="inbox"></i><span>Orders</span></a>
          <div class="nav-sub">
            <a href="#">Drafts</a>
            <a href="#">Abandoned checkouts</a>
          </div>
        </div>
        
        <div class="nav-group">
          <a href="products.html" class="nav-link"><i data-lucide="tag"></i><span>Products</span></a>
          <div class="nav-sub">
            <a href="collections.html">Collections</a>
            <a href="inventory.html">Inventory</a>
            <a href="purchase-orders.html">Purchase orders</a>
            <a href="#">Transfers</a>
            <a href="gift-cards.html">Gift cards</a>
          </div>
        </div>
        
        <div class="nav-group">
          <a href="customers.html" class="nav-link"><i data-lucide="users"></i><span>Customers</span></a>
          <div class="nav-sub">
            <a href="#">Segments</a>
            <a href="#">Companies</a>
          </div>
        </div>
        
        <a href="#" class="nav-link"><i data-lucide="trending-up"></i><span>Growth</span></a>
        <a href="coupons.html" class="nav-link"><i data-lucide="percent"></i><span>Discounts</span></a>
        <a href="#" class="nav-link"><i data-lucide="file-text"></i><span>Content</span></a>
        <a href="#" class="nav-link"><i data-lucide="globe"></i><span>Markets</span></a>
        <a href="#" class="nav-link"><i data-lucide="bar-chart-2"></i><span>Analytics</span></a>
        
        <div class="nav-section-title">Sales channels <i data-lucide="chevron-right" style="width:14px;height:14px;float:right;cursor:pointer;"></i></div>
        <a href="#" class="nav-link"><i data-lucide="store"></i><span>Online Store</span></a>
        <a href="#" class="nav-link"><i data-lucide="bot"></i><span>Agentic</span></a>
        <a href="#" class="nav-link"><i data-lucide="monitor-smartphone"></i><span>Point of Sale</span></a>
        
        <div class="nav-section-title">Apps <i data-lucide="chevron-right" style="width:14px;height:14px;float:right;cursor:pointer;"></i></div>
        <a href="#" class="nav-link"><i data-lucide="message-square"></i><span>Messaging</span></a>
        <a href="#" class="nav-link"><i data-lucide="message-circle"></i><span>Sidekick conversations</span></a>
        
        <div style="margin-top: 16px;"></div>
        <a href="settings.html" class="nav-link"><i data-lucide="settings"></i><span>Settings</span></a>
      </nav>
      
      <div class="sidebar-footer">
        <div class="store-info">
          <div class="store-logo-sm">RJ</div>
          <div class="store-details">
            <div class="store-name">Royra Jewels</div>
            <div class="store-loc">Jaipur, India</div>
          </div>
        </div>
      </div>
    </aside>`;

const files = fs.readdirSync('admin').filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join('admin', file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  const sidebarRegex = /<!-- SIDEBAR -->[\s\S]*?<\/aside>/;
  if (sidebarRegex.test(content)) {
    content = content.replace(sidebarRegex, newSidebar);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated sidebar in ${file}`);
  }
});
