const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'templates', 'index.html');

if (!fs.existsSync(filePath)) {
  console.error('index.html not found at', filePath);
  process.exit(1);
}

// Prefer explicit BACKEND_URL env var, then VITE_API_BASE_URL from frontend .env; otherwise fail
const dotenv = require('dotenv');
const localEnvPath = path.join(__dirname, '..', 'react-frontend', '.env');
if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
}
const backend = process.env.BACKEND_URL || process.env.VITE_API_BASE_URL;
if (!backend) {
  console.error('No BACKEND_URL or VITE_API_BASE_URL found in environment or react-frontend/.env. Please set BACKEND_URL or VITE_API_BASE_URL before running this script.');
  process.exit(1);
}
let content = fs.readFileSync(filePath, 'utf8');

if (content.indexOf('__BACKEND_URL__') === -1) {
  console.log('No BACKEND_URL placeholder found; nothing to inject.');
  process.exit(0);
}

content = content.replace(/__BACKEND_URL__/g, backend);
fs.writeFileSync(filePath, content, 'utf8');
console.log(`Injected BACKEND_URL=${backend} into ${filePath}`);
