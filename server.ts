import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

const distPath = path.resolve(__dirname, 'dist');

// Health check endpoints for deployment health checks and monitoring
app.get(['/health', '/_healthz', '/api/health'], (_req, res) => {
  res.status(200).send('OK');
});

// Serve static assets from Vite build directory
app.use(express.static(distPath, {
  maxAge: '1d',
  index: false,
}));

// SPA routing fallback: send index.html for all GET requests that didn't match a static file
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const server = app.listen(PORT, HOST, () => {
  console.log(`[RyokoRent] Production server listening on http://${HOST}:${PORT}`);
});

// Graceful shutdown handling for Cloud Run container lifecycle
const shutdown = () => {
  console.log('[RyokoRent] Received shutdown signal, closing server...');
  server.close(() => {
    console.log('[RyokoRent] Server closed successfully.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
