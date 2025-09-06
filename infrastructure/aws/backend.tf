# Terraform Backend Configuration for AWS
# This configures remote state storage with state locking

terraform {
  backend "s3" {
    # S3 bucket name (must be globally unique)
    bucket = "ecommerce-terraform-state-043309357886"
    
    # State file key
    key = "ecommerce-platform/terraform.tfstate"
    
    # AWS region
    region = "us-east-1"
    
    # Enable state locking using DynamoDB
    dynamodb_table = "ecommerce-terraform-locks"
    
    # Enable encryption
    encrypt = true
    
    # Enable versioning (not needed in backend config)
  }
}
