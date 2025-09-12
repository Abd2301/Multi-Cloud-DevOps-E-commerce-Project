# Azure Secrets Module
# This module creates Key Vault and manages secrets (Free tier)

# Create Key Vault (Free tier)
resource "azurerm_key_vault" "main" {
  name                = "ecommerce-kv-${random_string.suffix.result}"
  location            = var.location
  resource_group_name = var.resource_group_name
  tenant_id           = var.tenant_id
  sku_name            = "standard"  # Free tier

  # Enable soft delete (free tier allows this)
  soft_delete_retention_days = 7
  purge_protection_enabled   = false

  # Access policy for current user
  access_policy {
    tenant_id = var.tenant_id
    object_id = var.current_user_object_id

    secret_permissions = [
      "Get",
      "List",
      "Set",
      "Delete",
      "Recover",
      "Purge"
    ]
  }

  # Access policy for AKS managed identity
  access_policy {
    tenant_id = var.tenant_id
    object_id = var.aks_managed_identity_object_id

    secret_permissions = [
      "Get",
      "List"
    ]
  }

  tags = var.tags
}

# Generate random suffix for unique Key Vault name
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# Store database connection string
resource "azurerm_key_vault_secret" "database_connection" {
  name         = "database-connection-string"
  value        = var.database_connection_string
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault.main]
}

# Store JWT secret
resource "azurerm_key_vault_secret" "jwt_secret" {
  name         = "jwt-secret"
  value        = var.jwt_secret
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault.main]
}

# Store email configuration
resource "azurerm_key_vault_secret" "email_config" {
  name         = "email-config"
  value        = jsonencode(var.email_config)
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault.main]
}
