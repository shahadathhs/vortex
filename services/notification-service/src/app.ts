import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from '@vortex/common';

const app: express.Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ service: 'notification-service', status: 'healthy', timestamp: new Date() });
});

app.use(errorHandler);

export default app;
