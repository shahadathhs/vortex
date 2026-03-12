import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { config } from './config/config';

const router: Router = Router();

const services = [
  { path: '/api/auth', url: config.AUTH_SERVICE_URL },
  { path: '/api/products', url: config.PRODUCT_SERVICE_URL },
  { path: '/api/orders', url: config.ORDER_SERVICE_URL },
  { path: '/api/cart', url: config.ORDER_SERVICE_URL },
  { path: '/api/checkout', url: config.PAYMENT_SERVICE_URL },
  { path: '/api/payment', url: config.PAYMENT_SERVICE_URL },
  { path: '/api/webhooks', url: config.PAYMENT_SERVICE_URL },
  { path: '/api/activities', url: config.ACTIVITY_SERVICE_URL },
  { path: '/api/notifications', url: config.NOTIFICATION_SERVICE_URL },
  { path: '/api/analytics', url: config.ANALYTICS_SERVICE_URL },
];

services.forEach(({ path, url }) => {
  // Use pathFilter (not router.use(path, …)) so Express does NOT strip the
  // matched prefix — the full path (e.g. /api/auth/register) is forwarded
  // intact to the downstream service which mounts its own /api/* routes.
  router.use(
    createProxyMiddleware({
      target: url,
      changeOrigin: true,
      pathFilter: path,
    }),
  );
});

export default router;
