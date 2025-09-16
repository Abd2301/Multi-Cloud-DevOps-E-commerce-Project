# AWS Cost Module Outputs

output "cost_anomaly_detector_id" {
  description = "ID of the Cost Anomaly Detector"
  value       = aws_ce_anomaly_detector.main.id
}

output "cost_anomaly_monitor_id" {
  description = "ID of the Cost Anomaly Monitor"
  value       = aws_ce_anomaly_monitor.main.id
}

output "cost_category_id" {
  description = "ID of the Cost Category"
  value       = aws_ce_cost_category.main.id
}

output "budget_ids" {
  description = "IDs of the budgets"
  value       = {
    main = aws_budgets_budget.main.id
    reserved_instances = aws_budgets_budget.reserved_instances.id
    spot_instances = aws_budgets_budget.spot_instances.id
    storage = aws_budgets_budget.storage.id
    data_transfer = aws_budgets_budget.data_transfer.id
    monitoring = aws_budgets_budget.monitoring.id
    security = aws_budgets_budget.security.id
    database = aws_budgets_budget.database.id
    analytics = aws_budgets_budget.analytics.id
    machine_learning = aws_budgets_budget.machine_learning.id
  }
}

output "auto_scaling_group_id" {
  description = "ID of the Auto Scaling Group"
  value       = aws_autoscaling_group.main.id
}

output "launch_template_id" {
  description = "ID of the Launch Template"
  value       = aws_launch_template.main.id
}

output "cloudwatch_alarm_ids" {
  description = "IDs of the CloudWatch alarms"
  value       = {
    high_cpu = aws_cloudwatch_metric_alarm.high_cpu.id
    low_cpu = aws_cloudwatch_metric_alarm.low_cpu.id
  }
}


