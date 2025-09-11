# Azure Infrastructure for E-commerce Platform
# This file defines the main Azure resources using modules

terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

# Configure the Azure Provider
provider "azurerm" {
  features {}
}

# Data source to get current client configuration
data "azurerm_client_config" "current" {}

# Create Resource Group
resource "azurerm_resource_group" "ecommerce" {
  name     = var.resource_group_name
  location = var.location

  tags = var.common_tags
}

# Create Azure Container Registry
resource "azurerm_container_registry" "ecommerce" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.ecommerce.name
  location            = azurerm_resource_group.ecommerce.location
  sku                 = "Basic"
  admin_enabled       = true

  tags = {
    Environment = var.environment
    Project     = "ecommerce-platform"
    ManagedBy   = "terraform"
  }
}

# Create Network using module
module "network" {
  source = "./modules/network"

  project_name        = var.project_name
  location            = azurerm_resource_group.ecommerce.location
  resource_group_name = azurerm_resource_group.ecommerce.name
  vnet_address_space  = var.vnet_address_space
  subnets             = var.subnets
  tags                = var.common_tags
}

# Create Azure Kubernetes Service
resource "azurerm_kubernetes_cluster" "ecommerce" {
  name                = var.aks_cluster_name
  location            = azurerm_resource_group.ecommerce.location
  resource_group_name = azurerm_resource_group.ecommerce.name
  dns_prefix          = var.aks_cluster_name
  kubernetes_version  = var.kubernetes_version

  default_node_pool {
    name           = "default"
    node_count     = var.node_count
    vm_size        = var.node_size
    vnet_subnet_id = module.network.subnet_ids["aks-subnet"]
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin    = "azure"
    load_balancer_sku = "standard"
    service_cidr      = "10.1.0.0/16"
    dns_service_ip    = "10.1.0.10"
  }

  tags = var.common_tags
}

# Grant AKS access to ACR
resource "azurerm_role_assignment" "aks_acr" {
  scope                = azurerm_container_registry.ecommerce.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_kubernetes_cluster.ecommerce.kubelet_identity[0].object_id
}

# Create Monitoring using module
module "monitoring" {
  source = "./modules/monitoring"

  project_name        = var.project_name
  location            = azurerm_resource_group.ecommerce.location
  resource_group_name = azurerm_resource_group.ecommerce.name
  aks_cluster_id      = azurerm_kubernetes_cluster.ecommerce.id
  admin_email         = var.admin_email
  tags                = var.common_tags
}

# Create Secrets using module
module "secrets" {
  source = "./modules/secrets"

  project_name                   = var.project_name
  location                       = azurerm_resource_group.ecommerce.location
  resource_group_name            = azurerm_resource_group.ecommerce.name
  tenant_id                      = data.azurerm_client_config.current.tenant_id
  current_user_object_id         = data.azurerm_client_config.current.object_id
  aks_managed_identity_object_id = azurerm_kubernetes_cluster.ecommerce.kubelet_identity[0].object_id
  database_connection_string     = var.database_connection_string
  jwt_secret                     = var.jwt_secret
  email_config                   = var.email_config
  tags                           = var.common_tags
}

# Configure Kubernetes Provider
provider "kubernetes" {
  host                   = azurerm_kubernetes_cluster.ecommerce.kube_config.0.host
  client_certificate     = base64decode(azurerm_kubernetes_cluster.ecommerce.kube_config.0.client_certificate)
  client_key             = base64decode(azurerm_kubernetes_cluster.ecommerce.kube_config.0.client_key)
  cluster_ca_certificate = base64decode(azurerm_kubernetes_cluster.ecommerce.kube_config.0.cluster_ca_certificate)
}

# Create Namespace
resource "kubernetes_namespace" "ecommerce" {
  metadata {
    name = var.namespace
    labels = {
      Environment = var.environment
      Project     = "ecommerce-platform"
      ManagedBy   = "terraform"
    }
  }
}

# Create ConfigMap for environment variables
resource "kubernetes_config_map" "ecommerce_config" {
  metadata {
    name      = "ecommerce-config"
    namespace = kubernetes_namespace.ecommerce.metadata[0].name
  }

  data = {
    NODE_ENV                 = "production"
    USER_SERVICE_URL         = "http://user-service:3002"
    PRODUCT_SERVICE_URL      = "http://product-service:3001"
    ORDER_SERVICE_URL        = "http://order-service:3003"
    NOTIFICATION_SERVICE_URL = "http://notification-service:3004"
  }
}
