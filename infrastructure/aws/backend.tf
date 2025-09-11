# AWS Backend Configuration
# This file configures remote state storage using S3 + DynamoDB for state locking

terraform {
  backend "s3" {
    bucket         = "ecommerce-terraform-state-043309357886"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "ecommerce-terraform-locks"
    encrypt        = true
  }
}
