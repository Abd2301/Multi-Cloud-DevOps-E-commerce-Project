# AWS Cost Explorer Module
# This module creates AWS Cost Explorer for cost optimization and monitoring

# Create Cost Anomaly Monitor
resource "aws_ce_anomaly_monitor" "main" {
  name = "${var.project_name}-cost-anomaly-monitor"
  
  monitor_type = "DIMENSIONAL"
  monitor_specification = jsonencode({
    "Dimension" = "SERVICE"
    "MatchOptions" = ["EQUALS"]
    "Values" = ["Amazon Elastic Compute Cloud - Compute", "Amazon Elastic Container Service for Kubernetes", "Amazon Elastic Kubernetes Service"]
  })
}

# Create Cost Anomaly Detection
resource "aws_ce_anomaly_detector" "main" {
  name = "${var.project_name}-cost-anomaly-detector"
  
  monitor_arn_list = [aws_ce_anomaly_monitor.main.arn]
  
  specification = jsonencode({
    "AnomalyDetectorType" = "DIMENSIONAL"
    "Dimension" = "SERVICE"
    "MatchOptions" = ["EQUALS"]
    "Values" = ["Amazon Elastic Compute Cloud - Compute", "Amazon Elastic Container Service for Kubernetes", "Amazon Elastic Kubernetes Service"]
  })
}

# Create Cost Anomaly Subscription
resource "aws_ce_anomaly_subscription" "main" {
  name = "${var.project_name}-cost-anomaly-subscription"
  
  monitor_arn_list = [aws_ce_anomaly_monitor.main.arn]
  
  subscriber {
    type    = "EMAIL"
    address = var.cost_admin_email
  }
  
  threshold_expression {
    dimension {
      key = "ANOMALY_TOTAL_IMPACT_ABSOLUTE"
      values = ["100.0"]
    }
  }
  
  frequency = "DAILY"
}

# Create Cost Category
resource "aws_ce_cost_category" "main" {
  name = "${var.project_name}-cost-category"
  rule_version = "1.0"
  
  rule {
    value = "Production"
    rule {
      dimension {
        key = "SERVICE"
        values = ["Amazon Elastic Compute Cloud - Compute", "Amazon Elastic Container Service for Kubernetes", "Amazon Elastic Kubernetes Service"]
      }
    }
  }
  
  rule {
    value = "Development"
    rule {
      dimension {
        key = "SERVICE"
        values = ["Amazon Elastic Compute Cloud - Compute", "Amazon Elastic Container Service for Kubernetes", "Amazon Elastic Kubernetes Service"]
      }
    }
  }
  
  rule {
    value = "Monitoring"
    rule {
      dimension {
        key = "SERVICE"
        values = ["Amazon CloudWatch", "Amazon CloudWatch Logs", "Amazon CloudWatch Insights"]
      }
    }
  }
  
  rule {
    value = "Storage"
    rule {
      dimension {
        key = "SERVICE"
        values = ["Amazon Simple Storage Service", "Amazon Elastic Block Store", "Amazon Elastic File System"]
      }
    }
  }
  
  rule {
    value = "Networking"
    rule {
      dimension {
        key = "SERVICE"
        values = ["Amazon Virtual Private Cloud", "Amazon Route 53", "Amazon CloudFront", "Amazon API Gateway"]
      }
    }
  }
  
  rule {
    value = "Security"
    rule {
      dimension {
        key = "SERVICE"
        values = ["AWS Identity and Access Management", "AWS Key Management Service", "AWS Secrets Manager", "AWS Certificate Manager"]
      }
    }
  }
  
  rule {
    value = "Database"
    rule {
      dimension {
        key = "SERVICE"
        values = ["Amazon Relational Database Service", "Amazon DynamoDB", "Amazon ElastiCache", "Amazon Redshift"]
      }
    }
  }
  
  rule {
    value = "Analytics"
    rule {
      dimension {
        key = "SERVICE"
        values = ["Amazon Kinesis", "Amazon EMR", "Amazon QuickSight", "Amazon Athena"]
      }
    }
  }
  
  rule {
    value = "Machine Learning"
    rule {
      dimension {
        key = "SERVICE"
        values = ["Amazon SageMaker", "Amazon Comprehend", "Amazon Rekognition", "Amazon Textract"]
      }
    }
  }
  
  rule {
    value = "Other"
    rule {
      dimension {
        key = "SERVICE"
        values = ["Amazon Elastic Compute Cloud - Compute", "Amazon Elastic Container Service for Kubernetes", "Amazon Elastic Kubernetes Service"]
      }
    }
  }
}

