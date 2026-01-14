import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/db';
import { RabbitMQManager } from '../../common/rabbitmq';
import { errorHandler } from '../../common/error-handler';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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
    await connectDB(process.env.MONGODB_URI!);

    // Initialize RabbitMQ connection
    RabbitMQManager.getConnection(process.env.RABBITMQ_URL!);

    app.listen(PORT, () => {
        console.log(`Auth Service listening on port ${PORT}`);
    });
};

start();
