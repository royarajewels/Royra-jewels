import fs from 'fs';

const css = `
/* ==========================================================================
   ROYRA JEWELS - PROFESSIONAL ADMIN DASHBOARD STYLES
   Matches Shopify-style SaaS Admin UI
   ========================================================================== */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --admin-bg: #F1F2F4;
  --admin-surface: #FFFFFF;
  --admin-sidebar-bg: #EBEBEB;
  --admin-sidebar-text: #202223;
  --admin-sidebar-muted: #6D7175;
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
  
  --admin-font: 'Inter', -apple-system, BlinkMacSystemFont, 'San Francisco', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body.admin-body {
  font-family: var(--admin-font);
  background-color: var(--admin-bg);
  color: var(--admin-text);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* --- SIDEBAR --- */
.admin-sidebar {
  width: var(--admin-sidebar-width);
  background-color: var(--admin-sidebar-bg);
  color: var(--admin-sidebar-text);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border-right: 1px solid var(--admin-border);
  z-index: 100;
  overflow: hidden;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--admin-sidebar-text);
  padding: 6px 12px;
  margin-bottom: 2px;
  border-radius: var(--admin-radius-sm);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.15s ease;
}

.nav-link:hover {
  background: var(--admin-sidebar-hover);
  text-decoration: none;
  color: var(--admin-sidebar-text);
}

.nav-link.active {
  background: var(--admin-sidebar-active);
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.nav-link i {
  width: 20px;
  height: 20px;
  color: var(--admin-sidebar-muted);
}

.nav-link.active i {
  color: var(--admin-sidebar-text);
}

.nav-group {
  margin-bottom: 2px;
}

.nav-sub {
  margin-left: 36px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
  margin-bottom: 8px;
}

.nav-sub a {
  color: var(--admin-sidebar-muted);
  text-decoration: none;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: var(--admin-radius-sm);
  display: block;
}

.nav-sub a:hover, .nav-sub a.active {
  background: var(--admin-sidebar-hover);
  color: var(--admin-sidebar-text);
  text-decoration: none;
}

.nav-section-title {
  color: var(--admin-sidebar-muted);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 12px;
  margin-bottom: 8px;
  margin-top: 16px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--admin-border);
}

.store-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px;
  border-radius: var(--admin-radius-sm);
}
.store-info:hover {
  background: var(--admin-sidebar-hover);
}

.store-logo-sm {
  background: var(--admin-accent);
  color: #FFF;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--admin-radius-sm);
  font-weight: bold;
  font-size: 13px;
  font-family: 'Playfair Display', serif;
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

/* --- MAIN LAYOUT --- */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--admin-bg);
}

/* --- HEADER --- */
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

.mobile-menu-toggle {
  background: none;
  border: none;
  color: var(--admin-header-text);
  cursor: pointer;
  display: none; /* hidden on desktop */
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
  color: #1A1A1A;
  font-weight: bold;
  font-family: 'Playfair Display', serif;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--admin-radius-sm);
  font-size: 16px;
}

.brand-text {
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
  color: #FFFFFF;
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
  border-radius: var(--admin-radius-sm);
  border: 1px solid #3A3A3A;
  padding: 0 12px;
  height: 32px;
}

.global-search input {
  background: transparent;
  border: none;
  color: #FFF;
  flex: 1;
  outline: none;
  font-size: 13px;
  padding: 0 8px;
  font-family: var(--admin-font);
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
  border-radius: var(--admin-radius-sm);
  font-weight: 500;
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
  border-radius: var(--admin-radius-sm);
}

.topbar-right .icon-btn:hover {
  background: #333;
  color: #FFF;
}

.profile-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  padding: 4px 8px 4px 4px;
  border-radius: 16px;
  cursor: pointer;
  color: #FFF;
  font-size: 13px;
  font-weight: 500;
}

.profile-dropdown .avatar {
  background: #A68B5B;
  color: #1A1A1A;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
}

.profile-dropdown:hover {
  background: #2A2A2A;
}

/* --- CONTENT AREA --- */
.admin-content {
  flex: 1;
  padding: 32px 40px;
  overflow-y: auto;
}

/* --- CARDS --- */
.admin-card {
  background: var(--admin-surface);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-md);
  margin-bottom: 20px;
  overflow: hidden;
}

.admin-card-header {
  border-bottom: 1px solid var(--admin-border);
  padding: 16px 20px;
}

/* --- BUTTONS --- */
.btn-admin-primary {
  background: var(--admin-accent);
  border: 1px solid var(--admin-accent);
  border-radius: var(--admin-radius-sm);
  color: #FFF;
  font-weight: 600;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  font-family: var(--admin-font);
  transition: background 0.1s;
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
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  font-family: var(--admin-font);
  transition: background 0.1s;
}

.btn-admin-secondary:hover {
  background: #F6F6F7;
}

/* --- FORMS --- */
.form-input, .form-select, .form-textarea {
  border-radius: var(--admin-radius-sm);
  border: 1px solid #C9CCCF;
  padding: 8px 12px;
  font-size: 14px;
  font-family: var(--admin-font);
  color: var(--admin-text);
  width: 100%;
  outline: none;
  transition: border-color 0.15s;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  border-color: var(--admin-border-focus);
  box-shadow: 0 0 0 1px var(--admin-border-focus);
}

/* --- TABLES --- */
.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  padding: 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--admin-sidebar-muted);
  border-bottom: 1px solid var(--admin-border);
  background: var(--admin-surface);
}

.admin-table td {
  padding: 12px;
  font-size: 14px;
  color: var(--admin-text);
  border-bottom: 1px solid var(--admin-border);
  vertical-align: middle;
}

.admin-table tr:hover td {
  background: #F9FAFB;
}

/* --- TOAST --- */
.admin-toast-container {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
}
.admin-toast {
  background: #1A1A1A;
  color: #FFF;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  gap: 12px;
}
`
fs.writeFileSync('admin.css', css, 'utf8');
console.log('CSS Rewritten');
