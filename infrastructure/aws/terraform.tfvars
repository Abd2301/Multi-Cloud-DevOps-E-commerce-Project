# Terraform Variables for AWS E-commerce Platform
# This file contains the variable values for the AWS infrastructure

# Project Configuration
project_name = "ecommerce"
environment  = "dev"

# AWS Configuration
aws_region = "us-east-1"

# VPC Configuration
vpc_cidr             = "10.0.0.0/16"
availability_zones   = ["us-east-1a", "us-east-1b"]
public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs = ["10.0.10.0/24", "10.0.20.0/24"]

# EKS Cluster Configuration
eks_cluster_name   = "ecommerce-eks"
kubernetes_version = "1.30"
node_count         = 2
min_node_count     = 1
max_node_count     = 5
node_instance_type = "t3.medium" # Free tier compatible

# ECR Configuration
ecr_repository_name = "ecommerce"

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
