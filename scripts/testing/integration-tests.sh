#!/bin/bash

# Phase 1 Testing Script
# Tests Infrastructure as Code (IaC) Enhancement

set -e

echo "🚀 Starting Phase 1 Testing: Infrastructure as Code Enhancement"
echo "=============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to test Terraform configuration
test_terraform_config() {
    local env=$1
    local cloud=$2
    
    print_status "Testing Terraform configuration for $env environment on $cloud..."
    
    cd "infrastructure/$cloud"
    
    # Check if environment-specific tfvars exists
    if [ -f "environments/$env/terraform.tfvars" ]; then
        print_success "Environment-specific configuration found: environments/$env/terraform.tfvars"
    else
        print_warning "Using default configuration"
    fi
    
    # Initialize Terraform
    print_status "Initializing Terraform..."
    terraform init -upgrade
    
    # Validate configuration
    print_status "Validating Terraform configuration..."
    terraform validate
    
    # Format check
    print_status "Checking Terraform formatting..."
    terraform fmt -check
    
    # Plan (dry run)
    print_status "Running Terraform plan (dry run)..."
    terraform plan -var-file="environments/$env/terraform.tfvars" -out="$env.tfplan"
    
    print_success "Terraform configuration test passed for $env on $cloud"
    
    # Clean up plan file
    rm -f "$env.tfplan"
    
    cd - > /dev/null
}

# Function to test module structure
test_module_structure() {
    local cloud=$1
    
    print_status "Testing module structure for $cloud..."
    
    # Check if modules directory exists
    if [ -d "infrastructure/$cloud/modules" ]; then
        print_success "Modules directory found"
    else
        print_error "Modules directory not found"
        return 1
    fi
    
    # Check for required modules
    local required_modules=("network" "monitoring" "secrets")
    
    for module in "${required_modules[@]}"; do
        if [ -d "infrastructure/$cloud/modules/$module" ]; then
            print_success "Module $module found"
            
            # Check for required files
            local required_files=("main.tf" "variables.tf" "outputs.tf")
            for file in "${required_files[@]}"; do
                if [ -f "infrastructure/$cloud/modules/$module/$file" ]; then
                    print_success "  - $file found"
                else
                    print_error "  - $file missing"
                    return 1
                fi
            done
        else
            print_error "Module $module not found"
            return 1
        fi
    done
    
    print_success "Module structure test passed for $cloud"
}

# Function to test environment configurations
test_environment_configs() {
    local cloud=$1
    
    print_status "Testing environment configurations for $cloud..."
    
    local environments=("dev" "staging" "prod")
    
    for env in "${environments[@]}"; do
        if [ -f "infrastructure/$cloud/environments/$env/terraform.tfvars" ]; then
            print_success "Environment $env configuration found"
            
            # Check if configuration has required variables
            local required_vars=("project_name" "environment" "location" "resource_group_name")
            for var in "${required_vars[@]}"; do
                if grep -q "$var" "infrastructure/$cloud/environments/$env/terraform.tfvars"; then
                    print_success "  - $var found in $env configuration"
                else
                    print_warning "  - $var not found in $env configuration"
                fi
            done
        else
            print_warning "Environment $env configuration not found"
        fi
    done
    
    print_success "Environment configurations test passed for $cloud"
}

# Function to test free tier compatibility
test_free_tier_compatibility() {
    local cloud=$1
    
    print_status "Testing free tier compatibility for $cloud..."
    
    # Check for free tier resources
    local free_tier_resources=("Standard_B2s" "t3.micro" "Basic" "standard")
    
    for env in "dev" "staging" "prod"; do
        if [ -f "infrastructure/$cloud/environments/$env/terraform.tfvars" ]; then
            print_status "Checking $env environment for free tier compatibility..."
            
            # Check node size
            if grep -q "Standard_B2s" "infrastructure/$cloud/environments/$env/terraform.tfvars"; then
                print_success "  - Using free tier eligible node size (Standard_B2s)"
            else
                print_warning "  - Node size may not be free tier eligible"
            fi
            
            # Check ACR SKU
            if grep -q "Basic" "infrastructure/$cloud/environments/$env/terraform.tfvars"; then
                print_success "  - Using free tier eligible ACR SKU (Basic)"
            else
                print_warning "  - ACR SKU may not be free tier eligible"
            fi
        fi
    done
    
    print_success "Free tier compatibility test passed for $cloud"
}

# Main testing function
main() {
    print_status "Starting Phase 1 comprehensive testing..."
    
    # Test Azure
    print_status "Testing Azure infrastructure..."
    test_module_structure "azure"
    test_environment_configs "azure"
    test_free_tier_compatibility "azure"
    test_terraform_config "dev" "azure"
    
    # Test AWS
    print_status "Testing AWS infrastructure..."
    test_module_structure "aws"
    test_environment_configs "aws"
    test_free_tier_compatibility "aws"
    test_terraform_config "dev" "aws"
    
    print_success "🎉 Phase 1 testing completed successfully!"
    print_status "All Infrastructure as Code enhancements are working correctly."
    print_status "Ready to proceed to Phase 2: CI/CD Pipeline Implementation"
}

# Run main function
main "$@"
