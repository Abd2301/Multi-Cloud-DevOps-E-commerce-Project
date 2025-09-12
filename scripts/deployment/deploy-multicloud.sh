#!/bin/bash

# Multi-Cloud Deployment Script
# Deploys to both Azure and AWS for fault tolerance

set -e

echo "🌐 Multi-Cloud Deployment for Fault Tolerance"
echo "=============================================="

# Function to deploy to Azure
deploy_azure() {
    echo ""
    echo "🚀 Deploying to Azure AKS..."
    echo "----------------------------"
    
    # Check if Azure CLI is logged in
    if ! az account show &> /dev/null; then
        echo "❌ Please login to Azure CLI first: az login"
        return 1
    fi
    
    # Deploy Azure infrastructure
    echo "🏗️ Deploying Azure infrastructure..."
    cd infrastructure/azure
    terraform init
    terraform plan -var-file="environments/dev/terraform.tfvars" -out=azure.tfplan
    terraform apply azure.tfplan
    cd ../..
    
    # Deploy to Azure AKS
    ./deploy-azure.sh
}

# Function to deploy to AWS
deploy_aws() {
    echo ""
    echo "🚀 Deploying to AWS EKS..."
    echo "-------------------------"
    
    # Check if AWS CLI is configured
    if ! aws sts get-caller-identity &> /dev/null; then
        echo "❌ Please configure AWS CLI first: aws configure"
        return 1
    fi
    
    # Deploy AWS infrastructure
    echo "🏗️ Deploying AWS infrastructure..."
    cd infrastructure/aws
    terraform init
    terraform plan -var-file="environments/dev/terraform.tfvars" -out=aws.tfplan
    terraform apply aws.tfplan
    cd ../..
    
    # Deploy to AWS EKS
    ./deploy-aws.sh
}

# Main deployment logic
case "${1:-both}" in
    "azure")
        deploy_azure
        ;;
    "aws")
        deploy_aws
        ;;
    "both"|"")
        echo "🔄 Deploying to both clouds for fault tolerance..."
        deploy_azure
        deploy_aws
        echo ""
        echo "🎉 Multi-cloud deployment complete!"
        echo "💡 You now have fault tolerance across Azure and AWS"
        ;;
    *)
        echo "Usage: $0 [azure|aws|both]"
        echo "  azure: Deploy only to Azure AKS"
        echo "  aws:   Deploy only to AWS EKS"
        echo "  both:  Deploy to both clouds (default)"
        exit 1
        ;;
esac
