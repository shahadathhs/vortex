export const openApiSpec = {
  openapi: '3.0.0',
  info: { title: 'Vortex API', version: '1.0.0' },
  servers: [{ url: '/', description: 'Gateway' }],
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/auth/forgot-password': {
      post: {
        summary: 'Request password reset',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email' } },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/auth/reset-password': {
      post: {
        summary: 'Reset password with token',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'newPassword'],
                properties: {
                  token: { type: 'string' },
                  newPassword: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/auth/profile': {
      get: {
        summary: 'Get profile',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/products': {
      get: {
        summary: 'List products',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
        ],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/checkout': {
      post: {
        summary: 'Checkout from cart',
        description:
          'Validates cart, creates order (pending), creates Stripe PaymentIntent. Returns orderId and clientSecret for Stripe.js confirmPayment.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        orderId: { type: 'string' },
                        clientSecret: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/orders': {
      get: {
        summary: 'List orders',
        description:
          'Orders are created via checkout only. No direct POST /orders.',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/webhooks/stripe': {
      post: {
        summary: 'Stripe webhook',
        description:
          'Internal endpoint for Stripe webhooks. Handles payment_intent.succeeded and payment_intent.payment_failed.',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/cart': {
      get: {
        summary: 'Get cart',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'OK' } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};
