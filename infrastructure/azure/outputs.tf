# Outputs for Azure Infrastructure
# This file defines the outputs that will be displayed after successful deployment

# Resource Group Outputs
output "resource_group_name" {
  description = "Name of the created resource group"
  value       = azurerm_resource_group.ecommerce.name
}

output "resource_group_location" {
  description = "Location of the created resource group"
  value       = azurerm_resource_group.ecommerce.location
}

# Container Registry Outputs
output "acr_name" {
  description = "Name of the Azure Container Registry"
  value       = azurerm_container_registry.ecommerce.name
}

output "acr_login_server" {
  description = "Login server URL for the Azure Container Registry"
  value       = azurerm_container_registry.ecommerce.login_server
}

output "acr_admin_username" {
  description = "Admin username for the Azure Container Registry"
  value       = azurerm_container_registry.ecommerce.admin_username
  sensitive   = true
}

output "acr_admin_password" {
  description = "Admin password for the Azure Container Registry"
  value       = azurerm_container_registry.ecommerce.admin_password
  sensitive   = true
}

# Kubernetes Cluster Outputs
output "aks_cluster_name" {
  description = "Name of the AKS cluster"
  value       = azurerm_kubernetes_cluster.ecommerce.name
}

output "aks_cluster_location" {
  description = "Location of the AKS cluster"
  value       = azurerm_kubernetes_cluster.ecommerce.location
}

output "aks_cluster_fqdn" {
  description = "FQDN of the AKS cluster"
  value       = azurerm_kubernetes_cluster.ecommerce.fqdn
}

output "aks_cluster_kubernetes_version" {
  description = "Kubernetes version of the AKS cluster"
  value       = azurerm_kubernetes_cluster.ecommerce.kubernetes_version
}

output "aks_node_count" {
  description = "Number of nodes in the AKS cluster"
  value       = azurerm_kubernetes_cluster.ecommerce.default_node_pool[0].node_count
}

# Network Module Outputs
output "vnet_id" {
  description = "ID of the virtual network"
  value       = module.network.vnet_id
}

output "vnet_name" {
  description = "Name of the virtual network"
  value       = module.network.vnet_name
}

output "subnet_ids" {
  description = "Map of subnet names to their IDs"
  value       = module.network.subnet_ids
}

# Kubernetes Namespace Output
output "kubernetes_namespace" {
  description = "Name of the Kubernetes namespace"
  value       = kubernetes_namespace.ecommerce.metadata[0].name
}

# Monitoring Module Outputs
output "log_analytics_workspace_id" {
  description = "ID of the Log Analytics workspace"
  value       = module.monitoring.log_analytics_workspace_id
}

output "application_insights_id" {
  description = "ID of the Application Insights"
  value       = module.monitoring.application_insights_id
}

# Secrets Module Outputs
output "key_vault_id" {
  description = "ID of the Key Vault"
  value       = module.secrets.key_vault_id
}

output "key_vault_uri" {
  description = "URI of the Key Vault"
  value       = module.secrets.key_vault_uri
}

# Connection Information
output "kubectl_config_command" {
  description = "Command to configure kubectl for the AKS cluster"
  value       = "az aks get-credentials --resource-group ${azurerm_resource_group.ecommerce.name} --name ${azurerm_kubernetes_cluster.ecommerce.name}"
}

output "docker_login_command" {
  description = "Command to login to the Azure Container Registry"
  value       = "az acr login --name ${azurerm_container_registry.ecommerce.name}"
}

# Deployment Instructions
output "deployment_instructions" {
  description = "Instructions for deploying the application"
  value       = <<-EOT
    To deploy your e-commerce platform:
    
    1. Configure kubectl:
       az aks get-credentials --resource-group ${azurerm_resource_group.ecommerce.name} --name ${azurerm_kubernetes_cluster.ecommerce.name}
    
    2. Login to ACR:
       az acr login --name ${azurerm_container_registry.ecommerce.name}
    
    3. Build and push images:
       docker build -t ${azurerm_container_registry.ecommerce.login_server}/user-service:latest ./apps/user-service/
       docker push ${azurerm_container_registry.ecommerce.login_server}/user-service:latest
       # Repeat for other services...
    
    4. Deploy to Kubernetes:
       kubectl apply -f kubernetes/
    
    5. Check deployment:
       kubectl get pods -n ${kubernetes_namespace.ecommerce.metadata[0].name}
  EOT
}
