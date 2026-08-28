const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(/doc\.fontSize\(14\)\.text\('Total: ₹6,000\.00', \{ bold: true \}\);/,
"doc.font('Helvetica-Bold').fontSize(14).text('Total: ₹6,000.00');");
fs.writeFileSync('server.ts', content);
