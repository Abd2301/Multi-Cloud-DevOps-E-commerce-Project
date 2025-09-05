# Variables for AWS Infrastructure
# This file defines all the variables used in the AWS configuration

# General Variables
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "ecommerce"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "us-east-1"
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

# EKS Cluster Configuration
variable "eks_cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "ecommerce-eks"
}

variable "kubernetes_version" {
  description = "Kubernetes version for the EKS cluster"
  type        = string
  default     = "1.28"
}

variable "node_count" {
  description = "Desired number of nodes in the node group"
  type        = number
  default     = 2
  validation {
    condition     = var.node_count >= 1 && var.node_count <= 10
    error_message = "Node count must be between 1 and 10."
  }
}

variable "min_node_count" {
  description = "Minimum number of nodes in the node group"
  type        = number
  default     = 1
  validation {
    condition     = var.min_node_count >= 1
    error_message = "Minimum node count must be at least 1."
  }
}

variable "max_node_count" {
  description = "Maximum number of nodes in the node group"
  type        = number
  default     = 5
  validation {
    condition     = var.max_node_count >= var.node_count
    error_message = "Maximum node count must be greater than or equal to desired node count."
  }
}

variable "node_instance_type" {
  description = "Instance type for the EKS nodes"
  type        = string
  default     = "t3.medium"
  validation {
    condition     = contains(["t3.medium", "t3.large", "t3.xlarge", "m5.large", "m5.xlarge"], var.node_instance_type)
    error_message = "Node instance type must be one of: t3.medium, t3.large, t3.xlarge, m5.large, m5.xlarge."
  }
}

# ECR Configuration
variable "ecr_repository_name" {
  description = "Base name for ECR repositories"
  type        = string
  default     = "ecommerce"
  validation {
    condition     = can(regex("^[a-z0-9]+$", var.ecr_repository_name)) && length(var.ecr_repository_name) >= 2 && length(var.ecr_repository_name) <= 20
    error_message = "ECR repository name must be 2-20 characters long and contain only lowercase alphanumeric characters."
  }
}

# Namespace Configuration
variable "namespace" {
  description = "Kubernetes namespace for the application"
  type        = string
  default     = "ecommerce"
}

# Tags
variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default = {
    Environment = "dev"
    Project     = "ecommerce-platform"
    ManagedBy   = "terraform"
    Owner       = "devops-team"
    CostCenter  = "engineering"
  }
}
