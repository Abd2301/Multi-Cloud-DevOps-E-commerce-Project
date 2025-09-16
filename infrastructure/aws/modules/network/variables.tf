# AWS Network Module Variables

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-west-2a", "us-west-2b"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

# Transit Gateway specific variables
# vpc_id is created within this module, no need for input variable

# Direct Connect specific variables
variable "azure_gateway_ip" {
  description = "IP address of the Azure gateway"
  type        = string
  default     = "1.2.3.4"
}

variable "direct_connect_bgp_key" {
  description = "BGP key for Direct Connect"
  type        = string
  default     = "your-bgp-key"
}

# Application Load Balancer specific variables
variable "domain_name" {
  description = "Domain name for the load balancer"
  type        = string
  default     = "example.com"
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