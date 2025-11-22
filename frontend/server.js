const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Serve static files from templates directory
const staticPath = path.join(__dirname, 'templates');
app.use(express.static(staticPath));

// Proxy API and other dynamic routes that should go to the Flask backend
const apiProxyPaths = [
    '/contact',
    '/book-meeting',
    '/login',
    '/logout',
    '/admin',
    '/admin/*',
    '/api/*'
];

apiProxyPaths.forEach((p) => {
    app.use(p, createProxyMiddleware({
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
        logLevel: 'warn',
    }));
});

// For Single Page-like navigation, respond with index.html for missing routes
app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Frontend server (Node) is running on port ${PORT}`);
    console.log(`Proxying backend requests to ${BACKEND_URL}`);
});
