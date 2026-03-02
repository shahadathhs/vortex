# Config
ENV_FILE := .env.production
DOCKER_REGISTRY := shahadathhs
PACKAGE_NAME := vortex
VERSION := latest

# Docker Compose Commands
COMPOSE_FILE_ARGS := -f compose.infra.yaml -f compose.yaml
COMPOSE_ENV_ARGS := --env-file $(ENV_FILE)
COMPOSE_CMD := docker compose $(COMPOSE_FILE_ARGS) $(COMPOSE_ENV_ARGS)
COMPOSE_INFRA_CMD := docker compose -f compose.infra.yaml $(COMPOSE_ENV_ARGS)

# Services List
SERVICES := gateway auth product order payment notification

.PHONY: help infra dev prod tools up-% down build-% push-% pull-% clean clean-all logs-% install build-js typecheck lint lint-fix format format-fix ci-fix clean-pkg dev-% pm2-start pm2-stop pm2-restart pm2-delete pm2-status pm2-logs pm2-logs-%

help:
	@echo "Vortex - Makefile Commands"
	@echo "=========================="
	@echo ""
	@echo "pnpm / Development:"
	@echo "  make install          Install dependencies"
	@echo "  make dev              Run all services in dev (turbo)"
	@echo "  make dev-<service>    Run specific service (gateway, auth, order, product, payment, notification)"
	@echo "  make build-js         Build all packages (pnpm)"
	@echo "  make typecheck        Type-check all packages"
	@echo "  make lint             Lint all packages"
	@echo "  make lint-fix         Lint and fix all packages"
	@echo "  make format           Check formatting"
	@echo "  make format-fix       Format all packages"
	@echo "  make ci-fix          Lint + format fix (CI)"
	@echo "  make clean-pkg       Clean build artifacts and node_modules"
	@echo "  make deploy-<svc>   Deploy package to ./dist/deploy/<svc> (gateway, auth, order, product, notification)"
	@echo ""
	@echo "PM2 (production):"
	@echo "  make pm2-start      Build and start all services via PM2"
	@echo "  make pm2-stop       Stop all PM2 processes"
	@echo "  make pm2-restart    Restart all PM2 processes"
	@echo "  make pm2-delete     Delete all PM2 processes"
	@echo "  make pm2-status     Show PM2 process list"
	@echo "  make pm2-logs       Tail PM2 logs (all apps)"
	@echo "  make pm2-logs-<svc> Tail logs for specific app (gateway, auth, order, product, payment, notification)"
	@echo ""
	@echo "Docker / Environment:"
	@echo "  make infra            Start infrastructure (Mongo, RabbitMQ)"
	@echo "  make up               Start all services"
	@echo "  make up-<service>     Start specific service (gateway, auth, product, order, payment, notification)"
	@echo "  make tools           Start dev tools (Mongo Express)"
	@echo "  make down            Stop all containers"
	@echo ""
	@echo "Docker Images (build/push/pull):"
	@echo "  make build           Build all Docker images"
	@echo "  make build-<service>  Build specific service image"
	@echo "  make push            Push all images"
	@echo "  make pull            Pull all images"
	@echo ""
	@echo "Cleanup & Logs:"
	@echo "  make clean[-all]      Stop and remove containers [volumes]"
	@echo "  make logs-infra       Show infra logs"
	@echo "  make logs-dev         Show app logs"

# --- pnpm / Development ---

install:
	pnpm install

dev:
	pnpm dev

dev-gateway:
	pnpm --filter=gateway dev

dev-auth:
	pnpm --filter=auth-service dev

dev-order:
	pnpm --filter=order-service dev

dev-product:
	pnpm --filter=product-service dev

dev-notification:
	pnpm --filter=notification-service dev

dev-payment:
	pnpm --filter=payment-service dev

build-js:
	pnpm build

typecheck:
	pnpm typecheck

lint:
	pnpm lint

lint-fix:
	pnpm lint:fix

format:
	pnpm format

format-fix:
	pnpm format:fix

ci-fix:
	pnpm ci:fix

clean-pkg:
	pnpm clean

# Deploy: copy built package + deps to dist/deploy/<service>
deploy-gateway:
	pnpm deploy --filter=gateway dist/deploy/gateway

deploy-auth:
	pnpm deploy --filter=auth-service dist/deploy/auth-service

deploy-order:
	pnpm deploy --filter=order-service dist/deploy/order-service

deploy-product:
	pnpm deploy --filter=product-service dist/deploy/product-service

deploy-notification:
	pnpm deploy --filter=notification-service dist/deploy/notification-service

deploy-payment:
	pnpm deploy --filter=payment-service dist/deploy/payment-service

# --- PM2 (production) ---

pm2-start: build-js
	pm2 start ecosystem.config.mjs

pm2-stop:
	pm2 stop ecosystem.config.mjs 2>/dev/null || pm2 stop all

pm2-restart: build-js
	pm2 restart ecosystem.config.mjs 2>/dev/null || (pm2 delete all 2>/dev/null; pm2 start ecosystem.config.mjs)

pm2-delete:
	pm2 delete ecosystem.config.mjs 2>/dev/null || pm2 delete all 2>/dev/null || true

pm2-status:
	pm2 list

pm2-logs:
	pm2 logs

pm2-logs-gateway:
	pm2 logs vortex-gateway

pm2-logs-auth:
	pm2 logs vortex-auth-service

pm2-logs-order:
	pm2 logs vortex-order-service

pm2-logs-product:
	pm2 logs vortex-product-service

pm2-logs-notification:
	pm2 logs vortex-notification-service

pm2-logs-payment:
	pm2 logs vortex-payment-service

# --- Docker / Environment ---

infra:
	$(COMPOSE_INFRA_CMD) --profile infra up -d

up:
	$(COMPOSE_CMD) --profile dev up -d

prod:
	$(COMPOSE_CMD) --profile prod up -d

tools:
	$(COMPOSE_INFRA_CMD) --profile tools up -d

# Pattern: make up-auth, make up-gateway
up-%:
	$(COMPOSE_CMD) --profile $* up -d

down:
	$(COMPOSE_CMD) --profile infra --profile dev --profile prod --profile tools down --remove-orphans

# --- Build / Push / Pull patterns ---

# Build
build-gateway:
	docker build -f gateway/Dockerfile -t $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-gateway:$(VERSION) .

build-%:
	docker build -f services/$*-service/Dockerfile -t $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-$*-service:$(VERSION) .

build: $(addprefix build-, $(SERVICES))

# Push
push-gateway:
	docker push $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-gateway:$(VERSION)

push-%:
	docker push $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-$*-service:$(VERSION)

push: $(addprefix push-, $(SERVICES))

# Pull
pull-gateway:
	docker pull $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-gateway:$(VERSION)

pull-%:
	docker pull $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-$*-service:$(VERSION)

pull: $(addprefix pull-, $(SERVICES))

# --- Maintenance ---

clean:
	$(COMPOSE_CMD) --profile infra --profile dev --profile prod --profile tools down --remove-orphans

clean-all:
	$(COMPOSE_CMD) --profile infra --profile dev --profile prod --profile tools down -v --remove-orphans
	docker system prune -f
	docker volume prune -f

logs-infra:
	$(COMPOSE_INFRA_CMD) logs -f

logs-dev logs-prod:
	$(COMPOSE_CMD) logs -f
