# 🏗️ Terraform Guide: Infrastructure as Code for E-commerce Platform

This guide shows how to deploy your e-commerce platform using Terraform (Infrastructure as Code) to both Azure and AWS.

## 🎯 **What is Infrastructure as Code (IaC)?**

**Terraform** is like **"blueprints for your infrastructure"**:

- **Traditional Approach**: Manual setup, scripts, clicking in UI
- **Terraform Approach**: Code that describes what you want
- **Result**: Reproducible, version-controlled, professional infrastructure

### **Why Terraform is Better:**
- ✅ **Declarative** - Describe what you want, not how to get it
- ✅ **Idempotent** - Can run multiple times safely
- ✅ **State Management** - Tracks what exists
- ✅ **Version Control** - Track all changes in Git
- ✅ **Rollback Support** - Easy to undo changes
- ✅ **Industry Standard** - Used by Netflix, Uber, Amazon

## 🏗️ **Terraform Concepts**

### **1. Providers** = Cloud Platforms
- **Azure Provider** - Manages Azure resources
- **AWS Provider** - Manages AWS resources
- **Kubernetes Provider** - Manages K8s resources

### **2. Resources** = Infrastructure Components
- **Virtual Machines** - Compute instances
- **Networks** - VPCs, subnets, security groups
- **Databases** - Managed database services
- **Load Balancers** - Traffic distribution

### **3. Variables** = Configuration
- **Input Variables** - Customize your infrastructure
- **Output Variables** - Values from created resources
- **Local Variables** - Reusable values

### **4. State** = Current Infrastructure
- **Terraform State** - Tracks what exists
- **State Files** - Stored locally or remotely
- **State Management** - Prevents conflicts

## 🚀 **Quick Start**

### **Prerequisites:**
- Terraform installed (✅ You have v1.13.0)
- Azure CLI installed and logged in
- AWS CLI installed and configured

### **Step 1: Initialize Terraform**
```bash
# Navigate to Azure directory
cd infrastructure/azure

# Initialize Terraform
terraform init

# Plan the deployment
terraform plan

# Apply the changes
terraform apply
```

### **Step 2: Deploy to AWS**
```bash
# Navigate to AWS directory
cd infrastructure/aws

# Initialize Terraform
terraform init

# Plan the deployment
terraform plan

# Apply the changes
terraform apply
```

## 📁 **Project Structure**

```
infrastructure/
├── azure/
│   ├── main.tf          # Main Azure resources
│   ├── variables.tf     # Input variables
│   ├── outputs.tf       # Output values
│   └── terraform.tfvars # Variable values
├── aws/
│   ├── main.tf          # Main AWS resources
│   ├── iam.tf           # IAM roles and policies
│   ├── variables.tf     # Input variables
│   ├── outputs.tf       # Output values
│   └── terraform.tfvars # Variable values
└── modules/             # Reusable components
    ├── kubernetes/
    ├── container-registry/
    └── networking/
```

## 🔧 **Terraform Commands**

### **Basic Commands:**
```bash
# Initialize Terraform
terraform init

# Plan changes (dry run)
terraform plan

# Apply changes
terraform apply

# Destroy resources
terraform destroy

# Show current state
terraform show

# List resources
terraform state list
```

### **Advanced Commands:**
```bash
# Format code
terraform fmt

# Validate configuration
terraform validate

# Import existing resources
terraform import

# Refresh state
terraform refresh

# Output specific values
terraform output
```

## 🏗️ **What We're Deploying**

### **Azure Resources:**
- **Resource Group** - Container for all resources
- **Container Registry** - Store Docker images
- **Virtual Network** - Network infrastructure
- **AKS Cluster** - Managed Kubernetes
- **IAM Roles** - Security and permissions

### **AWS Resources:**
- **VPC** - Virtual Private Cloud
- **Subnets** - Public and private networks
- **EKS Cluster** - Managed Kubernetes
- **ECR Repositories** - Store Docker images
- **IAM Roles** - Security and permissions

## 💰 **Free Tier Optimization**

### **Azure Free Tier:**
- **B2s VMs** - 2 vCPU, 4GB RAM
- **Basic ACR** - 10GB storage
- **Free AKS** - Cluster management free

### **AWS Free Tier:**
- **t3.medium** - 2 vCPU, 4GB RAM
- **Free EKS** - Cluster management free
- **ECR** - 500MB storage

### **Cost Optimization:**
- ✅ **Small instances** for development
- ✅ **Auto-scaling** enabled
- ✅ **Spot instances** for non-production
- ✅ **Resource tagging** for cost tracking

## 🧪 **Testing Your Deployment**

### **1. Check Terraform State**
```bash
# Show all resources
terraform show

# List resources
terraform state list

# Check outputs
terraform output
```

### **2. Test Kubernetes**
```bash
# Configure kubectl
az aks get-credentials --resource-group ecommerce-rg --name ecommerce-aks

# Check cluster status
kubectl get nodes
kubectl get pods -n ecommerce
```

### **3. Test Application**
```bash
# Port forward for testing
kubectl port-forward service/user-service 3002:3002 -n ecommerce &

# Test health endpoint
curl http://localhost:3002/health
```

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **1. Authentication Errors**
```bash
# Azure
az login

# AWS
aws configure
```

#### **2. State Lock Errors**
```bash
# Force unlock (be careful!)
terraform force-unlock <lock-id>
```

#### **3. Resource Conflicts**
```bash
# Import existing resource
terraform import <resource_type>.<name> <resource_id>
```

#### **4. Plan/Apply Failures**
```bash
# Check logs
terraform plan -detailed-exitcode

# Validate configuration
terraform validate
```

## 🚀 **Production Considerations**

### **State Management:**
- **Remote State** - Store state in cloud storage
- **State Locking** - Prevent concurrent modifications
- **State Encryption** - Secure sensitive data

### **Security:**
- **Least Privilege** - Minimal required permissions
- **Resource Tagging** - Track and manage resources
- **Secrets Management** - Use Azure Key Vault/AWS Secrets Manager

### **Monitoring:**
- **Terraform Cloud** - Managed state and runs
- **Cost Monitoring** - Track resource costs
- **Compliance** - Ensure security standards

## 🎯 **Next Steps**

Once you're comfortable with Terraform:

1. **Modules** - Create reusable components
2. **Workspaces** - Manage multiple environments
3. **CI/CD** - Automated deployment pipelines
4. **Policy as Code** - Security and compliance
5. **Multi-Cloud** - Deploy across providers

## 🎉 **Congratulations!**

You now know how to:
- ✅ **Define infrastructure as code** with Terraform
- ✅ **Deploy to Azure and AWS** using IaC
- ✅ **Manage state** and track changes
- ✅ **Optimize costs** with free tier
- ✅ **Troubleshoot** common issues
- ✅ **Follow best practices** for production

This is exactly what **Senior DevOps Engineers** and **Platform Engineers** do at companies like Netflix, Uber, and Amazon! 🚀

---

*Terraform makes your infrastructure reproducible, version-controlled, and professional.*
