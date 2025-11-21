const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'frontend', 'templates');
const PORT = process.env.PORT || 3000;

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mime[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

http.createServer((req, res) => {
  try {
    const safeUrl = decodeURI(req.url.split('?')[0]);
    let filePath = path.join(ROOT, safeUrl);

    // If request is directory or root, serve index.html
    if (safeUrl === '/' || safeUrl === '') {
      filePath = path.join(ROOT, 'index.html');
      return sendFile(res, filePath);
    }

    // Prevent path traversal
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      return res.end('Bad Request');
    }

    fs.stat(filePath, (err, stats) => {
      if (!err && stats.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
        return sendFile(res, filePath);
      }

      if (err || !stats.isFile()) {
        // Fallback to index.html for SPA routes
        const index = path.join(ROOT, 'index.html');
        if (fs.existsSync(index)) return sendFile(res, index);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('Not Found');
      }

      return sendFile(res, filePath);
    });
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server error');
  }
}).listen(PORT, () => {
  console.log(`Static server running at http://localhost:${PORT} (serving ${ROOT})`);
});
