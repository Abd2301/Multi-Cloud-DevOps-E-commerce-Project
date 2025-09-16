# Azure Cost Management Module
# This module creates Azure Cost Management for cost optimization and monitoring

# Create Cost Management Export
resource "azurerm_cost_management_export" "main" {
  name                = "${var.project_name}-cost-export"
  scope               = "/subscriptions/${var.subscription_id}"
  export_type         = "ActualCost"
  recurrence_type     = "Monthly"
  recurrence_period   = 1
  status              = "Active"
  storage_account_id  = azurerm_storage_account.cost_export.id
  storage_container   = azurerm_storage_container.cost_export.name
  storage_folder      = "cost-exports"

  depends_on = [azurerm_storage_account.cost_export]
}

# Create Storage Account for Cost Export
resource "azurerm_storage_account" "cost_export" {
  name                     = "${var.project_name}costexport"
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"

  tags = var.tags
}

# Create Storage Container for Cost Export
resource "azurerm_storage_container" "cost_export" {
  name                  = "cost-exports"
  storage_account_name  = azurerm_storage_account.cost_export.name
  container_access_type = "private"
}

# Create Cost Management Budget
resource "azurerm_consumption_budget_subscription" "main" {
  name            = "${var.project_name}-budget"
  subscription_id = var.subscription_id

  amount     = var.budget_amount
  time_grain = "Monthly"

  time_period {
    start_date = "2024-01-01T00:00:00Z"
    end_date   = "2024-12-31T23:59:59Z"
  }

  filter {
    dimension {
      name = "ResourceGroupName"
      values = [var.resource_group_name]
    }
  }

  notification {
    enabled        = true
    threshold      = 80
    operator       = "GreaterThan"
    threshold_type = "Actual"

    contact_emails = var.budget_alert_emails
  }

  notification {
    enabled        = true
    threshold      = 100
    operator       = "GreaterThan"
    threshold_type = "Actual"

    contact_emails = var.budget_alert_emails
  }
}

# Create Cost Management Alert
resource "azurerm_monitor_action_group" "cost_alert" {
  name                = "${var.project_name}-cost-alerts"
  resource_group_name = var.resource_group_name
  short_name          = "cost-alert"

  email_receiver {
    name          = "cost-admin"
    email_address = var.cost_admin_email
  }

  tags = var.tags
}

# Create Cost Management Alert Rule
resource "azurerm_monitor_metric_alert" "cost_threshold" {
  name                = "${var.project_name}-cost-threshold"
  resource_group_name = var.resource_group_name
  scopes              = [var.subscription_id]
  description         = "Alert when cost exceeds threshold"
  severity            = 2
  frequency           = "PT1H"
  window_size         = "PT1H"

  criteria {
    metric_namespace = "Microsoft.CostManagement"
    metric_name      = "Cost"
    aggregation      = "Total"
    operator         = "GreaterThan"
    threshold        = var.cost_threshold
  }

  action {
    action_group_id = azurerm_monitor_action_group.cost_alert.id
  }

  tags = var.tags
}

# Create Cost Management Query
resource "azurerm_cost_management_export" "query" {
  name                = "${var.project_name}-cost-query"
  scope               = "/subscriptions/${var.subscription_id}"
  export_type         = "ActualCost"
  recurrence_type     = "Weekly"
  recurrence_period   = 1
  status              = "Active"
  storage_account_id  = azurerm_storage_account.cost_export.id
  storage_container   = azurerm_storage_container.cost_export.name
  storage_folder      = "cost-queries"

  depends_on = [azurerm_storage_account.cost_export]
}

# Create Cost Management Report
resource "azurerm_cost_management_export" "report" {
  name                = "${var.project_name}-cost-report"
  scope               = "/subscriptions/${var.subscription_id}"
  export_type         = "ActualCost"
  recurrence_type     = "Daily"
  recurrence_period   = 1
  status              = "Active"
  storage_account_id  = azurerm_storage_account.cost_export.id
  storage_container   = azurerm_storage_container.cost_export.name
  storage_folder      = "cost-reports"

  depends_on = [azurerm_storage_account.cost_export]
}

# Create Cost Management Dashboard
resource "azurerm_dashboard" "cost" {
  name                = "${var.project_name}-cost-dashboard"
  resource_group_name = var.resource_group_name
  location            = var.location
  tags                = var.tags

  dashboard_properties = jsonencode({
    "lenses" = {
      "0" = {
        "order" = 0
        "parts" = {
          "0" = {
            "position" = {
              "x" = 0
              "y" = 0
              "rowSpan" = 2
              "colSpan" = 3
            }
            "metadata" = {
              "inputs" = {
                "0" = {
                  "name" = "options"
                  "value" = {
                    "chart" = {
                      "metrics" = [
                        {
                          "resourceMetadata" = {
                            "id" = "/subscriptions/${var.subscription_id}"
                          }
                          "name" = "Cost"
                          "aggregationType" = 1
                        }
                      ]
                      "title" = "Cost Over Time"
                      "visualization" = {
                        "chartType" = "Line"
                      }
                    }
                  }
                }
              }
              "type" = "Extension/Microsoft_CostManagement/PartType/CostAnalysisChartPart"
            }
          }
        }
      }
    }
  })
}
