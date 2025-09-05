# ☁️ Cloud Deployment Guide: Azure & AWS (Free Tier)

This guide shows how to deploy your e-commerce platform to both Azure and AWS using their free tiers.

## 🎯 **What We're Deploying**

- **4 Microservices** (User, Product, Order, Notification)
- **Kubernetes Clusters** (Azure AKS, AWS EKS)
- **Container Registries** (Azure ACR, AWS ECR)
- **Load Balancers** and **Ingress Controllers**
- **Production-Ready** configuration

## 🆓 **Free Tier Limits**

### **Azure Free Tier:**
- **$200 credit** for 30 days
- **12 months free** for many services
- **AKS**: Free cluster management (pay only for VMs)
- **ACR**: 10GB free storage
- **Always Free**: Some services forever

### **AWS Free Tier:**
- **12 months free** for new accounts
- **EKS**: Free cluster management (pay only for EC2)
- **ECR**: 500MB free storage
- **Always Free**: Some services forever

## 🛠️ **Prerequisites Setup**

### **1. Azure Prerequisites**

#### **Install Azure CLI:**
```bash
# Download and install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Verify installation
az --version

# Login to Azure
az login
```

#### **Create Azure Account:**
1. Go to [Azure Portal](https://portal.azure.com)
2. Sign up for free account
3. Verify your identity
4. Get $200 credit for 30 days

### **2. AWS Prerequisites**

#### **Install AWS CLI:**
```bash
# Download and install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify installation
aws --version

# Configure AWS CLI
aws configure
```

#### **Create AWS Account:**
1. Go to [AWS Console](https://aws.amazon.com)
2. Sign up for free account
3. Verify your identity
4. Get 12 months free tier

### **3. Additional Tools**

#### **Install eksctl (for AWS EKS):**
```bash
# Download and install eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Verify installation
eksctl version
```

## 🚀 **Deployment Process**

### **Step 1: Prepare for Deployment**

```bash
# Make scripts executable
chmod +x scripts/azure-deploy.sh
chmod +x scripts/aws-deploy.sh

# Check prerequisites
az --version
aws --version
kubectl version --client
```

### **Step 2: Deploy to Azure**

```bash
# Run Azure deployment script
./scripts/azure-deploy.sh
```

**What this script does:**
1. Creates Azure Resource Group
2. Creates Azure Container Registry (ACR)
3. Builds and pushes Docker images to ACR
4. Creates Azure Kubernetes Service (AKS) cluster
5. Deploys microservices to AKS
6. Configures ingress and load balancing

### **Step 3: Deploy to AWS**

```bash
# Run AWS deployment script
./scripts/aws-deploy.sh
```

**What this script does:**
1. Creates Elastic Container Registry (ECR) repositories
2. Builds and pushes Docker images to ECR
3. Creates Elastic Kubernetes Service (EKS) cluster
4. Deploys microservices to EKS
5. Configures ingress and load balancing

## 📊 **Deployment Architecture**

### **Azure Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│                        Azure Cloud                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   Azure ACR     │  │   Azure AKS     │                  │
│  │  (Container     │  │  (Kubernetes    │                  │
│  │   Registry)     │  │   Cluster)      │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                E-commerce Platform                     │ │
│  │  • User Service (2 pods)                              │ │
│  │  • Product Service (2 pods)                           │ │
│  │  • Order Service (2 pods)                             │ │
│  │  • Notification Service (2 pods)                      │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### **AWS Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│                        AWS Cloud                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   AWS ECR       │  │   AWS EKS       │                  │
│  │  (Container     │  │  (Kubernetes    │                  │
│  │   Registry)     │  │   Cluster)      │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                E-commerce Platform                     │ │
│  │  • User Service (2 pods)                              │ │
│  │  • Product Service (2 pods)                           │ │
│  │  • Order Service (2 pods)                             │ │
│  │  • Notification Service (2 pods)                      │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🧪 **Testing Cloud Deployments**

### **1. Check Deployment Status**

```bash
# Check pods
kubectl get pods -n ecommerce

# Check services
kubectl get services -n ecommerce

# Check ingress
kubectl get ingress -n ecommerce
```

### **2. Test Services**

```bash
# Port forward for testing
kubectl port-forward service/user-service 3002:3002 -n ecommerce &
kubectl port-forward service/product-service 3001:3001 -n ecommerce &
kubectl port-forward service/order-service 3003:3003 -n ecommerce &
kubectl port-forward service/notification-service 3004:3004 -n ecommerce &

# Test health endpoints
curl http://localhost:3002/health
curl http://localhost:3001/health
curl http://localhost:3003/health
curl http://localhost:3004/health
```

### **3. Run Complete Platform Demo**

```bash
# Run the demo
node demo-complete-platform.js
```

## 💰 **Cost Optimization (Free Tier)**

### **Azure Cost Optimization:**
- Use **Standard_B2s** VMs (2 vCPU, 4GB RAM)
- Enable **auto-scaling** to scale down when not needed
- Use **spot instances** for non-production workloads
- Monitor usage with **Azure Cost Management**

### **AWS Cost Optimization:**
- Use **t3.medium** instances (2 vCPU, 4GB RAM)
- Enable **auto-scaling** to scale down when not needed
- Use **spot instances** for non-production workloads
- Monitor usage with **AWS Cost Explorer**

### **General Tips:**
- **Delete resources** when not needed
- **Use smaller instance types** for development
- **Enable auto-scaling** to save costs
- **Monitor usage** regularly

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **1. Authentication Errors**
```bash
# Azure
az login

# AWS
aws configure
```

#### **2. Image Pull Errors**
```bash
# Check if images exist in registry
az acr repository list --name <acr-name>
aws ecr describe-repositories
```

#### **3. Pod Not Starting**
```bash
# Check pod logs
kubectl logs <pod-name> -n ecommerce

# Check pod events
kubectl describe pod <pod-name> -n ecommerce
```

#### **4. Service Not Accessible**
```bash
# Check service endpoints
kubectl get endpoints -n ecommerce

# Check ingress
kubectl get ingress -n ecommerce
```

### **Debug Commands:**
```bash
# Check cluster status
kubectl cluster-info

# Check node status
kubectl get nodes

# Check resource usage
kubectl top pods -n ecommerce
kubectl top nodes
```

## 🚀 **Production Considerations**

### **Security:**
- **Network Policies** for pod-to-pod communication
- **RBAC** for access control
- **Secrets Management** for sensitive data
- **Pod Security Standards** enforcement

### **Monitoring:**
- **Azure Monitor** / **AWS CloudWatch**
- **Prometheus** and **Grafana**
- **Log aggregation** with ELK stack
- **Alerting** for critical issues

### **High Availability:**
- **Multi-zone deployment**
- **Pod disruption budgets**
- **Resource limits** and **requests**
- **Health checks** and **liveness probes**

## 🎯 **Next Steps**

Once you're comfortable with cloud deployment:

1. **CI/CD Pipelines** - Automated deployment
2. **Monitoring & Observability** - Production monitoring
3. **Security** - Container security scanning
4. **GitOps** - Declarative deployment
5. **Multi-Cloud** - Deploy across multiple clouds

## 🎉 **Congratulations!**

You now know how to:
- ✅ Deploy microservices to cloud platforms
- ✅ Use managed Kubernetes services
- ✅ Work with container registries
- ✅ Configure load balancing and ingress
- ✅ Optimize costs with free tiers
- ✅ Troubleshoot cloud deployments

This is exactly what companies like Netflix, Uber, and Amazon use to run their microservices in the cloud! 🚀

---

*This cloud deployment makes your e-commerce platform globally accessible, highly available, and production-ready.*
