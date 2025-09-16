# Azure Cost Module Variables

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

variable "budget_amount" {
  description = "Budget amount in USD"
  type        = number
  default     = 1000
}

variable "budget_alert_emails" {
  description = "List of email addresses for budget alerts"
  type        = list(string)
  default     = ["admin@example.com"]
}

variable "cost_admin_email" {
  description = "Email address for cost administrator"
  type        = string
  default     = "cost-admin@example.com"
}

variable "cost_threshold" {
  description = "Cost threshold for alerts"
  type        = number
  default     = 500
}

variable "subnet_id" {
  description = "ID of the subnet for auto-scaling"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}


