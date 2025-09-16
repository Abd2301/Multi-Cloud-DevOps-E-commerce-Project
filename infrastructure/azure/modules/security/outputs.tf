# Azure Security Module Outputs

output "security_center_workspace_id" {
  description = "ID of the Security Center workspace"
  value       = azurerm_log_analytics_workspace.security.id
}

output "security_center_contact_id" {
  description = "ID of the Security Center contact"
  value       = azurerm_security_center_contact.main.id
}

output "security_center_assessment_id" {
  description = "ID of the Security Center assessment"
  value       = azurerm_security_center_assessment.main.id
}

output "security_center_assessment_policy_id" {
  description = "ID of the Security Center assessment policy"
  value       = azurerm_security_center_assessment_policy.main.id
}


