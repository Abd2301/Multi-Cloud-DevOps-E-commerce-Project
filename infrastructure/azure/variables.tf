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

# Namespace Variables
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
  }
}
