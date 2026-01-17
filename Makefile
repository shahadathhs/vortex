# Environment file
ENV_FILE := .env.production

# Docker registry and package info
DOCKER_REGISTRY := shahadathhs
PACKAGE_NAME := vortex
VERSION := latest

# Compose files
COMPOSE_FILE_INFRA := compose.infra.yaml
COMPOSE_FILE_APP := compose.yaml

.PHONY: help \
	infra dev prod tools \
	build-all push-all pull-all \
	build-gateway build-auth build-product build-order build-notification \
	push-gateway push-auth push-product push-order push-notification \
	pull-gateway pull-auth pull-product pull-order pull-notification \
	clean clean-all logs-infra logs-dev logs-prod

help:
	@echo "Vortex Docker Commands"
	@echo "=========================================="
	@echo ""
	@echo "Environment Management:"
	@echo "  make infra         Start infrastructure (MongoDB, RabbitMQ, Redis)"
	@echo "  make dev           Start development environment"
	@echo "  make prod          Start production environment"
	@echo ""
	@echo "Image Management:"
	@echo "  make build-all     Build all service images"
	@echo "  make push-all      Push all service images"
	@echo "  make pull-all      Pull all service images"
	@echo ""
	@echo "Build per service:"
	@echo "  make build-gateway"
	@echo "  make build-auth"
	@echo "  make build-product"
	@echo "  make build-order"
	@echo "  make build-notification"
	@echo ""
	@echo "Push per service:"
	@echo "  make push-gateway"
	@echo "  make push-auth"
	@echo "  make push-product"
	@echo "  make push-order"
	@echo "  make push-notification"
	@echo ""
	@echo "Pull per service:"
	@echo "  make pull-gateway"
	@echo "  make pull-auth"
	@echo "  make pull-product"
	@echo "  make pull-order"
	@echo "  make pull-notification"
	@echo ""
	@echo "Development Tools:"
	@echo "  make tools         Start dev tools (Mongo Express, etc.)"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean         Stop and remove all containers"
	@echo "  make clean-all     Remove containers, images, volumes"

# Environment Commands
infra:
	docker compose -f $(COMPOSE_FILE_INFRA) --env-file $(ENV_FILE) up -d

dev:
	docker compose -f $(COMPOSE_FILE_INFRA) -f $(COMPOSE_FILE_APP) --env-file $(ENV_FILE) up -d

prod:
	docker compose -f $(COMPOSE_FILE_INFRA) -f $(COMPOSE_FILE_APP) --env-file $(ENV_FILE) up -d

tools:
	docker compose -f $(COMPOSE_FILE_INFRA) --env-file $(ENV_FILE) --profile tools up -d

# Image Management
build-all: build-gateway build-auth build-product build-order build-notification

push-all: push-gateway push-auth push-product push-order push-notification

pull-all: pull-gateway pull-auth pull-product pull-order pull-notification

build-gateway:
	docker build -f gateway/Dockerfile -t $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-gateway:$(VERSION) .

build-auth:
	docker build -f services/auth-service/Dockerfile -t $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-auth-service:$(VERSION) .

build-product:
	docker build -f services/product-service/Dockerfile -t $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-product-service:$(VERSION) .

build-order:
	docker build -f services/order-service/Dockerfile -t $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-order-service:$(VERSION) .

build-notification:
	docker build -f services/notification-service/Dockerfile -t $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-notification-service:$(VERSION) .

push-gateway:
	docker push $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-gateway:$(VERSION)

push-auth:
	docker push $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-auth-service:$(VERSION)

push-product:
	docker push $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-product-service:$(VERSION)

push-order:
	docker push $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-order-service:$(VERSION)

push-notification:
	docker push $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-notification-service:$(VERSION)

pull-gateway:
	docker pull $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-gateway:$(VERSION)

pull-auth:
	docker pull $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-auth-service:$(VERSION)

pull-product:
	docker pull $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-product-service:$(VERSION)

pull-order:
	docker pull $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-order-service:$(VERSION)

pull-notification:
	docker pull $(DOCKER_REGISTRY)/$(PACKAGE_NAME)-notification-service:$(VERSION)

# Cleanup Commands
clean:
	docker compose -f $(COMPOSE_FILE_INFRA) -f $(COMPOSE_FILE_APP) down --remove-orphans

clean-all:
	docker compose -f $(COMPOSE_FILE_INFRA) -f $(COMPOSE_FILE_APP) down -v --remove-orphans
	docker system prune -f
	docker volume prune -f

# Logs
logs-infra:
	docker compose -f $(COMPOSE_FILE_INFRA) logs -f

logs-dev:
	docker compose -f $(COMPOSE_FILE_INFRA) -f $(COMPOSE_FILE_APP) logs -f

logs-prod:
	docker compose -f $(COMPOSE_FILE_INFRA) -f $(COMPOSE_FILE_APP) logs -f