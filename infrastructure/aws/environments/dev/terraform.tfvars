# Development Environment Configuration
# Free tier friendly settings

# Project Configuration
project_name        = "ecommerce-dev"
environment         = "development"
aws_region         = "us-east-1"

# EKS Configuration (Free tier)
eks_cluster_name   = "ecommerce-dev-eks"
kubernetes_version = "1.30"
node_count         = 1
node_instance_type = "t3.medium"  # Free tier eligible
min_node_count     = 1
max_node_count     = 2

# ECR Configuration
ecr_repository_name = "ecommerce"

# Network Configuration
vpc_cidr = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b"]
public_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs = ["10.0.10.0/24", "10.0.20.0/24"]

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
