#!/bin/bash

# AWS Deployment Script
# Deploys microservices to AWS EKS with ECR images

set -e

echo "🚀 Deploying to AWS EKS..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Please configure AWS CLI first: aws configure"
    exit 1
fi

# Get EKS credentials
echo "🔑 Getting EKS credentials..."
aws eks update-kubeconfig --region us-east-1 --name ecommerce-dev-eks

# Login to ECR
echo "🐳 Logging into AWS ECR..."
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 043309357886.dkr.ecr.us-east-1.amazonaws.com

# Build and push images to ECR
echo "📦 Building and pushing images to ECR..."
docker build -t 043309357886.dkr.ecr.us-east-1.amazonaws.com/ecommerce/product-service:latest ./apps/product-service/
docker build -t 043309357886.dkr.ecr.us-east-1.amazonaws.com/ecommerce/user-service:latest ./apps/user-service/
docker build -t 043309357886.dkr.ecr.us-east-1.amazonaws.com/ecommerce/order-service:latest ./apps/order-service/
docker build -t 043309357886.dkr.ecr.us-east-1.amazonaws.com/ecommerce/notification-service:latest ./apps/notification-service/

docker push 043309357886.dkr.ecr.us-east-1.amazonaws.com/ecommerce/product-service:latest
docker push 043309357886.dkr.ecr.us-east-1.amazonaws.com/ecommerce/user-service:latest
docker push 043309357886.dkr.ecr.us-east-1.amazonaws.com/ecommerce/order-service:latest
docker push 043309357886.dkr.ecr.us-east-1.amazonaws.com/ecommerce/notification-service:latest

# Deploy to Kubernetes
echo "☸️ Deploying to AWS EKS..."
kubectl apply -f kubernetes/aws/

# Wait for deployment
echo "⏳ Waiting for deployment to complete..."
kubectl rollout status deployment/product-service
kubectl rollout status deployment/user-service
kubectl rollout status deployment/order-service
kubectl rollout status deployment/notification-service

# Show status
echo "✅ AWS deployment complete!"
echo "📊 Pod Status:"
kubectl get pods
echo ""
echo "🌐 Services:"
kubectl get services
echo ""
echo "🔗 Ingress:"
kubectl get ingress

echo ""
echo "🎉 AWS deployment successful!"
echo "💡 To test services, use port-forward:"
echo "   kubectl port-forward service/product-service 3001:3001"
