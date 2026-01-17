# Vortex E-Commerce Microservices
# Industry Standard Docker Management

# Environment files
ENV_FILE_PROD := .env.production
ENV_FILE_DEV := .env.development

# Docker registry
DOCKER_REGISTRY := softvence
VERSION := latest

.PHONY: help build push pull prod dev infra clean

help:
	@echo "Vortex Docker Commands (Industry Standard)"
	@echo "=========================================="
	@echo ""
	@echo "Environment Management:"
	@echo "  make infra         Start infrastructure (MongoDB, RabbitMQ, Redis)"
	@echo "  make dev           Start development environment"
	@echo "  make prod          Start production environment"
	@echo ""
	@echo "Image Management:"
	@echo "  make build         Build all service images"
	@echo "  make push          Push images to registry"
	@echo "  make pull          Pull images from registry"
	@echo ""
	@echo "Development Tools:"
	@echo "  make tools         Start dev tools (Mongo Express, etc.)"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean         Stop and remove all containers"
	@echo "  make clean-all     Remove containers, images, volumes"

# Environment Commands
infra:
	docker compose -f docker-compose.infra.yml --env-file $(ENV_FILE_DEV) up -d

dev:
	docker compose -f docker-compose.infra.yml -f docker-compose.dev.yml --env-file $(ENV_FILE_DEV) up -d

prod:
	docker compose -f docker-compose.infra.yml -f docker-compose.yml --env-file $(ENV_FILE_PROD) up -d

tools:
	docker compose -f docker-compose.infra.yml --env-file $(ENV_FILE_DEV) --profile tools up -d

# Image Management
build:
	docker build -t $(DOCKER_REGISTRY)/vortex-gateway:$(VERSION) --target gateway .
	docker build -t $(DOCKER_REGISTRY)/vortex-auth-service:$(VERSION) --target auth-service .
	docker build -t $(DOCKER_REGISTRY)/vortex-product-service:$(VERSION) --target product-service .
	docker build -t $(DOCKER_REGISTRY)/vortex-order-service:$(VERSION) --target order-service .
	docker build -t $(DOCKER_REGISTRY)/vortex-notification-service:$(VERSION) --target notification-service .

push:
	docker push $(DOCKER_REGISTRY)/vortex-gateway:$(VERSION)
	docker push $(DOCKER_REGISTRY)/vortex-auth-service:$(VERSION)
	docker push $(DOCKER_REGISTRY)/vortex-product-service:$(VERSION)
	docker push $(DOCKER_REGISTRY)/vortex-order-service:$(VERSION)
	docker push $(DOCKER_REGISTRY)/vortex-notification-service:$(VERSION)

pull:
	docker pull $(DOCKER_REGISTRY)/vortex-gateway:$(VERSION)
	docker pull $(DOCKER_REGISTRY)/vortex-auth-service:$(VERSION)
	docker pull $(DOCKER_REGISTRY)/vortex-product-service:$(VERSION)
	docker pull $(DOCKER_REGISTRY)/vortex-order-service:$(VERSION)
	docker pull $(DOCKER_REGISTRY)/vortex-notification-service:$(VERSION)

# Cleanup Commands
clean:
	docker compose -f docker-compose.infra.yml -f docker-compose.yml -f docker-compose.dev.yml down --remove-orphans

clean-all:
	docker compose -f docker-compose.infra.yml -f docker-compose.yml -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -f
	docker volume prune -f

# Logs
logs-infra:
	docker compose -f docker-compose.infra.yml logs -f

logs-dev:
	docker compose -f docker-compose.infra.yml -f docker-compose.dev.yml logs -f

logs-prod:
	docker compose -f docker-compose.infra.yml -f docker-compose.yml logs -f
