# Staging Environment Configuration
# Free tier friendly settings

# Project Configuration
project_name        = "ecommerce-staging"
environment         = "staging"
location           = "East US"
resource_group_name = "ecommerce-staging-rg"

# AKS Configuration (Free tier)
aks_cluster_name   = "ecommerce-staging-aks"
kubernetes_version = "1.30"
node_count         = 1
node_size          = "Standard_B2s"  # Free tier eligible
min_node_count     = 1
max_node_count     = 3

# ACR Configuration
acr_name = "ecommerceacrstaging1757135911"

# Network Configuration
vnet_address_space = ["10.1.0.0/16"]
subnets = {
  "aks-subnet" = {
    address_prefix = "10.1.1.0/24"
  }
  "monitoring-subnet" = {
    address_prefix = "10.1.2.0/24"
  }
}

# Monitoring Configuration
admin_email = "your-email@gmail.com"

# Namespace
namespace = "ecommerce-staging"

# Tags
common_tags = {
  Environment = "staging"
  Project     = "ecommerce-platform"
  ManagedBy   = "terraform"
  CostCenter  = "staging"
}
