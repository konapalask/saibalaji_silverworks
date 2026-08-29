// Sai Balaji Silverworks - 24/7 Production Frontend Server (Port 5173)
// Serves optimized React build and seamlessly proxies /api and /public to Node.js backend (Port 8000).

const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 5173;
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

// Serve static assets with long cache
app.use('/assets', express.static(path.join(distDir, 'assets'), {
  maxAge: '1y',
  immutable: true
}));

// Static files in root of dist (favicon, robots.txt, etc.)
app.use(express.static(distDir, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// SPA Fallback for all other routes - always send index.html with no-cache headers
app.get('*', (req, res) => {
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.sendFile(indexPath);
  }
  res.status(503).send(`
    <!DOCTYPE html>
    <html>
      <head><title>Sai Balaji Silverworks - Updating</title></head>
      <body style="font-family:sans-serif;text-align:center;padding:50px;background:#FAF9F5;">
        <h2>Sai Balaji Silverworks Server is updating...</h2>
        <p>Rebuilding latest production version. Please refresh in a few seconds.</p>
        <script>setTimeout(() => window.location.reload(), 3000);</script>
      </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sai Balaji 24/7 Frontend Server is listening on http://0.0.0.0:${PORT}`);
});

