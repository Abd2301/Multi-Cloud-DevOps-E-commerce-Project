# Azure Security Module Variables

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

variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

variable "target_resource_id" {
  description = "ID of the target resource for security assessment"
  type        = string
}

variable "security_contact_email" {
  description = "Email address for security contact"
  type        = string
  default     = "security@example.com"
}

variable "security_contact_phone" {
  description = "Phone number for security contact"
  type        = string
  default     = "+1-555-0123"
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}


