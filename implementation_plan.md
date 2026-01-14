# Detailed Implementation Plan: Event-Driven E-Commerce Ecosystem

This plan outlines the architecture and steps to build a microservices-based e-commerce platform using TypeScript, Express, MongoDB, and RabbitMQ.

## 1. Project Structure
The project will follow a monorepo-style structure for clarity, though each service is technically isolated.

```text
nodejs-microservice/
├── gateway/                # API Gateway (Port 3000)
├── services/
│   ├── auth-service/       # User Management & JWT (Port 3001)
│   ├── product-service/    # Catalog & Search (Port 3002)
│   ├── order-service/      # Order Processing (Port 3003)
│   └── notification-service/ # Event Consumer (Worker)
├── package.json            # Root configuration
└── .gitignore
```

## 2. Standardized Service Folder Structure
Each service in `services/` will adhere to:
- `src/config/`: DB and Message Broker initialization.
- `src/models/`: Mongoose schemas.
- `src/routes/`: Express route definitions.
- `src/services/`: Business logic and external integrations (RabbitMQ/Axios).
- `src/middlewares/`: Validation, auth, and error handling.
- `src/index.ts`: Entry point.

## 3. Communication Patterns
- **Synchronous (REST/Axios)**:
  - Gateway -> Auth Service (Login/Register)
  - Gateway -> Product Service (Browse/Search)
  - Gateway -> Order Service (Place Order)
  - Order Service -> Product Service (Check stock/details before order)
- **Asynchronous (RabbitMQ)**:
  - Order Service (Producer) -> `order.created` exchange -> Notification Service (Consumer)

## 4. Database Isolation
Each service will have its own dedicated MongoDB database:
- `ecommerce_auth`
- `ecommerce_product`
- `ecommerce_order`

## 5. Environment Variables Requirements
Each service will require a `.env` with:
- `PORT`: Service-specific port.
- `MONGODB_URI`: `mongodb://localhost:27017/ecommerce_<service_name>`
- `RABBITMQ_URL`: `amqp://localhost`
- `JWT_SECRET`: Shared secret for token verification.

## 6. Key Dependencies
| Category | Libraries |
| :--- | :--- |
| **Core** | `express@5.0.0-beta.3`, `typescript`, `mongoose`, `dotenv` |
| **Auth** | `jsonwebtoken`, `bcryptjs` |
| **Messaging** | `amqplib` |
| **HTTP Client** | `axios` |
| **Security** | `cors`, `helmet` |
| **Dev Tools** | `ts-node-dev`, `rimraf` |

## 7. Implementation Roadmap
1. **Initialize Root**: Git init, root `package.json`.
2. **Auth Service**: Implement registration, login, and JWT logic.
3. **Product Service**: CRUD with text search indexing.
4. **Order Service**: Sync call to Product Service + Order creation + Emit RabbitMQ event.
5. **Notification Service**: Listen for events and log simulated emails.
6. **API Gateway**: Routing logic + JWT global middleware.
7. **Verification**: End-to-end testing via Antigravity Browser Agent.
