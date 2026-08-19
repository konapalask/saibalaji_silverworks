// Sai Balaji Silverworks - 24/7 Production Frontend Server (Port 5173)
// Serves optimized React build and seamlessly proxies /api and /public to Node.js backend (Port 8000).

const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');

const app = express();
const PORT = 5173;
const distDir = path.join(__dirname, '../frontend/dist');

// Reverse Proxy for Backend APIs (Port 8000)
const proxyToBackend = (req, res) => {
  const options = {
    hostname: '127.0.0.1',
    port: 8000,
    path: req.originalUrl,
    method: req.method,
    headers: { ...req.headers, host: '127.0.0.1:8000' }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.status(502).json({ detail: 'Backend server connection error', error: err.message });
  });

  req.pipe(proxyReq, { end: true });
};

app.use('/api', proxyToBackend);
app.use('/public', proxyToBackend);
app.use('/docs', proxyToBackend);
app.use('/openapi.json', proxyToBackend);

// Serve Static Frontend Assets
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.send('<h1>Building frontend... Please wait a moment.</h1>');
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sai Balaji 24/7 Frontend Server is listening on http://0.0.0.0:${PORT}`);
});
