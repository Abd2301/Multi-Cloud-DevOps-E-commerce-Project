# Development Environment Configuration
# Free tier friendly settings

# Project Configuration
project_name        = "ecommerce-dev"
environment         = "development"
location           = "East US"
resource_group_name = "ecommerce-dev-rg"

# AKS Configuration (Free tier)
aks_cluster_name   = "ecommerce-dev-aks"
kubernetes_version = "1.30"
node_count         = 1
node_size          = "Standard_B2s"  # Free tier eligible
min_node_count     = 1
max_node_count     = 2

# ACR Configuration
acr_name = "ecommerceacrdev1757135911"

# Network Configuration
vnet_address_space = ["10.0.0.0/16"]
subnets = {
  "aks-subnet" = {
    address_prefix = "10.0.1.0/24"
  }
  "monitoring-subnet" = {
    address_prefix = "10.0.2.0/24"
  }
}

# Monitoring Configuration
admin_email = "your-email@gmail.com"

# Namespace
namespace = "ecommerce-dev"

# Tags
common_tags = {
  Environment = "development"
  Project     = "ecommerce-platform"
  ManagedBy   = "terraform"
  CostCenter  = "development"
}
