# Deployment Guide: Multi-Cloud DevOps Platform

## Overview

This guide shows you how to deploy the platform using direct Terraform commands - the professional way that DevOps engineers use in production.

## Prerequisites

### Required Tools
- **Terraform** 1.0+ installed
- **Azure CLI** configured with your account
- **AWS CLI** configured with your account
- **Docker** for building images
- **kubectl** for Kubernetes management

### Verify Installation
```bash
# Check Terraform
terraform version

# Check Azure CLI
az --version

# Check AWS CLI
aws --version

# Check Docker
docker --version

# Check kubectl
kubectl version --client
```

## 🌍 **Deployment Options**

### **Option 1: Azure Deployment**
### **Option 2: AWS Deployment**
### **Option 3: Multi-Cloud Deployment**

---

## 🔵 **Azure Deployment**

### **Step 1: Navigate to Azure Directory**
```bash
cd infrastructure/azure
```

### **Step 2: Initialize Terraform**
```bash
# Initialize Terraform (downloads providers, sets up backend)
terraform init
```

**What this does:**
- Downloads Azure provider
- Sets up local state file
- Prepares for deployment

### **Step 3: Plan Deployment**
```bash
# See what will be created (dry run)
terraform plan
```

**What this shows:**
- Resources that will be created
- Configuration details
- Estimated costs
- Any potential issues

### **Step 4: Apply Deployment**
```bash
# Deploy the infrastructure
terraform apply
```

**What this does:**
- Creates Azure Resource Group
- Creates Azure Container Registry (ACR)
- Creates Azure Kubernetes Service (AKS)
- Sets up networking (VNet, Subnets)
- Configures IAM roles

### **Step 5: Verify Deployment**
```bash
# Check what was created
terraform output

# List Azure resources
az resource list --resource-group ecommerce-rg
```

### **Step 6: Build and Push Images**
```bash
# Build Docker images
docker build -t ecommerce-user-service:latest ../apps/user-service/
docker build -t ecommerce-product-service:latest ../apps/product-service/
docker build -t ecommerce-order-service:latest ../apps/order-service/
docker build -t ecommerce-notification-service:latest ../apps/notification-service/

# Tag for Azure Container Registry
docker tag ecommerce-user-service:latest <acr-name>.azurecr.io/ecommerce-user-service:latest
docker tag ecommerce-product-service:latest <acr-name>.azurecr.io/ecommerce-product-service:latest
docker tag ecommerce-order-service:latest <acr-name>.azurecr.io/ecommerce-order-service:latest
docker tag ecommerce-notification-service:latest <acr-name>.azurecr.io/ecommerce-notification-service:latest

# Push to ACR
docker push <acr-name>.azurecr.io/ecommerce-user-service:latest
docker push <acr-name>.azurecr.io/ecommerce-product-service:latest
docker push <acr-name>.azurecr.io/ecommerce-order-service:latest
docker push <acr-name>.azurecr.io/ecommerce-notification-service:latest
```

### **Step 7: Deploy to Kubernetes**
```bash
# Get AKS credentials
az aks get-credentials --resource-group ecommerce-rg --name ecommerce-aks

# Deploy to Kubernetes
kubectl apply -f ../../kubernetes/

# Check deployment
kubectl get pods
kubectl get services
```

---

## 🟠 **AWS Deployment**

### **Step 1: Navigate to AWS Directory**
```bash
cd infrastructure/aws
```

### **Step 2: Initialize Terraform**
```bash
# Initialize Terraform
terraform init
```

### **Step 3: Plan Deployment**
```bash
# See what will be created
terraform plan
```

### **Step 4: Apply Deployment**
```bash
# Deploy the infrastructure
terraform apply
```

**What this creates:**
- VPC with public/private subnets
- Elastic Kubernetes Service (EKS) cluster
- Elastic Container Registry (ECR)
- IAM roles and policies
- Security groups

### **Step 5: Verify Deployment**
```bash
# Check outputs
terraform output

# List AWS resources
aws ec2 describe-vpcs
aws eks list-clusters
```

### **Step 6: Build and Push Images**
```bash
# Build Docker images
docker build -t ecommerce-user-service:latest ../apps/user-service/
docker build -t ecommerce-product-service:latest ../apps/product-service/
docker build -t ecommerce-order-service:latest ../apps/order-service/
docker build -t ecommerce-notification-service:latest ../apps/notification-service/

# Tag for AWS ECR
docker tag ecommerce-user-service:latest <account-id>.dkr.ecr.<region>.amazonaws.com/ecommerce-user-service:latest
docker tag ecommerce-product-service:latest <account-id>.dkr.ecr.<region>.amazonaws.com/ecommerce-product-service:latest
docker tag ecommerce-order-service:latest <account-id>.dkr.ecr.<region>.amazonaws.com/ecommerce-order-service:latest
docker tag ecommerce-notification-service:latest <account-id>.dkr.ecr.<region>.amazonaws.com/ecommerce-notification-service:latest

# Push to ECR
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/ecommerce-user-service:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/ecommerce-product-service:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/ecommerce-order-service:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/ecommerce-notification-service:latest
```

