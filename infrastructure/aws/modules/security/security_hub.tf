# AWS Security Hub Module
# This module creates AWS Security Hub for centralized security findings

# Create Security Hub
resource "aws_securityhub_account" "main" {
  enable_default_standards = true
}

# Create Security Hub Standards Subscription
resource "aws_securityhub_standards_subscription" "cis" {
  standards_arn = "arn:aws:securityhub:${var.region}::standards/cis-aws-foundations-benchmark/v/1.2.0"
  depends_on    = [aws_securityhub_account.main]
}

# Create Security Hub Standards Subscription for PCI DSS
resource "aws_securityhub_standards_subscription" "pci" {
  standards_arn = "arn:aws:securityhub:${var.region}::standards/pci-dss/v/3.2.1"
  depends_on    = [aws_securityhub_account.main]
}

# Create Security Hub Standards Subscription for NIST
resource "aws_securityhub_standards_subscription" "nist" {
  standards_arn = "arn:aws:securityhub:${var.region}::standards/nist-cybersecurity-framework/v/1.1.0"
  depends_on    = [aws_securityhub_account.main]
}

# Create Security Hub Standards Subscription for SOC
resource "aws_securityhub_standards_subscription" "soc" {
  standards_arn = "arn:aws:securityhub:${var.region}::standards/soc-2/v/1.0.0"
  depends_on    = [aws_securityhub_account.main]
}

# Create Security Hub Standards Subscription for ISO 27001
resource "aws_securityhub_standards_subscription" "iso" {
  standards_arn = "arn:aws:securityhub:${var.region}::standards/iso-27001/v/1.0.0"
  depends_on    = [aws_securityhub_account.main]
}
