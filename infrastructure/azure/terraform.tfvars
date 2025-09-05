# Terraform Variables for Azure E-commerce Platform
# This file contains the variable values for the Azure infrastructure

# Project Configuration
project_name = "ecommerce"
environment  = "dev"

# Azure Configuration
location           = "East US"
resource_group_name = "ecommerce-rg"

# Container Registry Configuration
acr_name = "ecommerceacr"

# Kubernetes Cluster Configuration
aks_cluster_name    = "ecommerce-aks"
kubernetes_version  = "1.28"
node_count         = 2
node_size          = "Standard_B2s"  # Free tier compatible

# Application Configuration
namespace = "ecommerce"

# Tags
common_tags = {
  Environment = "dev"
  Project     = "ecommerce-platform"
  ManagedBy   = "terraform"
  Owner       = "devops-team"
  CostCenter  = "engineering"
}
