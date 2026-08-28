import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adminDir = path.join(__dirname, 'admin');
const files = fs.readdirSync(adminDir).filter(f => f.endsWith('.html'));

const sidebarHtml = `
    <!-- MOBILE OVERLAY -->
    <div id="admin-sidebar-overlay" class="admin-sidebar-overlay" onclick="toggleAdminSidebar()"></div>
    <!-- SIDEBAR -->
    <aside id="admin-sidebar" class="admin-sidebar">
      <nav class="sidebar-nav">
        <a href="index.html" class="nav-link"><i data-lucide="home"></i><span>Home</span></a>
        
        <a href="orders.html" class="nav-link"><i data-lucide="inbox"></i><span>Orders</span></a>
        
        <div class="nav-group">
          <a href="products.html" class="nav-link"><i data-lucide="tag"></i><span>Products</span></a>
          <div class="nav-sub">
            <a href="products.html">All Products</a>
            <a href="collections.html">Collections</a>
            <a href="categories.html">Categories</a>
            <a href="#">Brands</a>
          </div>
        </div>
        
        <a href="customers.html" class="nav-link"><i data-lucide="users"></i><span>Customers</span></a>
        
        <a href="inventory.html" class="nav-link"><i data-lucide="package"></i><span>Inventory</span></a>
        
        <div class="nav-group">
          <a href="#" class="nav-link"><i data-lucide="shopping-bag"></i><span>Purchases</span></a>
          <div class="nav-sub">
            <a href="#">Purchase Orders</a>
            <a href="suppliers.html">Suppliers</a>
          </div>
        </div>
        
        <div class="nav-group">
          <a href="#" class="nav-link"><i data-lucide="trending-up"></i><span>Sales</span></a>
          <div class="nav-sub">
            <a href="orders.html">Orders</a>
            <a href="#">Invoices</a>
            <a href="returns.html">Returns</a>
          </div>
        </div>
        
        <a href="coupons.html" class="nav-link"><i data-lucide="percent"></i><span>Discounts</span></a>
        
        <a href="#" class="nav-link"><i data-lucide="megaphone"></i><span>Marketing</span></a>
        
        <div class="nav-group">
          <a href="#" class="nav-link"><i data-lucide="bar-chart-2"></i><span>Reports</span></a>
          <div class="nav-sub">
            <a href="#">Reports</a>
            <a href="#">Analytics</a>
          </div>
        </div>
        
        <a href="settings.html" class="nav-link"><i data-lucide="settings"></i><span>Settings</span></a>
        
        <div class="nav-section-title" style="margin-top:24px">Sales Channels</div>
        <a href="#" class="nav-link"><i data-lucide="store"></i><span>Online Store</span></a>
        <a href="#" class="nav-link"><i data-lucide="monitor-smartphone"></i><span>Point of Sale</span></a>
        <a href="#" class="nav-link"><i data-lucide="smartphone"></i><span>Mobile App</span></a>
        
        <div class="nav-section-title" style="margin-top:24px">Apps</div>
        <a href="#" class="nav-link"><i data-lucide="grid"></i><span>Apps</span></a>
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
    </aside>
`;

const headerHtml = `
      <header class="admin-topbar">
        <div class="topbar-left">
          <button type="button" class="mobile-menu-toggle" onclick="toggleAdminSidebar()">
            <i data-lucide="menu"></i>
          </button>
          <a href="index.html" class="topbar-brand">
            <span class="brand-logo">RJ</span>
            <span class="brand-text">ROYRA JEWELS</span>
          </a>
        </div>
        <div class="topbar-center">
          <div class="global-search">
            <i data-lucide="search" class="search-icon"></i>
            <input type="text" placeholder="Search" />
            <span class="search-shortcut">CTRL K</span>
          </div>
        </div>
        <div class="topbar-right">
          <button type="button" class="icon-btn"><i data-lucide="bell"></i></button>
          <button type="button" class="icon-btn"><i data-lucide="help-circle"></i></button>
          <div class="profile-dropdown">
            <div class="avatar">MS</div>
            <span class="profile-name">Royra Jewels Admin</span>
            <i data-lucide="chevron-down"></i>
          </div>
        </div>
      </header>
`;

files.forEach(file => {
  const filePath = path.join(adminDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace Sidebar
  content = content.replace(/<!-- MOBILE OVERLAY -->[\s\S]*?<\/aside>/g, sidebarHtml);
  
  // Replace Header
  content = content.replace(/<header class="admin-topbar">[\s\S]*?<\/header>/g, headerHtml);
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
