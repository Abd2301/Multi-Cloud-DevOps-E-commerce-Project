# Azure Backend Configuration
# This file configures remote state storage using Azure Blob Storage

terraform {
  backend "azurerm" {
    resource_group_name  = "ecommerce-terraform-state-rg"
    storage_account_name = "ecommerceterraformstate"
    container_name       = "tfstate"
    key                  = "dev/terraform.tfstate"
  }
}