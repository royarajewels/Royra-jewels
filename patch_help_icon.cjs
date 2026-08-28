const fs = require('fs');
const path = require('path');

const dir = 'admin/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

for (let file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  if (content.includes('<i data-lucide="bell"></i></button>') && !content.includes('<i data-lucide="help-circle"></i>')) {
    content = content.replace(/<button type="button" class="icon-btn"><i data-lucide="bell"><\/i><\/button>/,
      '<button type="button" class="icon-btn"><i data-lucide="bell"></i></button>\n          <button type="button" class="icon-btn"><i data-lucide="help-circle"></i></button>');
    fs.writeFileSync(path.join(dir, file), content);
  }
}
