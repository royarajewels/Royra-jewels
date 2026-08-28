const fs = require('fs');
let html = fs.readFileSync('admin/product-form.html', 'utf8');

// 1. Add AI Generate Control
const aiControlHTML = `
                    <div style="width:1px; background:#C9CCCF;"></div>
                    <button type="button" onclick="openAIGenerator()" style="border:none;background:none;cursor:pointer; display:flex; align-items:center; gap:4px; color:#A68B5B;"><i data-lucide="sparkles" style="width:14px;height:14px;"></i> <span style="font-size:12px; font-weight:600;">Generate text</span></button>
`;
html = html.replace(/<button style="border:none;background:none;cursor:pointer;"><i data-lucide="image" style="width:14px;height:14px;"><\/i><\/button>/, '<button style="border:none;background:none;cursor:pointer;"><i data-lucide="image" style="width:14px;height:14px;"></i></button>' + aiControlHTML);

// 2. Add AI Modal
const aiModal = `
  <!-- AI Generator Modal -->
  <div id="ai-generator-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1000; align-items:center; justify-content:center;">
    <div style="background:#fff; width: 400px; border-radius:8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); overflow:hidden; display:flex; flex-direction:column;">
      <div style="padding:16px; border-bottom:1px solid #E5E5E5; display:flex; justify-content:space-between; align-items:center;">
        <h4 style="margin:0; font-size:14px; font-weight:600;">Generate text</h4>
        <button onclick="closeAIGenerator()" style="background:none;border:none;cursor:pointer;"><i data-lucide="x" style="width:16px;height:16px;"></i></button>
      </div>
      <div style="padding:16px;">
        <label style="font-size:13px; color:#6D7175; margin-bottom:8px; display:block;">Describe what you want to write</label>
        <textarea id="ai-prompt-input" rows="3" style="width:100%; border:1px solid #C9CCCF; border-radius:4px; padding:8px; font-size:13px; resize:none;" placeholder="E.g. A luxurious description for a silver diamond ring..."></textarea>
      </div>
      <div style="padding:16px; border-top:1px solid #E5E5E5; display:flex; justify-content:flex-end; gap:8px;">
        <button onclick="closeAIGenerator()" class="btn-admin-secondary">Cancel</button>
        <button onclick="runAIGenerator()" class="btn-admin-primary" style="background:#35B161; color:#fff; display:flex; align-items:center; gap:6px;"><i data-lucide="sparkles" style="width:14px;height:14px;"></i> Generate</button>
      </div>
    </div>
  </div>
`;
html = html.replace(/<\/body>/, aiModal + '\n</body>');

// 3. Make Media buttons work
html = html.replace(/<button class="btn-admin-secondary" style="font-size:13px; font-weight:600; padding:4px 12px; border-radius:4px;">Upload new<\/button>/, 
  `<button class="btn-admin-secondary" style="font-size:13px; font-weight:600; padding:4px 12px; border-radius:4px;" onclick="document.getElementById('media-upload-input').click()">Upload new</button><input type="file" id="media-upload-input" style="display:none;" multiple accept="image/*,video/*" onchange="handleMediaUpload(this)" />`);
html = html.replace(/<button class="btn-admin-secondary" style="font-size:13px; font-weight:600; padding:4px 12px; border-radius:4px;">Select existing<\/button>/,
  `<button class="btn-admin-secondary" style="font-size:13px; font-weight:600; padding:4px 12px; border-radius:4px;" onclick="alert('Opening existing media gallery...')">Select existing</button>`);

// 4. Add the product-form specific scripts
const scripts = `
<script>
  function openAIGenerator() {
    document.getElementById('ai-generator-modal').style.display = 'flex';
  }
  function closeAIGenerator() {
    document.getElementById('ai-generator-modal').style.display = 'none';
  }
  function runAIGenerator() {
    const prompt = document.getElementById('ai-prompt-input').value;
    if(!prompt) return;
    const btn = document.querySelector('#ai-generator-modal .btn-admin-primary');
    btn.innerHTML = '<i data-lucide="loader" class="spin"></i> Generating...';
    
    // Simulate AI generation
    setTimeout(() => {
      document.querySelector('textarea[rows="4"]').value = "Experience the epitome of elegance with this beautifully crafted piece. Designed to seamlessly blend modern sophistication with timeless luxury, it features intricate detailing and premium materials that ensure lasting brilliance. Perfect for sensitive skin and guaranteed to make a statement on any occasion.";
      closeAIGenerator();
      btn.innerHTML = '<i data-lucide="sparkles" style="width:14px;height:14px;"></i> Generate';
    }, 1500);
  }
  
  function handleMediaUpload(input) {
    if(input.files && input.files.length > 0) {
      window.showAdminToast(input.files.length + ' file(s) uploaded successfully');
    }
  }
</script>
`;
html = html.replace(/<\/body>/, scripts + '\n</body>');

fs.writeFileSync('admin/product-form.html', html);
