#!/bin/bash

# Azure Deployment Script
# Deploys microservices to Azure AKS with ACR images

set -e

echo "🚀 Deploying to Azure AKS..."

# Check if Azure CLI is logged in
if ! az account show &> /dev/null; then
    echo "❌ Please login to Azure CLI first: az login"
    exit 1
fi

# Get AKS credentials
echo "🔑 Getting AKS credentials..."
az aks get-credentials --resource-group ecommerce-rg --name ecommerce-aks --overwrite-existing

# Login to ACR
echo "🐳 Logging into Azure Container Registry..."
az acr login --name ecommerceacr1757135911

# Build and push images to ACR
echo "📦 Building and pushing images to ACR..."
docker build -t ecommerceacr1757135911.azurecr.io/product-service:latest ./apps/product-service/
docker build -t ecommerceacr1757135911.azurecr.io/user-service:latest ./apps/user-service/
docker build -t ecommerceacr1757135911.azurecr.io/order-service:latest ./apps/order-service/
docker build -t ecommerceacr1757135911.azurecr.io/notification-service:latest ./apps/notification-service/

docker push ecommerceacr1757135911.azurecr.io/product-service:latest
docker push ecommerceacr1757135911.azurecr.io/user-service:latest
docker push ecommerceacr1757135911.azurecr.io/order-service:latest
docker push ecommerceacr1757135911.azurecr.io/notification-service:latest

# Deploy to Kubernetes
echo "☸️ Deploying to Azure AKS..."
kubectl apply -f kubernetes/azure/

# Wait for deployment
echo "⏳ Waiting for deployment to complete..."
kubectl rollout status deployment/product-service
kubectl rollout status deployment/user-service
kubectl rollout status deployment/order-service
kubectl rollout status deployment/notification-service

# Show status
echo "✅ Azure deployment complete!"
echo "📊 Pod Status:"
kubectl get pods
echo ""
echo "🌐 Services:"
kubectl get services
echo ""
echo "🔗 Ingress:"
kubectl get ingress

echo ""
echo "🎉 Azure deployment successful!"
echo "💡 To test services, use port-forward:"
echo "   kubectl port-forward service/product-service 3001:3001"
