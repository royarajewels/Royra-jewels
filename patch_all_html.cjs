const fs = require('fs');
const path = require('path');

const dir = 'admin/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const profileDropdownHtml = `
          <div class="profile-dropdown" onclick="toggleProfileMenu(event)" style="cursor:pointer; position:relative;">
            <div class="avatar" style="background:#35B161; color:#fff; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:600;">MS</div>
            <span class="profile-name" style="color:#FFF; font-size:13px; font-weight:500;">Royra Jewels Admin</span>
            <i data-lucide="chevron-down" style="width:14px;height:14px;color:#FFF;"></i>
            
            <div id="profile-popover-menu" style="display:none; position:absolute; top:40px; right:0; background:#fff; border:1px solid #E5E5E5; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15); width:240px; z-index:1001; color:#202223; cursor:default;">
               <div style="padding:16px; border-bottom:1px solid #E5E5E5; display:flex; align-items:center; gap:12px;">
                 <div style="background:#35B161; color:#fff; width:36px; height:36px; border-radius:5px; display:flex; align-items:center; justify-content:center; font-weight:700;">RJ</div>
                 <div>
                   <div style="font-weight:600; font-size:14px;">Royra Jewels</div>
                   <div style="font-size:12px; color:#6D7175;">admin@royrajewels.com</div>
                 </div>
               </div>
               <div style="padding:8px 0; border-bottom:1px solid #E5E5E5;">
                 <a href="#" style="display:block; padding:8px 16px; font-size:13px; text-decoration:none; color:#202223;">Manage account</a>
                 <a href="#" style="display:block; padding:8px 16px; font-size:13px; text-decoration:none; color:#202223;">Stores</a>
               </div>
               <div style="padding:8px 0;">
                 <a href="login.html" style="display:block; padding:8px 16px; font-size:13px; text-decoration:none; color:#202223;">Log out</a>
               </div>
            </div>
          </div>
`;

// Script to toggle profile menu
const toggleScript = `
<script>
  function toggleProfileMenu(e) {
    e.stopPropagation();
    const menu = document.getElementById('profile-popover-menu');
    if(menu) {
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
  }
  document.addEventListener('click', function(e) {
    const menu = document.getElementById('profile-popover-menu');
    if(menu && menu.style.display === 'block') {
      menu.style.display = 'none';
    }
  });
</script>
`;

for (let file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  let modified = false;

  // Replace profile dropdown
  if (content.includes('<div class="profile-dropdown">')) {
     content = content.replace(/<div class="profile-dropdown">[\s\S]*?<\/div>\s*<\/div>/, profileDropdownHtml + '\n        </div>');
     modified = true;
  }
  
  if (modified && !content.includes('toggleProfileMenu(')) {
     content = content.replace(/<\/body>/, toggleScript + '\n</body>');
  }
  
  // Make back buttons explicitly use window.location
  if (content.includes('href="orders.html"')) {
     content = content.replace(/href="orders\.html"/g, 'href="orders.html" onclick="window.location.href=\'orders.html\'; return false;"');
     modified = true;
  }
  if (content.includes('href="products.html"')) {
     content = content.replace(/href="products\.html"/g, 'href="products.html" onclick="window.location.href=\'products.html\'; return false;"');
     modified = true;
  }
  
  // Sidebar fix: The prompt states submenu links are shown inline. The CSS `.nav-sub` was already fixed in admin.css.
  // We need to ensure `.nav-sub` doesn't have missing active link styling, but admin.css has `.nav-sub a:hover`.

  if (modified) {
     fs.writeFileSync(path.join(dir, file), content);
  }
}

console.log('All HTML files patched with profile dropdown and back buttons.');
