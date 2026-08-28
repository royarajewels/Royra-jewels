const fs = require('fs');

let css = fs.readFileSync('admin/admin.css', 'utf8');

const additionalStyles = `
/* Topbar Brand & Colors */
.topbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}
.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #35B161; /* Shopify green icon style */
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  font-weight: 700;
  font-family: var(--admin-font-serif);
  font-size: 16px;
}
.brand-text {
  color: #FFFFFF;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.05em;
}

.topbar-right .icon-btn svg,
.topbar-right .profile-dropdown i,
.topbar-right .profile-name,
.mobile-menu-toggle {
  color: #FFFFFF !important;
  stroke: #FFFFFF !important;
}

.global-search {
  background-color: #2F2F2F !important;
  border: 1px solid #424242 !important;
}
.global-search input {
  color: #FFFFFF !important;
}
.global-search .search-icon {
  stroke: #8C8C8C !important;
}
.global-search .search-shortcut {
  background-color: #1A1A1A !important;
  color: #8C8C8C !important;
  border-color: #424242 !important;
}
.profile-dropdown:hover {
  background-color: #2F2F2F !important;
}
`;

if (!css.includes('.brand-logo {')) {
    css += additionalStyles;
}

fs.writeFileSync('admin/admin.css', css);
console.log('topbar css patched.');
