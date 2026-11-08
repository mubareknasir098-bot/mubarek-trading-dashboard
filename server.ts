import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const distPath = path.resolve(__dirname, 'dist');

// Serve static assets from dist
app.use(express.static(distPath));

// Health check endpoint for Cloud Run
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback: send index.html for any navigation routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mubarek Trading Dashboard running on port ${PORT}`);
});
