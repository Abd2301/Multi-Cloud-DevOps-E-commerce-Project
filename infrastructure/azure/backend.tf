# Terraform Backend Configuration for Azure
# This configures remote state storage with state locking

terraform {
  backend "azurerm" {
    # Storage account name (must be globally unique)
    storage_account_name = "ecommercestate1757135911"
    
    # Container name for state files
    container_name = "tfstate"
    
    # State file name
    key = "ecommerce-platform.tfstate"
    
    # Resource group for storage account
    resource_group_name = "ecommerce-state-rg"
    
    # Azure region (not needed in backend config)
    
    # Enable state locking
    # This prevents concurrent modifications
    # Uses Azure Blob Storage lease mechanism
  }
}
