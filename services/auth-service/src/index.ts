import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/db';
import { RabbitMQManager, errorHandler, getConfig } from '@vortex/common';
import authRoutes from './routes/auth.routes';

const config = getConfig();
const app = express();
const PORT = config.PORT;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ service: 'auth-service', status: 'healthy', timestamp: new Date() });
});

// Error handling
app.use(errorHandler);

// Start server
const start = async () => {
  await connectDB(config.MONGODB_URI);

  // Initialize RabbitMQ connection
  RabbitMQManager.getConnection(config.RABBITMQ_URL);

  app.listen(PORT, () => {
    console.info(`Auth Service listening on port ${PORT}`);
  });
};

start();
