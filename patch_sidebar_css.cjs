const fs = require('fs');

let css = fs.readFileSync('admin/admin.css', 'utf8');

// Update global anchor reset
if (!css.includes('a { text-decoration: none; color: inherit; }')) {
    css = css.replace(/body\.admin-body \{/, 'a { text-decoration: none; color: inherit; }\n\nbody.admin-body {');
}

// Update variables for light sidebar and black header
css = css.replace(/--admin-sidebar-bg: #1F1F1F;/g, '--admin-sidebar-bg: #EBEBEB;'); // Shopify sidebar bg
css = css.replace(/--admin-sidebar-text: #E5E5E5;/g, '--admin-sidebar-text: #303030;');
css = css.replace(/--admin-sidebar-muted: #8E8E8E;/g, '--admin-sidebar-muted: #616161;');
css = css.replace(/--admin-sidebar-active: #2C2C2C;/g, '--admin-sidebar-active: #FFFFFF;');
css = css.replace(/--admin-sidebar-hover: #262626;/g, '--admin-sidebar-hover: #DCDCDC;');

// Header background
css = css.replace(/\.admin-topbar \{[\s\S]*?\}/, (match) => {
    return match.replace(/background-color: var\(--admin-surface\);/, 'background-color: #1A1A1A; /* Black header */')
                .replace(/border-bottom: 1px solid var\(--admin-border\);/, 'border-bottom: none;');
});

// Topbar text colors
css = css.replace(/\.topbar-title \{[\s\S]*?\}/, (match) => {
    return match.replace(/color: var\(--admin-text\);/, 'color: #FFFFFF;');
});

// Brand colors
css = css.replace(/\.brand-text \{[\s\S]*?\}/, (match) => {
    return match.replace(/color: #1F1F1F;/, 'color: #FFFFFF;').replace(/color: var\(--admin-text\);/, 'color: #FFFFFF;');
});
css = css.replace(/\.brand-logo \{[\s\S]*?\}/, (match) => {
    return match.replace(/color: var\(--admin-surface\);/, 'color: #FFFFFF;');
});

// Update nav link styles
css = css.replace(/\.nav-link \{[\s\S]*?\}/, (match) => {
    return match.replace(/color: var\(--admin-sidebar-text\);/, 'color: #303030;');
});
css = css.replace(/\.nav-link:hover \{[\s\S]*?\}/, (match) => {
    return match.replace(/color: #FFFFFF;/, 'color: #303030;');
});
css = css.replace(/\.nav-link:hover svg \{[\s\S]*?\}/, (match) => {
    return match.replace(/stroke: #FFFFFF;/, 'stroke: #303030;');
});
css = css.replace(/\.nav-link\.active \{[\s\S]*?\}/, (match) => {
    return match.replace(/color: #FFFFFF;/, 'color: #303030;')
                .replace(/border-left: 3px solid var\(--admin-accent\);/, 'border-radius: 6px;');
});
css = css.replace(/\.nav-link\.active svg \{[\s\S]*?\}/, (match) => {
    return match.replace(/stroke: var\(--admin-accent\);/, 'stroke: #303030;');
});

// Add .nav-sub styles if missing or broken
if (!css.includes('.nav-sub {')) {
    css += `
/* Nav Submenu */
.nav-group {
  display: flex;
  flex-direction: column;
}
.nav-sub {
  display: flex;
  flex-direction: column;
  padding-left: 32px;
  margin-top: 2px;
  gap: 4px;
}
.nav-sub a {
  font-size: 13px;
  color: #616161;
  padding: 6px 12px;
  border-radius: 6px;
  transition: background 0.1s;
}
.nav-sub a:hover {
  background-color: #DCDCDC;
  color: #303030;
}
`;
} else {
    // If it exists, update it to make sure it's flex column
    css = css.replace(/\.nav-sub \{[\s\S]*?\}/, '.nav-sub { display: flex; flex-direction: column; padding-left: 32px; margin-top: 2px; gap: 4px; }');
    css = css.replace(/\.nav-sub a \{[\s\S]*?\}/, '.nav-sub a { font-size: 13px; color: #616161; padding: 6px 12px; border-radius: 6px; transition: background 0.1s; }');
}

// Adjust sidebar to be below header if Shopify does this. Actually, Shopify's header spans full width, and sidebar is below it.
// Let's modify layout:
css = css.replace(/\.admin-sidebar \{[\s\S]*?\}/, (match) => {
    return match.replace(/top: 0;/, 'top: var(--admin-header-height);');
});

fs.writeFileSync('admin/admin.css', css);
console.log('admin.css patched successfully.');
