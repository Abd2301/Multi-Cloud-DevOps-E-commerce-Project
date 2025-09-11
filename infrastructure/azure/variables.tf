# Variables for Azure Infrastructure
# This file defines all the variables used in the Azure configuration

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

variable "location" {
  description = "Azure region where resources will be created"
  type        = string
  default     = "East US"
}

# Resource Group Variables
variable "resource_group_name" {
  description = "Name of the Azure Resource Group"
  type        = string
  default     = "ecommerce-rg"
}

# Container Registry Variables
variable "acr_name" {
  description = "Name of the Azure Container Registry"
  type        = string
  default     = "ecommerceacr"
  validation {
    condition     = can(regex("^[a-zA-Z0-9]+$", var.acr_name)) && length(var.acr_name) >= 5 && length(var.acr_name) <= 50
    error_message = "ACR name must be 5-50 characters long and contain only alphanumeric characters."
  }
}

# Kubernetes Cluster Variables
variable "aks_cluster_name" {
  description = "Name of the AKS cluster"
  type        = string
  default     = "ecommerce-aks"
}

variable "kubernetes_version" {
  description = "Kubernetes version for the AKS cluster"
  type        = string
  default     = "1.28"
}

variable "node_count" {
  description = "Number of nodes in the default node pool"
  type        = number
  default     = 2
  validation {
    condition     = var.node_count >= 1 && var.node_count <= 10
    error_message = "Node count must be between 1 and 10."
  }
}

variable "node_size" {
  description = "Size of the nodes in the default node pool"
  type        = string
  default     = "Standard_B2s"
  validation {
    condition     = contains(["Standard_B2s", "Standard_B4s", "Standard_D2s_v3", "Standard_D4s_v3"], var.node_size)
    error_message = "Node size must be one of: Standard_B2s, Standard_B4s, Standard_D2s_v3, Standard_D4s_v3."
  }
}

variable "min_node_count" {
  description = "Minimum number of nodes in the node pool"
  type        = number
  default     = 1
  validation {
    condition     = var.min_node_count >= 1 && var.min_node_count <= 10
    error_message = "Minimum node count must be between 1 and 10."
  }
}

variable "max_node_count" {
  description = "Maximum number of nodes in the node pool"
  type        = number
  default     = 3
  validation {
    condition     = var.max_node_count >= 1 && var.max_node_count <= 20
    error_message = "Maximum node count must be between 1 and 20."
  }
}

# Namespace Variables
variable "namespace" {
  description = "Kubernetes namespace for the application"
  type        = string
  default     = "ecommerce"
}

# Network Configuration
variable "vnet_address_space" {
  description = "Address space for the VNet"
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "subnets" {
  description = "Map of subnets to create"
  type = map(object({
    address_prefix = string
  }))
  default = {
    "aks-subnet" = {
      address_prefix = "10.0.1.0/24"
    }
    "monitoring-subnet" = {
      address_prefix = "10.0.2.0/24"
    }
  }
}

# Monitoring Configuration
variable "admin_email" {
  description = "Admin email for alerts"
  type        = string
  default     = "admin@example.com"
}

# Secrets Configuration
variable "database_connection_string" {
  description = "Database connection string"
  type        = string
  default     = "mongodb://localhost:27017/ecommerce"
}

variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  default     = "your-super-secret-jwt-key-change-in-production"
}

variable "email_config" {
  description = "Email configuration"
  type = object({
    host     = string
    port     = number
    username = string
    password = string
  })
  default = {
    host     = "smtp.gmail.com"
    port     = 587
    username = "your-email@gmail.com"
    password = "your-app-password"
  }
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
  }
}
