export default {
  apps: [
    {
      name: 'vortex-gateway',
      script: './gateway/dist/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'vortex-auth-service',
      script: './services/auth-service/dist/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'vortex-product-service',
      script: './services/product-service/dist/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
    },
    {
      name: 'vortex-order-service',
      script: './services/order-service/dist/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
      },
    },
    {
      name: 'vortex-payment-service',
      script: './services/payment-service/dist/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3005,
      },
    },
    {
      name: 'vortex-notification-service',
      script: './services/notification-service/dist/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3004,
      },
    },
    {
      name: 'vortex-activity-service',
      script: './services/activity-service/dist/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3006,
      },
    },
    {
      name: 'vortex-analytics-service',
      script: './services/analytics-service/dist/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3007,
      },
    },
  ],
};
