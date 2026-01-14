import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { ServicePort } from '@vortex/constants';

const router: Router = Router();

const services = [
  { path: '/auth', port: ServicePort.AUTH },
  { path: '/products', port: ServicePort.PRODUCT },
  { path: '/orders', port: ServicePort.ORDER },
];

services.forEach(({ path, port }) => {
  router.use(
    path,
    createProxyMiddleware({
      target: `http://127.0.0.1:${port}`,
      changeOrigin: true,
    }),
  );
});

export default router;
