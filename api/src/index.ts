import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { pool } from './db/client.js';
import usersRouter from './routes/users.js';
import conversationsRouter from './routes/conversations.js';
import messagesRouter from './routes/messages.js';
import ratingRouter from './routes/rating.js';
import adminRouter from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIST = path.join(__dirname, '../../app/dist');

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/users', usersRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/conversations', messagesRouter);
app.use('/api/conversations', ratingRouter);
app.use('/api/admin', adminRouter);

// Serve frontend static files
app.use(express.static(FRONTEND_DIST));

// SPA fallback — any non-API route serves index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(config.port, () => {
  console.log(`API running on http://localhost:${config.port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    pool.end();
  });
});
