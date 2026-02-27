# Vortex - Event-Driven E-Commerce Ecosystem

[![CI](https://github.com/shahadathhs/vortex/actions/workflows/ci.yml/badge.svg)](https://github.com/shahadathhs/vortex/actions/workflows/ci.yml)
[![Release](https://github.com/shahadathhs/vortex/actions/workflows/release.yml/badge.svg)](https://github.com/shahadathhs/vortex/actions/workflows/release.yml)
[![Version](https://img.shields.io/github/v/release/shahadathhs/vortex)](https://github.com/shahadathhs/vortex/releases)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A **portfolio project** showcasing production-grade microservices architecture for e-commerce platforms. Built with Node.js, TypeScript, and designed to demonstrate scalable, cloud-native system design patterns.

> 🛠️ **Interested in contributing?** Read our [Contributing Guide](./CONTRIBUTING.md).

## 🎯 Project Overview

Vortex is a **portfolio demonstration** of modern backend engineering practices, featuring:

- **Event-Driven Architecture**: Asynchronous inter-service communication using RabbitMQ message broker
- **Microservices Pattern**: Independent, loosely-coupled services with database-per-service isolation
- **Scalable Infrastructure**: Horizontal scaling capabilities with API Gateway and load balancing
- **Modern DevOps**: Containerized deployment with Docker, multi-environment orchestration
- **Cloud-Native Design**: Production-ready patterns for distributed systems and high availability
- **Type Safety**: End-to-end TypeScript implementation with strict typing and validation
- **Monorepo Architecture**: Turborepo-based workspace with shared configurations and utilities

## 🏗️ Architecture Overview

### Microservices

| Service                  | Purpose                                            | Database                   | Events                               |
| ------------------------ | -------------------------------------------------- | -------------------------- | ------------------------------------ |
| **Gateway**              | API Gateway for routing and load balancing         | N/A                        | N/A                                  |
| **Auth Service**         | User authentication, authorization, JWT management | MongoDB (`vortex_auth`)    | `user.created`, `user.updated`       |
| **Product Service**      | Product catalog, inventory management              | MongoDB (`vortex_product`) | `product.created`, `product.updated` |
| **Order Service**        | Order processing, order lifecycle management       | MongoDB (`vortex_order`)   | `order.created`, `order.updated`     |
| **Notification Service** | Event-driven notifications (order confirmations)   | N/A (event consumer)       | Consumes `user.created`, `order.*`   |

### Infrastructure Components

- **MongoDB**: Document database with database-per-service pattern
- **RabbitMQ**: Message broker for event-driven communication
- **Redis**: Caching layer with master-replica configuration (dev/prod)
- **Mongo Express**: Web-based MongoDB admin interface (dev/infra)

### Communication Patterns

```
┌─────────┐
│ Gateway │ ──── HTTP ───▶ ┌──────────────┐
└─────────┘                 │   Services   │
                            └──────┬───────┘
                                   │
                            ┌──────▼────────┐
                            │   RabbitMQ    │ (Event Bus)
                            └──────┬────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
            ┌─────────────┐ ┌──────────┐ ┌─────────────┐
            │   Product   │ │  Order   │ │Notification │
            └─────────────┘ └──────────┘ └─────────────┘
```

## 📋 Business Requirements

### Platform Goal

Vortex will be a **B2C e-commerce platform** for digital and physical product sales, focusing on demonstrating:

- Complete order-to-delivery workflow
- Real-time inventory management
- Event-driven order processing
- Multi-channel notifications
- Secure payment integration
- Scalable architecture for high-traffic scenarios

### Target Users

#### 1. **Customers** (End Users)

- Browse and search product catalog
- Add products to cart and checkout
- Track order status in real-time
- Receive order notifications (email/SMS)
- Manage user profile and order history
- Write product reviews and ratings

#### 2. **Vendors/Sellers** (Future scope)

- List products with inventory management
- Monitor sales and analytics
- Process orders and update status
- Handle returns and refunds

#### 3. **Administrators**

- Manage product catalog
- View system analytics
- Handle customer support
- Monitor system health

### Core Features & Requirements

#### 🔐 Authentication & User Management (Auth Service)

**Functional Requirements:**

- User registration with email verification
- JWT-based authentication with refresh tokens
- Role-based access control (Customer, Vendor, Admin)
- Password reset functionality
- Social login (Google, GitHub) - optional
- Session management and logout

**User Stories:**

- As a customer, I want to register an account so I can place orders
- As a user, I want to securely log in to access my account
- As a customer, I want to reset my password if I forget it

#### 🛍️ Product Management (Product Service)

**Functional Requirements:**

- Product CRUD operations (Admin/Vendor)
- Multi-category product organization
- Product variants (size, color, etc.)
- Image upload and management
- Inventory tracking with stock levels
- Product search and filtering (name, category, price range)
- Product recommendations (related/similar items)
- Product reviews and ratings

**Business Rules:**

- Products with zero stock should be marked as "Out of Stock"
- Products can have multiple images (max 5)
- Product prices must be positive values
- Inventory should be decremented on order placement
- Inventory should be reserved during checkout process

**User Stories:**

- As a customer, I want to browse products by category
- As a customer, I want to search for products by name or description
- As an admin, I want to add new products to the catalog
- As a customer, I want to see product ratings before purchasing

#### 🛒 Shopping Cart & Checkout (Order Service)

**Functional Requirements:**

- Add/remove items from cart
- Update item quantities
- Apply discount codes/coupons
- Calculate totals (subtotal, tax, shipping, discounts)
- Save cart for later (persistent cart)
- Guest checkout option
- Multiple shipping addresses
- Order summary before payment

**Business Rules:**

- Cart items must have available inventory
- Discounts cannot reduce total below zero
- Minimum order value requirements
- Maximum cart item quantity limits

**User Stories:**

- As a customer, I want to add multiple items to my cart
- As a customer, I want to apply a promo code for discounts
- As a customer, I want to save my cart and return later
- As a customer, I want to review my order before payment

#### 📦 Order Processing (Order Service)

**Functional Requirements:**

- Create orders from cart
- Order status tracking (Pending → Confirmed → Processing → Shipped → Delivered → Completed)
- Order history and details
- Order cancellation (before shipping)
- Return/refund requests
- Order invoice generation
- Payment integration (Stripe/PayPal)

**Events Published:**

- `order.created` → Triggers inventory deduction, payment processing
- `order.confirmed` → Triggers shipping preparation
- `order.shipped` → Sends tracking notification
- `order.delivered` → Requests product review
- `order.cancelled` → Restores inventory, processes refund

**Business Rules:**

- Orders can only be cancelled before shipping
- Payment must be successful before order confirmation
- Inventory must be available for all items
- Failed payments should release inventory
- Order total must match cart calculation

**User Stories:**

- As a customer, I want to track my order status in real-time
- As a customer, I want to cancel an order if it hasn't shipped yet
- As an admin, I want to update order status as it progresses
- As a customer, I want to receive an invoice for my purchase

#### 🔔 Notifications (Notification Service)

**Functional Requirements:**

- Email notifications (order confirmation, shipping, delivery)
- SMS notifications for critical updates
- In-app notifications
- Notification preferences management
- Notification history/archive
- Template-based messaging

**Triggered By:**

- User registration → Welcome email
- Order placed → Order confirmation email
- Payment received → Payment receipt
- Order shipped → Shipping notification with tracking
- Order delivered → Delivery confirmation
- Password reset → Reset link email

**User Stories:**

- As a customer, I want to receive email confirmation when I place an order
- As a customer, I want SMS notifications when my order ships
- As a customer, I want to manage my notification preferences

#### 💳 Payment Processing (Future - Payment Service)

**Functional Requirements:**

- Multiple payment methods (Credit Card, Debit Card, Digital Wallets)
- Payment gateway integration (Stripe/Razorpay)
- Secure payment processing (PCI compliance)
- Payment status tracking
- Refund processing
- Payment history

**Business Rules:**

- All transactions must be encrypted
- Failed payments should be retried (max 3 attempts)
- Refunds processed within 5-7 business days

### Non-Functional Requirements

#### Performance

- API response time < 200ms for 95% of requests
- Support 1000+ concurrent users
- Database queries optimized with indexing
- Redis caching for frequently accessed data

#### Security

- JWT tokens with expiration
- Rate limiting on API endpoints
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- Environment-based secrets management

#### Scalability

- Horizontal scaling of microservices
- Database connection pooling
- Message queue for async processing
- CDN for static assets (images)
- Load balancing at Gateway level

#### Reliability

- 99.9% uptime target
- Graceful error handling
- Retry mechanisms for failed operations
- Database backups (daily)
- Transaction rollback on failures

#### Observability

- Centralized logging (Winston/Pino)
- Request tracing with correlation IDs
- Health check endpoints
- Performance monitoring
- Error tracking and alerting

### Current Scope (Foundation)

1. **Service Architecture**
   - ✅ Microservices foundation with service isolation
   - ✅ API Gateway for unified entry point
   - ✅ Event-driven communication infrastructure
   - ✅ Environment-based configuration management

2. **Development Infrastructure**
   - ✅ Monorepo structure with Turborepo
   - ✅ Shared packages for common utilities
   - ✅ Centralized configuration (TypeScript, ESLint, Prettier)
   - ✅ Docker containerization for all services
   - ✅ Multi-environment support (dev, prod, infra)

3. **Data Layer**
   - ✅ Database-per-service pattern
   - ✅ MongoDB integration with authentication
   - ✅ Redis caching infrastructure
   - ✅ Data persistence with Docker volumes

### Planned Features (Roadmap)

#### Phase 1: Core E-Commerce Functionality ✅

- [x] User registration and authentication (JWT-based)
- [x] Product CRUD operations with search/filtering
- [x] Shopping cart management
- [x] Order placement and tracking
- [x] Basic notification system (order confirmations)

#### Phase 2: Advanced Features

- [ ] Payment gateway integration
- [ ] Inventory management with stock tracking (decrement on order)
- [x] Order status workflows (pending → confirmed → processing → shipped → delivered → completed)
- [x] User profile management (`GET /api/auth/profile`)
- [ ] Product reviews and ratings

#### Phase 3: Enterprise Features

- [ ] API documentation (Swagger/OpenAPI)
- [ ] Comprehensive logging and monitoring (ELK/Prometheus)
- [ ] Distributed tracing (Jaeger/Zipkin)
- [ ] Rate limiting and API throttling
- [ ] GraphQL gateway option
- [ ] Kubernetes deployment manifests
- [ ] CI/CD pipelines (GitHub Actions)

#### Phase 4: Business Intelligence

- [ ] Analytics and reporting
- [ ] Recommendation engine
- [ ] Admin dashboard
- [ ] Customer support integration
- [ ] Multi-tenant support

## 🛠️ Tech Stack

### Core Technologies

- **Runtime**: Node.js 24.x
- **Language**: TypeScript 5.x
- **Framework**: Express.js
- **API Gateway**: http-proxy-middleware

### Data & Messaging

- **Database**: MongoDB 8.2
- **Message Queue**: RabbitMQ 4.2
- **Cache**: Redis 7.2 (Alpine)
- **Admin UI**: Mongo Express 1.0.2

### Development Tools

- **Monorepo**: Turborepo + pnpm workspaces (catalog for shared versions)
- **Code Quality**: ESLint, Prettier, Husky, Lint-staged
- **Containerization**: Docker, Docker Compose
- **Package Manager**: pnpm 10.x
- **Process Manager**: PM2 (production deployment)

## 📁 Project Structure

```
vortex/
├── gateway/                    # API Gateway (port 3000)
├── common/                     # Shared utilities, middleware, JWT, RabbitMQ, config
├── services/
│   ├── auth-service/          # Authentication & Authorization (port 3001)
│   ├── product-service/       # Product Catalog Management (port 3002)
│   ├── order-service/         # Order Processing + Cart (port 3003)
│   └── notification-service/  # Event-driven Notifications (port 3004)
├── compose.infra.yaml         # MongoDB, RabbitMQ, Redis, Mongo Express
├── compose.yaml               # Application services
├── ecosystem.config.mjs       # PM2 process definitions
├── Makefile                   # Docker, pnpm, PM2 commands
└── turbo.json                 # Turborepo configuration
```

## 🚦 Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 24.x (for local development)
- pnpm 10.x (for local development)
- Make (optional, for simplified commands)

### Environment Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd vortex
   ```

2. **Configure environment variables**

   ```bash
   cp .env.production .env.local
   # Edit .env.local with your credentials
   ```

3. **Install dependencies (for local development)**
   ```bash
   pnpm install
   # or
   make install
   ```

### Running with Docker

#### Start Infrastructure Only

```bash
make infra
# Starts: MongoDB, RabbitMQ, Redis, Mongo Express
```

#### Start Development Environment

```bash
make up
# Starts: Infrastructure + All Services
```

#### Start Production Environment

```bash
make prod
# Starts: Infrastructure + All Services + Redis Replica
```

#### Start Specific Service

```bash
make up-auth          # Auth service only
make up-product       # Product service only
make up-order         # Order service only
make up-notification  # Notification service only
make up-gateway       # Gateway only
```

#### Stop All Services

```bash
make down
```

#### Clean Up (remove containers and volumes)

```bash
make clean        # Stop and remove containers
make clean-all    # Also remove volumes and prune Docker
```

#### View All Make Commands

```bash
make help
```

### Local Development (without Docker)

Start infrastructure first (`make infra`), then run services:

```bash
# Or use make shortcuts (each in separate terminal)
make dev-gateway
make dev-auth
make dev-order
make dev-product
make dev-notification

# Or use pnpm directly
pnpm auth:dev
pnpm product:dev
pnpm order:dev
pnpm notification:dev
pnpm gateway:dev
```

### Running with PM2 (Production)

Build and run all services via PM2:

```bash
make infra          # Start MongoDB, RabbitMQ first
make pm2-start      # Build + start all services
make pm2-status     # View process list
make pm2-logs       # Tail logs
make pm2-stop       # Stop all
```

## 🔧 Development Workflow

### pnpm / Make Commands

| Command                           | Description             |
| --------------------------------- | ----------------------- |
| `make install`                    | Install dependencies    |
| `make build-js`                   | Build all packages      |
| `make typecheck`                  | Type-check all packages |
| `make lint` / `make lint-fix`     | Lint and fix            |
| `make format` / `make format-fix` | Format code             |
| `make ci-fix`                     | Lint + format fix       |

### Build All Services

```bash
pnpm build
# or
make build-js
```

### Lint & Format

```bash
pnpm lint          # Check for lint errors
pnpm lint:fix      # Auto-fix lint errors
pnpm format        # Check formatting
pnpm format:fix    # Auto-format code
```

### Type Checking

```bash
pnpm typecheck
# or
make typecheck
```

### Docker Image Management

```bash
make build         # Build all Docker images
make build-auth    # Build specific service image
make push          # Push all images to registry
make pull          # Pull all images from registry
```

## 📊 API Endpoints

All routes go through the Gateway at `http://localhost:3000`.

| Service      | Base Path       | Endpoints                                                                                                                               |
| ------------ | --------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**     | `/api/auth`     | `POST /register`, `POST /login`, `POST /refresh-token`, `POST /forgot-password`, `POST /reset-password`, `GET /profile`, `POST /logout` |
| **Products** | `/api/products` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` (query: `?q=`, `?category=`, `?minPrice=`, `?maxPrice=`)                       |
| **Orders**   | `/api/orders`   | `GET /`, `GET /:id`, `GET /user/:userId`, `POST /`, `PUT /:id/status`                                                                   |
| **Cart**     | `/api/cart`     | `GET /?userId=`, `POST /`, `PUT /:productId`, `DELETE /:productId`, `POST /clear`                                                       |

## 📊 Service Health Checks

- Gateway: http://localhost:3000/health
- Auth: http://localhost:3001/health
- Product: http://localhost:3002/health
- Order: http://localhost:3003/health
- Notification: http://localhost:3004/health

## 🔐 Admin Interfaces

- **Mongo Express**: http://localhost:8081
  - Username: `mongo` (from .env)
  - Password: `mongo` (from .env)

- **RabbitMQ Management**: http://localhost:15672
  - Username: `rabbitmq` (from .env)
  - Password: `rabbitmq` (from .env)

## 📝 Configuration

All services use environment-based configuration via the `@vortex/common` package:

```typescript
import { createConfig, AuthEnv } from '@vortex/common';

export const config = createConfig(AuthEnv);

// Access configuration
const port = config.PORT;
const mongoUri = config.MONGODB_URI;
```

## 🎯 Design Principles

1. **Service Independence**: Each service can be deployed, scaled, and updated independently
2. **Database per Service**: No direct database sharing between services
3. **Event-Driven Communication**: Services communicate via events, not direct calls
4. **Configuration as Code**: All infrastructure defined in version-controlled files
5. **Developer Experience First**: Simplified commands, hot-reload, type safety
6. **Production Ready**: Security best practices, error handling, logging

## 🤝 About This Project

This is a **portfolio project** designed to showcase:

- Proficiency in microservices architecture and distributed systems
- Full-stack backend development with Node.js and TypeScript
- DevOps practices including containerization and infrastructure as code
- Event-driven design patterns and message queue implementation
- Production-ready code organization and tooling setup

### Technical Highlights

**Architecture Patterns**

- API Gateway pattern for unified service routing
- Database-per-service for data isolation
- Event-driven communication with message queuing
- Shared package management in monorepo structure

**DevOps & Infrastructure**

- Multi-stage Docker builds for optimized images
- Environment-based configuration management
- Profile-based deployment strategies (dev/prod/infra)
- Redis master-replica setup for caching layer

**Code Quality**

- Strict TypeScript with centralized configs
- Automated linting and formatting (ESLint, Prettier)
- Pre-commit hooks with Husky and Lint-staged
- Conventional commits for clear change history

## 📜 License

ISC

---

**Status**: ✅ Phase 1 Complete - Core E-Commerce Features Implemented

**Purpose**: Portfolio & Learning Demonstration of Modern Microservices Architecture
