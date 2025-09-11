# AWS Production Environment Configuration
# Project Configuration
project_name        = "ecommerce-prod"
environment         = "production"
aws_region         = "us-east-1"

# EKS Configuration
kubernetes_version  = "1.30"
node_instance_type  = "t3.large"
min_node_count      = 2
max_node_count      = 5

# ECR Configuration
ecr_repository_name = "ecommerce"

# Network Configuration
vpc_cidr            = "10.2.0.0/16"
availability_zones  = ["us-east-1a", "us-east-1b"]

# Secrets Configuration
admin_email                = "your-email@gmail.com"
database_connection_string = "postgresql://prod-user:prod-password@prod-db-host:5432/ecommerce_prod"
jwt_secret                = "prod-jwt-secret-key-change-in-production"
email_config = {
  host     = "prod-smtp-server"
  port     = 587
  username = "prod-user"
  password = "prod-password"
  secure   = false
}

# Common Tags
common_tags = {
  Environment = "production"
  Project     = "ecommerce-platform"
  ManagedBy   = "terraform"
  CostCenter  = "production"
}
