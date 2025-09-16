# Multi-Cloud DevOps Platform
# Professional Makefile for common operations

.PHONY: help install test lint build deploy clean

# Default target
help: ## Show this help message
	@echo "Multi-Cloud DevOps Platform - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development
install: ## Install all dependencies
	npm install
	cd apps/user-service && npm install
	cd apps/product-service && npm install
	cd apps/order-service && npm install
	cd apps/notification-service && npm install

test: ## Run all tests
	npm test

test-watch: ## Run tests in watch mode
	npm run test:watch

test-coverage: ## Run tests with coverage
	npm run test:coverage

lint: ## Run linting
	npm run lint

lint-fix: ## Fix linting issues
	npm run lint:fix

# Docker operations
docker-build: ## Build all Docker images
	docker-compose build

docker-up: ## Start services with Docker Compose
	docker-compose up -d

docker-down: ## Stop Docker Compose services
	docker-compose down

docker-logs: ## View Docker Compose logs
	docker-compose logs -f

docker-clean: ## Clean up Docker resources
	docker-compose down -v && docker system prune -f

# Kubernetes operations
k8s-deploy: ## Deploy to Kubernetes
	kubectl apply -f kubernetes/base/

k8s-deploy-azure: ## Deploy to Azure Kubernetes
	kubectl apply -f kubernetes/overlays/azure/

k8s-deploy-aws: ## Deploy to AWS Kubernetes
	kubectl apply -f kubernetes/overlays/aws/

k8s-status: ## Check Kubernetes deployment status
	kubectl get pods -n ecommerce
	kubectl get services -n ecommerce

k8s-logs: ## View Kubernetes logs
	kubectl logs -f deployment/user-service -n ecommerce
	kubectl logs -f deployment/product-service -n ecommerce
	kubectl logs -f deployment/order-service -n ecommerce
	kubectl logs -f deployment/notification-service -n ecommerce

# Infrastructure operations
terraform-init: ## Initialize Terraform
	cd infrastructure/azure && terraform init
	cd infrastructure/aws && terraform init

terraform-plan: ## Plan Terraform changes
	cd infrastructure/azure && terraform plan
	cd infrastructure/aws && terraform plan

terraform-apply: ## Apply Terraform changes
	cd infrastructure/azure && terraform apply
	cd infrastructure/aws && terraform apply

terraform-destroy: ## Destroy Terraform infrastructure
	cd infrastructure/azure && terraform destroy
	cd infrastructure/aws && terraform destroy

terraform-validate: ## Validate Terraform configurations
	cd infrastructure/azure && terraform validate
	cd infrastructure/aws && terraform validate

# Cloud deployment
deploy-azure: ## Deploy to Azure
	cd infrastructure/azure && terraform apply
	kubectl apply -f kubernetes/overlays/azure/

deploy-aws: ## Deploy to AWS
	cd infrastructure/aws && terraform apply
	kubectl apply -f kubernetes/overlays/aws/

# Quality assurance
quality-checks: ## Run all quality checks
	npm run lint
	npm test
	cd infrastructure/azure && terraform validate
	cd infrastructure/aws && terraform validate

# Cleanup
clean: ## Clean up all resources
	docker-compose down -v
	docker system prune -f
	kubectl delete namespace ecommerce --ignore-not-found=true

# Development workflow
dev-start: install docker-up ## Start development environment
	@echo "Development environment started. Services available at:"
	@echo "User Service: http://localhost:3002"
	@echo "Product Service: http://localhost:3001"
	@echo "Order Service: http://localhost:3003"
	@echo "Notification Service: http://localhost:3004"

dev-stop: docker-down ## Stop development environment
	@echo "Development environment stopped."
