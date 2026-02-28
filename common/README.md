# @vortex/common

[![npm](https://img.shields.io/npm/v/@vortex/common.svg)](https://www.npmjs.com/package/@vortex/common)

Shared utilities, core logic, and middlewares for the Vortex microservices platform. Provides type-safe config, JWT helpers, RabbitMQ management, error handling, and Express middleware.

## Installation

```bash
pnpm add @vortex/common
# or
npm install @vortex/common
```

## Features

- **Config** — Type-safe environment variable loading with `createConfig()` and enum-based schema
- **JWT** — Token generation and verification with `generateToken()` and `verifyToken()`
- **RabbitMQ** — Singleton connection manager via `RabbitMQManager.getConnection()`
- **Error handling** — `ApiError` hierarchy, `errorHandler` middleware, `MongooseErrorParser`
- **Middleware** — `protect` (auth), `checkPermission` (RBAC), `validateRequest` (Zod)
- **Utilities** — `asyncHandler`, `logger` (Winston), `successResponse`, `successPaginatedResponse`
- **Schemas** — `paginationQuerySchema` (Zod)

## Usage

### Config

```typescript
import { createConfig, AuthEnv } from '@vortex/common';

export const config = createConfig(AuthEnv);

const port = config.PORT;
const mongoUri = config.getOrThrow('MONGODB_URI');
```

### JWT

```typescript
import { generateToken, verifyToken } from '@vortex/common';

const token = generateToken(
  { id: '1', email: 'a@b.com', role: 'admin' },
  secret,
);
const payload = verifyToken(token, secret);
```

### Error Handler

```typescript
import { errorHandler } from '@vortex/common';

app.use(errorHandler);
```

### Middleware

```typescript
import { protect, checkPermission, validateRequest } from '@vortex/common';

app.use(protect(JWT_SECRET));
app.use(checkPermission(Permission.ORDER_CREATE));
app.post('/orders', validateRequest(orderSchema), orderController.create);
```

## API

| Export                                                                  | Description                          |
| ----------------------------------------------------------------------- | ------------------------------------ |
| `createConfig`, `Config`                                                | Environment config factory and class |
| `generateToken`, `verifyToken`, `TokenPayload`                          | JWT utilities                        |
| `RabbitMQManager`                                                       | RabbitMQ connection manager          |
| `ApiError`, `BadRequestError`, `UnauthorizedError`, etc.                | Error classes                        |
| `errorHandler`                                                          | Express error handler middleware     |
| `MongooseErrorParser`                                                   | Mongoose error → ApiError parser     |
| `protect`, `checkPermission`, `validateRequest`                         | Express middleware                   |
| `asyncHandler`, `logger`, `successResponse`, `successPaginatedResponse` | Utilities                            |
| `paginationQuerySchema`, `PaginationQuery`                              | Pagination schema                    |
| `EventName`, `QueueName`, `AuthEnv`, `OrderEnv`, etc.                   | Enums and constants                  |

## License

MIT
