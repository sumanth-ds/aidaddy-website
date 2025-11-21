const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'templates', 'index.html');

if (!fs.existsSync(filePath)) {
  console.error('index.html not found at', filePath);
  process.exit(1);
}

const backend = process.env.BACKEND_URL || 'https://aidaddy-backend.onrender.com';
let content = fs.readFileSync(filePath, 'utf8');

if (content.indexOf('__BACKEND_URL__') === -1) {
  console.log('No BACKEND_URL placeholder found; nothing to inject.');
  process.exit(0);
}

content = content.replace(/__BACKEND_URL__/g, backend);
fs.writeFileSync(filePath, content, 'utf8');
console.log(`Injected BACKEND_URL=${backend} into ${filePath}`);
