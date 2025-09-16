# Azure Security Center Module
# This module creates Azure Security Center for cloud security posture management

# Create Security Center Pricing
resource "azurerm_security_center_subscription_pricing" "main" {
  tier          = "Standard"
  resource_type = "VirtualMachines"
}

# Create Security Center Workspace
resource "azurerm_log_analytics_workspace" "security" {
  name                = "${var.project_name}-security-workspace"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = var.tags
}

# Create Security Center Auto Provisioning
resource "azurerm_security_center_auto_provisioning" "main" {
  auto_provision = "On"
}

# Create Security Center Contact
resource "azurerm_security_center_contact" "main" {
  email = var.security_contact_email
  phone = var.security_contact_phone

  alert_notifications = true
  alerts_to_admins    = true
}

# Create Security Center Setting
resource "azurerm_security_center_setting" "main" {
  setting_name = "MCAS"
  enabled      = true
}

# Create Security Center Workspace
resource "azurerm_security_center_workspace" "main" {
  scope        = "/subscriptions/${var.subscription_id}"
  workspace_id = azurerm_log_analytics_workspace.security.id
}

# Create Security Center Assessment
resource "azurerm_security_center_assessment" "main" {
  assessment_policy_id = azurerm_security_center_assessment_policy.main.id
  target_resource_id = var.target_resource_id
  status {
    code = "Healthy"
  }
}

# Create Security Center Assessment Policy
resource "azurerm_security_center_assessment_policy" "main" {
  display_name = "${var.project_name}-assessment-policy"
  description  = "Security assessment policy for ${var.project_name}"
  categories   = ["Compute", "Data", "IdentityAndAccess", "Networking", "Storage"]
  severity     = "Medium"
  user_impact  = "Low"
}

# Create Security Center Assessment Metadata
resource "azurerm_security_center_assessment_metadata" "main" {
  display_name = "${var.project_name}-assessment-metadata"
  description  = "Security assessment metadata for ${var.project_name}"
  categories   = ["Compute", "Data", "IdentityAndAccess", "Networking", "Storage"]
  severity     = "Medium"
  user_impact  = "Low"
}

# Create Security Center Assessment Policy Assignment
resource "azurerm_security_center_assessment_policy_assignment" "main" {
  display_name = "${var.project_name}-assessment-policy-assignment"
  description  = "Security assessment policy assignment for ${var.project_name}"
  policy_id    = azurerm_security_center_assessment_policy.main.id
  target_resource_id = var.target_resource_id
}