### **Step 7: Deploy to Kubernetes**
```bash
# Get EKS credentials
aws eks update-kubeconfig --region <region> --name ecommerce-eks

# Deploy to Kubernetes
kubectl apply -f ../../kubernetes/

# Check deployment
kubectl get pods
kubectl get services
```

---

## 🌐 **Multi-Cloud Deployment**

### **Deploy to Both Clouds:**
```bash
# Deploy to Azure
cd infrastructure/azure
terraform init
terraform apply

# Deploy to AWS
cd ../aws
terraform init
terraform apply
```

### **Benefits of Multi-Cloud:**
- **High Availability** - If one cloud fails, the other works
- **Vendor Lock-in** - Avoid dependency on single provider
- **Cost Optimization** - Use best pricing from each cloud
- **Geographic Distribution** - Deploy closer to users

---

## 🔧 **Advanced Terraform Commands**

### **Custom Variables:**
```bash
# Deploy with custom variables
terraform apply -var="resource_group_name=my-ecommerce-rg" -var="location=East US"

# Use variable file
terraform apply -var-file="production.tfvars"
```

### **Targeted Deployment:**
```bash
# Deploy only specific resources
terraform apply -target=azurerm_resource_group.ecommerce_rg
```

### **State Management:**
```bash
# Show current state
terraform show

# List resources
terraform state list

# Import existing resource
terraform import azurerm_resource_group.ecommerce_rg /subscriptions/.../resourceGroups/ecommerce-rg
```

### **Destroy Infrastructure:**
```bash
# Destroy all resources
terraform destroy

# Destroy specific resources
terraform destroy -target=azurerm_resource_group.ecommerce_rg
```

---

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **1. Terraform Init Fails**
```bash
# Clear Terraform cache
rm -rf .terraform
terraform init
```

#### **2. Provider Authentication Issues**
```bash
# Azure
az login
az account set --subscription <subscription-id>

# AWS
aws configure
aws sts get-caller-identity
```

#### **3. Resource Already Exists**
```bash
# Import existing resource
terraform import <resource_type>.<name> <resource_id>
```

#### **4. State Lock Issues**
```bash
# Force unlock (use with caution)
terraform force-unlock <lock-id>
```

---

## 📊 **Monitoring Deployment**

### **Check Resource Status:**
```bash
# Azure
az resource list --resource-group ecommerce-rg --output table

# AWS
aws ec2 describe-instances --output table
aws eks list-clusters
```

### **Check Kubernetes:**
```bash
# Get cluster info
kubectl cluster-info

# Check nodes
kubectl get nodes

# Check pods
kubectl get pods -o wide

# Check services
kubectl get services
```

### **Check Logs:**
```bash
# Pod logs
kubectl logs <pod-name>

# Service logs
kubectl logs -f deployment/<service-name>
```

---

## 💰 **Cost Management**

### **Monitor Costs:**
```bash
# Azure
az consumption usage list --start-date 2024-01-01 --end-date 2024-01-31

# AWS
aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --granularity MONTHLY --metrics BlendedCost
```

### **Optimize Costs:**
- Use **spot instances** for non-critical workloads
- Set up **auto-scaling** to scale down during low usage
- Use **reserved instances** for predictable workloads
- Monitor and **tag resources** for cost tracking

---

## 🎯 **Best Practices**

### **1. Always Plan First:**
```bash
terraform plan  # Always run before apply
```

### **2. Use Version Control:**
```bash
git add .
git commit -m "Add infrastructure changes"
git push
```

### **3. Use Remote State:**
```bash
# Configure remote backend
terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "terraformstate"
    container_name       = "tfstate"
    key                  = "ecommerce.terraform.tfstate"
  }
}
```

### **4. Use Modules:**
```bash
# Create reusable modules
module "networking" {
  source = "./modules/networking"
  # ... variables
}
```

### **5. Use Workspaces:**
```bash
# Create different environments
terraform workspace new dev
terraform workspace new staging
terraform workspace new production
```

---

## 🎉 **Success!**

You've now deployed a production-ready, multi-cloud e-commerce platform using **professional DevOps practices**!

**What you've learned:**
- ✅ **Terraform** - Infrastructure as Code
- ✅ **Azure** - AKS, ACR, VNet
- ✅ **AWS** - EKS, ECR, VPC
- ✅ **Kubernetes** - Container orchestration
- ✅ **Docker** - Containerization
- ✅ **Multi-cloud** - Cloud-agnostic deployment

**You're now ready for senior DevOps positions!** 🚀

