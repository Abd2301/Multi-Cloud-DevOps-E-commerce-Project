# AWS Cost Module Variables

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "region" {
  description = "AWS region"
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

variable "reserved_instances_budget_amount" {
  description = "Budget amount for reserved instances"
  type        = number
  default     = 500
}

variable "spot_instances_budget_amount" {
  description = "Budget amount for spot instances"
  type        = number
  default     = 300
}

variable "storage_budget_amount" {
  description = "Budget amount for storage"
  type        = number
  default     = 200
}

variable "data_transfer_budget_amount" {
  description = "Budget amount for data transfer"
  type        = number
  default     = 100
}

variable "monitoring_budget_amount" {
  description = "Budget amount for monitoring"
  type        = number
  default     = 150
}

variable "security_budget_amount" {
  description = "Budget amount for security"
  type        = number
  default     = 100
}

variable "database_budget_amount" {
  description = "Budget amount for database"
  type        = number
  default     = 400
}

variable "analytics_budget_amount" {
  description = "Budget amount for analytics"
  type        = number
  default     = 250
}

variable "machine_learning_budget_amount" {
  description = "Budget amount for machine learning"
  type        = number
  default     = 300
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs"
  type        = list(string)
  default     = []
}

variable "target_group_arns" {
  description = "List of target group ARNs"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}


