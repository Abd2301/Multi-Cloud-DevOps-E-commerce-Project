# Azure Monitoring Module Variables

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "aks_cluster_id" {
  description = "ID of the AKS cluster to monitor"
  type        = string
}

variable "admin_email" {
  description = "Admin email for alerts"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
