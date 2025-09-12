# 🔐 GitHub Secrets Setup Guide

## **Required Secrets for CI/CD Pipeline**

### **Azure Secrets**
```bash
# Get Azure credentials
az ad sp create-for-rbac --name "ecommerce-cicd" --role contributor --scopes /subscriptions/{subscription-id}/resourceGroups/ecommerce-rg --sdk-auth
```

**Secret Name:** `AZURE_CREDENTIALS`
**Value:** JSON output from above command

### **AWS Secrets**
```bash
# Create IAM user for CI/CD
aws iam create-user --user-name ecommerce-cicd
aws iam attach-user-policy --user-name ecommerce-cicd --policy-arn arn:aws:iam::aws:policy/PowerUserAccess
aws iam create-access-key --user-name ecommerce-cicd
```

**Secret Name:** `AWS_ACCESS_KEY_ID`
**Value:** Access Key ID from above command

**Secret Name:** `AWS_SECRET_ACCESS_KEY`
**Value:** Secret Access Key from above command

## **How to Add Secrets in GitHub**

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact name and value

## **Required Permissions**

### **Azure Permissions**
- Contributor access to resource group
- ACR push/pull permissions
- AKS cluster access

### **AWS Permissions**
- ECR push/pull permissions
- EKS cluster access
- S3 bucket access for Terraform state
- DynamoDB access for state locking

## **Testing Secrets**

After adding secrets, the CI/CD pipeline will automatically:
1. ✅ Test Azure authentication
2. ✅ Test AWS authentication
3. ✅ Build and push Docker images
4. ✅ Deploy to both clouds
5. ✅ Run health checks

## **Security Best Practices**

- 🔒 Never commit secrets to code
- 🔒 Use least privilege principle
- 🔒 Rotate secrets regularly
- 🔒 Monitor secret usage
- 🔒 Use environment-specific secrets
