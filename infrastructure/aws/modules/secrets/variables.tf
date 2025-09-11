# AWS Secrets Module Variables

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "eks_node_role_name" {
  description = "Name of the EKS node group IAM role"
  type        = string
}

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

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
