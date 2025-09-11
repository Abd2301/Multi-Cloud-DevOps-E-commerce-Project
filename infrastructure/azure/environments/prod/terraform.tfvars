# Production Environment Configuration
# Free tier friendly settings (for demo purposes)

# Project Configuration
project_name        = "ecommerce-prod"
environment         = "production"
location           = "East US"
resource_group_name = "ecommerce-prod-rg"

# AKS Configuration (Free tier)
aks_cluster_name   = "ecommerce-prod-aks"
kubernetes_version = "1.30"
node_count         = 2
node_size          = "Standard_B2s"  # Free tier eligible
min_node_count     = 2
max_node_count     = 5

# ACR Configuration
acr_name = "ecommerceacrprod1757135911"

# Network Configuration
vnet_address_space = ["10.2.0.0/16"]
subnets = {
  "aks-subnet" = {
    address_prefix = "10.2.1.0/24"
  }
  "monitoring-subnet" = {
    address_prefix = "10.2.2.0/24"
  }
}

# Monitoring Configuration
admin_email = "your-email@gmail.com"

# Namespace
namespace = "ecommerce-prod"

# Tags
common_tags = {
  Environment = "production"
  Project     = "ecommerce-platform"
  ManagedBy   = "terraform"
  CostCenter  = "production"
}
