import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { config } from '../config/config';

const router: Router = Router();

const services = [
  { path: '/auth', url: config.getOrThrow('AUTH_SERVICE_URL') },
  { path: '/products', url: config.getOrThrow('PRODUCT_SERVICE_URL') },
  { path: '/orders', url: config.getOrThrow('ORDER_SERVICE_URL') },
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
