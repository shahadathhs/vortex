import { Router, Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { RabbitMQManager } from '@vortex/common';
import { EventName, QueueName } from '@vortex/constants';
import { createConfig, OrderEnv } from '@vortex/config';
import { ServicePort } from '@vortex/constants';

const config = createConfig(OrderEnv, ServicePort.ORDER);

const router: Router = Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, productId, quantity, totalPrice } = req.body;

    // Create order in DB
    const order = await Order.create({ userId, productId, quantity, totalPrice });

    // Emit event to RabbitMQ
    const connection = RabbitMQManager.getConnection(config.RABBITMQ_URL);
    const channelWrapper = connection.createChannel({
      json: true,
      setup: (channel: any) => channel.assertQueue(QueueName.NOTIFICATION_QUEUE, { durable: true }),
    });

    await channelWrapper.sendToQueue(QueueName.NOTIFICATION_QUEUE, {
      event: EventName.ORDER_CREATED,
      data: {
        orderId: (order as any)._id,
        userId,
        totalPrice,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

export default router;
