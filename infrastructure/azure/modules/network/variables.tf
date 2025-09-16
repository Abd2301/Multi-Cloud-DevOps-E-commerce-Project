# Azure Network Module Variables

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

variable "vnet_address_space" {
  description = "Address space for the virtual network"
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "subnets" {
  description = "Map of subnets to create"
  type        = map(object({
    address_prefix = string
  }))
  default = {
    "subnet1" = {
      address_prefix = "10.0.1.0/24"
    }
    "subnet2" = {
      address_prefix = "10.0.2.0/24"
    }
  }
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

# Virtual WAN specific variables
variable "vhub_address_prefix" {
  description = "Address prefix for the virtual hub"
  type        = string
  default     = "10.1.0.0/16"
}

variable "vnet_id" {
  description = "ID of the virtual network (optional - VPC created within module)"
  type        = string
  default     = null
}

variable "virtual_hub_id" {
  description = "ID of the virtual hub (optional - created within module)"
  type        = string
  default     = null
}

variable "virtual_network_gateway_id" {
  description = "ID of the virtual network gateway (optional - not created in module)"
  type        = string
  default     = null
}

# ExpressRoute specific variables
variable "expressroute_shared_key" {
  description = "Shared key for ExpressRoute"
  type        = string
  default     = "your-shared-key"
}

variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

# Load Balancer specific variables
variable "domain_name" {
  description = "Domain name for the load balancer"
  type        = string
  default     = "example.com"
}