import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { env } from './config/config';

const router: Router = Router();

const services = [
  { path: '/api/auth', url: env.AUTH_SERVICE_URL },
  { path: '/api/products', url: env.PRODUCT_SERVICE_URL },
  { path: '/api/orders', url: env.ORDER_SERVICE_URL },
  { path: '/api/cart', url: env.ORDER_SERVICE_URL },
  { path: '/api/checkout', url: env.PAYMENT_SERVICE_URL },
  { path: '/api/webhooks', url: env.PAYMENT_SERVICE_URL },
];

services.forEach(({ path, url }) => {
  router.use(
    path,
    createProxyMiddleware({
      target: url,
      changeOrigin: true,
    }),
  );
});

export default router;
