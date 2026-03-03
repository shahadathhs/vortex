export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Vortex API',
    version: '1.3.0',
    description: `
## Vortex — Event-Driven E-Commerce API

All requests go through the **API Gateway** at \`/\`.

### Services

| Service | Base Path | Description |
|---|---|---|
| **Auth** | \`/api/auth\` | Registration, login, JWT, profile, password reset, admin management |
| **Products** | \`/api/products\` | Product catalog, search, inventory |
| **Cart** | \`/api/cart\` | Per-user cart: add, update, remove, clear |
| **Orders** | \`/api/orders\` | Order lifecycle — created via checkout only |
| **Checkout** | \`/api/checkout\` | Validates cart → creates order → returns Stripe \`clientSecret\` |
| **Webhooks** | \`/api/webhooks\` | Stripe webhook — confirms or cancels orders |

### Authentication

Protected endpoints require \`Authorization: Bearer <token>\`.
Get a token from \`POST /api/auth/login\` or \`POST /api/auth/register\`.

### E-Commerce Flow

1. Register / login → receive JWT
2. Browse products → \`GET /api/products\`
3. Add to cart → \`POST /api/cart\`
4. Checkout → \`POST /api/checkout\` → receive \`clientSecret\`
5. Confirm payment via Stripe.js using \`clientSecret\`
6. Stripe webhook → order confirmed, cart cleared, inventory decremented
    `,
  },
  servers: [{ url: '/', description: 'API Gateway' }],
  paths: {
    '/api/auth': {
      get: {
        tags: ['Auth Service'],
        summary: 'Auth Service',
        description:
          'Handles user registration, login, JWT access + refresh tokens, profile, password reset, and admin CRUD. Key routes: `POST /register`, `POST /login`, `POST /refresh-token`, `POST /logout`, `GET /profile`, `PATCH /profile`, `PATCH /password`, `POST /forgot-password`, `POST /reset-password`. Admin routes (superadmin only): `POST /admin`, `GET /admin`, `DELETE /admin/:id`, `POST /admin/reset-password`.',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/products': {
      get: {
        tags: ['Product Service'],
        summary: 'Product Service',
        description:
          'Product catalog with search and filtering. Public: `GET /` (supports `?q=`, `?category=`, `?minPrice=`, `?maxPrice=`), `GET /:id`. Protected (admin/vendor): `POST /`, `PUT /:id`, `DELETE /:id`.',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/cart': {
      get: {
        tags: ['Cart (Order Service)'],
        summary: 'Cart Service',
        description:
          'Per-user cart persisted in the Order Service. All endpoints require authentication. Routes: `GET /`, `POST /` (add item), `PUT /:productId` (update qty), `DELETE /:productId` (remove), `POST /clear`.',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/orders': {
      get: {
        tags: ['Order Service'],
        summary: 'Order Service',
        description:
          'Orders are created via checkout only — no direct `POST /orders`. Routes: `GET /` (own orders), `GET /:id`, `GET /user/:userId` (admin), `PUT /:id/status` (admin).',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/checkout': {
      post: {
        tags: ['Payment Service'],
        summary: 'Checkout',
        description:
          'Validates cart items and stock, fetches live product prices, creates a pending order, and creates a Stripe PaymentIntent. Returns `{ orderId, clientSecret }` — use `clientSecret` with Stripe.js `confirmPayment` to complete the payment on the frontend.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
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
    '/api/webhooks/stripe': {
      post: {
        tags: ['Payment Service'],
        summary: 'Stripe Webhook',
        description:
          'Receives Stripe webhook events. `payment_intent.succeeded` → confirms order + clears cart. `payment_intent.payment_failed` → cancels order. Configure in Stripe Dashboard pointing to this endpoint.',
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
