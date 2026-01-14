import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { RabbitMQManager, errorHandler, getConfig } from '@vortex/common';

const config = getConfig();
const app = express();
const PORT = config.PORT;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ service: 'notification-service', status: 'healthy', timestamp: new Date() });
});

app.use(errorHandler);

const start = async () => {
  try {
    const connection = RabbitMQManager.getConnection(config.RABBITMQ_URL);

    // Create a channel for consuming events later
    connection.createChannel({
      setup: (channel: any) => {
        return Promise.all([
          channel.assertQueue('order_events', { durable: true }),
          channel.consume('order_events', (msg: any) => {
            if (msg) {
              console.info('Received event:', msg.content.toString());
              channel.ack(msg);
            }
          }),
        ]);
      },
    });

    app.listen(PORT, () => {
      console.info(`Notification Service listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Notification Service', error);
  }
};

start();
