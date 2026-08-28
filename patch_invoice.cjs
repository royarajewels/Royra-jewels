const fs = require('fs');
let html = fs.readFileSync('admin/order-detail.html', 'utf8');

const newSendInvoice = `async function sendInvoice() {
      const email = document.getElementById('invoice-to').value;
      if (!email) {
        alert("Please enter customer email");
        return;
      }
      
      const btn = event.target;
      const originalText = btn.innerHTML;
      btn.innerHTML = 'Sending...';
      btn.disabled = true;
      
      try {
        const res = await fetch('/api/integration/generate-invoice', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            orderId: '1001',
            emailTo: email
          })
        });
        
        const data = await res.json();
        
        if (data.success) {
          alert('Invoice sent successfully to ' + email);
          closeInvoiceModal();
          
          // Add timeline entry
          const timeline = document.querySelector('.timeline-container');
          if (timeline) {
            const entry = document.createElement('div');
            entry.style = "display: flex; gap: 16px; margin-bottom: 20px;";
            entry.innerHTML = \`
              <div style="width: 32px; height: 32px; border-radius: 50%; background: #EBEBEB; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #6D7175;">
                <i data-lucide="mail" style="width:16px;height:16px;"></i>
              </div>
              <div style="flex: 1; padding-top: 6px;">
                <p style="margin: 0; font-size: 14px; color: #202223;">Invoice sent to <b>\${email}</b></p>
                <p style="margin: 4px 0 0; font-size: 13px; color: #6D7175;">Just now \${data.simulated ? '(Simulated/Ethereal)' : ''}</p>
              </div>
            \`;
            timeline.insertBefore(entry, timeline.children[1]); // insert after "Today" header
            lucide.createIcons();
          }
        } else {
          alert('Failed to send invoice: ' + data.error);
          closeInvoiceModal();
          
          // Add failure timeline entry
          const timeline = document.querySelector('.timeline-container');
          if (timeline) {
            const entry = document.createElement('div');
            entry.style = "display: flex; gap: 16px; margin-bottom: 20px;";
            entry.innerHTML = \`
              <div style="width: 32px; height: 32px; border-radius: 50%; background: #FDE8E8; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #D72C0D;">
                <i data-lucide="alert-circle" style="width:16px;height:16px;"></i>
              </div>
              <div style="flex: 1; padding-top: 6px;">
                <p style="margin: 0; font-size: 14px; color: #D72C0D;">Invoice failed to send</p>
                <p style="margin: 4px 0 0; font-size: 13px; color: #6D7175;">Just now - \${data.error}</p>
              </div>
            \`;
            timeline.insertBefore(entry, timeline.children[1]); // insert after "Today" header
            lucide.createIcons();
          }
        }
      } catch (err) {
        alert('Error: ' + err.message);
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }`;

html = html.replace(/async function sendInvoice\(\) \{[\s\S]*?async function printInvoice/, newSendInvoice + "\n\n    async function printInvoice");

// Also add "timeline-container" class to timeline div so we can select it
html = html.replace(/<h3 style="font-size: 14px; font-weight: 600; color: #202223; margin: 0 0 16px;">Timeline<\/h3>\s*<div>/, '<h3 style="font-size: 14px; font-weight: 600; color: #202223; margin: 0 0 16px;">Timeline</h3>\n            <div class="timeline-container">');

fs.writeFileSync('admin/order-detail.html', html);
