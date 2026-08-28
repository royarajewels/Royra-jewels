import fs from 'fs';

let css = fs.readFileSync('admin.css', 'utf8');

// Replace Root Variables
css = css.replace(/:root\s*{[^}]*}/, `:root {
  --admin-bg: #F1F1F1;
  --admin-surface: #FFFFFF;
  --admin-sidebar-bg: #EBEBEB;
  --admin-sidebar-text: #303030;
  --admin-sidebar-muted: #616161;
  --admin-sidebar-active: #FFFFFF;
  --admin-sidebar-hover: #DCDCDC;
  
  --admin-header-bg: #1A1A1A;
  --admin-header-text: #FFFFFF;
  --admin-header-icon: #A6A6A6;
  
  --admin-text: #202223;
  --admin-text-secondary: #6D7175;
  --admin-text-muted: #8C9196;
  
  --admin-border: #E1E3E5;
  --admin-border-focus: #008060;
  
  --admin-accent: #1A1A1A;
  --admin-accent-hover: #303030;
  --admin-accent-light: #F3F3F3;
  
  --admin-success: #008060;
  --admin-success-bg: #E3F1DF;
  --admin-warning: #B98900;
  --admin-warning-bg: #FFF5EA;
  --admin-danger: #D82C0D;
  --admin-danger-bg: #FFEA8A;
  --admin-info: #2C6ECB;
  --admin-info-bg: #EBF5FA;
  
  --admin-sidebar-width: 240px;
  --admin-header-height: 56px;
  --admin-radius-sm: 4px;
  --admin-radius-md: 8px;
  --admin-radius-lg: 12px;
  
  --admin-font: -apple-system, BlinkMacSystemFont, 'San Francisco', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  --admin-font-serif: 'Playfair Display', Georgia, serif;
}`);

// Inject CSS overrides at the end
const newCss = `
/* --- SHOPIFY ADMIN STYLE OVERRIDES --- */
.admin-topbar {
  background: var(--admin-header-bg);
  color: var(--admin-header-text);
  height: var(--admin-header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 50;
}
.topbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.topbar-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--admin-header-text);
}
.brand-logo {
  background: #A68B5B;
  color: #fff;
  font-weight: bold;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 14px;
}
.brand-text {
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.5px;
}
.topbar-center {
  flex: 1;
  max-width: 480px;
  margin: 0 24px;
}
.global-search {
  position: relative;
  display: flex;
  align-items: center;
  background: #2A2A2A;
  border-radius: 6px;
  border: 1px solid #333;
  padding: 0 12px;
  height: 32px;
}
.global-search input {
  background: transparent;
  border: none;
  color: #FFF;
  flex: 1;
  outline: none;
  font-size: 14px;
  padding: 0 8px;
}
.global-search input::placeholder {
  color: #A6A6A6;
}
.search-icon {
  color: #A6A6A6;
  width: 16px;
  height: 16px;
}
.search-shortcut {
  background: #333;
  color: #A6A6A6;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.topbar-right .icon-btn {
  background: transparent;
  border: none;
  color: var(--admin-header-icon);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
}
.topbar-right .icon-btn:hover {
  background: #333;
  color: #FFF;
}
.profile-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #2A2A2A;
  padding: 4px 8px 4px 4px;
  border-radius: 16px;
  cursor: pointer;
  color: #FFF;
  font-size: 13px;
  font-weight: 500;
}
.profile-dropdown .avatar {
  background: #008060;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
}
.profile-dropdown:hover {
  background: #333;
}

.admin-sidebar {
  background: var(--admin-sidebar-bg);
  border-right: none;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
}
.sidebar-nav {
  flex: 1;
  padding: 0 12px;
  overflow-y: auto;
}
.nav-link {
  color: var(--admin-sidebar-text);
  padding: 6px 12px;
  margin-bottom: 2px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}
.nav-link:hover {
  background: var(--admin-sidebar-hover);
  color: var(--admin-sidebar-text);
}
.nav-link.active {
  background: var(--admin-sidebar-active);
  font-weight: 600;
}
.nav-section-title {
  color: var(--admin-sidebar-muted);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 12px;
  margin-bottom: 8px;
}
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #DCDCDC;
}
.store-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.store-logo-sm {
  background: #1A1A1A;
  color: #FFF;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: bold;
  font-size: 13px;
}
.store-details {
  display: flex;
  flex-direction: column;
}
.store-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--admin-sidebar-text);
}
.store-loc {
  font-size: 12px;
  color: var(--admin-sidebar-muted);
}
.nav-group .nav-sub {
  margin-left: 32px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
  margin-bottom: 8px;
}
.nav-sub a {
  color: var(--admin-sidebar-muted);
  text-decoration: none;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
}
.nav-sub a:hover, .nav-sub a.active {
  background: var(--admin-sidebar-hover);
  color: var(--admin-sidebar-text);
}

.admin-card {
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-md);
  margin-bottom: 20px;
}
.admin-card-header {
  border-bottom: 1px solid var(--admin-border);
  padding: 16px 20px;
}
.admin-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #202223;
}
.admin-main {
  background: var(--admin-bg);
}
.btn-admin-primary {
  background: var(--admin-accent);
  border-radius: var(--admin-radius-sm);
  color: #FFF;
  font-weight: 600;
}
.btn-admin-primary:hover {
  background: var(--admin-accent-hover);
}
.btn-admin-secondary {
  background: #FFF;
  border: 1px solid #C9CCCF;
  color: #202223;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  border-radius: var(--admin-radius-sm);
}
.btn-admin-secondary:hover {
  background: #F6F6F7;
}
.form-input, .form-select, .form-textarea {
  border-radius: var(--admin-radius-sm);
  border: 1px solid #C9CCCF;
}
`;

fs.writeFileSync('admin.css', css + newCss, 'utf8');
console.log('admin.css updated');