# Create Cost Budget
resource "aws_budgets_budget" "main" {
  name         = "${var.project_name}-budget"
  budget_type  = "COST"
  limit_amount = var.budget_amount
  limit_unit   = "USD"
  time_unit    = "MONTHLY"
  time_period_start = "2024-01-01_00:00"
  time_period_end   = "2024-12-31_23:59"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 80
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = var.budget_alert_emails
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 100
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = var.budget_alert_emails
  }
}

# Create Cost Budget for Reserved Instances
resource "aws_budgets_budget" "reserved_instances" {
  name         = "${var.project_name}-reserved-instances-budget"
  budget_type  = "COST"
  limit_amount = var.reserved_instances_budget_amount
  limit_unit   = "USD"
  time_unit    = "MONTHLY"
  time_period_start = "2024-01-01_00:00"
  time_period_end   = "2024-12-31_23:59"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 90
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = var.budget_alert_emails
  }
}

# Create Cost Budget for Spot Instances
resource "aws_budgets_budget" "spot_instances" {
  name         = "${var.project_name}-spot-instances-budget"
  budget_type  = "COST"
  limit_amount = var.spot_instances_budget_amount
  limit_unit   = "USD"
  time_unit    = "MONTHLY"
  time_period_start = "2024-01-01_00:00"
  time_period_end   = "2024-12-31_23:59"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 90
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = var.budget_alert_emails
  }
}

# Create Cost Budget for Storage
resource "aws_budgets_budget" "storage" {
  name         = "${var.project_name}-storage-budget"
  budget_type  = "COST"
  limit_amount = var.storage_budget_amount
  limit_unit   = "USD"
  time_unit    = "MONTHLY"
  time_period_start = "2024-01-01_00:00"
  time_period_end   = "2024-12-31_23:59"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 90
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = var.budget_alert_emails
  }
}

# Create Cost Budget for Data Transfer
resource "aws_budgets_budget" "data_transfer" {
  name         = "${var.project_name}-data-transfer-budget"
  budget_type  = "COST"
  limit_amount = var.data_transfer_budget_amount
  limit_unit   = "USD"
  time_unit    = "MONTHLY"
  time_period_start = "2024-01-01_00:00"
  time_period_end   = "2024-12-31_23:59"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 90
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = var.budget_alert_emails
  }
}

# Create Cost Budget for Monitoring
resource "aws_budgets_budget" "monitoring" {
  name         = "${var.project_name}-monitoring-budget"
  budget_type  = "COST"
  limit_amount = var.monitoring_budget_amount
  limit_unit   = "USD"
  time_unit    = "MONTHLY"
  time_period_start = "2024-01-01_00:00"
  time_period_end   = "2024-12-31_23:59"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 90
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = var.budget_alert_emails
  }
}

# Create Cost Budget for Security
resource "aws_budgets_budget" "security" {
  name         = "${var.project_name}-security-budget"
  budget_type  = "COST"
  limit_amount = var.security_budget_amount
  limit_unit   = "USD"
  time_unit    = "MONTHLY"
  time_period_start = "2024-01-01_00:00"
  time_period_end   = "2024-12-31_23:59"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 90
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = var.budget_alert_emails
  }
}

# Create Cost Budget for Database
resource "aws_budgets_budget" "database" {
  name         = "${var.project_name}-database-budget"
  budget_type  = "COST"
  limit_amount = var.database_budget_amount
  limit_unit   = "USD"
  time_unit    = "MONTHLY"
  time_period_start = "2024-01-01_00:00"
  time_period_end   = "2024-12-31_23:59"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 90
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = var.budget_alert_emails
  }
}

# Create Cost Budget for Analytics
resource "aws_budgets_budget" "analytics" {
  name         = "${var.project_name}-analytics-budget"
  budget_type  = "COST"
  limit_amount = var.analytics_budget_amount
  limit_unit   = "USD"
  time_unit    = "MONTHLY"
  time_period_start = "2024-01-01_00:00"
  time_period_end   = "2024-12-31_23:59"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 90
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = var.budget_alert_emails
  }
}

# Create Cost Budget for Machine Learning
resource "aws_budgets_budget" "machine_learning" {
  name         = "${var.project_name}-machine-learning-budget"
  budget_type  = "COST"
  limit_amount = var.machine_learning_budget_amount
  limit_unit   = "USD"
  time_unit    = "MONTHLY"
  time_period_start = "2024-01-01_00:00"
  time_period_end   = "2024-12-31_23:59"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 90
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = var.budget_alert_emails
  }
}