# 🚀 **Quick Start Guide - Multi-Cloud E-commerce Platform**

## **🎯 Get Started in 5 Minutes**

### **Step 1: Setup GitHub Secrets**
```bash
# Azure Credentials
az ad sp create-for-rbac --name "ecommerce-cicd" --role contributor --scopes /subscriptions/{subscription-id}/resourceGroups/ecommerce-rg --sdk-auth

# AWS Credentials
aws iam create-user --user-name ecommerce-cicd
aws iam attach-user-policy --user-name ecommerce-cicd --policy-arn arn:aws:iam::aws:policy/PowerUserAccess
aws iam create-access-key --user-name ecommerce-cicd
```

### **Step 2: Add Secrets to GitHub**
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:
   - `AZURE_CREDENTIALS` (JSON from Step 1)
   - `AWS_ACCESS_KEY_ID` (from Step 1)
   - `AWS_SECRET_ACCESS_KEY` (from Step 1)

### **Step 3: Deploy to Development**
```bash
# Push to develop branch
git add .
git commit -m "Add CI/CD pipeline"
git push origin develop
```

### **Step 4: Deploy to Production**
```bash
# Push to main branch
git checkout main
git merge develop
git push origin main
```

### **Step 5: Monitor Deployment**
- Go to **Actions** tab in GitHub
- Watch the pipeline execute
- Check deployment status

## **🔧 Manual Commands**

### **Local Development**
```bash
# Start all services
npm run start-services

# Test services
npm run test-services

# Stop services
npm run stop-services
```

### **Docker Development**
```bash
# Build and run with Docker
docker-compose up --build

# Stop Docker services
docker-compose down
```

### **Kubernetes Deployment**
```bash
# Deploy to Azure
kubectl apply -f kubernetes/azure/

# Deploy to AWS
kubectl apply -f kubernetes/aws/

# Check status
kubectl get pods -A
```

## **🚨 Emergency Rollback**

### **GitHub Actions Rollback**
1. Go to **Actions** tab
2. Click **Emergency Rollback**
3. Select environment (Azure/AWS/Both)
4. Choose rollback version
5. Click **Run workflow**

### **Manual Rollback**
```bash
# Azure
kubectl rollout undo deployment/product-service -n ecommerce
kubectl rollout undo deployment/user-service -n ecommerce
kubectl rollout undo deployment/order-service -n ecommerce
kubectl rollout undo deployment/notification-service -n ecommerce

# AWS
kubectl rollout undo deployment/product-service -n ecommerce-dev
kubectl rollout undo deployment/user-service -n ecommerce-dev
kubectl rollout undo deployment/order-service -n ecommerce-dev
kubectl rollout undo deployment/notification-service -n ecommerce-dev
```

## **📊 Health Checks**

### **Service Health**
```bash
# Check all services
curl http://localhost:3001/health  # Product Service
curl http://localhost:3002/health  # User Service
curl http://localhost:3003/health  # Order Service
curl http://localhost:3004/health  # Notification Service
```

### **Kubernetes Health**
```bash
# Check pods
kubectl get pods -A

# Check services
kubectl get services -A

# Check ingress
kubectl get ingress -A
```

## **🔍 Troubleshooting**

### **Common Issues**
1. **Port already in use** → Stop services: `npm run stop-services`
2. **Docker build fails** → Check Dockerfile syntax
3. **Kubernetes deployment fails** → Check image references
4. **CI/CD fails** → Check GitHub secrets

### **Logs**
```bash
# Service logs
kubectl logs -f deployment/product-service -n ecommerce

# Pod logs
kubectl logs -f <pod-name> -n ecommerce
```

## **🎯 Project Structure**

```
Multi-Cloud-DevOps-E-commerce-Project/
├── apps/                          # Microservices
│   ├── product-service/
│   ├── user-service/
│   ├── order-service/
│   └── notification-service/
├── infrastructure/                # Terraform IaC
│   ├── azure/                    # Azure infrastructure
│   └── aws/                      # AWS infrastructure
├── kubernetes/                   # K8s manifests
│   ├── azure/                    # Azure-specific manifests
│   └── aws/                      # AWS-specific manifests
├── .github/workflows/            # CI/CD pipelines
│   ├── ci-cd.yml                # Main pipeline
│   ├── dev-deploy.yml           # Development pipeline
│   ├── security.yml             # Security pipeline
│   └── rollback.yml             # Rollback pipeline
└── docs/                        # Documentation
```

## **🚀 Ready to Deploy!**

Your multi-cloud e-commerce platform is now **production-ready** with:
- ✅ **4 Microservices** (Product, User, Order, Notification)
- ✅ **Docker Containerization** with security best practices
- ✅ **Kubernetes Orchestration** on Azure AKS + AWS EKS
- ✅ **Terraform IaC** for infrastructure management
- ✅ **CI/CD Pipelines** with automated testing and deployment
- ✅ **Multi-Cloud Deployment** for fault tolerance
- ✅ **Security Scanning** and monitoring
- ✅ **Emergency Rollback** capabilities

**🎉 Congratulations! You now have an enterprise-grade DevOps project!**
