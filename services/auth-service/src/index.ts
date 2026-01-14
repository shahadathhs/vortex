import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/db';
import { RabbitMQManager, errorHandler } from '@vortex/common';
import { createConfig, AuthEnv } from '@vortex/config';
import { ServicePort } from '@vortex/constants';
import authRoutes from './routes/auth.routes';

const config = createConfig(AuthEnv, ServicePort.AUTH);
const app = express();
const PORT = config.PORT;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ service: 'auth-service', status: 'healthy', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);

// Error Handler
app.use(errorHandler);

// Start server
const start = async () => {
  try {
    await connectDB(config.MONGODB_URI);

    // Initialize RabbitMQ connection
    RabbitMQManager.getConnection(config.RABBITMQ_URL);

    app.listen(PORT, () => {
      console.info(`Auth Service listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Auth Service', error);
  }
};

start();
