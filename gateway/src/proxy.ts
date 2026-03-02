import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { createConfig, GatewayEnv } from '@vortex/common';

const router: Router = Router();

export const config = createConfig(GatewayEnv);

const services = [
  { path: '/api/auth', url: config.getOrThrow(GatewayEnv.AUTH_SERVICE_URL) },
  {
    path: '/api/products',
    url: config.getOrThrow(GatewayEnv.PRODUCT_SERVICE_URL),
  },
  { path: '/api/orders', url: config.getOrThrow(GatewayEnv.ORDER_SERVICE_URL) },
  { path: '/api/cart', url: config.getOrThrow(GatewayEnv.ORDER_SERVICE_URL) },
  {
    path: '/api/checkout',
    url: config.getOrThrow(GatewayEnv.PAYMENT_SERVICE_URL),
  },
  {
    path: '/api/webhooks',
    url: config.getOrThrow(GatewayEnv.PAYMENT_SERVICE_URL),
  },
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
