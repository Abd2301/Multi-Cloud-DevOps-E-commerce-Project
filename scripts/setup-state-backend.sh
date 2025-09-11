#!/bin/bash
set -e

echo "🔒 Setting up Terraform State Management"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Function to setup Azure state backend
setup_azure_state() {
    log_info "Setting up Azure state backend..."
    
    # Create resource group for state
    az group create \
        --name "ecommerce-terraform-state-rg" \
        --location "eastus" \
        --tags "Project=ecommerce-platform" "Purpose=terraform-state" || true
    
    # Create storage account for state
    az storage account create \
        --name "ecommerceterraformstate" \
        --resource-group "ecommerce-terraform-state-rg" \
        --location "eastus" \
        --sku "Standard_LRS" \
        --kind "StorageV2" \
        --access-tier "Hot" || true
    
    # Create container for state
    az storage container create \
        --name "tfstate" \
        --account-name "ecommerceterraformstate" || true
    
    log_success "Azure state backend setup complete"
}

# Function to setup AWS state backend
setup_aws_state() {
    log_info "Setting up AWS state backend..."
    
    # Create S3 bucket for state
    aws s3 mb s3://ecommerce-terraform-state-043309357886 --region us-east-1 || true
    
    # Enable versioning
    aws s3api put-bucket-versioning \
        --bucket ecommerce-terraform-state-043309357886 \
        --versioning-configuration Status=Enabled || true
    
    # Create DynamoDB table for state locking
    aws dynamodb create-table \
        --table-name ecommerce-terraform-locks \
        --attribute-definitions AttributeName=LockID,AttributeType=S \
        --key-schema AttributeName=LockID,KeyType=HASH \
        --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
        --region us-east-1 || true
    
    log_success "AWS state backend setup complete"
}

# Main execution
echo "Choose state backend setup:"
echo "1) Azure only"
echo "2) AWS only" 
echo "3) Both Azure and AWS"
echo "4) Skip state setup"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        setup_azure_state
        ;;
    2)
        setup_aws_state
        ;;
    3)
        setup_azure_state
        setup_aws_state
        ;;
    4)
        log_info "Skipping state setup"
        ;;
    *)
        log_error "Invalid choice. Please run the script again."
        ;;
esac

echo ""
log_success "State management setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'terraform init' in each infrastructure directory"
echo "2. Run 'terraform init -migrate-state' to migrate existing state"
echo "3. Your state will now be stored remotely and safely!"
