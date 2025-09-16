# AWS Security Module Outputs

output "security_hub_account_id" {
  description = "ID of the Security Hub account"
  value       = aws_securityhub_account.main.id
}

output "security_hub_standards_subscription_ids" {
  description = "IDs of the Security Hub standards subscriptions"
  value       = {
    cis = aws_securityhub_standards_subscription.cis.id
    pci = aws_securityhub_standards_subscription.pci.id
    nist = aws_securityhub_standards_subscription.nist.id
    soc = aws_securityhub_standards_subscription.soc.id
    iso = aws_securityhub_standards_subscription.iso.id
  }
}


