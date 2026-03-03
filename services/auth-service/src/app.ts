import { apiInfoLogger, errorHandler, notFound } from '@vortex/common';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import authRoutes from './routes/auth.routes';

const app: express.Application = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(apiInfoLogger);

// Routes
app.get('/', (req, res) => {
  res.json({
    service: 'auth-service',
    routes: { auth: '/api/auth', health: '/health' },
  });
});

app.get('/health', (req, res) => {
  res.json({
    service: 'auth-service',
    status: 'healthy',
    timestamp: new Date(),
  });
});

app.use('/api/auth', authRoutes);

// 404 handler
app.use(notFound);

// Error Handler
app.use(errorHandler);

export default app;
