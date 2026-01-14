import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { errorHandler } from '@vortex/common';

const app = express();
const PORT = 3000;

app.use(helmet());
app.use(cors());

// Proxy routes
app.use(
  '/auth',
  createProxyMiddleware({
    target: 'http://127.0.0.1:3001',
    changeOrigin: true,
  }),
);

app.use(
  '/products',
  createProxyMiddleware({
    target: 'http://127.0.0.1:3002',
    changeOrigin: true,
  }),
);

app.use(
  '/orders',
  createProxyMiddleware({
    target: 'http://127.0.0.1:3003',
    changeOrigin: true,
  }),
);

app.get('/health', (req, res) => {
  res.json({ service: 'gateway', status: 'healthy', timestamp: new Date() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.info(`API Gateway listening on port ${PORT}`);
});
