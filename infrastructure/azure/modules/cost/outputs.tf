# Azure Cost Module Outputs

output "cost_management_export_id" {
  description = "ID of the Cost Management export"
  value       = azurerm_cost_management_export.main.id
}

output "cost_management_budget_id" {
  description = "ID of the Cost Management budget"
  value       = azurerm_consumption_budget_subscription.main.id
}

output "cost_management_alert_action_group_id" {
  description = "ID of the Cost Management alert action group"
  value       = azurerm_monitor_action_group.cost_alert.id
}

output "cost_management_dashboard_id" {
  description = "ID of the Cost Management dashboard"
  value       = azurerm_dashboard.cost.id
}

output "auto_scaling_setting_id" {
  description = "ID of the Auto Scaling setting"
  value       = azurerm_monitor_autoscale_setting.main.id
}

output "virtual_machine_scale_set_id" {
  description = "ID of the Virtual Machine Scale Set"
  value       = azurerm_linux_virtual_machine_scale_set.main.id
}


