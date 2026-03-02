# Vortex - Event-Driven E-Commerce Ecosystem

[![CI](https://github.com/shahadathhs/vortex/actions/workflows/ci.yml/badge.svg)](https://github.com/shahadathhs/vortex/actions/workflows/ci.yml)
[![Release](https://github.com/shahadathhs/vortex/actions/workflows/release.yml/badge.svg)](https://github.com/shahadathhs/vortex/actions/workflows/release.yml)
[![Version](https://img.shields.io/github/v/release/shahadathhs/vortex)](https://github.com/shahadathhs/vortex/releases)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](./LICENSE)

A **portfolio project** showcasing production-grade microservices architecture for e-commerce platforms. Built with Node.js, TypeScript, and designed to demonstrate scalable, cloud-native system design patterns.

> 🛠️ **Interested in contributing?** Read our [Contributing Guide](./CONTRIBUTING.md).  
> 📜 [Code of Conduct](./CODE_OF_CONDUCT.md) · [Security Policy](./SECURITY.md)

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

| Service                  | Purpose                                            | Database                   | Events                                                                      |
| ------------------------ | -------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------- |
| **Gateway**              | API Gateway for routing and load balancing         | N/A                        | N/A                                                                         |
| **Auth Service**         | User authentication, authorization, JWT management | MongoDB (`vortex_auth`)    | `user.created`, `user.updated`                                              |
| **Product Service**      | Product catalog, inventory management              | MongoDB (`vortex_product`) | `product.created`, `product.updated`                                        |
| **Order Service**        | Order processing, order lifecycle management       | MongoDB (`vortex_order`)   | `order.created`, `order.updated`                                            |
| **Notification Service** | Event consumer + email (Nodemailer/SMTP)           | N/A (event consumer)       | Consumes `user.created`, `order.*`, `product.*`, `password.reset.requested` |

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

## 📋 Implemented Features

All features below are **fully implemented**—no placeholders or stubs.

### 🔐 Auth Service

- **Registration & Login**: Email/password signup and signin with bcrypt hashing
- **JWT Auth**: Access tokens + refresh tokens (opaque, stored in DB); `POST /refresh-token` to rotate
- **Profile**: `GET /profile`, `PATCH /profile` (firstName, lastName), `PATCH /password` (change own password)
- **Logout**: `POST /logout` invalidates refresh token
- **RBAC**: Roles (customer, vendor, admin) with permission checks (`PRODUCT_CREATE`, `ADMIN_CREATE`, etc.)
- **Superadmin**: Seed via `SUPERADMIN_EMAIL`/`SUPERADMIN_PASSWORD`; admin CRUD (`POST/GET/DELETE /api/auth/admin`); `POST /api/auth/admin/reset-password` to reset any user's password
- **Password Reset**: `POST /forgot-password` (email) → sends reset link; `POST /reset-password` (token, newPassword) → resets password

### 🛍️ Product Service

- **CRUD**: Create, read, update, delete products (admin/vendor only for write)
- **Search & Filter**: `?q=` (text search), `?category=`, `?minPrice=`, `?maxPrice=`
- **Stock**: Products have `stock`; catalog events published to RabbitMQ on create/update/delete
- **Inventory**: Consumes `order.created` → decrements stock; `order.updated` (cancelled) → restores stock

### 🛒 Cart & Order Service

- **Cart**: Get, add item, update quantity, remove item, clear; persisted per user
- **Orders**: Create order from cart items; list by user; get by ID; update status (pending → confirmed → processing → shipped → delivered → completed)
- **Events**: `order.created` and `order.updated` published to RabbitMQ (includes `userEmail` for notifications)

### 🔔 Notification Service

- **Event Consumer**: Subscribes to RabbitMQ `vortex` exchange; consumes `user.created`, `order.created`, `order.updated`, `product.*`, `password.reset.requested`
- **Email**: Nodemailer/SMTP; welcome (user.created), order confirmation (order.created), shipped/delivered (order.updated), password reset link (password.reset.requested). Set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` to enable; otherwise logs only

### 🏗️ Infrastructure & DevOps

- **Gateway**: HTTP proxy to services; health checks; rate limiting (100 req/15min); Swagger UI at `/api-docs`
- **Monorepo**: Turborepo, pnpm workspaces, shared `@vortex/common`
- **Docker**: Compose for infra (MongoDB, RabbitMQ, Redis, Mongo Express) and all services
- **CI**: GitHub Actions—lint, format, typecheck, build on push/PR
- **Release**: Automated versioning and Docker image push via GitHub Actions

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

4. **Superadmin seed** – Runs automatically on auth-service startup when `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD` are set. Or run manually: `pnpm auth:seed`

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

| Service               | Base Path         | Endpoints                                                                                                                                                                    |
| --------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**              | `/api/auth`       | `POST /register`, `POST /login`, `POST /refresh-token`, `GET /profile`, `PATCH /profile`, `PATCH /password`, `POST /logout`, `POST /forgot-password`, `POST /reset-password` |
| **Auth (Superadmin)** | `/api/auth/admin` | `POST /` (create admin), `GET /` (list admins), `DELETE /:id` (delete admin), `POST /reset-password` (superadmin: change any user's password)                                |
| **Products**          | `/api/products`   | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` (query: `?q=`, `?category=`, `?minPrice=`, `?maxPrice=`)                                                            |
| **Orders**            | `/api/orders`     | `GET /`, `GET /:id`, `GET /user/:userId`, `POST /`, `PUT /:id/status`                                                                                                        |
| **Cart**              | `/api/cart`       | `GET /`, `POST /`, `PUT /:productId`, `DELETE /:productId`, `POST /clear`                                                                                                    |

### API Authentication

Protected endpoints require the `Authorization: Bearer <token>` header with a valid JWT from `/api/auth/login` or `/api/auth/register`.

| Area         | Auth Required | Notes                                                                                                                                                       |
| ------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cart**     | Yes           | All cart endpoints require authentication. User is inferred from JWT.                                                                                       |
| **Orders**   | Yes           | All order endpoints require authentication. User/ownership from JWT.                                                                                        |
| **Products** | Partial       | `GET /` and `GET /:id` are public. `POST /`, `PUT /:id`, `DELETE /:id` require admin or vendor role (`PRODUCT_CREATE`, `PRODUCT_UPDATE`, `PRODUCT_DELETE`). |

## 📊 Service Health Checks & API Docs

- Gateway: http://localhost:3000/health
- API Docs (Swagger): http://localhost:3000/api-docs
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

This project is licensed under the **ISC License**. See the [LICENSE](./LICENSE) file for details.

## 📋 Community

- [Code of Conduct](./CODE_OF_CONDUCT.md) – Our standards for community participation
- [Security Policy](./SECURITY.md) – How to report security vulnerabilities

---

**Status**: Full e-commerce flow: auth, products, cart, orders, inventory decrement, email notifications, password reset, API docs, rate limiting.

**Purpose**: Portfolio demonstration of event-driven microservices architecture.
