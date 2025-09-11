# AWS Staging Environment Configuration
# Project Configuration
project_name        = "ecommerce-staging"
environment         = "staging"
aws_region         = "us-east-1"

# EKS Configuration
kubernetes_version  = "1.30"
node_instance_type  = "t3.medium"
min_node_count      = 1
max_node_count      = 3

# ECR Configuration
ecr_repository_name = "ecommerce"

# Network Configuration
vpc_cidr            = "10.1.0.0/16"
availability_zones  = ["us-east-1a", "us-east-1b"]

# Secrets Configuration
admin_email                = "your-email@gmail.com"
database_connection_string = "postgresql://staging-user:staging-password@staging-db-host:5432/ecommerce_staging"
jwt_secret                = "staging-jwt-secret-key-change-in-production"
email_config = {
  host     = "staging-smtp-server"
  port     = 587
  username = "staging-user"
  password = "staging-password"
  secure   = false
}

# Common Tags
common_tags = {
  Environment = "staging"
  Project     = "ecommerce-platform"
  ManagedBy   = "terraform"
  CostCenter  = "staging"
}
